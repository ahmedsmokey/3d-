const API_BASE = import.meta.env?.VITE_API_BASE || 'http://127.0.0.1:8000/api';

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.substring(0, name.length + 1) === (name + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
}

export async function apiFetch(url, options = {}) {
  const finalUrl = url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  const headers = { ...(options.headers || {}) };
  const csrfToken = getCookie('csrftoken');
  if (csrfToken && !headers['X-CSRFToken']) {
    headers['X-CSRFToken'] = csrfToken;
  }
  return fetch(finalUrl, {
    ...options,
    headers,
    credentials: 'include'
  });
}

export async function fetchSystemStatus() {
  try {
    const res = await apiFetch('/status/', { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Status endpoint returned non-200');
    return await res.json();
  } catch (err) {
    console.warn('Backend status check:', err.message);
    return {
      status: 'offline',
      database: {
        engine: 'SQLite (Development Default)',
        mode: 'Development',
        host: 'localhost'
      }
    };
  }
}

export async function fetchCategories() {
  try {
    const res = await apiFetch(`${API_BASE}/categories/`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return await res.json();
  } catch (err) {
    console.warn('Falling back for categories:', err.message);
    return [];
  }
}

export async function createCategory(categoryData) {
  const res = await apiFetch(`${API_BASE}/categories/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoryData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return await res.json();
}

export async function updateCategory(categoryId, categoryData) {
  const res = await apiFetch(`${API_BASE}/categories/${categoryId}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoryData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return await res.json();
}

export async function deleteCategory(categoryId) {
  const res = await apiFetch(`${API_BASE}/categories/${categoryId}/`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return true;
}


export async function fetchBrands() {
  try {
    const res = await apiFetch(`${API_BASE}/brands/`);
    if (!res.ok) throw new Error('Failed to fetch brands');
    return await res.json();
  } catch (err) {
    console.warn('Falling back for brands:', err.message);
    return [];
  }
}

export async function createBrand(brandData) {
  const res = await apiFetch(`${API_BASE}/brands/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(brandData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return await res.json();
}

export async function updateBrand(brandId, brandData) {
  const res = await apiFetch(`${API_BASE}/brands/${brandId}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(brandData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return await res.json();
}

export async function deleteBrand(brandId) {
  const res = await apiFetch(`${API_BASE}/brands/${brandId}/`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return true;
}

export async function fetchPrinters(brandId = null) {
  try {
    const url = brandId ? `${API_BASE}/printers/?brand=${brandId}` : `${API_BASE}/printers/`;
    const res = await apiFetch(url);
    if (!res.ok) throw new Error('Failed to fetch printers');
    return await res.json();
  } catch (err) {
    console.warn('Falling back for printers:', err.message);
    return [];
  }
}

export async function createPrinter(printerData) {
  const res = await apiFetch(`${API_BASE}/printers/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(printerData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return await res.json();
}

export async function updatePrinter(printerId, printerData) {
  const res = await apiFetch(`${API_BASE}/printers/${printerId}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(printerData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return await res.json();
}

export async function deletePrinter(printerId) {
  const res = await apiFetch(`${API_BASE}/printers/${printerId}/`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return true;
}

export async function fetchProducts(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.printer) params.append('printer', filters.printer);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.featured) params.append('featured', 'true');
    if (filters.deals) params.append('deals', 'true');

    const res = await apiFetch(`${API_BASE}/products/?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    return data.results || data;
  } catch (err) {
    console.warn('Falling back for products:', err.message);
    return [];
  }
}

export async function toggleProductDeal(productId, dealData = {}) {
  const res = await apiFetch(`${API_BASE}/products/${productId}/toggle-deal/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dealData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return await res.json();
}

export async function batchUpdateDeals(productIds, isDeal = true, discountPercentage = 20, dealDescription = 'عرض حصري') {
  const res = await apiFetch(`${API_BASE}/products/batch-deal/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_ids: productIds,
      is_deal: isDeal,
      discount_percentage: discountPercentage,
      deal_description: dealDescription
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return await res.json();
}

export async function createOrder(orderPayload) {
  const res = await apiFetch(`${API_BASE}/orders/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.error || data.detail || (typeof data === 'string' ? data : 'تعذر إتمام الطلب، يرجى التأكد من تسجيل الدخول والمحاولة مرة أخرى');
    const err = new Error(errorMsg);
    err.code = data.code;
    throw err;
  }
  return data;
}

// ==============================================================================
// AUTHENTICATION APIS (Standard & Google Sign-In)
// ==============================================================================
export async function loginUser(username, password, rememberMe = true) {
  const res = await apiFetch(`${API_BASE}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, remember_me: rememberMe })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل تسجيل الدخول');
  return data.user;
}

export async function registerUser(userData, rememberMe = true) {
  const res = await apiFetch(`${API_BASE}/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...userData, remember_me: rememberMe })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل إنشاء الحساب');
  return data.user;
}

export async function googleAuth(googleData, rememberMe = true) {
  const res = await apiFetch(`${API_BASE}/auth/google/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...googleData, remember_me: rememberMe })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل تسجيل الدخول عبر Google');
  return data.user;
}

export async function logoutUser() {
  try {
    await apiFetch(`${API_BASE}/auth/logout/`, { method: 'POST' });
  } catch (e) {
    console.warn('Logout network error:', e);
  }
  return true;
}

export async function updateUserProfile(userData) {
  const res = await apiFetch(`${API_BASE}/auth/me/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل تحديث البيانات');
  return data.user;
}

export async function changeUserPassword(passwordData) {
  const res = await apiFetch(`${API_BASE}/auth/change-password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(passwordData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل تغيير كلمة المرور');
  return data;
}

export async function fetchUserOrders(email, userId) {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (email) params.append('email', email);
    const url = `${API_BASE}/orders/?${params.toString()}`;
    const res = await apiFetch(url);
    if (!res.ok) throw new Error('فشل جلب الطلبات');
    const data = await res.json();
    return data.results || data;
  } catch (err) {
    console.warn('Orders fetch:', err.message);
    return [];
  }
}

// ==============================================================================
// ADMIN DASHBOARD APIS
// ==============================================================================
export async function fetchDashboardStats() {
  try {
    const res = await apiFetch(`${API_BASE}/admin/dashboard-stats/`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return await res.json();
  } catch (err) {
    console.warn('Admin stats fallback:', err.message);
    return null;
  }
}

export async function fetchAdminOrders() {
  try {
    const res = await apiFetch(`${API_BASE}/orders/`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    const data = await res.json();
    return data.results || data;
  } catch (err) {
    console.warn('Admin orders fallback:', err.message);
    return [];
  }
}

export async function updateOrderStatus(orderId, newStatus) {
  const res = await apiFetch(`${API_BASE}/orders/${orderId}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return await res.json();
}

export async function deleteOrder(orderId) {
  const res = await apiFetch(`${API_BASE}/orders/${orderId}/`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to delete order');
  }
  return true;
}

export async function fetchCustomers() {
  try {
    const res = await apiFetch(`${API_BASE}/admin/customers/`);
    if (!res.ok) throw new Error('Failed to fetch customers');
    return await res.json();
  } catch (err) {
    console.warn('Admin customers fallback:', err.message);
    return [];
  }
}

export async function createProduct(productData) {
  const res = await apiFetch(`${API_BASE}/products/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }
  return await res.json();
}

export async function updateProduct(productId, productData) {
  const res = await apiFetch(`${API_BASE}/products/${productId}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }
  return await res.json();
}

export async function uploadProductImages(files) {
  const formData = new FormData();
  if (Array.isArray(files) || files instanceof FileList) {
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
  } else {
    formData.append('images', files);
  }

  const res = await apiFetch(`${API_BASE}/upload-image/`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'فشل رفع الصور');
  }

  return await res.json();
}

export async function uploadProductImage(file) {
  const res = await uploadProductImages([file]);
  return {
    ...res,
    image_url: res.image_url || (res.images && res.images[0]) || ''
  };
}


export async function deleteProduct(productId) {
  const res = await apiFetch(`${API_BASE}/products/${productId}/`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete product');
  return true;
}

export async function fetchBanners() {
  try {
    const res = await apiFetch(`${API_BASE}/banners/`);
    if (!res.ok) throw new Error('Failed to fetch banners');
    return await res.json();
  } catch (err) {
    console.warn('Falling back for banners:', err.message);
    return [];
  }
}

export async function createBanner(bannerData) {
  const isFormData = bannerData instanceof FormData;
  const res = await apiFetch(`${API_BASE}/banners/`, {
    method: 'POST',
    headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
    body: isFormData ? bannerData : JSON.stringify(bannerData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || JSON.stringify(err));
  }
  return await res.json();
}

export async function deleteBanner(bannerId) {
  const res = await apiFetch(`${API_BASE}/banners/${bannerId}/`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete banner');
  return true;
}

export async function fetchEmployees() {
  try {
    const res = await apiFetch(`${API_BASE}/admin/employees/`);
    if (!res.ok) throw new Error('Failed to fetch employees');
    return await res.json();
  } catch (err) {
    console.warn('Employees fallback:', err.message);
    return [];
  }
}

export async function createEmployee(data) {
  const res = await apiFetch(`${API_BASE}/admin/employees/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create employee');
  }
  return await res.json();
}

export async function deleteEmployee(idOrIds) {
  const isArray = Array.isArray(idOrIds);
  const payload = isArray ? { ids: idOrIds } : { id: idOrIds };
  const res = await apiFetch(`${API_BASE}/admin/employees/`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to delete employee');
  return await res.json();
}

export async function fetchAccounts() {
  try {
    const res = await apiFetch(`${API_BASE}/admin/accounts/`);
    if (!res.ok) throw new Error('Failed to fetch accounts');
    return await res.json();
  } catch (err) {
    console.warn('Accounts fallback:', err.message);
    return [];
  }
}

export async function createAccount(data) {
  const res = await apiFetch(`${API_BASE}/admin/accounts/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create account');
  }
  return await res.json();
}

export async function deleteAccount(idOrIds) {
  const isArray = Array.isArray(idOrIds);
  const payload = isArray ? { ids: idOrIds } : { id: idOrIds };
  const res = await apiFetch(`${API_BASE}/admin/accounts/`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to delete account');
  return await res.json();
}

export async function fetchRoles() {
  try {
    const res = await apiFetch(`${API_BASE}/admin/roles/`);
    if (!res.ok) throw new Error('Failed to fetch roles');
    return await res.json();
  } catch (err) {
    console.warn('Roles fallback:', err.message);
    return [];
  }
}

export async function createRole(data) {
  const res = await apiFetch(`${API_BASE}/admin/roles/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create role');
  }
  return await res.json();
}

export async function deleteRole(idOrIds) {
  const isArray = Array.isArray(idOrIds);
  const payload = isArray ? { ids: idOrIds } : { id: idOrIds };
  const res = await apiFetch(`${API_BASE}/admin/roles/`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to delete role');
  return await res.json();
}

export async function toggleUserActiveStatus(userId) {
  const res = await apiFetch(`${API_BASE}/admin/toggle-user-active/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId })
  });
  if (!res.ok) throw new Error('Failed to toggle active status');
  return await res.json();
}


