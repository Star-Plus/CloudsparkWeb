export default class CountryRegionMapper {
    private countryToRegionMap: { [key: string]: [number, string, number] } = {
        "EG": [20, "twemoji:flag-egypt", 10],
        "US": [1, "twemoji:flag-united-states", 10],
    };

    public getAvailableCountries(): string[] {
        return Object.keys(this.countryToRegionMap);
    }

    public getCountryCode(country: string): number | null {
        const entry = this.countryToRegionMap[country];
        return entry ? entry[0] : null;
    }

    public getCountryFlagEmoji(country: string): string | null {
        const entry = this.countryToRegionMap[country];
        return entry ? entry[1] : null;
    }

    public getPhoneLength(country: string): number {
        const entry = this.countryToRegionMap[country];
        return entry[2];
    }
}