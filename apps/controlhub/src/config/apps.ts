import { AppId, AppConfig } from '@/types/events';

/**
 * All Allied iMpact apps registered in ControlHub
 */
export const APPS: Record<AppId, AppConfig> = {
  coinbox: {
    appId: 'coinbox',
    name: 'CoinBox',
    description: 'P2P Financial Platform - Loans, Investments, Crypto Trading',
    url: 'https://coinbox.alliedimpact.com',
    environment: 'production',
    enabled: true,
  },
  sportshub: {
    appId: 'sportshub',
    name: 'SportsHub',
    description: 'Multi-project Sports Voting Platform',
    url: 'https://sportshub.alliedimpact.com',
    environment: 'production',
    enabled: true,
  },
  drivemaster: {
    appId: 'drivemaster',
    name: 'DriveMaster',
    description: 'Driver Training with Gamified Learning',
    url: 'https://drivemaster.alliedimpact.com',
    environment: 'production',
    enabled: true,
  },
  edutech: {
    appId: 'edutech',
    name: 'EduTech',
    description: 'Education Platform - Computer Skills + Coding',
    url: 'https://edutech.alliedimpact.com',
    environment: 'production',
    enabled: true,
  },
  portal: {
    appId: 'portal',
    name: 'Portal',
    description: 'Central Hub - Connect Users to All Products',
    url: 'https://portal.alliedimpact.com',
    environment: 'production',
    enabled: true,
  },
  myprojects: {
    appId: 'myprojects',
    name: 'MyProjects',
    description: 'Project Management for Custom Software',
    url: 'https://myprojects.alliedimpact.com',
    environment: 'production',
    enabled: true,
  },
};

/**
 * Get all enabled apps
 */
export function getEnabledApps(): AppConfig[] {
  return Object.values(APPS).filter(app => app.enabled);
}

/**
 * Get app config by ID
 */
export function getAppConfig(appId: AppId): AppConfig | undefined {
  return APPS[appId];
}

/**
 * Validate if an appId is valid
 */
export function isValidAppId(appId: string): appId is AppId {
  return appId in APPS;
}
