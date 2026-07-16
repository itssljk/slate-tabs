export interface Quicklink {
  id: string;
  title: string;
  url: string;
}

export const DEFAULT_QUICKLINKS: Quicklink[] = [
  { id: "github", title: "GitHub", url: "https://github.com" },
  { id: "youtube", title: "YouTube", url: "https://youtube.com" },
  { id: "reddit", title: "Reddit", url: "https://reddit.com" },
  { id: "gmail", title: "Gmail", url: "https://mail.google.com" },
  { id: "chatgpt", title: "ChatGPT", url: "https://chatgpt.com" }
];

export function getDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    let clean = url.trim().toLowerCase();
    if (!/^https?:\/\//i.test(clean)) {
      clean = "https://" + clean;
    }
    try {
      return new URL(clean).hostname;
    } catch {
      return "";
    }
  }
}
