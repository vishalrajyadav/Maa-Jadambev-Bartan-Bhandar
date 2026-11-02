import React from "react";
import { 
  Home, 
  Package, 
  Camera, 
  IndianRupee,
  Store,
  MapPin
} from "lucide-react";
import { SHOP_INFO } from "../utils";

export default function Sidebar({ activeTab, setActiveTab, t, darkMode }) {
  const navItems = [
    { id: "home", label: t.home, sub: t.homeSub, icon: Home },
    { id: "products", label: t.allItems, sub: t.allItemsSub, icon: Package },
    { id: "scan", label: t.photoScan, sub: t.photoScanSub, icon: Camera },
    { id: "sales", label: t.sellItem, sub: t.sellItemSub, icon: IndianRupee },
  ];

  return (
    <>
      {/* Desktop & Laptop Sidebar */}
      <aside className={`hidden lg:flex flex-col w-72 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/90"} border-r min-h-screen p-5 shrink-0 select-none transition-colors`}>
        {/* Shop Branding Card */}
        <div className={`p-3.5 mb-6 rounded-2xl border shadow-sm transition-colors ${
          darkMode ? "bg-slate-800/80 border-slate-700" : "bg-gradient-to-br from-indigo-50/90 to-slate-50 border-indigo-100/80"
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-300 shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className={`font-black text-sm leading-tight ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                Maa Jagdambe
              </h1>
              <p className="font-extrabold text-xs text-indigo-500 leading-none mt-0.5">
                Bartan Bhandar
              </p>
              <p className={`text-[10px] font-semibold mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                माँ जगदम्बे बर्तन भंडार
              </p>
            </div>
          </div>

          <div className={`mt-3 pt-2.5 border-t flex items-start gap-1.5 text-[11px] font-medium ${
            darkMode ? "border-slate-700 text-slate-400" : "border-indigo-100/70 text-slate-500"
          }`}>
            <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
            <span className="line-clamp-2 leading-tight">
              Pankaj Cinema ke bagal, Dahiyawa, Chhapra
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : darkMode
                      ? "text-slate-300 hover:text-white hover:bg-slate-800"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <div className={`p-1.5 rounded-xl ${
                  isActive 
                    ? "bg-white/20 text-white" 
                    : darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="leading-tight">{item.label}</div>
                  <div className={`text-[11px] font-normal ${isActive ? "text-indigo-100" : darkMode ? "text-slate-400" : "text-slate-400"}`}>
                    {item.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Live Shop System Status */}
        <div className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
          darkMode ? "bg-emerald-950/60 border-emerald-800/80 text-emerald-300" : "bg-emerald-50 border-emerald-200/80 text-emerald-800"
        }`}>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-extrabold">{t.systemActive}</span>
        </div>
      </aside>

      {/* Mobile & Tablet Bottom Bar */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 ${
        darkMode ? "bg-slate-900/95 border-slate-800" : "bg-white/95 border-slate-200"
      } backdrop-blur-md border-t z-50 px-2 py-2 flex items-center justify-around shadow-2xl transition-colors`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all ${
                isActive 
                  ? darkMode ? "text-indigo-400 font-extrabold bg-indigo-950/70" : "text-indigo-600 font-extrabold bg-indigo-50/80" 
                  : darkMode ? "text-slate-400" : "text-slate-500 font-medium"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
