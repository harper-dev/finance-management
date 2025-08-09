import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enCommon from '../locales/en/common.json';
import enLanding from '../locales/en/landing.json';
import zhCommon from '../locales/zh/common.json';
import zhLanding from '../locales/zh/landing.json';

const resources = {
  en: {
    common: enCommon,
    landing: enLanding,
  },
  zh: {
    common: zhCommon,
    landing: zhLanding,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      lookupCookie: 'i18nextLng',
      caches: ['localStorage', 'cookie'],
    },
  });

export default i18n;