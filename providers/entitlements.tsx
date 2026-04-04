import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type EntitlementsContextValue = {
  isPro: boolean;
  setPro: (value: boolean) => Promise<void>;
  openPaywall: () => void;
  requirePro: (action: () => void) => void;
};

const EntitlementsContext = createContext<EntitlementsContextValue | null>(
  null,
);

const KEY = "entitlements_isPro";

export function EntitlementsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPro, setIsPro] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(KEY);
        setIsPro(stored === "true");
      } catch {
        setIsPro(false);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const setPro = useCallback(async (value: boolean) => {
    setIsPro(value);
    try {
      await SecureStore.setItemAsync(KEY, value ? "true" : "false");
    } catch {
      // ignore
    }
  }, []);

  const openPaywall = useCallback(() => {
    router.push("/paywall");
  }, []);

  const requirePro = useCallback(
    (action: () => void) => {
      if (!hydrated) return;
      if (isPro) action();
      else openPaywall();
    },
    [hydrated, isPro, openPaywall],
  );

  const value = useMemo(
    () => ({ isPro, setPro, openPaywall, requirePro }),
    [isPro, setPro, openPaywall, requirePro],
  );

  return (
    <EntitlementsContext.Provider value={value}>
      {children}
    </EntitlementsContext.Provider>
  );
}

export function useEntitlements() {
  const ctx = useContext(EntitlementsContext);
  if (!ctx)
    throw new Error("useEntitlements must be used within EntitlementsProvider");
  return ctx;
}
