export default interface ITask {
    id: string;
    action: string;
    
    isDone(): boolean;
}