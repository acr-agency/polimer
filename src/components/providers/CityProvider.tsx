// providers/CityProvider.tsx

"use client";

import { createContext, useContext } from "react";

const CityContext = createContext<string | null>(null);

export function CityProvider({
  city,
  children,
}: {
  city: string | null;
  children: React.ReactNode;
}) {
  return (
    <CityContext.Provider value={city}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  return useContext(CityContext);
}