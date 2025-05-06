// src/app/app.component.ts
import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { App as CapacitorApp } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private platform: Platform) {
    this.platform.ready().then(() => {
      CapacitorApp.addListener('backButton', () => {
        CapacitorApp.exitApp();
      });

      this.platform.backButton.subscribeWithPriority(9999, () => {
        CapacitorApp.exitApp();
      });
    });
  }
}
