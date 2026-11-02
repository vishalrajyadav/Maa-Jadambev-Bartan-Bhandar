import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  Upload, 
  X, 
  Check, 
  Image as ImageIcon,
  IndianRupee,
  Download,
  PackageCheck
} from "lucide-react";
import { 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  uploadProductImage,
  resolveImageUrl
} from "../api";
import { formatRupees, exportStockToExcel } from "../utils";

export default function Products({ t, darkMode }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formImage, setFormImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts(search);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 150);
    return () => clearTimeout(timer);
  }, [search]);

  const handleExport = () => {
    exportStockToExcel(products);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormPrice("");
    setFormStock("");
    setFormImage("");
    setFormError("");
    setIsAddModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormName(product.productName);
    setFormPrice(product.price.toString());
    setFormStock(product.availableStock.toString());
    setFormImage(product.productImage || "");
    setFormError("");
    setIsAddModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setFormError("");
      const result = await uploadProductImage(file);
      setFormImage(result.url);
    } catch (err) {
      setFormError(err.message || "Failed to upload photo");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Item name is required.");
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError("Please enter a valid price in Rupees.");
      return;
    }

    const stockNum = parseInt(formStock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setFormError("Stock cannot be negative.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      if (editingProduct) {
        await updateProduct(editingProduct.productId, {
          productName: formName.trim(),
          price: priceNum,
          availableStock: stockNum,
          productImage: formImage.trim() || null,
        });
      } else {
        await createProduct({
          productName: formName.trim(),
          price: priceNum,
          initialStockQuantity: stockNum,
          productImage: formImage.trim() || null,
        });
      }

      setIsAddModalOpen(false);
      await loadProducts();
    } catch (err) {
      setFormError(err.message || "Could not save item.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      await deleteProduct(deletingProduct.productId);
      setDeletingProduct(null);
      await loadProducts();
    } catch (err) {
      alert("Failed to delete item: " + err.message);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header Card */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-3xl border shadow-sm transition-colors ${
        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/90"
      }`}>
        <div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
            {t.allCrockeryTitle}
          </h2>
          <p className={`text-xs sm:text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            {t.allCrockerySub}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-extrabold shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>{t.downloadExcel}</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-extrabold shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t.addNewItem}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.searchPlaceholder}
          className={`w-full pl-10 pr-4 py-3 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-sm font-medium border ${
            darkMode 
              ? "bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500" 
              : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
          }`}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : products.length === 0 ? (
        <div className={`rounded-3xl border border-dashed p-12 text-center max-w-md mx-auto my-6 ${
          darkMode ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-300 text-slate-700"
        }`}>
          <PackageCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-base">{t.noItemsFound}</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">{t.noItemsSub}</p>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
          >
            + {t.addNewItem}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {products.map((product) => {
            const isLowStock = product.availableStock < 5;
            return (
              <div
                key={product.productId}
                className={`rounded-3xl border shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group ${
                  darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/90"
                }`}
              >
                {/* Product Photo */}
                <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={resolveImageUrl(product.productImage)}
                    alt={product.productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=400&q=80";
                    }}
                  />

                  {/* Low Stock Badge */}
                  {isLowStock && (
                    <span className="absolute top-3 right-3 bg-rose-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {t.runningOut}
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className={`font-extrabold text-base line-clamp-1 mb-1 ${darkMode ? "text-slate-100" : "text-slate-900"}`} title={product.productName}>
                      {product.productName}
                    </h3>
                    <p className="text-xl font-black text-indigo-500 tracking-tight">
                      {formatRupees(product.price)}
                    </p>
                  </div>

                  {/* Stock & Sold indicators */}
                  <div className={`grid grid-cols-2 gap-2 my-3 pt-3 border-t text-xs ${
                    darkMode ? "border-slate-800" : "border-slate-100"
                  }`}>
                    <div className={`p-2.5 rounded-xl border ${
                      darkMode ? "bg-slate-800/80 border-slate-700/80" : "bg-slate-50 border-slate-100"
                    }`}>
                      <span className="text-[10px] text-slate-400 font-bold block">{t.inShop}</span>
                      <span className={`text-sm font-extrabold ${isLowStock ? "text-rose-500" : "text-emerald-500"}`}>
                        {product.availableStock} pcs
                      </span>
                    </div>
                    <div className={`p-2.5 rounded-xl border ${
                      darkMode ? "bg-slate-800/80 border-slate-700/80" : "bg-slate-50 border-slate-100"
                    }`}>
                      <span className="text-[10px] text-slate-400 font-bold block">{t.sold}</span>
                      <span className={`text-sm font-extrabold ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
                        {product.totalSold} pcs
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons: Edit & Delete */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => openEditModal(product)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
                        darkMode 
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-200" 
                          : "bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700"
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{t.edit}</span>
                    </button>
                    <button
                      onClick={() => setDeletingProduct(product)}
                      title={t.delete}
                      className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-md w-full p-6 shadow-2xl border relative animate-in fade-in zoom-in-95 ${
            darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-100 text-slate-900"
          }`}>
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black">
              {editingProduct ? t.editItemTitle : t.addItemTitle}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 mb-5">
              {t.modalSub}
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">{t.photoLabel}</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {formImage ? (
                      <img src={resolveImageUrl(formImage)} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                      darkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}>
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? "Uploading..." : t.uploadBtn}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="url"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder={t.orPasteUrl}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs border ${
                        darkMode ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">{t.nameLabel}</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium border focus:outline-none focus:border-indigo-500 ${
                    darkMode ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">{t.priceLabel}</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="e.g. 850"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold border focus:outline-none focus:border-indigo-500 ${
                      darkMode ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">{t.stockLabel}</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    placeholder="e.g. 25"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold border focus:outline-none focus:border-indigo-500 ${
                      darkMode ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-2xl text-sm font-extrabold shadow-md transition flex items-center justify-center gap-2"
                >
                  {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  <span>{editingProduct ? t.saveChanges : t.saveItem}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-sm w-full p-6 shadow-2xl border text-center relative ${
            darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-100 text-slate-900"
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black">{t.deleteConfirmTitle}</h3>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              {t.deleteConfirmSub.replace("{name}", deletingProduct.productName)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingProduct(null)}
                className={`flex-1 py-2.5 px-3 border rounded-xl text-xs font-bold ${
                  darkMode ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 px-3 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
