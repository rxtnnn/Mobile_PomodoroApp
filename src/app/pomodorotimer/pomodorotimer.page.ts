import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform, IonRouterOutlet } from '@ionic/angular';
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
  currentTime: string = '';
  timerDisplay: string = '25:00';
  timerState: TimerState = TimerState.IDLE;
  isRunning: boolean = false;

  private timerStateSubscription: Subscription | null = null;
  private timeRemainingSubscription: Subscription | null = null;
  private isRunningSubscription: Subscription | null = null;

  constructor(
    private platform: Platform,
    private timerService: TimerService,
    private notificationService: NotificationService,
    private routerOutlet: IonRouterOutlet
  ) {
    // Update current time every second
    setInterval(() => { this.updateCurrentTime() }, 1000);

    // Handle back button
    this.platform.backButton.subscribeWithPriority(-1, () => {
      if (!this.routerOutlet.canGoBack()) {
        App.exitApp();
      }
    });
  }

  ngOnInit() {
    // Initialize notifications
    this.setupNotifications();

    // Subscribe to timer updates
    this.timerStateSubscription = this.timerService.getTimerState().subscribe(state => {
      this.timerState = state;
      console.log('Timer state updated:', state);
    });

    this.timeRemainingSubscription = this.timerService.getTimeRemaining().subscribe(timeMs => {
      this.timerDisplay = this.timerService.formatTimeRemaining(timeMs);
    });

    // Subscribe to running state
    this.isRunningSubscription = this.timerService.getIsRunning().subscribe(running => {
      this.isRunning = running;
      console.log('Timer running state updated:', running);
    });
  }

  ngOnDestroy() {
    // Clean up subscriptions
    if (this.timerStateSubscription) {
      this.timerStateSubscription.unsubscribe();
    }

    if (this.timeRemainingSubscription) {
      this.timeRemainingSubscription.unsubscribe();
    }

    if (this.isRunningSubscription) {
      this.isRunningSubscription.unsubscribe();
    }
  }

  updateCurrentTime() {
    const now = new Date();
    const defaultTimezone = getDefaultTimezone();
    this.currentTime = formatDateInTimezone(now, defaultTimezone);
  }

  async setupNotifications() {
    // Check and request permissions if needed
    const permissions = await this.notificationService.checkNotificationPermissions();
    if (permissions.display !== 'granted') {
      await this.notificationService.requestNotificationPermissions();
    }

    // Listen for notifications
    this.notificationService.listenForIncomingNotifications();
  }

  toggleTimer() {
    console.log('Toggle button clicked');
    this.timerService.toggleTimer();
  }


  // Helper methods to determine UI state
  isWorkSession(): boolean {
    return this.timerState === TimerState.WORK;
  }

  isBreakSession(): boolean {
    return this.timerState === TimerState.BREAK;
  }

  getButtonIcon(): string {
    return this.isRunning ? 'pause' : 'play';
  }
}
