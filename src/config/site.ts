export const siteConfig = {
  name: "Slate Tabs",
  description: "A clean, minimal, and dark-themed browser start page.",
  url: "https://github.com/itssljk/slate-tabs",
  links: {
    github: "https://github.com/itssljk/slate-tabs",
  },
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Dashboard",
      href: "/dashboard",
      disabled: true,
    },
    {
      title: "Settings",
      href: "/settings",
    },
  ],
};

export type SiteConfig = typeof siteConfig;
