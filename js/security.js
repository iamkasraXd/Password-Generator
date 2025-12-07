class SecurityManager {
    constructor() {
        this.clipboardTimer = null;
        this.lastCopiedPassword = null;
    }

    calculateStrength(password) {
        if (!password) return { score: 0, entropy: 0, text: 'Very Weak' };

        const length = password.length;
        let poolSize = 0;

        // Calculate character pool size
        if (/[a-z]/.test(password)) poolSize += 26;
        if (/[A-Z]/.test(password)) poolSize += 26;
        if (/[0-9]/.test(password)) poolSize += 10;
        if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

        const entropy = length * Math.log2(poolSize);
        let score = 0;
        let text = 'Very Weak';

        if (entropy >= 256) {
            score = 5;
            text = 'Excellent';
        } else if (entropy >= 128) {
            score = 4;
            text = 'Very Strong';
        } else if (entropy >= 60) {
            score = 3;
            text = 'Strong';
        } else if (entropy >= 36) {
            score = 2;
            text = 'Fair';
        } else if (entropy >= 28) {
            score = 1;
            text = 'Weak';
        }

        return { score, entropy: Math.round(entropy), text };
    }

    updateStrengthDisplay(password) {
        const strength = this.calculateStrength(password);
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        const entropyText = document.getElementById('entropyText');

        // Update progress bar
        const percentage = Math.min((strength.score / 5) * 100, 100);
        strengthFill.style.width = percentage + '%';

        // Update colors
        strengthFill.className = '';
        const colorClass = [
            'strength-very-weak',
            'strength-weak', 
            'strength-fair',
            'strength-strong',
            'strength-very-strong',
            'strength-excellent'
        ][strength.score];
        strengthFill.classList.add(colorClass);

        // Update text
        strengthText.textContent = strength.text;
        entropyText.textContent = `${strength.entropy} bits`;
    }

    async copyToClipboard(password) {
        try {
            await navigator.clipboard.writeText(password);
            this.lastCopiedPassword = password;
            this.startClipboardTimer();
            console.log('Password copied to clipboard');
            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    }

    startClipboardTimer() {
        const clearTime = config.get('clipboardClearTime');
        if (clearTime === 0) return;

        // Clear existing timer
        if (this.clipboardTimer) {
            clearTimeout(this.clipboardTimer);
        }

        this.clipboardTimer = setTimeout(async () => {
            try {
                const currentClipboard = await navigator.clipboard.readText();
                if (currentClipboard === this.lastCopiedPassword) {
                    await navigator.clipboard.writeText('');
                    console.log(`Clipboard auto-cleared after ${clearTime} seconds`);
                }
            } catch (error) {
                console.error('Failed to clear clipboard:', error);
            }
        }, clearTime * 1000);
    }

    async checkBreach(password) {
        if (!config.get('breachCheckEnabled')) {
            return { safe: true, message: 'Breach checking is disabled' };
        }

        try {
            // Calculate SHA-1 hash
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-1', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

            // Send only first 5 characters (k-anonymity)
            const prefix = hashHex.substring(0, 5);
            const suffix = hashHex.substring(5);

            const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
            if (!response.ok) {
                throw new Error('Network error');
            }

            const text = await response.text();
            const lines = text.split('\n');

            // Search for our hash suffix
            for (const line of lines) {
                const [hashSuffix, count] = line.trim().split(':');
                if (hashSuffix === suffix) {
                    return {
                        safe: false,
                        count: parseInt(count),
                        message: `⚠️ This password has been seen ${parseInt(count).toLocaleString()} times in data breaches!`
                    };
                }
            }

            return {
                safe: true,
                message: '✓ This password has not been found in known breaches'
            };

        } catch (error) {
            console.error('Breach check failed:', error);
            return {
                safe: null,
                message: 'Unable to check breach status (network error)'
            };
        }
    }

    displayBreachResult(result) {
        const breachResult = document.getElementById('breachResult');
        breachResult.textContent = result.message;
        
        breachResult.className = '';
        if (result.safe === true) {
            breachResult.classList.add('breach-safe');
        } else if (result.safe === false) {
            breachResult.classList.add('breach-found');
        } else {
            breachResult.classList.add('breach-error');
        }
    }
}

const securityManager = new SecurityManager();