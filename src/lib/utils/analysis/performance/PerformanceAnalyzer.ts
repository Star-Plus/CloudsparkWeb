
export default class PerformanceAnalyzer {

    private static stack: PerformanceProfile[] = [];

    public static startRecording(label: string = "Default") {
        const profile = new PerformanceProfile(label);
        this.stack.push(profile);
        performance.mark(`start-${profile.id}`);
    }

    public static stopRecording() {
        const profile = this.stack.pop();
        if (!profile) {
            console.warn("PerformanceAnalyzer: No profile to stop.");
            return;
        }

        performance.mark(`end-${profile.id}`);
        performance.measure("duration", `start-${profile.id}`, `end-${profile.id}`);
        const duration = performance.getEntriesByName("duration")[0].duration;
        console.log(`[Profile: ${profile.label}] Duration: ${duration.toFixed(2)} ms`);
    }

};

export class PerformanceProfile {

    id: string = crypto.randomUUID();
    label: string;

    constructor(label: string) {
        this.label = label;
    }
    
}