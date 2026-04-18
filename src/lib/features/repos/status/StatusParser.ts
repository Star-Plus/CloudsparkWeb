import FileStatus from "./FileStatus";
import { StatusMapper } from "./STATUS";

export default class StatusParser {
    public static parseStatusString(statusString: string): any {
        try {
            const statusLines = statusString.split('\n').filter(line => line.trim() !== '');
    
            const statusList = statusLines.map(line => {
                const parts = line.trim().split(':');
                if (parts.length !== 2) {
                    return null;
                }
    
                const status = StatusMapper.fromString(parts[1].trim());
    
                return new FileStatus(parts[0].trim(), status!);
            });
            
            return statusList;
        }
        catch (error) {
            throw error;
        }
    }
}