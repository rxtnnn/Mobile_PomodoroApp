import { Injectable } from '@angular/core';
import { LocalNotifications, PermissionStatus, LocalNotificationSchema, ScheduleResult } from '@capacitor/local-notifications';
import { ToastController, Platform } from '@ionic/angular';
import { getDefaultTimezone, formatDateInTimezone } from '../utils/timezone-util';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  defaultTimeZone: string = '';

  constructor(
    private toastController: ToastController,
    private platform: Platform
  ) {
    // Initialize when the service is created
    this.initializeNotifications();
  }

  private async initializeNotifications() {
    // Wait for the platform to be ready
    await this.platform.ready();

    // Request permissions on startup
    await this.requestNotificationPermissions();

    // Create notification channel for Android
    if (this.platform.is('android')) {
      try {
        await LocalNotifications.createChannel({
          id: 'pomodoro-notifications',
          name: 'Pomodoro Timer',
          description: 'Notifications for Pomodoro Timer app',
          importance: 5, // High importance enables sound and vibration
          visibility: 1,
          lights: true,
          lightColor: '#FF0000',
          sound: 'notification.wav'
        });
        console.log('Notification channel created successfully');
      } catch (error) {
        console.error('Error creating notification channel:', error);
      }
    }

    // Set up notification listeners
    this.listenForIncomingNotifications();
  }

  // Check notification permissions
  async checkNotificationPermissions(): Promise<PermissionStatus> {
    const permissions = await LocalNotifications.checkPermissions();
    console.log('Current permissions:', permissions);
    return permissions;
  }

  // Request notification permissions
  async requestNotificationPermissions(): Promise<PermissionStatus> {
    const permissions = await LocalNotifications.requestPermissions();
    console.log('Updated permissions:', permissions);
    return permissions;
  }

  // Create a notification
  async scheduleNotification(notification: LocalNotificationSchema) {
    this.defaultTimeZone = getDefaultTimezone();

    // Ensure permissions are granted
    const permissions = await this.checkNotificationPermissions();
    if (permissions.display !== 'granted') {
      console.log('Notification permissions not granted. Requesting...');
      await this.requestNotificationPermissions();
    }

    // For Android, make sure to set the channelId
    if (this.platform.is('android')) {
      notification = {
        ...notification,
        channelId: 'pomodoro-notifications',
        sound: 'notification.wav'
      };
    }

    try {
      await LocalNotifications.schedule({
        notifications: [notification],
      });
      console.log('Notification scheduled:', notification);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  // Read all pending notifications
  async getPendingNotifications(): Promise<ScheduleResult> {
    const pending = await LocalNotifications.getPending();
    console.log('Pending notifications:', pending);
    return pending;
  }

  // Update a notification
  async updateNotification(id: number, updatedNotification: LocalNotificationSchema) {
    await LocalNotifications.cancel({ notifications: [{ id }] });
    await this.scheduleNotification(updatedNotification);
    console.log(`Notification with ID ${id} updated.`);
  }

  // Delete a notification
  async cancelNotification(id: number) {
    await LocalNotifications.cancel({ notifications: [{ id }] });
    console.log(`Notification with ID ${id} canceled.`);
  }

  // Listen for incoming notifications
  listenForIncomingNotifications() {
    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('Notification received:', notification);
      this.displayInAppNotification(notification);
    });
  }

  async displayInAppNotification(notification: any) {
    const toast = await this.toastController.create({
      header: notification.title,
      message: notification.body,
      position: 'top',
      duration: 5000,
      color: 'dark',
      cssClass: 'notification-toast',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}
