import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationService } from './notification.service';
import { Platform } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export enum TimerState {
  IDLE = 'idle',
  WORK = 'work',
  BREAK = 'break',
}

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private readonly WORK_TIME_MS = 1 * 60 * 1000;
  private readonly BREAK_TIME_MS = 1 * 60 * 1000;

  private timerState = new BehaviorSubject<TimerState>(TimerState.IDLE);
  private timeRemaining = new BehaviorSubject<number>(this.WORK_TIME_MS);
  private isRunning = new BehaviorSubject<boolean>(false);
  private timerId: any = null;
  private endTime: number = 0;
  private readonly WORK_END_NOTIFICATION_ID = 1;
  private readonly BREAK_END_NOTIFICATION_ID = 2;

  constructor(
    private notificationService: NotificationService,
    private platform: Platform,
    private toastController: ToastController
  ) {}

  getTimerState(): Observable<TimerState> {
    return this.timerState.asObservable();
  }

  getTimeRemaining(): Observable<number> {
    return this.timeRemaining.asObservable();
  }

  getIsRunning(): Observable<boolean> {
    return this.isRunning.asObservable();
  }

  startWorkSession() {
    this.clearTimer();
    this.timerState.next(TimerState.WORK);
    this.timeRemaining.next(this.WORK_TIME_MS);
    this.endTime = Date.now() + this.WORK_TIME_MS;
    this.startTimer();

    console.log('Work session started, duration:', this.formatTimeRemaining(this.WORK_TIME_MS));
  }

  startBreakSession() {
    this.clearTimer();
    this.timerState.next(TimerState.BREAK);
    this.timeRemaining.next(this.BREAK_TIME_MS);
    this.endTime = Date.now() + this.BREAK_TIME_MS;
    this.startTimer();

    console.log('Break session started, duration:', this.formatTimeRemaining(this.BREAK_TIME_MS));
  }

  // Reset timer back to initial state
  resetTimer() {
    this.clearTimer();
    this.timerState.next(TimerState.IDLE);
    this.timeRemaining.next(this.WORK_TIME_MS);
    this.isRunning.next(false);
    console.log('Timer reset');
  }

  toggleTimer() {
    console.log('Toggle timer called, current state:',
      this.timerState.value,
      'running:', this.isRunning.value);

    if (this.timerState.value === TimerState.IDLE) {
      console.log('Starting work session');
      this.startWorkSession();
    } else {
      // Instead of pause/resume logic, we now just reset
      console.log('Resetting timer');
      this.resetTimer();
    }
  }

  private startTimer() {
    this.isRunning.next(true);

    this.timerId = setInterval(() => {
      const remaining = Math.max(0, this.endTime - Date.now());
      this.timeRemaining.next(remaining);
      if (remaining <= 0) {
        this.handleTimerComplete();
      }
    }, 100);

    console.log('Timer started with interval ID:', this.timerId);
  }

  private async handleTimerComplete() {
    console.log('Timer complete, current state:', this.timerState.value);
    this.clearTimer();

    // Enhanced vibration with multiple approaches for better reliability
    await this.triggerVibration();

    if (this.timerState.value === TimerState.WORK) {
      await this.showCompletionToast('Work session completed! Time for a break.');
      this.scheduleWorkEndNotification();
      this.startBreakSession();
    } else if (this.timerState.value === TimerState.BREAK) {
      await this.showCompletionToast('Break completed! Session finished.');
      this.scheduleBreakEndNotification();
      // Changed: Instead of starting a new work session, just reset to IDLE state
      this.resetTimer();
    }
  }

  // Separated vibration logic for better organization
  private async triggerVibration() {
    try {
      // Try stronger vibration first
      await Haptics.impact({ style: ImpactStyle.Heavy });
      console.log('Haptics impact vibration triggered');

      // Then try standard vibration after a short delay
      setTimeout(async () => {
        try {
          await Haptics.vibrate();
          console.log('Standard haptics vibration triggered');
        } catch (err) {
          console.error('Standard vibration failed:', err);
        }
      }, 300);
    } catch (e) {
      console.error('Impact vibration failed:', e);

      // Try with navigator.vibrate as fallback
      try {
        if (navigator && navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
          console.log('Navigator vibration triggered');
        }
      } catch (navError) {
        console.error('Navigator vibration failed:', navError);
      }
    }
  }

  private clearTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
      this.isRunning.next(false);
      console.log('Timer cleared');
    }
  }

  private async showCompletionToast(message: string) {
    try {
      const toast = await this.toastController.create({
        message: message,
        duration: 4000,
        position: 'top',
        color: 'dark',
        buttons: [
          {
            text: 'OK',
            role: 'cancel'
          }
        ]
      });
      await toast.present();
      console.log('Toast notification presented:', message);
    } catch (error) {
      console.error('Error showing toast:', error);
    }
  }

  private scheduleWorkEndNotification() {
    try {
      const notification = {
        id: this.WORK_END_NOTIFICATION_ID,
        title: 'Pomodoro Completed',
        body: 'Time for a 5-minute break!',
        schedule: { at: new Date() },
        sound: 'notification.wav'
        // Removed undefined properties to reduce potential errors
      };
      this.notificationService.scheduleNotification(notification);
      console.log('Work end notification scheduled');
    } catch (error) {
      console.error('Error scheduling work end notification:', error);
    }
  }

  private scheduleBreakEndNotification() {
    try {
      const notification = {
        id: this.BREAK_END_NOTIFICATION_ID,
        title: 'Break Completed',
        body: 'Pomodoro session finished.',
        schedule: { at: new Date() },
        sound: 'notification.wav'
        // Removed undefined properties to reduce potential errors
      };
      this.notificationService.scheduleNotification(notification);
      console.log('Break end notification scheduled');
    } catch (error) {
      console.error('Error scheduling break end notification:', error);
    }
  }

  // Format the remaining time as MM:SS
  formatTimeRemaining(timeMs: number): string {
    const totalSeconds = Math.ceil(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
