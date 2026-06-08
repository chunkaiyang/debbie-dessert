"use client";

import { createContext, useContext, useMemo, useState } from "react";

type Language = "en" | "zh";
type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: <T extends { en: string; zh: string }>(value: T) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: <T extends { en: string; zh: string }>(text: T) => text[language],
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
