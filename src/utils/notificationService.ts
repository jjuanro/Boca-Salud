import { NotificationSchedule } from '../types/health';
import { sounds } from './audio';

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'water' | 'food' | 'exercise' | 'cheat' | 'move' | 'meal' | 'stand' | 'night_review' | 'system';
  timestamp: string;
}

type NotificationListener = (notification: InAppNotification) => void;

class NotificationService {
  private listeners: Set<NotificationListener> = new Set();
  private checkIntervalId: number | null = null;
  private lastFiredMinute: string = '';

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const res = await Notification.requestPermission();
      return res === 'granted';
    } catch {
      return false;
    }
  }

  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Trigger a notification (both Native Browser Notification + In-App Dynamic Island alert)
  dispatchNotification(item: {
    title: string;
    message: string;
    type?: InAppNotification['type'];
  }) {
    const notification: InAppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: item.title,
      message: item.message,
      type: item.type || 'system',
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };

    // Play pleasant Apple bell chime & haptics
    sounds.playNotificationChime();

    // Trigger In-App listeners (dynamic island / banner)
    this.listeners.forEach((fn) => fn(notification));

    // Also trigger native browser notification if allowed
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        new Notification(item.title, {
          body: item.message,
          icon: '/icon.svg',
          badge: '/icon.svg',
          tag: `vitalis-${notification.type}`,
        });
      } catch {
        // Fallback or silent in iframe
      }
    }
  }

  // Start background minute-clock monitor for scheduled notifications
  startScheduler(getSettings: () => NotificationSchedule[]) {
    if (typeof window === 'undefined') return;
    if (this.checkIntervalId !== null) return;

    this.checkIntervalId = window.setInterval(() => {
      const now = new Date();
      const currentHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      // Avoid firing multiple times within same minute
      if (currentHM === this.lastFiredMinute) return;

      const settings = getSettings();
      const matched = settings.filter((s) => s.enabled && s.time === currentHM);

      if (matched.length > 0) {
        this.lastFiredMinute = currentHM;
        matched.forEach((setting) => {
          this.dispatchNotification({
            title: setting.title,
            message: setting.message,
            type: setting.type,
          });
        });
      }
    }, 15000); // Check every 15s
  }

  stopScheduler() {
    if (this.checkIntervalId !== null) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
  }
}

export const notificationService = new NotificationService();
