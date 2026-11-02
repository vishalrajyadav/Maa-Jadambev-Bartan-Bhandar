import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Printer, Download, Check } from "lucide-react";

export default function QrCodeModal({ product, onClose }) {
  const qrRef = useRef(null);

  if (!product) return null;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${product.productName}</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 90vh; text-align: center; }
            h2 { margin-bottom: 4px; }
            p { margin: 4px 0; color: #555; }
            .box { border: 2px dashed #ccc; padding: 24px; border-radius: 16px; }
          </style>
        </head>
        <body>
          <div class="box">
            <h2>${product.productName}</h2>
            <p>Code: <strong>${product.qrCodeValue}</strong></p>
            <p>Price: $${product.price.toFixed(2)}</p>
            <div style="margin-top: 16px;">
              ${qrRef.current?.innerHTML || ""}
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${product.qrCodeValue}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mt-2">{product.productName}</h3>
        <p className="text-xs font-mono text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded-md mt-1 font-semibold">
          {product.qrCodeValue}
        </p>

        {/* QR Code Canvas */}
        <div 
          ref={qrRef} 
          className="my-6 p-4 bg-white rounded-2xl border-2 border-dashed border-slate-200 inline-block shadow-inner"
        >
          <QRCodeSVG 
            value={product.qrCodeValue} 
            size={180} 
            level="H" 
            includeMargin={true}
          />
        </div>

        <div className="text-xs text-slate-500 mb-6 space-y-1">
          <p>Scan this QR code with the built-in scanner or camera to view product details & record instant sales.</p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Code</span>
          </button>
        </div>
      </div>
    </div>
  );
}
