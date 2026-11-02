import React, { useEffect, useState } from "react";
import { 
  ShoppingBag, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  IndianRupee, 
  Package, 
  Printer 
} from "lucide-react";
import { fetchProducts, fetchSales, recordSale, resolveImageUrl } from "../api";
import { formatRupees, printReceipt } from "../utils";

export default function Sales({ onSaleRecorded, t, darkMode }) {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [selling, setSelling] = useState(false);
  const [formError, setFormError] = useState("");
  const [successSale, setSuccessSale] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, sls] = await Promise.all([fetchProducts(), fetchSales()]);
      setProducts(prods);
      setSales(sls);
      if (prods.length > 0 && !selectedProductId) {
        setSelectedProductId(prods[0].productId.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedProduct = products.find(
    (p) => p.productId.toString() === selectedProductId.toString()
  );

  const parsedQty = parseInt(quantity, 10) || 0;
  const unitPrice = selectedProduct?.price || 0;
  const totalAmount = unitPrice * parsedQty;

  const handleSell = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      setFormError("Please choose an item.");
      return;
    }

    if (parsedQty <= 0) {
      setFormError("Quantity must be at least 1 piece.");
      return;
    }

    if (parsedQty > selectedProduct.availableStock) {
      setFormError(
        `Only ${selectedProduct.availableStock} pieces available for "${selectedProduct.productName}".`
      );
      return;
    }

    try {
      setSelling(true);
      setFormError("");
      setSuccessSale(null);

      const newSale = await recordSale({
        productId: selectedProduct.productId,
        quantity: parsedQty,
      });

      setSuccessSale(newSale);
      setQuantity("1");
      await loadData();
      if (onSaleRecorded) onSaleRecorded();
    } catch (err) {
      setFormError(err.message || "Failed to record sale.");
    } finally {
      setSelling(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className={`p-5 rounded-3xl border shadow-sm transition-colors ${
        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/90"
      }`}>
        <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
          {t.sellItemTitle}
        </h2>
        <p className={`text-xs sm:text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
          {t.sellItemSubText}
        </p>
      </div>

      {/* 1. Record Sale Form */}
      <div className={`rounded-3xl border p-5 sm:p-7 shadow-sm max-w-3xl transition-colors ${
        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/90"
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${
            darkMode ? "bg-indigo-950 text-indigo-400 border-indigo-800" : "bg-indigo-50 text-indigo-700 border-indigo-100"
          }`}>
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-base sm:text-lg font-black ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
              {t.newSaleEntry}
            </h3>
            <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{t.pickItemSub}</p>
          </div>
        </div>

        {formError && (
          <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {successSale && (
          <div className="mb-5 p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <span className="font-extrabold text-sm block">
                  {t.soldSuccess} ({successSale.quantity} pcs - {formatRupees(successSale.totalAmount)})
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Stock updated automatically.</span>
              </div>
            </div>
            <button
              onClick={() => printReceipt(successSale)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shrink-0 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bill</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSell} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-7">
              <label className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                {t.selectItemLabel}
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setFormError("");
                }}
                className={`w-full px-3.5 py-3.5 rounded-2xl text-xs sm:text-sm font-bold border focus:outline-none focus:border-indigo-500 ${
                  darkMode ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                {products.map((p) => (
                  <option key={p.productId} value={p.productId}>
                    {p.productName} — {formatRupees(p.price)} ({p.availableStock} in shop)
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                {t.quantityLabel}
              </label>
              <div className={`flex items-center border rounded-2xl overflow-hidden shadow-sm ${
                darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50"
              }`}>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, parsedQty - 1).toString())}
                  className="w-10 h-12 flex items-center justify-center text-slate-400 hover:text-white font-black text-lg select-none"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct?.availableStock || 9999}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full text-center font-extrabold text-sm focus:outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((parsedQty + 1).toString())}
                  className="w-10 h-12 flex items-center justify-center text-slate-400 hover:text-white font-black text-lg select-none"
                >
                  +
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={selling || !selectedProduct || selectedProduct?.availableStock <= 0}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white rounded-2xl text-sm font-black shadow-md transition flex items-center justify-center gap-1.5"
              >
                {selling ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <IndianRupee className="w-4 h-4" />
                    <span>Sell</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {selectedProduct && (
            <div className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border text-xs ${
              darkMode ? "bg-slate-800/80 border-slate-700" : "bg-slate-50 border-slate-100"
            }`}>
              <div className="flex items-center gap-3">
                <img
                  src={resolveImageUrl(selectedProduct.productImage)}
                  alt={selectedProduct.productName}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <span className={`font-extrabold block text-sm ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                    {selectedProduct.productName}
                  </span>
                  <span className={`font-bold ${selectedProduct.availableStock < 5 ? "text-rose-500" : "text-emerald-500"}`}>
                    {selectedProduct.availableStock} pieces in shop
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 ml-auto">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">{t.rate}</span>
                  <span className={`text-sm font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                    {formatRupees(unitPrice)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">{t.totalAmount}</span>
                  <span className="text-xl font-black text-indigo-500">
                    {formatRupees(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* 2. Sales History Table */}
      <div className={`rounded-3xl border shadow-sm overflow-hidden transition-colors ${
        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/90"
      }`}>
        <div className={`p-5 border-b flex items-center justify-between ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
          <div>
            <h3 className={`text-base sm:text-lg font-black ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
              {t.salesHistory}
            </h3>
            <p className="text-xs text-slate-400">{t.allCompletedSales}</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            darkMode ? "bg-indigo-950 text-indigo-300 border-indigo-800" : "bg-indigo-50 text-indigo-700 border-indigo-100"
          }`}>
            {sales.length}
          </span>
        </div>

        {sales.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className={`text-sm font-bold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
              {t.noSalesYet}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[11px] font-bold text-slate-400 uppercase tracking-wider ${
                  darkMode ? "bg-slate-800/60 border-slate-800" : "bg-slate-50/80 border-slate-100"
                }`}>
                  <th className="py-3.5 px-5">{t.tableItem}</th>
                  <th className="py-3.5 px-4 text-center">{t.tableQty}</th>
                  <th className="py-3.5 px-4 text-right">{t.tableRate}</th>
                  <th className="py-3.5 px-4 text-right">{t.tableTotal}</th>
                  <th className="py-3.5 px-5 text-right">{t.tableDateTime}</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-xs sm:text-sm ${darkMode ? "divide-slate-800 text-slate-200" : "divide-slate-100 text-slate-800"}`}>
                {sales.map((sale) => (
                  <tr key={sale.saleId} className={darkMode ? "hover:bg-slate-800/50 transition" : "hover:bg-slate-50/70 transition"}>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={resolveImageUrl(sale.productImage)}
                          alt={sale.productName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800"
                        />
                        <span className="font-extrabold">{sale.productName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-extrabold border ${
                        darkMode ? "bg-indigo-950 text-indigo-300 border-indigo-800" : "bg-indigo-50 text-indigo-700 border-indigo-100"
                      }`}>
                        {sale.quantity} pcs
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-400">
                      {formatRupees(sale.unitPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black">
                      {formatRupees(sale.totalAmount)}
                    </td>
                    <td className="py-3.5 px-5 text-right text-xs text-slate-400 font-medium whitespace-nowrap">
                      {new Date(sale.saleDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
