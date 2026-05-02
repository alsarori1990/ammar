import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      app_name: 'Ammar Calories',
      tagline: 'Track your health, effortlessly.',
      daily_goal: 'Daily Goal',
      calories: 'Calories',
      remaining: 'Remaining',
      consumed: 'Consumed',
      add_food: 'Add Food',
      food_name_placeholder: 'What did you eat? (e.g. 2 eggs, rice...)',
      quantity_placeholder: 'Quantity (optional, e.g. 100g, 2 pieces)',
      add_button: 'Add to log',
      analyzing: 'AI is analyzing...',
      history: 'Today\'s Log',
      no_entries: 'No food items added yet.',
      search_results: 'Search Results',
      searching: 'Searching library...',
      select_food: 'Select a food item',
      enter_quantity: 'Enter weight (grams)',
      high_calorie_warning: '⚠️ High Caloric Density (>250 kcal/100g). Consume in moderation!',
      low_calorie_info: '✅ Healthy Caloric Density. Good choice!',
      settings: 'Settings',
      language: 'Language',
      switch_ar: 'العربية',
      switch_en: 'English',
      edit: 'Edit',
      delete: 'Delete',
      total: 'Total',
      unit_grams: 'grams',
      unit_pieces: 'pieces',
      unit_cups: 'cups',
      success_add: 'Added successfully!',
      error_ai: 'Could not recognize food. Try being more specific.',
      goal_input_label: 'Your Daily Calorie Goal',
      save: 'Save',
      health_tip: 'Healthy Choice Tip'
    }
  },
  ar: {
    translation: {
      app_name: 'عمار كالوريز',
      tagline: 'تتبع صحتك بسهولة.',
      daily_goal: 'الهدف اليومي',
      calories: 'سعرة',
      remaining: 'المتبقي',
      consumed: 'المستهلك',
      add_food: 'إضافة طعام',
      food_name_placeholder: 'ماذا أكلت؟ (مثلاً: ٢ بيض، أرز...)',
      quantity_placeholder: 'الكمية (اختياري، مثلاً: ١٠٠ جرام)',
      add_button: 'أضف للسجل',
      analyzing: 'الذكاء الاصطناعي يحلل...',
      history: 'سجل اليوم',
      no_entries: 'لم يتم إضافة أي طعام بعد.',
      search_results: 'نتائج البحث',
      searching: 'جاري البحث في المكتبة...',
      select_food: 'اختر صنفاً',
      enter_quantity: 'أدخل الوزن (جرام)',
      high_calorie_warning: '⚠️ كثافة سعرات عالية (أكثر من ٢٥٠ سعرة/١٠٠ جرام). تناول بحذر!',
      low_calorie_info: '✅ كثافة سعرات جيدة. خيار صحي!',
      settings: 'الإعدادات',
      language: 'اللغة',
      switch_ar: 'العربية',
      switch_en: 'English',
      edit: 'تعديل',
      delete: 'حذف',
      total: 'المجموع',
      unit_grams: 'جرام',
      unit_pieces: 'قطعة',
      unit_cups: 'كوب',
      success_add: 'تمت الإضافة بنجاح!',
      error_ai: 'لم يتم التعرف على الطعام. حاول التوضيح أكثر.',
      goal_input_label: 'هدفك اليومي من السعرات',
      save: 'حفظ',
      health_tip: 'نصيحة لخيار صحي'
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

// Update document direction on language change
i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

// Initial set
document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = i18n.language;

export default i18n;
