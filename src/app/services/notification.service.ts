import { Injectable } from '@angular/core';
import {
  LocalNotifications,
  PermissionStatus,
  LocalNotificationSchema,
  ScheduleResult,
  Channel
} from '@capacitor/local-notifications';
import { ToastController, Platform } from '@ionic/angular';
import { Haptics } from '@capacitor/haptics';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly CHANNEL_ID = 'pomodoro-notifications-' + new Date().getTime();

  constructor(
    private toastController: ToastController,
    private platform: Platform
  ) {
    this.initializeNotifications();
  }

  private async initializeNotifications() {
    await this.platform.ready();
    await this.requestNotificationPermissions();

    if (this.platform.is('android')) {
      try {
        const { channels } = await LocalNotifications.listChannels();
        for (const ch of channels) {
          if (ch.id.startsWith('pomodoro-notifications')) {
            await LocalNotifications.deleteChannel({ id: ch.id });
          }
        }

        const channel: Channel = {
          id: this.CHANNEL_ID,
          name: 'Pomodoro Timer Alerts',
          description: 'Notifications for Pomodoro Timer completions',
          importance: 5,
          visibility: 1,
          vibration: true,
          lights: true,
          lightColor: '#FF0000'
        };

        await LocalNotifications.createChannel(channel);
      } catch (err) {
        console.error('Error setting up Android channel:', err);
      }
    }
    this.listenForIncomingNotifications();
  }

  async requestNotificationPermissions(): Promise<PermissionStatus> {
    return await LocalNotifications.requestPermissions();
  }

  async listenForIncomingNotifications() {
    LocalNotifications.addListener(
      'localNotificationReceived',
      async (notification) => {
        try {
          await Haptics.vibrate();
        } catch (e) {
          console.warn('Haptics failed:', e);
        }
        this.displayInAppNotification(notification);
      }
    );
  }

  async checkNotificationPermissions(): Promise<PermissionStatus> {
    return LocalNotifications.checkPermissions();
  }

  async scheduleNotification(
    notification: LocalNotificationSchema,
    exact: boolean = false
  ) {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }

    if (this.platform.is('android')) {
      notification.channelId = this.CHANNEL_ID;
    }

    const scheduleOpts: any = {
      notifications: [notification]
    };
    if (exact) {
      scheduleOpts.allowWhileIdle = true;
    }

    await LocalNotifications.schedule(scheduleOpts);
  }

  async playWorkCompleteSound() {
    await this.scheduleNotification({
      id: Math.random() * 10000 | 0,
      title: 'Pomodoro Completed',
      body: 'Time for a 5-minute break!',
      ongoing: false,
      autoCancel: true
    }, true);
  }

  async playBreakCompleteSound() {
    await this.scheduleNotification({
      id: Math.random() * 10000 | 0,
      title: 'Break Completed',
      body: 'Ready for the next Pomodoro?',
      ongoing: false,
      autoCancel: true
    }, true);
  }

  async getPendingNotifications(): Promise<ScheduleResult> {
    return LocalNotifications.getPending();
  }

  async cancelNotification(id: number) {
    await LocalNotifications.cancel({ notifications: [{ id }] });
  }

  async updateNotification(id: number, updated: LocalNotificationSchema) {
    await LocalNotifications.cancel({ notifications: [{ id }] });
    updated.id = id;
    await this.scheduleNotification(updated);
  }

  async displayInAppNotification(notification: any) {
    const toast = await this.toastController.create({
      header: notification.title,
      message: notification.body,
      position: 'top',
      duration: 3000,
      color: 'dark',
    });
    await toast.present();
  }
}
