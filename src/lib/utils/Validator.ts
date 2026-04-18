export default class Validator {

    processor : Function;
    errorMessage : string = "Validation failed";

    public constructor(
        processor: Function,
        errorMessage: string = "Validation failed"
    ){
        this.processor = processor;
        this.errorMessage = errorMessage;
    }

}