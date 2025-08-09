import { createContext, useContext, ReactNode } from 'react';
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
  
  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };
  
  const getCurrentCurrency = () => {
    return currencies[i18n.language as keyof typeof currencies] || currencies.en;
  };

  const value: LanguageContextType = {
    language: i18n.language,
    setLanguage,
    t,
    currencies,
    getCurrentCurrency
  };

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