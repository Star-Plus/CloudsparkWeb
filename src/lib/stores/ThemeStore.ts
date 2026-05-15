import { browser } from "$app/environment";
import { writable } from "svelte/store";

const theme = writable("light");

if (browser) {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
        theme.set(storedTheme);
    }

    theme.subscribe((value) => {
        localStorage.setItem("theme", value);
    });
}

export default theme;