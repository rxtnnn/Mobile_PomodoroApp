import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'localApp',
  webDir: 'www',
  plugins: {
    Permissions: {
      vibrate: true
    }
  }
};

export default config;
