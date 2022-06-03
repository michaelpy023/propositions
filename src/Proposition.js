export function isPropositionalLetter(c) {
    switch (c) {
        case 'p':
        case 'q':
        case 'r':
        case 's':
        case 't':
        case 'u':
        case 'w':
        case 'y':
        case 'z':
            return true;
    }

    return false;
}

function getErrorString(error) {
    return '[ERROR] ' + error;
}

function getErrorHint(proposition, i) {
    let str = '';

    for (let j = 0; j < proposition.length; j++) {
        if (j === i) {
            str += '*';
        } else {
            str += proposition.charAt(j);
        }
    }

    return "at position " + i + " indicated by * : " + str;
}

function getExpectedString(arr) {
    let str = 'expected one of the following: ';

    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === 'A') str += "Any letter"
        else str += arr[i];

        if (i !== arr.length - 1) str += ', ';
    }

    return str;
}

export function simplify(proposition) {
    return (
        proposition.replace(/\s/g, "")
            .replaceAll('<->', '=')
            .replaceAll('<=>', '=')
            .replaceAll('->', '>')
            .replaceAll('=>', '>')
    );
}

export function isValid(proposition, callback) {
    const nextExpectedCharacters = [];

    let parenthesesCount = 0;
    let operatorCount = 0;
    let letterCount = 0;

    for (let i = 0; i < proposition.length; i++) {
        let c = proposition.charAt(i);

        while (nextExpectedCharacters.length > 0) {
            let arr = nextExpectedCharacters.shift();
            let success = false;

            for (let j = 0; j < arr.length; j++) {
                const expect = arr[j];

                if (expect !== 'A') {
                    if (c === expect) {
                        success = true;
                        break;
                    }
                }

                if (expect === 'A') {
                    if (isPropositionalLetter(c)) {
                        success = true;
                        break;
                    }
                }
            }

            if (!success) {
                return callback(false, 
                    getErrorString('Unexpected character '),
                    getErrorHint(proposition, i),
                    getExpectedString(arr));
            }
        }

        if (i > proposition.length - 1) {
            return callback(false, getErrorString("Expression is invalid. Parentheses are incorrect."));
        }

        if (c === '(') {
            parenthesesCount++;
            nextExpectedCharacters.push(['(', 'A', '~']);
        } else if (c === ')') {
            parenthesesCount--;
            operatorCount--;
            letterCount = 0;

            if (operatorCount < 0) {
                return callback(false, 
                    getErrorString("A parenthesis has no operator inside "),
                    getErrorHint(proposition, i));
            }

            let expect;

            if (parenthesesCount > 0) expect = [')', '>', '=', '^', 'v'];
            else expect = ['>', '=', '^', 'v'];

            nextExpectedCharacters.push(expect);
        } else if (isPropositionalLetter(c)) {
            letterCount++;

            let expect;

            if (parenthesesCount > 0) expect = [')', '>', '=', '^', 'v'];
            else expect = ['>', '=', '^', 'v'];

            nextExpectedCharacters.push(expect);
        } else if (c === '>' || c === '=' || c === '^' || c === 'v') {
            operatorCount++;

            if (parenthesesCount === 0) {
                return callback(false, 
                    getErrorString("Binary operator has no parentheses "),
                    getErrorHint(proposition, i));
            }

            if (operatorCount > parenthesesCount) {
                return callback(false, 
                    getErrorString("A parenthesis has more than one operator "),
                    getErrorHint(proposition, i));
            }

            if (letterCount >= 2) {
                return callback(false,
                    getErrorString("A parenthesis has more than one operator"),
                    getErrorHint(proposition, i));
            }

            if (parenthesesCount > 0 && letterCount > 1) {
                return callback(false,
                    getErrorString("A parenthesis has more than one operator"),
                    getErrorHint(proposition, i));
            }

            if (c === '>') {
                nextExpectedCharacters.push(['(', '~', 'A']);
            } else if (c === '=') {
                nextExpectedCharacters.push(['(', '~', 'A']);
            } else if (c === '^') {
                nextExpectedCharacters.push(['(', '~', 'A']);
            } else if (c === 'v') {
                nextExpectedCharacters.push(['(', '~', 'A']);
            }
        } else if (c === '~') {
            nextExpectedCharacters.push(['(', 'A']);
        } else {
            return callback(false, 
                getErrorString("Invalid expression "),
                getErrorHint(proposition, i));
        }
    }

    if (parenthesesCount > 0) {
        return callback(false, getErrorString('A parenthesis was not closed!'));
    }

    callback(true);
}