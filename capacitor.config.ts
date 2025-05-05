import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'pomodoroApp',
  webDir: 'www',
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_notification",
      iconColor: "#FF0000",
      sound: "notification.wav",
    },
    Haptics: {
      impact: {
        style: "heavy"
      }
    }
  },
  server: {
    androidScheme: "https"
  }
};

export default config;
