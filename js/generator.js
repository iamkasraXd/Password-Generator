class PasswordGenerator {
    constructor() {
        this.charsets = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };
        
        this.similarChars = '1l|I0O';
        this.ambiguousSymbols = '{}[]()';
        
        this.wordList = [
            'able', 'about', 'account', 'acid', 'across', 'act', 'addition', 'adjustment', 'advertisement', 'after',
            'again', 'against', 'agreement', 'air', 'all', 'almost', 'among', 'amount', 'amusement', 'and',
            'angle', 'angry', 'animal', 'answer', 'ant', 'any', 'apparatus', 'apple', 'approval', 'arch',
            'argument', 'arm', 'army', 'art', 'as', 'at', 'attack', 'attempt', 'attention', 'attraction',
            'authority', 'automatic', 'awake', 'baby', 'back', 'bad', 'bag', 'balance', 'ball', 'band'
        ];
    }

    generate(options) {
        const mode = options.mode || 'random';
        
        switch (mode) {
            case 'passphrase':
                return this.generatePassphrase(options);
            case 'human':
                return this.generateHumanFriendly(options);
            case 'developer':
                return this.generateDeveloper(options);
            default:
                return this.generateRandom(options);
        }
    }

    generateRandom(options) {
        if (options.pattern) {
            return this.generateFromPattern(options.pattern);
        }

        let charset = this.buildCharset(options);
        if (!charset) return '';

        const length = options.length || 12;
        let password = '';

        // Use crypto.getRandomValues for secure random generation
        const array = new Uint32Array(length);
        crypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
            password += charset[array[i] % charset.length];
        }

        return password;
    }

    generateFromPattern(pattern) {
        let password = '';
        const array = new Uint32Array(pattern.length);
        crypto.getRandomValues(array);

        for (let i = 0; i < pattern.length; i++) {
            const char = pattern[i];
            let charset = '';

            switch (char) {
                case 'A':
                    charset = this.charsets.uppercase;
                    break;
                case 'a':
                    charset = this.charsets.lowercase;
                    break;
                case '#':
                    charset = this.charsets.numbers;
                    break;
                case '!':
                    charset = this.charsets.symbols;
                    break;
                default:
                    password += char;
                    continue;
            }

            password += charset[array[i] % charset.length];
        }

        return password;
    }

    generatePassphrase(options) {
        const wordCount = Math.min(Math.max(options.length || 4, 4), 8);
        const words = [];
        const array = new Uint32Array(wordCount);
        crypto.getRandomValues(array);

        for (let i = 0; i < wordCount; i++) {
            const word = this.wordList[array[i] % this.wordList.length];
            words.push(word.charAt(0).toUpperCase() + word.slice(1));
        }

        return words.join('-');
    }

    generateHumanFriendly(options) {
        const consonants = 'bcdfghjklmnpqrstvwxyz';
        const vowels = 'aeiou';
        const length = Math.max(options.length || 8, 6);
        let password = '';

        const array = new Uint32Array(length);
        crypto.getRandomValues(array);

        for (let i = 0; i < length - 4; i++) {
            if (i % 2 === 0) {
                password += consonants[array[i] % consonants.length];
            } else {
                password += vowels[array[i] % vowels.length];
            }
        }

        // Add numbers at the end
        for (let i = length - 4; i < length; i++) {
            password += this.charsets.numbers[array[i] % this.charsets.numbers.length];
        }

        // Capitalize first letter
        return password.charAt(0).toUpperCase() + password.slice(1);
    }

    generateDeveloper(options) {
        const type = options.devType || 'api';
        
        switch (type) {
            case 'jwt':
                return this.generateBase64Key(32);
            case 'ssh':
                return this.generatePassphrase({ length: 5 });
            case 'hex':
                return this.generateHexKey(options.length || 32);
            case 'base64':
                return this.generateBase64Key(options.length || 32);
            default: // api
                return 'sk_' + this.generateRandom({ 
                    length: 24, 
                    uppercase: false, 
                    lowercase: true, 
                    numbers: true, 
                    symbols: false 
                });
        }
    }

    generateHexKey(length) {
        const hexChars = '0123456789abcdef';
        let key = '';
        const array = new Uint32Array(length);
        crypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
            key += hexChars[array[i] % hexChars.length];
        }

        return key;
    }

    generateBase64Key(length) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode(...array)).replace(/[+/=]/g, '').substring(0, length);
    }

    buildCharset(options) {
        let charset = '';

        if (options.uppercase) charset += this.charsets.uppercase;
        if (options.lowercase) charset += this.charsets.lowercase;
        if (options.numbers) charset += this.charsets.numbers;
        if (options.symbols) charset += this.charsets.symbols;

        if (options.excludeSimilar) {
            charset = charset.split('').filter(char => !this.similarChars.includes(char)).join('');
        }

        if (options.excludeAmbiguous) {
            charset = charset.split('').filter(char => !this.ambiguousSymbols.includes(char)).join('');
        }

        return charset;
    }
}

const passwordGenerator = new PasswordGenerator();