/**
 * Manages all UI interactions and DOM manipulations.
 */
class UIManager {
    constructor(elements) {
        this.elements = elements;
    }

    updateLengthDisplay(value) {
        this.elements.lengthValue.textContent = value;
    }

    toggleDeveloperOptions(isDeveloperMode) {
        this.elements.developerOptions.classList.toggle('hidden', !isDeveloperMode);
        this.elements.patternInput.parentElement.classList.toggle('hidden', isDeveloperMode);
    }

    updatePasswordOutput(password) {
        this.elements.passwordOutput.value = password;
        if (window.animations) {
            window.animations.pulse(this.elements.passwordOutput);
            window.animations.addGlow(this.elements.passwordOutput);
        }
    }

    clearBreachResult() {
        if (this.elements.breachResult) {
            this.elements.breachResult.textContent = '';
            this.elements.breachResult.className = 'breach-result';
        }
    }

    setBreachCheckState(isChecking) {
        this.elements.breachCheckBtn.disabled = isChecking;
        this.elements.breachCheckBtn.textContent = isChecking ? 'Checking...' : 'Check for Breaches';
    }

    setButtonIcon(button, iconName) {
        button.innerHTML = `<i class="ph-${iconName}"></i>`;
    }

    loadSettingsToUI() {
        this.elements.lengthSlider.value = config.get('defaultLength');
        this.updateLengthDisplay(this.elements.lengthSlider.value);

        const charsets = config.get('defaultCharsets');
        this.elements.uppercase.checked = charsets.uppercase;
        this.elements.lowercase.checked = charsets.lowercase;
        this.elements.numbers.checked = charsets.numbers;
        this.elements.symbols.checked = charsets.symbols;

        this.elements.excludeSimilar.checked = config.get('excludeSimilar');
        this.elements.excludeAmbiguous.checked = config.get('excludeAmbiguous');
        this.elements.clipboardClear.value = config.get('clipboardClearTime');
    }
}

/**
 * Main application class for the Password Generator.
 * Handles UI initialization, event binding, and user interactions.
 */
class PasswordGeneratorApp {
    /**
     * Initializes the application.
     */
    constructor() {
        this.currentPassword = '';
        this.initialize();
    }

    /**
     * Sets up elements, UI manager, binds events, loads settings,
     * and generates an initial password.
     */
    initialize() {
        this.initializeElements();
        this.ui = new UIManager(this.elements);
        this.bindEvents();
        this.ui.loadSettingsToUI();
    }

    /**
     * Caches references to all necessary DOM elements.
     */
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
            breachResult: document.getElementById('breachResult')
        };
    }

    /**
     * Attaches event listeners to all interactive UI elements.
     */
    bindEvents() {
        // Only generate password when buttons are clicked
        this.elements.generateBtn.addEventListener('click', () => this.generatePassword());
        this.elements.regenerateBtn.addEventListener('click', () => this.generatePassword());

        this.elements.lengthSlider.addEventListener('input', e => {
            this.ui.updateLengthDisplay(e.target.value);
            if (window.animations) {
                window.animations.scale(this.elements.lengthValue, 1.3, 200);
            }
        });

        this.elements.modeSelect.addEventListener('change', e => {
            this.ui.toggleDeveloperOptions(e.target.value === 'developer');
        });

        this.elements.copyBtn.addEventListener('click', () => this.copyPassword());
        this.elements.breachCheckBtn.addEventListener('click', () => this.checkBreach());

        this.elements.clipboardClear.addEventListener('change', e => {
            config.set('clipboardClearTime', parseInt(e.target.value, 10));
        });
        
        // Add ripple effect to all buttons
        if (window.animations) {
            document.querySelectorAll('.btn, .copy-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    window.animations.createRipple(e, btn);
                });
            });
        }
    }

    /**
     * Saves the current UI settings to local storage.
     */
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
        config.set('clipboardClearTime', parseInt(this.elements.clipboardClear.value));
    }

    /**
     * Generates a new password based on current settings and updates the UI.
     */
    generatePassword() {
        try {
            const options = this.getGenerationOptions();
            this.currentPassword = passwordGenerator.generate(options);
            this.ui.updatePasswordOutput(this.currentPassword);
            
            securityManager.updateStrengthDisplay(this.currentPassword);
            this.ui.clearBreachResult();
            
            if (window.animations) {
                window.animations.rotate(this.elements.generateBtn, 360, 400);
            }
            
            this.saveSettings();
        } catch (error) {
            console.error('Error generating password:', error);
            if (window.animations) {
                window.animations.shake(this.elements.passwordOutput);
            }
        }
    }

    /**
     * Gathers all password generation options from the UI.
     * @returns {object} An object containing all options for password generation.
     */
    getGenerationOptions() {
        return {
            length: parseInt(this.elements.lengthSlider.value),
            uppercase: this.elements.uppercase.checked,
            lowercase: this.elements.lowercase.checked,
            numbers: this.elements.numbers.checked,
            symbols: this.elements.symbols.checked,
            excludeSimilar: this.elements.excludeSimilar.checked,
            excludeAmbiguous: this.elements.excludeAmbiguous.checked,
            pattern: this.elements.patternInput.value.trim() || null,
            mode: this.elements.modeSelect.value,
            devType: this.elements.devModeSelect.value
        };
    }

    /**
     * Copies the current password to the clipboard and shows a confirmation.
     */
    async copyPassword() {
        if (!this.currentPassword) return;
        
        try {
            const success = await securityManager.copyToClipboard(this.currentPassword);
            if (success) {
                this.ui.setButtonIcon(this.elements.copyBtn, 'check');
                
                if (window.animations) {
                    window.animations.scale(this.elements.copyBtn, 1.2);
                    window.animations.createConfetti();
                }
                
                setTimeout(() => this.ui.setButtonIcon(this.elements.copyBtn, 'copy'), 2000);
            }
        } catch (error) {
            console.error('Copy error:', error);
        }
    }

    /**
     * Checks the current password against a list of known data breaches.
     */
    async checkBreach() {
        if (!this.currentPassword) return;
        
        this.ui.setBreachCheckState(true);
        
        try {
            const result = await securityManager.checkBreach(this.currentPassword);
            securityManager.displayBreachResult(result);
        } catch (error) {
            console.error('Breach check error:', error);
        } finally {
            this.ui.setBreachCheckState(false);
        }
    }
    
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new PasswordGeneratorApp();
        console.log('✓ Password Generator initialized successfully');
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
});
