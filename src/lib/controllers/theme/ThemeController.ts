export default class ThemeController {

    private isDark: boolean;

    private static instance: ThemeController;

    private constructor() {
        if (!window) throw new Error('ThemeController can only be initialized in the browser');
        ThemeController.instance = this;

        this.isDark = localStorage.getItem('theme') === 'dark';
        this.applyTheme(this.isDark);
    }

    static getInstance(): ThemeController {
        if (!ThemeController.instance) {
            ThemeController.instance = new ThemeController();
        }
        return this.instance;
    }

    applyTheme(isDark: boolean) {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }

        this.isDark = isDark;
    }

    toggleTheme() {
        this.applyTheme(!this.isDark);
    }

    getTheme(): boolean {
        return this.isDark;
    }
}