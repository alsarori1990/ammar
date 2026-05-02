import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PlusCircle, 
  History, 
  Settings as SettingsIcon, 
  Flame, 
  Utensils, 
  Trash2, 
  Search,
  Loader2,
  Languages,
  Trophy,
  Info,
  Check,
  AlertTriangle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { searchFoodLibrary, FoodLibraryItem } from './services/geminiService';
import { FoodEntry, getEntries, saveEntries, getSettings, saveSettings, UserSettings } from './types';
import './i18n';

export default function App() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'track' | 'history' | 'settings'>('track');
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [settings, setSettings] = useState<UserSettings>(getSettings());
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodLibraryItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FoodLibraryItem | null>(null);
  const [quantity, setQuantity] = useState('100');

  useEffect(() => {
    setEntries(getEntries());
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;
    setIsSearching(true);
    const results = await searchFoodLibrary(query, i18n.language);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleAddItem = () => {
    if (!selectedItem) return;
    const qValue = parseInt(quantity) || 100;
    const factor = qValue / 100;

    const newEntry: FoodEntry = {
      id: crypto.randomUUID(),
      name: i18n.language === 'ar' ? selectedItem.nameAr : selectedItem.nameEn,
      calories: Math.round(selectedItem.caloriesPer100g * factor),
      protein: selectedItem.protein * factor,
      carbs: selectedItem.carbs * factor,
      fat: selectedItem.fat * factor,
      quantity: `${qValue}g`,
      timestamp: Date.now(),
      originalLanguage: i18n.language,
      healthTip: selectedItem.caloriesPer100g > 250 ? t('high_calorie_warning') : t('low_calorie_info')
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    saveEntries(updated);
    setSelectedItem(null);
    setSearchResults([]);
    setQuery('');
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    saveEntries(updated);
  };

  const totalCalories = entries.reduce((acc, curr) => acc + curr.calories, 0);
  const progressPercent = Math.min(100, (totalCalories / settings.dailyGoal) * 100);

  return (
    <div className="mobile-container">
      {/* Header */}
      <header className="p-6 flex justify-between items-center bg-white border-b border-slate-100 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Flame className="text-orange-500 fill-orange-500" size={24} />
            {t('app_name')}
          </h1>
          <p className="text-xs text-slate-500">{t('tagline')}</p>
        </div>
        <button 
          onClick={() => {
            const newLang = i18n.language === 'ar' ? 'en' : 'ar';
            i18n.changeLanguage(newLang);
            const ns = { ...settings, language: newLang as 'ar'|'en' };
            setSettings(ns);
            saveSettings(ns);
          }}
          className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
        >
          <Languages size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'track' && (
            <motion.div key="track" className="space-y-6">
              {/* Progress Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-indigo-100 text-sm font-medium">{t('daily_goal')}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-bold">{totalCalories}</span>
                    <span className="text-indigo-100">/ {settings.dailyGoal} {t('calories')}</span>
                  </div>
                  <div className="mt-6 space-y-2">
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        className="h-full bg-white rounded-full shadow-sm"
                      />
                    </div>
                  </div>
                </div>
                <Trophy size={140} className="absolute -right-6 -bottom-6 opacity-10" />
              </div>

              {/* SEARCH SECTION */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Search size={18} className="text-indigo-500" />
                  {t('add_food')}
                </h3>
                <form onSubmit={handleSearch} className="relative">
                  <input 
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('food_name_placeholder')}
                    className="w-full p-4 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button 
                    disabled={isSearching}
                    className="absolute right-2 top-2 p-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50"
                  >
                    {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                  </button>
                </form>

                {/* RESULTS LIST */}
                {searchResults.length > 0 ? (
                  <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map(item => (
                      <button 
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="w-full text-left p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold text-sm text-slate-800">{i18n.language === 'ar' ? item.nameAr : item.nameEn}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{item.source}</p>
                        </div>
                        <span className="text-xs font-bold text-indigo-600">{item.caloriesPer100g} cal/100g</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  !isSearching && query.trim() !== '' && searchResults.length === 0 && (
                    <div className="mt-4 p-4 text-center text-xs text-slate-400 italic">
                      {t('no_entries')}
                    </div>
                  )
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold mb-4">{t('history')}</h2>
              {entries.length === 0 ? (
                <div className="py-20 text-center text-slate-400 italic text-sm">{t('no_entries')}</div>
              ) : (
                entries.map(entry => (
                  <div key={entry.id} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                    <div>
                      <h4 className="font-bold text-sm">{entry.name}</h4>
                      <p className="text-xs text-slate-500">{entry.quantity} • {entry.calories} cal</p>
                      {entry.healthTip && (
                        <p className={`text-[10px] mt-1 font-medium ${entry.healthTip.includes('⚠️') ? 'text-orange-600' : 'text-emerald-600'}`}>
                          {entry.healthTip}
                        </p>
                      )}
                    </div>
                    <button onClick={() => deleteEntry(entry.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold">{t('settings')}</h2>
              <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">{t('goal_input_label')}</label>
                  <input 
                    type="number" 
                    value={settings.dailyGoal} 
                    onChange={e => setSettings({...settings, dailyGoal: parseInt(e.target.value) || 0})}
                    className="w-full p-3 bg-slate-50 rounded-lg border-none text-sm"
                  />
                  <button onClick={() => saveSettings(settings)} className="w-full mt-2 py-3 bg-indigo-600 text-white rounded-lg font-bold">{t('save')}</button>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* QUANTITY MODAL */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-md rounded-t-3xl p-8 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl text-slate-900">{i18n.language === 'ar' ? selectedItem.nameAr : selectedItem.nameEn}</h3>
                  <p className="text-slate-500 text-sm mt-1">{selectedItem.caloriesPer100g} kcal / 100g</p>
                </div>
                <button onClick={() => setSelectedItem(null)} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200"><X size={20} /></button>
              </div>

              {selectedItem.caloriesPer100g > 250 ? (
                <div className="flex gap-3 bg-orange-50 border border-orange-100 p-4 rounded-xl">
                  <AlertTriangle className="text-orange-500 shrink-0" />
                  <p className="text-xs text-orange-700 leading-relaxed font-medium">{t('high_calorie_warning')}</p>
                </div>
              ) : (
                <div className="flex gap-3 bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                  <Check className="text-emerald-500 shrink-0" />
                  <p className="text-xs text-emerald-700 leading-relaxed font-medium">{t('low_calorie_info')}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">{t('enter_quantity')}</label>
                <div className="flex gap-3">
                  <input 
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="flex-1 p-4 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-bold"
                  />
                  <button 
                    onClick={handleAddItem}
                    className="px-8 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                  >
                    <PlusCircle size={20} />
                    {t('add_button')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 w-full max-w-md bg-white/80 backdrop-blur-md border-t border-slate-100 h-20 px-6 flex justify-between items-center z-10">
        <NavButton active={activeTab === 'track'} icon={<PlusCircle size={24} />} onClick={() => setActiveTab('track')} />
        <NavButton active={activeTab === 'history'} icon={<History size={24} />} onClick={() => setActiveTab('history')} />
        <NavButton active={activeTab === 'settings'} icon={<SettingsIcon size={24} />} onClick={() => setActiveTab('settings')} />
      </nav>
    </div>
  );
}

function NavButton({ active, icon, onClick }: { active: boolean, icon: React.ReactNode, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`p-3 rounded-2xl transition-all ${active ? 'text-indigo-600 bg-indigo-50 scale-110' : 'text-slate-400'}`}>
      {icon}
    </button>
  );
}
