class PasswordGeneratorApp {
    constructor() {
        this.currentPassword = '';
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
        this.generatePassword();
    }

    initializeElements() {
        this.elements = {
            passwordOutput: document.getElementById('passwordOutput'),
            copyBtn: document.getElementById('copyBtn'),
            lengthSlider: document.getElementById('lengthSlider'),
            lengthValue: document.getElementById('lengthValue'),
            uppercase: document.getElementById('uppercase'),
            lowercase: document.getElementById('lowercase'),
            numbers: document.getElementById('numbers'),
            symbols: document.getElementById('symbols'),
            excludeSimilar: document.getElementById('excludeSimilar'),
            excludeAmbiguous: document.getElementById('excludeAmbiguous'),
            patternInput: document.getElementById('patternInput'),
            modeSelect: document.getElementById('modeSelect'),
            developerOptions: document.getElementById('developerOptions'),
            devModeSelect: document.getElementById('devModeSelect'),
            generateBtn: document.getElementById('generateBtn'),
            regenerateBtn: document.getElementById('regenerateBtn'),
            breachCheckBtn: document.getElementById('breachCheckBtn'),
            clipboardClear: document.getElementById('clipboardClear'),
            themeToggle: document.getElementById('themeToggle'),
            toast: document.getElementById('toast'),
            breachResult: document.getElementById('breachResult')
        };
    }

    bindEvents() {
        // Length slider
        this.elements.lengthSlider.addEventListener('input', (e) => {
            this.elements.lengthValue.textContent = e.target.value;
            this.generatePassword();
        });

        // Character options
        [this.elements.uppercase, this.elements.lowercase, this.elements.numbers, this.elements.symbols].forEach(checkbox => {
            checkbox.addEventListener('change', () => this.generatePassword());
        });

        // Filters
        [this.elements.excludeSimilar, this.elements.excludeAmbiguous].forEach(checkbox => {
            checkbox.addEventListener('change', () => this.generatePassword());
        });

        // Pattern input
        this.elements.patternInput.addEventListener('input', () => this.generatePassword());

        // Mode selection
        this.elements.modeSelect.addEventListener('change', () => {
            const isDeveloperMode = this.elements.modeSelect.value === 'developer';
            this.elements.developerOptions.classList.toggle('hidden', !isDeveloperMode);
            this.elements.patternInput.parentElement.classList.toggle('hidden', isDeveloperMode);
            this.generatePassword();
        });
        
        this.elements.devModeSelect.addEventListener('change', () => this.generatePassword());

        // Buttons
        this.elements.generateBtn.addEventListener('click', () => this.generatePassword());
        this.elements.regenerateBtn.addEventListener('click', () => this.generatePassword());
        this.elements.copyBtn.addEventListener('click', () => this.copyPassword());

        // Security features
        this.elements.breachCheckBtn.addEventListener('click', () => this.checkBreach());
        this.elements.clipboardClear.addEventListener('change', (e) => {
            config.set('clipboardClearTime', parseInt(e.target.value));
        });
        
        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    loadSettings() {
        // Load saved settings
        this.elements.lengthSlider.value = config.get('defaultLength');
        this.elements.lengthValue.textContent = config.get('defaultLength');
        
        const charsets = config.get('defaultCharsets');
        this.elements.uppercase.checked = charsets.uppercase;
        this.elements.lowercase.checked = charsets.lowercase;
        this.elements.numbers.checked = charsets.numbers;
        this.elements.symbols.checked = charsets.symbols;
        
        this.elements.excludeSimilar.checked = config.get('excludeSimilar');
        this.elements.excludeAmbiguous.checked = config.get('excludeAmbiguous');
        this.elements.clipboardClear.value = config.get('clipboardClearTime');
        
        // Load theme
        const isDark = config.get('darkTheme') || false;
        if (isDark) {
            document.body.classList.add('dark');
            this.elements.themeToggle.textContent = '☀️';
        }
    }

    saveSettings() {
        config.set('defaultLength', parseInt(this.elements.lengthSlider.value));
        config.set('defaultCharsets', {
            uppercase: this.elements.uppercase.checked,
            lowercase: this.elements.lowercase.checked,
            numbers: this.elements.numbers.checked,
            symbols: this.elements.symbols.checked
        });
        config.set('excludeSimilar', this.elements.excludeSimilar.checked);
        config.set('excludeAmbiguous', this.elements.excludeAmbiguous.checked);
    }

    generatePassword() {
        try {
            const options = this.getGenerationOptions();
            this.currentPassword = passwordGenerator.generate(options);
            this.elements.passwordOutput.value = this.currentPassword;
            
            // Update security indicators
            securityManager.updateStrengthDisplay(this.currentPassword);
            
            // Clear previous breach check result
            if (this.elements.breachResult) {
                this.elements.breachResult.textContent = '';
            }
            
            // Save current settings
            this.saveSettings();
        } catch (error) {
            console.error('Error generating password:', error);
            this.showToast('Error generating password', 'error');
        }
    }

    getGenerationOptions() {
        const pattern = this.elements.patternInput.value.trim();
        
        const options = {
            length: parseInt(this.elements.lengthSlider.value),
            uppercase: this.elements.uppercase.checked,
            lowercase: this.elements.lowercase.checked,
            numbers: this.elements.numbers.checked,
            symbols: this.elements.symbols.checked,
            excludeSimilar: this.elements.excludeSimilar.checked,
            excludeAmbiguous: this.elements.excludeAmbiguous.checked,
            pattern: pattern || null,
            mode: this.elements.modeSelect.value
        };

        if (options.mode === 'developer') {
            options.devType = this.elements.devModeSelect.value;
        }

        return options;
    }

    async copyPassword() {
        if (!this.currentPassword) {
            this.showToast('No password to copy!', 'error');
            return;
        }
        
        try {
            const success = await securityManager.copyToClipboard(this.currentPassword);
            if (success) {
                this.showToast('✓ Password copied!', 'success');
            } else {
                this.showToast('Failed to copy', 'error');
            }
        } catch (error) {
            console.error('Copy error:', error);
            this.showToast('Failed to copy', 'error');
        }
    }

    async checkBreach() {
        if (!this.currentPassword) {
            this.showToast('Generate a password first!', 'error');
            return;
        }
        
        this.elements.breachCheckBtn.textContent = 'Checking...';
        this.elements.breachCheckBtn.disabled = true;
        
        try {
            const result = await securityManager.checkBreach(this.currentPassword);
            securityManager.displayBreachResult(result);
        } catch (error) {
            console.error('Breach check error:', error);
            this.showToast('Breach check failed', 'error');
        } finally {
            this.elements.breachCheckBtn.textContent = 'Check Breach';
            this.elements.breachCheckBtn.disabled = false;
        }
    }
    
    toggleTheme() {
        const isDark = document.body.classList.toggle('dark');
        this.elements.themeToggle.textContent = isDark ? '☀️' : '🌙';
        config.set('darkTheme', isDark);
    }
    
    showToast(message, type = 'info') {
        this.elements.toast.textContent = message;
        this.elements.toast.className = `toast ${type}`;
        this.elements.toast.classList.add('show');
        
        setTimeout(() => {
            this.elements.toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new PasswordGeneratorApp();
        console.log('✓ Password Generator initialized successfully');
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
});
