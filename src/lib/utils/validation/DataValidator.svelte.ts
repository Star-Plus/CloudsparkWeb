export type ReviewResult = {
    isValid: boolean;
    message: string;
}

export default abstract class DataValidator {
    data: Map<string, any> = new Map<string, any>();
    errors: Map<string, string> = new Map<string, string>();
    
    isValid = $state<boolean>(false);

    feed(key: string, value: any) : void {
        const reviewRes = this.review(key, value);
        if (reviewRes.isValid) {
            this.data.set(key, value);
            this.errors.delete(key);

            if (this.errors.size === 0) {
                this.isValid = true;
            }
        }
        else {
            this.errors.set(key, reviewRes.message);
            this.isValid = false;
        }
    }

    protected abstract review(key: string, value: any): ReviewResult;

    getErrors(): Map<string, string> {
        return this.errors;
    }

    getData(): Map<string, string> {
        if (!this.isValid) {
            throw new Error('Data is not valid');
        }

        return this.data;
    }

    serialize<T>(): T {
        if (!this.isValid) {
            throw new Error('Data is not valid');
        }

        return Object.fromEntries(this.data.entries()) as T;
    }
}