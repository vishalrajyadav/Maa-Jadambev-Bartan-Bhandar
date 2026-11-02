import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Products from "./components/Products";
import ScanProduct from "./components/ScanProduct";
import Sales from "./components/Sales";
import { Store, MapPin, Database, Sun, Moon, Languages } from "lucide-react";
import { SHOP_INFO } from "./utils";
import { translations } from "./i18n";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Language state (Hindi default for Bihar shop, toggleable to English)
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("shop_lang") || "hi";
  });

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("shop_theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("shop_lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("shop_theme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const t = translations[lang] || translations.en;

  const handleSaleRecorded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === "hi" ? "en" : "hi"));
  };

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? "dark bg-slate-950 text-slate-100" : "bg-[#f8fafc] text-slate-800"} flex`}>
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        t={t} 
        darkMode={darkMode} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header with Shop Details, Language Toggle & Dark Mode */}
        <header className={`sticky top-0 z-30 ${darkMode ? "bg-slate-900/90 border-slate-800 text-slate-100" : "bg-white/90 border-slate-200/90 text-slate-800"} backdrop-blur-md border-b px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs transition-colors`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="lg:hidden w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black leading-tight truncate">
                  {lang === "hi" ? SHOP_INFO.nameHindi : SHOP_INFO.name}
                </h1>
                <span className={`hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-md ${darkMode ? "bg-indigo-950 text-indigo-300 border border-indigo-800" : "bg-indigo-50 text-indigo-700 border border-indigo-100"}`}>
                  {lang === "hi" ? SHOP_INFO.name : SHOP_INFO.nameHindi}
                </span>
              </div>
              <p className={`text-[11px] sm:text-xs flex items-center gap-1 truncate mt-0.5 font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                <MapPin className="w-3 h-3 text-indigo-500 shrink-0 inline" />
                <span>{lang === "hi" ? "पंकज सिनेमा के बगल वाली गली, दहियावां, छपरा, बिहार" : SHOP_INFO.address}</span>
              </p>
            </div>
          </div>

          {/* Right Action Tools: Language Switcher + Dark Mode Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Switcher Button */}
            <button
              onClick={toggleLanguage}
              title={lang === "hi" ? "Switch to English" : "हिंदी में बदलें"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                darkMode
                  ? "bg-slate-800 border-slate-700 text-indigo-300 hover:bg-slate-700"
                  : "bg-slate-100 border-slate-200 text-indigo-700 hover:bg-indigo-50"
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{lang === "hi" ? "English" : "हिंदी"}</span>
            </button>

            {/* Dark Mode / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className={`p-2 rounded-xl border text-xs transition-all ${
                darkMode
                  ? "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* System Status Pill */}
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${
              darkMode ? "bg-slate-800/80 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
            }`}>
              <Database className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t.connected}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">
          {activeTab === "home" && (
            <Dashboard 
              key={refreshTrigger}
              setActiveTab={setActiveTab} 
              t={t}
              darkMode={darkMode}
            />
          )}

          {activeTab === "products" && (
            <Products 
              key={refreshTrigger} 
              t={t}
              darkMode={darkMode}
            />
          )}

          {activeTab === "scan" && (
            <ScanProduct 
              onSaleRecorded={handleSaleRecorded} 
              t={t}
              darkMode={darkMode}
            />
          )}

          {activeTab === "sales" && (
            <Sales 
              key={refreshTrigger} 
              onSaleRecorded={handleSaleRecorded} 
              t={t}
              darkMode={darkMode}
            />
          )}
        </main>
      </div>
    </div>
  );
}
