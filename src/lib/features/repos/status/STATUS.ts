const enum FILE_STATUS {
    MODIFIED = 'M',
    UNTRACKED = 'N',
    DELETED = 'D',
}

export class StatusMapper {
    public static fromString(statusStr: string): FILE_STATUS | null {
        switch (statusStr) {
            case 'Modified':
                return FILE_STATUS.MODIFIED;
            case 'Untracked':
                return FILE_STATUS.UNTRACKED;
            case 'Deleted':
                return FILE_STATUS.DELETED;
            default:
                throw new Error(`Unknown status string: ${statusStr}`);
        }
    }

    public static getStatusColor(status: FILE_STATUS): string {
        switch (status) {
            case FILE_STATUS.MODIFIED:
                return 'bg-yellow-500';
            case FILE_STATUS.UNTRACKED:
                return 'bg-emerald-600';
            case FILE_STATUS.DELETED:
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    }
}

export default FILE_STATUS;