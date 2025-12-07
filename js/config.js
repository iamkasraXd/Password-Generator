class Config {
    constructor() {
        this.settings = {
            clipboardClearTime: 0,
            breachCheckEnabled: true,
            defaultLength: 12,
            defaultCharsets: {
                uppercase: true,
                lowercase: true,
                numbers: true,
                symbols: false
            },
            excludeSimilar: false,
            excludeAmbiguous: false,
            darkTheme: true
        };
        this.load();
    }

    load() {
        try {
            const saved = localStorage.getItem('passwordGeneratorConfig');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Failed to load config:', error);
        }
    }

    save() {
        try {
            localStorage.setItem('passwordGeneratorConfig', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Failed to save config:', error);
        }
    }

    get(key) {
        return this.settings[key];
    }

    set(key, value) {
        this.settings[key] = value;
        this.save();
    }
}

const config = new Config();