export function getSettingsUrl(): string {
  if (typeof window === "undefined") {
    return "/settings";
  }
  
  const isExtension =
    window.location.protocol === "chrome-extension:" ||
    window.location.protocol === "moz-extension:" ||
    window.location.pathname.endsWith(".html") ||
    window.location.href.includes("/out/");

  return isExtension ? "/settings.html" : "/settings";
}
