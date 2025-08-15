import { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, options?: any) => string;
  currencies: {
    [key: string]: {
      code: string;
      symbol: string;
      name: string;
    };
  };
  getCurrentCurrency: () => {
    code: string;
    symbol: string;
    name: string;
  };
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const currencies = {
  en: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar'
  },
  zh: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation();
  
  const setLanguage = useCallback((lang: string) => {
    i18n.changeLanguage(lang);
  }, [i18n]);
  
  const getCurrentCurrency = useCallback(() => {
    return currencies[i18n.language as keyof typeof currencies] || currencies.en;
  }, [i18n.language]);

  const value = useMemo(() => ({
    language: i18n.language,
    setLanguage,
    t,
    currencies,
    getCurrentCurrency
  }), [i18n.language, setLanguage, t, getCurrentCurrency]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;