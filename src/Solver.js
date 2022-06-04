import * as Proposition from "./Proposition";

export function findClosingParenthesisIndex(proposition, startIndex, directionIsLeft) {
    let toClose = 0;

    for (let i = startIndex; i !== (directionIsLeft ? 0 : proposition.length); i += (directionIsLeft ? -1 : 1)) {
        let c = proposition.charAt(i);

        if (directionIsLeft) {
            if (c === ')') toClose++;
            if (c === '(') toClose--;
        } else {
            if (c === '(') toClose++;
            if (c === ')') toClose--;
        }

        if (toClose === 0) return i;
    }

    return 0;
}

export function getLeftAndRightSubPropositions(proposition, centerIndex) {
    let result = ["", ""];

    const charLeft = proposition.charAt(centerIndex - 1);
    const charRight = proposition.charAt(centerIndex + 1);

    if (charLeft === ')') {
        let closingParenthesesIndex = findClosingParenthesisIndex(proposition, centerIndex - 1, true);
        result[0] = proposition.substring(closingParenthesesIndex, centerIndex);
    } else if (Proposition.isPropositionalLetter(charLeft)) {
        result[0] = charLeft;
    }

    if (charRight === '(') {
        let closingParenthesesIndex = findClosingParenthesisIndex(proposition, centerIndex + 1, false);
        result[1] = proposition.substring(centerIndex + 1, closingParenthesesIndex + 1);
    } else if (Proposition.isPropositionalLetter(charRight)) {
        result[1] = charRight;
    }

    return result;
}

export function parse(tree, proposition) {
    if (proposition.length === 1) {
        tree.value = proposition;
        return;
    }

    if (proposition.length === 2) {
        tree.value = '~';
        tree.left = {};
        tree.left.value = proposition.charAt(1);
        return;
    }

    if (proposition.charAt(0) === '~') {
        tree.value = '~';
        tree.left = {};
        parse(tree.left, proposition.substring(1));
        return;
    }

    function charAt(i) {
        return proposition.charAt(i);
    }

    for (let i = 1; i < proposition.length - 1; i++) {
        let c = charAt(i);

        if (c === '(') {
            i = findClosingParenthesisIndex(proposition, i, false);
            continue;
        }

        if (c === '^' || c === 'v' || c === '>' || c === '=') {
            const left = charAt(i - 1)
            const right = charAt(i + 1);

            tree.value = c;
            tree.left = {};
            tree.right = {};

            if (left === ')') {
                const closingIndex = findClosingParenthesisIndex(proposition, i - 1, true);

                if (charAt(closingIndex - 1) == '~') {
                    tree.left.value = '~';
                    tree.left.left = {};
                    const substr = proposition.substring(closingIndex, i);
                    parse(tree.left.left, substr);
                } else {
                    const substr = proposition.substring(closingIndex, i);
                    parse(tree.left, substr);
                }
            } else {
                // Letra
                const isNegated = charAt(i - 2) == '~';

                if (isNegated) {
                    tree.left.value = '~';
                    tree.left.left = {};
                    tree.left.left.value = left;
                } else {
                    tree.left.value = left;
                }
            }

            if (right === '(') {
                const closingIndex = findClosingParenthesisIndex(proposition, i + 1, false);
                const substr = proposition.substring(i + 1, closingIndex + 1);
                parse(tree.right, substr);
            } else {
                if (right === '~') {
                    const afterNegation = charAt(i + 2);

                    if (afterNegation === '(') {
                        const closingIndex = findClosingParenthesisIndex(proposition, i + 2, false);
                        const substr = proposition.substring(i + 2, closingIndex + 1);
                        tree.right.value = '~';
                        tree.right.left = {};
                        parse(tree.right.left, substr);
                    } else {
                        // Letra
                        tree.right.value = '~';
                        tree.right.left = {};
                        tree.right.left.value = afterNegation;
                    }
                } else {
                    // Letra
                    tree.right.value = right;
                }
            }
        }
    }
}

export function parseold(tree, proposition) {
    let currentDepth = 0;

    for (let i = 0; i < proposition.length; i++) {
        let c = proposition.charAt(i);

        if (c === '(') currentDepth++;
        if (c === ')') currentDepth--;

        if (i === 0) {
            if (c === '~') {
                tree.left = { parent: tree };
                tree.right = { parent: tree };
                tree.value = c;
                tree = tree.left;
            } else if (Proposition.isPropositionalLetter(c)) {
                tree.value = c;
                return;
            }
        }

        if (currentDepth !== 1) continue;

        if (c === '>' || c === '=' || c === '^' || c === 'v') {
            tree.left = { parent: tree };
            tree.right = { parent: tree };
            tree.value = c;

            if (tree.parent !== undefined) {
                tree.parent.left.sibling = tree.parent.right;
                tree.parent.right.sibling = tree.parent.sibling ? tree.parent.sibling.left : undefined;
            }

            let subPropositions = getLeftAndRightSubPropositions(proposition, i);

            if (subPropositions[1].length === 1) {
                tree.right.value = subPropositions[1];
                tree.right.sibling = tree.sibling ? tree.sibling.left : undefined;
            } else {
                parse(tree.right, subPropositions[1]);
            }

            // If the proposition is larger than 1, it's not a letter
            if (subPropositions[0].length === 1) {
                tree.left.value = subPropositions[0];
                tree.left.sibling = tree.right;
            } else {
                parse(tree.left, subPropositions[0]);
            }
        }
    }
}

export function calculate(tree, values) {
    let value = tree.value;

    if (value === '~') {
        let left = calculate(tree.left, values);
        return (left === 1) ? 0 : 1;
    } else {
        if (value === '>' || value === '=' || value === '^' || value === 'v') {
            let left = calculate(tree.left, values);
            let right = calculate(tree.right, values);

            switch (value) {
                case '>':
                    return (left === 1 && right === 0) ? 0 : 1;
                case '=':
                    return (left === right) ? 1 : 0;
                case '^':
                    return (left === 1 && right === 1) ? 1 : 0;
                case 'v':
                    return (left === 1 || right === 1) ? 1 : 0;
            }
        }

        // If 'value' is not one of the previous characters, it has to be a propositional letter
        return values[value];
    }
}

function getTreeLevel(tree, level, arr) {
    const nullTree = tree === undefined;

    if (level < 1)
        return;
    else if (level == 1)
        arr.push(nullTree ? '' : tree.value);
    else if (level > 1) {
        getTreeLevel(nullTree ? {} : tree.left, level - 1, arr);
        getTreeLevel(nullTree ? {} : tree.right, level - 1, arr);
    }
}

function getTreeHeight(tree, current) {
    let leftHeight = 0;
    let rightHeight = 0;

    if (tree.left) leftHeight = getTreeHeight(tree.left, current + 1);
    if (tree.right) rightHeight = getTreeHeight(tree.right, current + 1);

    return Math.max(current, leftHeight, rightHeight);
}

// Convierte el arbol en array
export function treeToArray(tree) {
    let arr = [];
    let height = getTreeHeight(tree, 1);

    console.log("Tree height: ", height);

    for (let i = 0; i <= height; i++) {
        getTreeLevel(tree, i, arr);
    }

    return arr;
}

export function getPropositionalLetters(proposition) {
    let list = [];

    for (let i = 0; i < proposition.length; i++) {
        let c = proposition.charAt(i);
        if (Proposition.isPropositionalLetter(c)) {
            // Do not add the same letter twice
            if (list.find(val => val === c)) continue;
            list.push(c);
        }
    }

    return list;
}

export function shiftAndGetLastBit(n, bitIndexFromEnd) {
    return (n >> bitIndexFromEnd) & 1;
}

export function getAllPossibleCombinationsOfBinaryDigits(length) {
    const maxCombinations = Math.pow(2, length);
    const list = [];

    for (let i = 0; i < length; i++) list[i] = [];

    let n = 0;

    while (n < maxCombinations) {
        for (let i = 0; i < length; i++) {
            list[i].push(shiftAndGetLastBit(n, length - (i + 1)));
        }

        n++;
    }

    return list;
}