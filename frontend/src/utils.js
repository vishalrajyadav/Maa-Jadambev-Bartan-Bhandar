import * as XLSX from "xlsx";

// Format numbers in Indian Rupee notation (e.g. ₹1,450 or ₹25,000)
export function formatRupees(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Shop Information
export const SHOP_INFO = {
  name: "Maa Jagdambe Bartan Bhandar",
  nameHindi: "माँ जगदम्बे बर्तन भंडार",
  address: "Pankaj Cinema ke bagal wali gali, Dahiyawa, Chhapra, Bihar",
  contact: "Add Contact No.",
};

// Export remaining items to Excel (.xlsx) with Shop Branding
export function exportStockToExcel(items) {
  if (!items || items.length === 0) {
    alert("No items to export.");
    return;
  }

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Header rows with shop name and address
  const headerRows = [
    ["MAA JAGDAMBE BARTAN BHANDAR (माँ जगदम्बे बर्तन भंडार)"],
    ["Address: Pankaj Cinema se bagal wali gali, Dahiyawa, Chhapra, Bihar"],
    [`Stock Report as on: ${today}`],
    [], // empty spacer row
    ["S.No", "Item Name", "Price (₹)", "Items in Shop (Stock)", "Total Sold", "Stock Status"]
  ];

  const dataRows = items.map((item, idx) => [
    idx + 1,
    item.productName,
    item.price,
    item.availableStock,
    item.totalSold,
    item.availableStock === 0 
      ? "Out of Stock (Khali)" 
      : item.availableStock < 5 
        ? "Running Out (Kam Stock)" 
        : "Available (Stock Me Hai)"
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([...headerRows, ...dataRows]);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 8 },
    { wch: 42 },
    { wch: 14 },
    { wch: 22 },
    { wch: 14 },
    { wch: 25 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Stock List");

  const fileDate = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Maa_Jagdambe_Stock_Report_${fileDate}.xlsx`);
}

// Print Bill / Sale Receipt
export function printReceipt(sale, shop = SHOP_INFO) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const saleDate = new Date(sale.saleDate || new Date()).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  printWindow.document.write(`
    <html>
      <head>
        <title>Receipt - ${shop.name}</title>
        <style>
          body { font-family: monospace, sans-serif; padding: 20px; max-width: 320px; margin: 0 auto; color: #111; }
          .center { text-align: center; }
          .line { border-top: 1px dashed #444; margin: 10px 0; }
          .flex { display: flex; justify-content: space-between; }
          h2 { margin: 0; font-size: 16px; }
          p { margin: 3px 0; font-size: 12px; }
          .bold { font-weight: bold; }
          .total { font-size: 16px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="center">
          <h2>${shop.name}</h2>
          <p>${shop.nameHindi}</p>
          <p>${shop.address}</p>
          <p>Ph: ${shop.contact}</p>
        </div>
        <div class="line"></div>
        <div class="flex"><p>Date:</p><p>${saleDate}</p></div>
        <div class="flex"><p>Bill No:</p><p>#${sale.saleId || Math.floor(1000 + Math.random() * 9000)}</p></div>
        <div class="line"></div>
        <p class="bold">${sale.productName}</p>
        <div class="flex">
          <p>${sale.quantity} pcs @ ₹${sale.unitPrice}</p>
          <p class="bold">₹${sale.totalAmount}</p>
        </div>
        <div class="line"></div>
        <div class="flex total">
          <p>Total Paid:</p>
          <p>₹${sale.totalAmount}</p>
        </div>
        <div class="line"></div>
        <div class="center">
          <p class="bold">धन्यवाद! फिर पधारें।</p>
          <p>Thank you! Visit Again.</p>
        </div>
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
