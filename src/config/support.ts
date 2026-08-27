export interface SupportConfig {
  enabled: boolean;
  url: string;
}

/**
 * Optional support destination. Keep disabled until a real destination is configured.
 */
export const supportConfig: SupportConfig = {
  enabled: false,
  url: ''
};
