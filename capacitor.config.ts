import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'pomodoroApp',
  webDir: 'www',
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_notification",
      iconColor: "#FF0000",
      // Do not set sound here for Android 11 - it needs to be set in the channel
    },
    Haptics: {
      impact: {
        style: "heavy"
      }
    }
  },
  android: {
    allowMixedContent: true
  },
  server: {
    androidScheme: "https"
  }
};

export default config;
