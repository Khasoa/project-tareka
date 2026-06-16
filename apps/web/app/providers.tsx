"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";

import { AuthHydration } from "@/components/auth-hydration";
import { I18nProvider } from "@/lib/i18n/i18n-provider";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        themes={["dark", "light"]}
        enableSystem={false}
        storageKey="tareka-theme"
      >
        <I18nProvider>
          <AuthHydration />
          {children}
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
