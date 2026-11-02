const API_URL = import.meta.env.VITE_API_URL || "";

export const getApiUrl = () => API_URL;

// Helper to ensure image URLs load properly whether relative (/uploads/..) or absolute
export function resolveImageUrl(url) {
  if (!url) return "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=600&q=80";
  if (url.startsWith("/uploads")) {
    return `${API_URL}${url}`;
  }
  return url;
}

export async function fetchDashboardSummary() {
  const res = await fetch(`${API_URL}/api/dashboard/summary`);
  if (!res.ok) throw new Error("Could not load shop summary");
  return res.json();
}

export async function fetchProducts(search = "") {
  const url = search ? `${API_URL}/api/products?search=${encodeURIComponent(search)}` : `${API_URL}/api/products`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not load items");
  return res.json();
}

export async function fetchProductById(id) {
  const res = await fetch(`${API_URL}/api/products/${id}`);
  if (!res.ok) throw new Error("Item not found");
  return res.json();
}

export async function createProduct(productData) {
  const res = await fetch(`${API_URL}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to add item");
  }
  return res.json();
}

export async function updateProduct(id, productData) {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to update item");
  }
  return res.json();
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete item");
  return res.json();
}

export async function uploadProductImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/api/products/upload-image`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Photo upload failed");
  }
  return res.json();
}

export async function fetchSales() {
  const res = await fetch(`${API_URL}/api/sales`);
  if (!res.ok) throw new Error("Could not load sales list");
  return res.json();
}

export async function recordSale(saleData) {
  const res = await fetch(`${API_URL}/api/sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(saleData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to record sale");
  }
  return res.json();
}
