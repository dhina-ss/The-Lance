/// <reference types="vite/client" />

declare module 'virtual:content' {
  export const home: any;
  export const services: any;
  export const about: any;
  export const work: any;
  export const contact: any;
  export const endpoint_management: any;
  export const ems_pricing: any;
  const content: {
    home: any;
    services: any;
    about: any;
    work: any;
    contact: any;
    endpoint_management: any;
    ems_pricing: any;
  };
  export default content;
}

declare module 'virtual:format-overrides' {
  import type { FormatOverrideBundle } from '@/lib/format-overrides';
  const bundle: FormatOverrideBundle;
  export default bundle;
}
