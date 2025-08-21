export class PWAService {
  private static instance: PWAService;
  private registration: ServiceWorkerRegistration | null = null;

  static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  async init(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');

        // Listen for updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration!.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                this.showUpdateNotification();
              }
            });
          }
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'SYNC_DATA') {
            // Handle background sync
            this.handleBackgroundSync();
          }
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private showUpdateNotification(): void {
    if (confirm('A new version is available. Would you like to update?')) {
      window.location.reload();
    }
  }

  private handleBackgroundSync(): void {
    // Trigger data sync when connection is restored
    window.dispatchEvent(new CustomEvent('background-sync'));
  }

  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (this.registration && 'Notification' in window && Notification.permission === 'granted') {
      await this.registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options
      });
    }
  }

  isInstallable(): boolean {
    return 'beforeinstallprompt' in window;
  }

  async promptInstall(): Promise<boolean> {
    const event = (window as any).deferredPrompt;
    if (event) {
      event.prompt();
      const result = await event.userChoice;
      (window as any).deferredPrompt = null;
      return result.outcome === 'accepted';
    }
    return false;
  }

  isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  async registerBackgroundSync(tag: string): Promise<void> {
    if (this.registration && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        await this.registration.sync.register(tag);
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }
}