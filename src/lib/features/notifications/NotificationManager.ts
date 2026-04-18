import { addNotification, removeNotification, type NotificationType } from '../../stores/notifications';

export class NotificationManager {
    static success(message: string, duration: number = 3000) {
        return addNotification({ message, type: 'success', duration });
    }

    static error(message: string, duration: number = 5000) {
        return addNotification({ message, type: 'error', duration });
    }

    static info(message: string, duration: number = 3000) {
        return addNotification({ message, type: 'info', duration });
    }

    static warning(message: string, duration: number = 4000) {
        return addNotification({ message, type: 'warning', duration });
    }

    static remove(id: string) {
        removeNotification(id);
    }
}
