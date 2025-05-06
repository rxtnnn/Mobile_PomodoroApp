// src/app/pomodorotimer/pomodorotimer.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { TimerService, TimerState } from '../services/timer.service';
import { NotificationService } from '../services/notification.service';
import { getDefaultTimezone, formatDateInTimezone } from '../utils/timezone-util';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pomodorotimer',
  templateUrl: './pomodorotimer.page.html',
  styleUrls: ['./pomodorotimer.page.scss'],
  standalone: false
})
export class PomodorotimerPage implements OnInit, OnDestroy {
  currentTime = '';
  timerDisplay = '25:00';
  timerState: TimerState = TimerState.IDLE;
  isRunning = false;

  private timerStateSub!: Subscription;
  private timeRemSub!: Subscription;
  private isRunningSub!: Subscription;
  private lastState = TimerState.IDLE;

  constructor(
    private timerService: TimerService,
    private notificationService: NotificationService,
  ) {
    setInterval(() => this.updateCurrentTime(), 1000);

  }

  ngOnInit() {
    this.setupNotifications();

    this.timerStateSub = this.timerService.getTimerState()
      .subscribe(state => {
        if (this.lastState === TimerState.WORK && state === TimerState.IDLE) {
          setTimeout(() => {
            this.timerService.startBreakSession();
          }, 1000);
        }
        this.lastState = state;
      });

    this.timeRemSub = this.timerService.getTimeRemaining()
      .subscribe(ms => this.timerDisplay = this.timerService.formatTimeRemaining(ms));

    this.isRunningSub = this.timerService.getIsRunning()
      .subscribe(running => this.isRunning = running);

  }

  ngOnDestroy() {
    this.timerStateSub?.unsubscribe();
    this.timeRemSub?.unsubscribe();
    this.isRunningSub?.unsubscribe();
  }

  updateCurrentTime() {
    const now = new Date();
    this.currentTime = formatDateInTimezone(now, getDefaultTimezone());
  }

  async setupNotifications() {
    const perms = await this.notificationService.checkNotificationPermissions();
    if (perms.display !== 'granted') {
      await this.notificationService.requestNotificationPermissions();
    }
    this.notificationService.listenForIncomingNotifications();
  }

  toggleTimer() {
    this.timerService.toggleTimer();
  }

  isWorkSession() {
    return this.timerState === TimerState.WORK;
  }

  isBreakSession() {
    return this.timerState === TimerState.BREAK;
  }

  getButtonIcon() {
    return this.isRunning ? 'refresh' : 'play';
  }
}
