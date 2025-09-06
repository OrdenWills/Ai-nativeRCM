import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      "dashboard": "Dashboard",
      "eligibility": "Eligibility",
      "priorAuth": "Prior Authorization",
      "documentation": "Clinical Documentation",
      "coding": "Medical Coding",
      "claims": "Claims Management",
      "remittance": "Remittance & Reconciliation",
      "settings": "Settings",
      "logout": "Logout",
      
      // Common
      "welcome": "Welcome to AI-native RCM Platform",
      "loading": "Loading...",
      "save": "Save",
      "cancel": "Cancel",
      "submit": "Submit",
      "search": "Search",
      "filter": "Filter",
      
      // Dashboard
      "totalClaims": "Total Claims",
      "pendingAuth": "Pending Authorizations",
      "denialRate": "Denial Rate",
      "revenue": "Revenue This Month"
    }
  },
  ar: {
    translation: {
      // Navigation
      "dashboard": "لوحة التحكم",
      "eligibility": "الأهلية",
      "priorAuth": "التفويض المسبق",
      "documentation": "التوثيق السريري",
      "coding": "الترميز الطبي",
      "claims": "إدارة المطالبات",
      "remittance": "التحويل والتسوية",
      "settings": "الإعدادات",
      "logout": "تسجيل الخروج",
      
      // Common
      "welcome": "مرحباً بك في منصة إدارة دورة الإيرادات الذكية",
      "loading": "جاري التحميل...",
      "save": "حفظ",
      "cancel": "إلغاء",
      "submit": "إرسال",
      "search": "بحث",
      "filter": "تصفية",
      
      // Dashboard
      "totalClaims": "إجمالي المطالبات",
      "pendingAuth": "التفويضات المعلقة",
      "denialRate": "معدل الرفض",
      "revenue": "الإيرادات هذا الشهر"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
