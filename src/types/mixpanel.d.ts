// TypeScript declarations for global Mixpanel object
declare global {
  interface Window {
    mixpanel: {
      init: (token: string, config?: any) => void;
      identify: (userId: string) => void;
      track: (eventName: string, properties?: Record<string, any>) => void;
      track_pageview: (properties?: Record<string, any>) => void;
      register: (properties: Record<string, any>) => void;
      register_once: (properties: Record<string, any>) => void;
      reset: () => void;
      get_distinct_id: () => string | undefined;
      alias: (alias: string, original?: string) => void;
      time_event: (eventName: string) => void;
      set_config: (config: Record<string, any>) => void;
      opt_in_tracking: () => void;
      opt_out_tracking: () => void;
      has_opted_in_tracking: () => boolean;
      has_opted_out_tracking: () => boolean;
      clear_opt_in_out_tracking: () => void;
      people: {
        set: (properties: Record<string, any>) => void;
        set_once: (properties: Record<string, any>) => void;
        unset: (propertyNames: string[]) => void;
        increment: (properties: Record<string, number>) => void;
        append: (properties: Record<string, any>) => void;
        union: (properties: Record<string, any[]>) => void;
        track_charge: (amount: number, properties?: Record<string, any>) => void;
        clear_charges: () => void;
        delete_user: () => void;
        remove: (properties: Record<string, any>) => void;
      };
      __SV?: number;
      _i?: any[];
    };
    __DISABLE_MIXPANEL__?: boolean;
  }
}

export {};