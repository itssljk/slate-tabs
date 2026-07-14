import type { Metadata } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "New Slate",
  description: "A clean, minimal new tab page.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('slate-theme');
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                  }
                  document.documentElement.setAttribute('data-theme', theme);
                  
                  var glow = localStorage.getItem('slate-settings-glow') !== 'false';
                  document.documentElement.setAttribute('data-glow', glow ? 'true' : 'false');
                  
                  var minimal = localStorage.getItem('slate-settings-minimal') === 'true';
                  document.documentElement.setAttribute('data-minimal', minimal ? 'true' : 'false');
                  
                  var perf = localStorage.getItem('slate-settings-perf') === 'true';
                  document.documentElement.setAttribute('data-perf', perf ? 'true' : 'false');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
