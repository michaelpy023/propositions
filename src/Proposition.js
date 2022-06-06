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

export function simplify(proposition) {
    return (
        proposition.replace(/\s/g, "")
            .replaceAll('<->', '=')
            .replaceAll('<=>', '=')
            .replaceAll('->', '>')
            .replaceAll('=>', '>')
    );
}

export function isPropositionValid(proposition) {
    let notFinished = true;
    
    function charAt(i) {
        return proposition.charAt(i);
    }

    function replaceBetween(str, startIndex, endIndex, newValue) {
        return str.substring(0, startIndex) + newValue + str.substring(endIndex);
    }

    while (notFinished) {
        notFinished = false;

        let replacements = [];

        for (let i = 0; i < proposition.length; i++) {
            const c = charAt(i);

            if (isPropositionalLetter(c)) {
                replacements.push({ from: i, to: i, newChar: '0' });
                notFinished = true;
                break;
            }

            if (c === '~') {
                if (charAt(i + 1) == '0') {
                    replacements.push({ from: i, to: i + 1, newChar: '0' });
                    notFinished = true;
                    break;
                }
            } else if (c === '^' || c === '>' || c === '=' || c === 'v') {
                if (charAt(i - 2) === '(' && charAt(i + 2) === ')') {
                    replacements.push({ from: i - 2, to: i + 2, newChar: '0'});
                    notFinished = true;
                    break;
                }
            }
        }

        replacements.forEach(r => proposition = replaceBetween(proposition, r.from, r.to + 1, r.newChar));
    }

    return proposition === '0';
}