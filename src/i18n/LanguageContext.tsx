import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { LANGUAGES, TRANSLATIONS, type Language, type TranslationStrings } from '@/i18n/translations';

interface LanguageContextValue {
  lang: Language;
  t: TranslationStrings;
  dir: 'rtl' | 'ltr';
  currency: string;
  locale: string;
  setLang: (lang: Language) => void;
  formatPrice: (amount: number) => string;
  formatDate: (iso: string) => string;
  formatTime: (iso: string) => string;
  formatDateTime: (iso: string) => string;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'pos-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'ar' || stored === 'fr' || stored === 'en') return stored;
    return 'ar';
  });

  const dir = LANGUAGES[lang].dir;
  const currency = LANGUAGES[lang].currency;
  const locale = LANGUAGES[lang].locale;
  const t = TRANSLATIONS[lang];

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const formatPrice = useCallback(
    (amount: number) => {
      const formatted = amount.toLocaleString(locale);
      return `${formatted} ${currency}`;
    },
    [locale, currency]
  );

  const formatTime = useCallback(
    (iso: string) => {
      const d = new Date(iso);
      return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    },
    [locale]
  );

  const formatDate = useCallback(
    (iso: string) => {
      const d = new Date(iso);
      return d.toLocaleDateString(locale, { day: 'numeric', month: 'numeric' }) + ' ' + formatTime(iso);
    },
    [locale, formatTime]
  );

  const formatDateTime = useCallback(
    (iso: string) => {
      const d = new Date(iso);
      return d.toLocaleString(locale);
    },
    [locale]
  );

  const value: LanguageContextValue = {
    lang,
    t,
    dir,
    currency,
    locale,
    setLang,
    formatPrice,
    formatDate,
    formatTime,
    formatDateTime,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
