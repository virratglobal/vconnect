import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useBranding } from "@/hooks/use-branding";
import { SEO_CONFIG } from "@/lib/seo-config";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

/** JSON-LD Organization structured data — rendered once in the root shell */
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SEO_CONFIG.siteName,
  url: SEO_CONFIG.siteUrl,
  logo: `${SEO_CONFIG.siteUrl}/logo.png`,
  sameAs: ["https://twitter.com/virratreach", "https://www.linkedin.com/company/virrat-reach"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    availableLanguage: ["English", "Hindi"],
  },
};

/** JSON-LD SoftwareApplication structured data */
const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SEO_CONFIG.siteName,
  operatingSystem: "Web",
  applicationCategory: "BusinessApplication",
  description:
    "AI-Powered WhatsApp CRM for bulk broadcasting, chatbot automation, smart inbox, and voice call campaigns.",
  offers: {
    "@type": "Offer",
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
  },
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `VCONNECT - Professional WhatsApp CRM` },
      {
        name: "description",
        content: "Enterprise WhatsApp CRM platform for campaigns, reports, and contact management.",
      },
      { name: "author", content: SEO_CONFIG.author },
      { name: "robots", content: SEO_CONFIG.robots },
      { name: "theme-color", content: SEO_CONFIG.themeColor },
      { name: "application-name", content: SEO_CONFIG.siteName },
      { name: "referrer", content: "no-referrer-when-downgrade" },
      // Open Graph
      { property: "og:title", content: SEO_CONFIG.siteName },
      {
        property: "og:description",
        content: "Enterprise WhatsApp CRM platform for campaigns, reports, and contact management.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SEO_CONFIG.siteUrl },
      { property: "og:image", content: `${SEO_CONFIG.siteUrl}${SEO_CONFIG.ogImage}` },
      { property: "og:site_name", content: SEO_CONFIG.siteName },
      { property: "og:locale", content: SEO_CONFIG.locale },
      // Twitter
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SEO_CONFIG.siteName },
      {
        name: "twitter:description",
        content: "Enterprise WhatsApp CRM platform for campaigns, reports, and contact management.",
      },
      { name: "twitter:image", content: `${SEO_CONFIG.siteUrl}${SEO_CONFIG.ogImage}` },
      { name: "twitter:creator", content: SEO_CONFIG.twitterHandle },
    ],
    links: [
      {
        rel: "canonical",
        href: SEO_CONFIG.siteUrl,
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico?v=vconnect",
      },
      {
        rel: "shortcut icon",
        type: "image/x-icon",
        href: "/favicon.ico?v=vconnect",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png?v=vconnect",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon.png?v=vconnect",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function BrandingInitializer() {
  useBranding();
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <BrandingInitializer />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      {/* Global toast notifications — must be here for auth errors, success messages etc. to appear */}
      <Toaster />
    </QueryClientProvider>
  );
}
