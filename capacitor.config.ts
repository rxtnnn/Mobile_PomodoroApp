import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'pomodoroApp',
  webDir: 'www',
  plugins: {
    Permissions: {
      vibrate: true
    }
  }
};

export default config;
