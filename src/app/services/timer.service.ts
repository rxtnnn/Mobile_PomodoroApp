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
  private readonly WORK_TIME_MS = 10 * 1000;
  private readonly BREAK_TIME_MS = 10 * 1000;

  private timerState = new BehaviorSubject<TimerState>(TimerState.IDLE);
  private timeRemaining = new BehaviorSubject<number>(this.WORK_TIME_MS);
  private isRunning = new BehaviorSubject<boolean>(false);
  private timerId: any = null;
  private endTime: number = 0;

  constructor(
    private notificationService: NotificationService,
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
  }

  startBreakSession() {
    this.clearTimer();
    this.timerState.next(TimerState.BREAK);
    this.timeRemaining.next(this.BREAK_TIME_MS);
    this.endTime = Date.now() + this.BREAK_TIME_MS;
    this.startTimer();
  }

  resetTimer() {
    this.clearTimer();
    this.timerState.next(TimerState.IDLE);
    this.timeRemaining.next(this.WORK_TIME_MS);
    this.isRunning.next(false);
  }

  toggleTimer() {
    if (this.timerState.value === TimerState.IDLE) {
      this.startWorkSession();
    } else {
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
  }

  private async handleTimerComplete() {
    console.log('Timer complete, current state:', this.timerState.value);
    this.clearTimer();

    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      console.log('Haptics vibration triggered');
    } catch (e) {
      console.error('Haptics vibration failed:', e);
    }

    if (this.timerState.value === TimerState.WORK) {
      await this.notificationService.playWorkCompleteSound();
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.startBreakSession();
    } else if (this.timerState.value === TimerState.BREAK) {
      await this.notificationService.playBreakCompleteSound();
      this.resetTimer();
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

  formatTimeRemaining(timeMs: number): string {
    const totalSeconds = Math.ceil(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
