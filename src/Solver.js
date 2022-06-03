import * as Proposition from "./Proposition";

export function findClosingParenthesesIndex(proposition, startIndex, directionIsLeft) {
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

    if (proposition.charAt(centerIndex - 1) === ')') {
        let closingParenthesesIndex = findClosingParenthesesIndex(proposition, centerIndex - 1, true);
        result[0] = proposition.substring(closingParenthesesIndex, centerIndex);
    }

    if (proposition.charAt(centerIndex + 1) === '(') {
        let closingParenthesesIndex = findClosingParenthesesIndex(proposition, centerIndex + 1, false);
        result[1] = proposition.substring(centerIndex + 1, closingParenthesesIndex + 1);
    }

    return result;
}

export function parse(tree, proposition) {
    let currentDepth = 0;

    for (let i = 0; i < proposition.length; i++) {
        let c = proposition.charAt(i);

        if (c === '(') currentDepth++;
        if (c === ')') currentDepth--;

        if (currentDepth !== 1) continue;

        if (c === '>' || c === '=' || c === '^' || c === 'v') {
            tree.left = {};
            tree.right = {};
            tree.value = c;

            let parentheses = getLeftAndRightSubPropositions(proposition, i);

            if (proposition.charAt(i - 1) === ')') {
                parse(tree.left, parentheses[0]);
            } else {
                if (proposition.charAt(i - 2) === '~') {
                    tree.left.value = '~';
                    tree.left.left = {};
                    tree.left.left.value = proposition.charAt(i - 1);
                } else {
                    tree.left.value = proposition.charAt(i - 1);
                }
            }

            if (proposition.charAt(i + 1) === '(') {
                parse(tree.right, parentheses[1]);
            } else {
                if (proposition.charAt(i + 1) === '~') {
                    tree.right.value = '~';
                    tree.right.left = {};
                    tree.right.left.value = proposition.charAt(i + 2);
                } else {
                    tree.right.value = proposition.charAt(i + 1);
                }
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