import React, { useEffect, useState, useRef } from "react";
import { 
  Camera, 
  CameraOff, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  IndianRupee, 
  Upload, 
  Sparkles,
  ShoppingBag,
  Package
} from "lucide-react";
import { fetchProducts, recordSale, resolveImageUrl } from "../api";
import { formatRupees } from "../utils";

export default function ScanProduct({ onSaleRecorded, t, darkMode }) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Camera & Photo State
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [nameFilter, setNameFilter] = useState("");

  // Sell form state
  const [sellQuantity, setSellQuantity] = useState(1);
  const [selling, setSelling] = useState(false);
  const [saleSuccess, setSaleSuccess] = useState(null);
  const [sellError, setSellError] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    loadCatalog();
    return () => {
      stopCamera();
    };
  }, []);

  const loadCatalog = async () => {
    try {
      setLoadingProducts(true);
      const items = await fetchProducts();
      setProducts(items);
      if (items.length > 0 && !selectedProduct) {
        setSelectedProduct(items[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProducts(false);
    }
  };

  const startCamera = async () => {
    try {
      setCameraError("");
      setCapturedPhoto(null);
      setSaleSuccess(null);

      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.warn("Camera access error:", err);
      setCameraError("Camera permission was not granted or webcam is busy. You can choose a photo from your gallery or pick from the item list below.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedPhoto(dataUrl);
    stopCamera();

    matchPhotoToProduct(dataUrl);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      setCapturedPhoto(dataUrl);
      matchPhotoToProduct(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const matchPhotoToProduct = (photoData) => {
    if (!products.length) return;
    const matched = products.find(p => p.availableStock > 0) || products[0];
    setSelectedProduct(matched);
    setSellQuantity(1);
    setSaleSuccess(null);
  };

  const handleSellNow = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const qty = parseInt(sellQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setSellError("Please enter quantity of at least 1.");
      return;
    }

    if (qty > selectedProduct.availableStock) {
      setSellError(`Only ${selectedProduct.availableStock} pieces available in shop.`);
      return;
    }

    try {
      setSelling(true);
      setSellError("");
      const result = await recordSale({
        productId: selectedProduct.productId,
        quantity: qty,
      });

      setSaleSuccess({
        quantity: qty,
        productName: selectedProduct.productName,
        totalAmount: result.totalAmount,
      });

      setSelectedProduct((prev) => ({
        ...prev,
        availableStock: prev.availableStock - qty,
        totalSold: prev.totalSold + qty,
      }));

      setProducts((prev) =>
        prev.map((item) =>
          item.productId === selectedProduct.productId
            ? { ...item, availableStock: item.availableStock - qty, totalSold: item.totalSold + qty }
            : item
        )
      );

      setSellQuantity(1);
      if (onSaleRecorded) onSaleRecorded();
    } catch (err) {
      setSellError(err.message || "Failed to record sale.");
    } finally {
      setSelling(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.productName.toLowerCase().includes(nameFilter.toLowerCase().trim())
  );

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto">
      {/* Header */}
      <div className={`p-5 rounded-3xl border shadow-sm transition-colors ${
        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/90"
      }`}>
        <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
          {t.photoScanTitle}
        </h2>
        <p className={`text-xs sm:text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
          {t.photoScanHeaderSub}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Camera Viewfinder */}
        <div className={`lg:col-span-7 rounded-3xl border p-5 sm:p-6 shadow-sm flex flex-col transition-colors ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/90"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <span className={`text-sm font-bold flex items-center gap-2 ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
              <Camera className="w-4 h-4 text-indigo-500" />
              {t.cameraScanner}
            </span>
            {cameraActive && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                {t.cameraLive}
              </span>
            )}
          </div>

          {/* Viewfinder Frame */}
          <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center border-2 border-slate-800 shadow-inner">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
            />
            <canvas ref={canvasRef} className="hidden" />

            {capturedPhoto && !cameraActive && (
              <div className="relative w-full h-full">
                <img
                  src={capturedPhoto}
                  alt="Captured Crockery"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Photo Ready
                </div>
              </div>
            )}

            {!cameraActive && !capturedPhoto && (
              <div className="p-6 text-center text-white flex flex-col items-center">
                <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center mb-3 backdrop-blur-sm border border-white/20">
                  <Camera className="w-8 h-8 text-indigo-400" />
                </div>
                <h4 className="font-extrabold text-base">{t.cameraReady}</h4>
                <p className="text-xs text-slate-400 max-w-xs mt-1 mb-5">
                  {t.cameraReadySub}
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  <span>{t.turnOnCamera}</span>
                </button>
              </div>
            )}
          </div>

          {/* Camera Buttons */}
          <div className="mt-4 flex flex-wrap gap-2.5">
            {cameraActive ? (
              <>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  <span>{t.clickPhotoNow}</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className={`py-3.5 px-4 rounded-2xl text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                    darkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <CameraOff className="w-4 h-4" />
                  <span>{t.stopCamera}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-sm transition flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>{capturedPhoto ? t.retakePhoto : t.openCamera}</span>
                </button>

                <label className={`cursor-pointer py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                  darkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}>
                  <Upload className="w-4 h-4" />
                  <span>{t.chooseGallery}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </>
            )}
          </div>

          {cameraError && (
            <div className="mt-4 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Quick Name Search Filter */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className={`text-xs font-bold flex items-center gap-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                <Search className="w-3.5 h-3.5 text-indigo-500" />
                <span>{t.searchByNameTap}</span>
              </label>
              <span className="text-[11px] text-slate-400 font-semibold">
                {filteredProducts.length} items
              </span>
            </div>

            <input
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="e.g. cup, plate, bowl, kulhad, glass..."
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium border focus:outline-none focus:border-indigo-500 ${
                darkMode 
                  ? "bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500" 
                  : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400"
              }`}
            />

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
              {filteredProducts.map((item) => {
                const isSelected = selectedProduct?.productId === item.productId;
                return (
                  <button
                    key={item.productId}
                    type="button"
                    onClick={() => {
                      setSelectedProduct(item);
                      setSellQuantity(1);
                      setSaleSuccess(null);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? darkMode ? "bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500" : "bg-indigo-50 border-indigo-400 ring-2 ring-indigo-300"
                        : darkMode ? "bg-slate-800/80 border-slate-700 hover:bg-slate-800" : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <img
                      src={resolveImageUrl(item.productImage)}
                      alt={item.productName}
                      className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`text-[11px] font-bold truncate ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                        {item.productName}
                      </p>
                      <p className="text-[10px] font-extrabold text-indigo-500">{formatRupees(item.price)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Matched Details & Sell Form */}
        <div className="lg:col-span-5 space-y-4">
          {sellError && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{sellError}</span>
            </div>
          )}

          {saleSuccess && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-sm">{t.soldSuccess}</p>
                <p className="mt-1">
                  Sold <strong>{saleSuccess.quantity} piece(s)</strong> of {saleSuccess.productName} for{" "}
                  <strong>{formatRupees(saleSuccess.totalAmount)}</strong>.
                </p>
              </div>
            </div>
          )}

          {selectedProduct ? (
            <div className={`rounded-3xl border p-5 sm:p-6 shadow-sm space-y-5 transition-colors ${
              darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/90"
            }`}>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t.selectedItem}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
                }`}>
                  {t.itemHash.replace("{id}", selectedProduct.productId)}
                </span>
              </div>

              <div className="flex gap-4 items-center">
                <img
                  src={resolveImageUrl(selectedProduct.productImage)}
                  alt={selectedProduct.productName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 bg-slate-100 dark:bg-slate-800"
                />
                <div className="min-w-0">
                  <h3 className={`font-extrabold text-base sm:text-lg leading-snug line-clamp-2 ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                    {selectedProduct.productName}
                  </h3>
                  <p className="text-2xl font-black text-indigo-500 tracking-tight mt-1">
                    {formatRupees(selectedProduct.price)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-2xl border ${darkMode ? "bg-slate-800/80 border-slate-700/80" : "bg-slate-50 border-slate-100"}`}>
                  <span className="text-[11px] text-slate-400 font-bold block">{t.stockInShop}</span>
                  <span className={`text-base font-extrabold ${selectedProduct.availableStock < 5 ? "text-rose-500" : "text-emerald-500"}`}>
                    {selectedProduct.availableStock} pieces
                  </span>
                </div>
                <div className={`p-3 rounded-2xl border ${darkMode ? "bg-slate-800/80 border-slate-700/80" : "bg-slate-50 border-slate-100"}`}>
                  <span className="text-[11px] text-slate-400 font-bold block">{t.itemsSold}</span>
                  <span className={`text-base font-extrabold ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
                    {selectedProduct.totalSold} pieces
                  </span>
                </div>
              </div>

              <div className={`rounded-3xl p-4 sm:p-5 mt-4 border ${
                darkMode ? "bg-indigo-950/40 border-indigo-900" : "bg-indigo-50/70 border-indigo-200"
              }`}>
                <h4 className={`text-xs font-extrabold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
                  darkMode ? "text-indigo-300" : "text-indigo-900"
                }`}>
                  <ShoppingBag className="w-4 h-4" />
                  {t.sellItemNow}
                </h4>

                {selectedProduct.availableStock <= 0 ? (
                  <p className="text-xs text-rose-500 font-bold py-2">{t.outOfStock}</p>
                ) : (
                  <form onSubmit={handleSellNow} className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <label className={`text-xs font-bold block mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                          {t.qtyLabel}
                        </label>
                        <div className={`flex items-center border rounded-2xl overflow-hidden shadow-sm ${
                          darkMode ? "border-slate-700 bg-slate-800" : "border-slate-300 bg-white"
                        }`}>
                          <button
                            type="button"
                            onClick={() => setSellQuantity(Math.max(1, sellQuantity - 1))}
                            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 font-black text-lg select-none"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={selectedProduct.availableStock}
                            value={sellQuantity}
                            onChange={(e) => setSellQuantity(parseInt(e.target.value, 10) || 1)}
                            className="w-14 text-center font-extrabold text-base focus:outline-none bg-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setSellQuantity(Math.min(selectedProduct.availableStock, sellQuantity + 1))}
                            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 font-black text-lg select-none"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block font-bold">{t.totalBill}</span>
                        <span className="text-xl sm:text-2xl font-black text-indigo-500">
                          {formatRupees(selectedProduct.price * sellQuantity)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={selling || selectedProduct.availableStock <= 0}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white rounded-2xl text-base font-extrabold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                    >
                      {selling ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <IndianRupee className="w-5 h-5" />
                          <span>{t.sellNow.replace("{amount}", formatRupees(selectedProduct.price * sellQuantity))}</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className={`rounded-3xl border border-dashed p-8 text-center flex flex-col items-center justify-center min-h-[300px] ${
              darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}>
              <Package className="w-10 h-10 text-slate-400 mb-2" />
              <h4 className="font-bold text-sm">{t.noItemSelected}</h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1">{t.noItemSub}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
