export {};
export {};

import "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    page: string;
    hideBreadcrumb?: boolean;
    breadcrumb?: { name: string; to: string }[];
  }
}

declare global {
  interface Window {
    VANTA: {
      CELLS: any;
    };
    Chart: any;
    $: any;
    google: any;
    _isNS: any;
    _setupNS: any;
    _loadCss: any;
    _loadJs: any;
    _exportMessages: any;
    _exportVersion: any;
    googleTranslateElementInit: any;
    PerfectScrollbar: any;
    QRCode: any;
  }

  interface String {
    capitalize(): string;
  }
}
