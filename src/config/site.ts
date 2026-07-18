export const siteConfig = {
  name: "Slate Tabs",
  version: "1.0.0",
  description: "A clean, minimal, and dark-themed browser start page.",
  url: "https://github.com/itssljk/slate-tabs",
  links: {
    github: "https://github.com/itssljk/slate-tabs",
    discord: "https://discord.gg/Kfn4V2nF3N",
  },
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Settings",
      href: "/settings",
    },
  ],
};

export type SiteConfig = typeof siteConfig;
