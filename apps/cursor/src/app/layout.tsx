import "./globals.css";
import type { PluginItem } from "@/components/command-menu";
import { Header } from "@/components/header";
import { GlobalModals } from "@/components/modals/global-modals";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { getPlugins } from "@directories/data/plugins";
import { OpenPanelComponent } from "@openpanel/nextjs";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export const metadata: Metadata = {
  title: "Cursor Directory",
  description: "Browse community plugins, rules, and MCP servers for Cursor",
  icons: [
    {
      rel: "icon",
      url: "https://cdn.midday.ai/cursor/favicon.png",
    },
  ],
  openGraph: {
    title: "Cursor Directory",
    description: "Browse community plugins, rules, and MCP servers for Cursor",
    url: "https://cursor.directory",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev/opengraph-image-v2.png",
        width: 800,
        height: 600,
      },
      {
        url: "https://pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev/opengraph-image-v2.png",
        width: 1800,
        height: 1600,
      },
    ],
  },
  twitter: {
    title: "Cursor Directory",
    description: "Browse community plugins, rules, and MCP servers for Cursor",
    images: [
      {
        url: "https://pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev/opengraph-image-v2.png",
        width: 800,
        height: 600,
      },
      {
        url: "https://pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev/opengraph-image-v2.png",
        width: 1800,
        height: 1600,
      },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    // { media: "(prefers-color-scheme: light)" },
    { media: "(prefers-color-scheme: dark)" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const plugins: PluginItem[] = getPlugins().map((plugin) => ({
    title: plugin.slug,
    slug: plugin.slug,
  }));

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        `${GeistSans.variable} ${GeistMono.variable}`,
        "whitespace-pre-line antialiased bg-background text-foreground !dark",
      )}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <Header plugins={plugins} />
            {children}

            <a
              href="https://github.com/pontusab/cursor.directory"
              target="_blank"
              rel="noreferrer"
            >
              <Button
                className="hidden size-[48px] bg-[#F5F5F3]/30 text-black border border-black rounded-full font-medium fixed bottom-4 left-6 z-10 backdrop-blur-lg dark:bg-[#F5F5F3]/30 dark:text-white dark:border-white"
                variant="outline"
                size="icon"
              >
                <PlusIcon className="w-4 h-4" />
              </Button>
            </a>

            <Toaster />
            <GlobalModals />
          </NuqsAdapter>
        </ThemeProvider>
      </body>

      <OpenPanelComponent
        clientId={process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID!}
        trackScreenViews
        disabled={process.env.NODE_ENV === "development"}
      />
    </html>
  );
}
