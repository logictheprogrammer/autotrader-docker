export {}

declare global {
  interface Window {
    VANTA: {
      CELLS: any
    }
    Chart: any
    $: any
    google: any
    _isNS: any
    _setupNS: any
    _loadCss: any
    _loadJs: any
    _exportMessages: any
    _exportVersion: any
    googleTranslateElementInit: any
    cryptohopper: any
  }
}
