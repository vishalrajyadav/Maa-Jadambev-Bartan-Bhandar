import React, { useEffect, useState } from "react";
import { 
  Package, 
  Boxes, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  Camera, 
  Download, 
  RefreshCw 
} from "lucide-react";
import { fetchDashboardSummary, fetchProducts, resolveImageUrl } from "../api";
import { formatRupees, exportStockToExcel } from "../utils";

export default function Dashboard({ setActiveTab, t, darkMode }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await fetchDashboardSummary();
      setData(summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = async () => {
    try {
      const allItems = await fetchProducts();
      exportStockToExcel(allItems);
    } catch (err) {
      alert("Error exporting stock: " + err.message);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-9 h-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className={`text-sm font-bold ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 max-w-lg mx-auto rounded-2xl text-center border ${
        darkMode ? "bg-red-950/40 border-red-800 text-red-200" : "bg-red-50 border-red-200 text-red-800"
      }`}>
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h3 className="font-bold">Error</h3>
        <p className="text-xs mb-3">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Try Again
        </button>
      </div>
    );
  }

  const cards = [
    {
      title: t.totalItems,
      value: data?.totalProducts ?? 0,
      sub: t.totalItemsSub,
      icon: Package,
      badgeColor: darkMode ? "bg-indigo-950 text-indigo-400 border-indigo-800" : "bg-indigo-50 text-indigo-700 border-indigo-100",
    },
    {
      title: t.itemsInShop,
      value: data?.availableStock ?? 0,
      sub: t.itemsInShopSub,
      icon: Boxes,
      badgeColor: darkMode ? "bg-emerald-950 text-emerald-400 border-emerald-800" : "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    {
      title: t.itemsSold,
      value: data?.totalItemsSold ?? 0,
      sub: t.itemsSoldSub,
      icon: TrendingUp,
      badgeColor: darkMode ? "bg-blue-950 text-blue-400 border-blue-800" : "bg-blue-50 text-blue-700 border-blue-100",
    },
    {
      title: t.runningOut,
      value: data?.lowStockProducts ?? 0,
      sub: t.runningOutSub,
      icon: AlertTriangle,
      badgeColor: data?.lowStockProducts > 0 
        ? darkMode ? "bg-rose-950 text-rose-300 border-rose-800 font-bold" : "bg-rose-100 text-rose-700 border-rose-200 font-bold" 
        : darkMode ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-600 border-slate-200",
      alert: data?.lowStockProducts > 0,
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header Card */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-3xl border shadow-sm transition-colors ${
        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/90"
      }`}>
        <div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
            {t.overviewTitle}
          </h2>
          <p className={`text-xs sm:text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            {t.overviewSub}
          </p>
        </div>

        {/* Action Buttons: Export Excel & Photo Scan */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>{t.downloadExcel}</span>
          </button>

          <button
            onClick={() => setActiveTab("scan")}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition"
          >
            <Camera className="w-4 h-4" />
            <span>{t.clickPhoto}</span>
          </button>

          <button
            onClick={loadData}
            title="Refresh"
            className={`p-2.5 rounded-xl border transition ${
              darkMode ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all shadow-sm ${
                c.alert 
                  ? darkMode ? "border-rose-700 ring-2 ring-rose-900 bg-rose-950/30" : "border-rose-300 ring-2 ring-rose-200 bg-rose-50/20" 
                  : darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/90"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs sm:text-sm font-bold ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                  {c.title}
                </span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${c.badgeColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                {c.value}
              </div>
              <p className={`text-[11px] sm:text-xs mt-1 font-medium leading-tight ${darkMode ? "text-slate-400" : "text-slate-400"}`}>
                {c.sub}
              </p>
              {c.alert && (
                <span className="inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white">
                  {t.restockNeeded}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 3 Bottom Lists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* 1. Top Selling */}
        <div className={`rounded-3xl border p-5 shadow-sm flex flex-col transition-colors ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/90"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`font-extrabold text-base ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                {t.topSelling}
              </h3>
              <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-400"}`}>{t.popularCrockery}</p>
            </div>
            <button
              onClick={() => setActiveTab("products")}
              className="text-xs font-bold text-indigo-500 hover:underline flex items-center gap-1"
            >
              {t.seeAll} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {(!data?.bestSellingProducts || data.bestSellingProducts.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No sales yet.</p>
            ) : (
              data.bestSellingProducts.slice(0, 5).map((p, idx) => (
                <div
                  key={p.productId}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition-colors ${
                    darkMode ? "bg-slate-800/80 border-slate-700/80" : "bg-slate-50 border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-bold text-slate-400 w-3">{idx + 1}</span>
                    <img
                      src={resolveImageUrl(p.productImage)}
                      alt={p.productName}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-200 dark:bg-slate-800"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=300&q=80";
                      }}
                    />
                    <div className="truncate">
                      <p className={`text-xs sm:text-sm font-bold truncate ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                        {p.productName}
                      </p>
                      <p className="text-xs font-extrabold text-indigo-500">{formatRupees(p.price)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-xs sm:text-sm font-extrabold text-emerald-500">{p.totalSold}</span>
                    <p className="text-[10px] text-slate-400 font-bold">{t.sold}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Recent Sales */}
        <div className={`rounded-3xl border p-5 shadow-sm flex flex-col transition-colors ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/90"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`font-extrabold text-base ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                {t.recentSales}
              </h3>
              <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-400"}`}>{t.latestSold}</p>
            </div>
            <button
              onClick={() => setActiveTab("sales")}
              className="text-xs font-bold text-indigo-500 hover:underline flex items-center gap-1"
            >
              {t.history} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {(!data?.recentlySoldProducts || data.recentlySoldProducts.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No sales yet.</p>
            ) : (
              data.recentlySoldProducts.slice(0, 5).map((s) => (
                <div
                  key={s.saleId}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition-colors ${
                    darkMode ? "bg-slate-800/80 border-slate-700/80" : "bg-slate-50 border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 border ${
                      darkMode ? "bg-indigo-950 text-indigo-300 border-indigo-800" : "bg-indigo-50 text-indigo-700 border-indigo-100"
                    }`}>
                      +{s.quantity}
                    </div>
                    <div className="truncate">
                      <p className={`text-xs sm:text-sm font-bold truncate ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                        {s.productName}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 inline" />
                        {new Date(s.saleDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className={`text-xs sm:text-sm font-extrabold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                      {formatRupees(s.totalAmount)}
                    </p>
                    <p className="text-[10px] text-slate-400">{formatRupees(s.unitPrice)} each</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Items Running Out */}
        <div className={`rounded-3xl border p-5 shadow-sm flex flex-col transition-colors ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/90"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`font-extrabold text-base ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                {t.runningOut}
              </h3>
              <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-400"}`}>{t.runningOutSub}</p>
            </div>
            {data?.lowStockProductsList?.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white">
                {data.lowStockProductsList.length}
              </span>
            )}
          </div>

          <div className="space-y-3 flex-1">
            {(!data?.lowStockProductsList || data.lowStockProductsList.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  darkMode ? "bg-emerald-950 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                }`}>
                  <Boxes className="w-5 h-5" />
                </div>
                <p className={`text-sm font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                  {t.goodStock}
                </p>
                <p className="text-xs text-slate-400">{t.noRunningOut}</p>
              </div>
            ) : (
              data.lowStockProductsList.slice(0, 5).map((p) => (
                <div
                  key={p.productId}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border ${
                    darkMode ? "bg-rose-950/30 border-rose-900/60" : "bg-rose-50/70 border-rose-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={resolveImageUrl(p.productImage)}
                      alt={p.productName}
                      className="w-11 h-11 rounded-xl object-cover border border-rose-300 dark:border-rose-900 shrink-0 bg-slate-200 dark:bg-slate-800"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=300&q=80";
                      }}
                    />
                    <div className="truncate">
                      <p className={`text-xs sm:text-sm font-bold truncate ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                        {p.productName}
                      </p>
                      <p className="text-xs font-bold text-slate-400">{formatRupees(p.price)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-rose-600 text-white">
                      {t.onlyLeft.replace("{count}", p.availableStock)}
                    </span>
                    <button
                      onClick={() => setActiveTab("products")}
                      className="block text-[11px] font-bold text-indigo-400 hover:underline mt-1"
                    >
                      {t.restock}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
