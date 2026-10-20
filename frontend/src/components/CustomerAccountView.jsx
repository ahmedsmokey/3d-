import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  ShoppingBag,
  Heart,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  Edit2,
  Plus,
  ArrowRight,
  ArrowLeft,
  Trash2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Package,
  Calendar,
  Phone,
  Mail,
  Home,
  Tag,
  X
} from 'lucide-react';
import { updateUserProfile, changeUserPassword, fetchUserOrders } from '../api';

export default function CustomerAccountView({
  user,
  onUserUpdate,
  onLogout,
  onOpenAdmin,
  onBackToStore,
  onNavigateToDeals,
  wishlist = [],
  onRemoveFromWishlist,
  onAddToCart,
  lang = 'ar'
}) {
  const isAr = lang === 'ar';
  const isAdmin = user?.role === 'admin' || user?.is_staff || user?.is_superuser;

  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'addresses' | 'orders' | 'wishlist' | 'security'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [toast, setToast] = useState(null);

  // Addresses state (persisted in localStorage per user)
  const addressesStorageKey = `printforge_addresses_${user?.id || 'guest'}`;
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem(addressesStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Edit Profile Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone && user.phone !== '-' ? user.phone : '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Add Address Modal State
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [newCity, setNewCity] = useState('بغداد');
  const [newStreet, setNewStreet] = useState('');
  const [newPhone, setNewPhone] = useState(user?.phone && user.phone !== '-' ? user.phone : '');
  const [newNotes, setNewNotes] = useState('');

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  // Sync edit profile form if user prop changes
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone && user.phone !== '-' ? user.phone : '');
    }
  }, [user]);

  // Fetch real user orders if available
  useEffect(() => {
    if (user?.email) {
      setLoadingOrders(true);
      fetchUserOrders(user.email)
        .then((res) => {
          if (Array.isArray(res)) {
            setOrders(res);
          }
        })
        .catch((err) => console.warn('Fetch orders:', err))
        .finally(() => setLoadingOrders(false));
    }
  }, [user?.email]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Save address helper
  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!newStreet.trim()) {
      showToast(isAr ? 'يرجى إدخال تفاصيل العنوان والشارع' : 'Please enter address details', 'error');
      return;
    }
    const newAddr = {
      id: Date.now(),
      city: newCity,
      street: newStreet.trim(),
      phone: newPhone.trim() || user?.phone || '',
      notes: newNotes.trim(),
      isDefault: addresses.length === 0
    };
    const updated = [newAddr, ...addresses];
    setAddresses(updated);
    try {
      localStorage.setItem(addressesStorageKey, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    setIsAddAddressOpen(false);
    setNewStreet('');
    setNewNotes('');
    showToast(isAr ? 'تمت إضافة العنوان بنجاح' : 'Address added successfully');
  };

  // Delete address
  const handleDeleteAddress = (id) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    try {
      localStorage.setItem(addressesStorageKey, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    showToast(isAr ? 'تم حذف العنوان' : 'Address deleted');
  };

  // Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast(isAr ? 'الاسم مطلوب' : 'Name is required', 'error');
      return;
    }
    setUpdatingProfile(true);
    try {
      const updatedUser = await updateUserProfile({
        id: user.id,
        name: editName.trim(),
        phone: editPhone.trim() || '-'
      });
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
      setIsEditProfileOpen(false);
      showToast(isAr ? 'تم تحديث معلوماتك الشخصية بنجاح' : 'Personal information updated successfully');
    } catch (err) {
      showToast(err.message || (isAr ? 'فشل التحديث' : 'Update failed'), 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast(isAr ? 'يجب أن تتكون كلمة المرور الجديدة من 6 خانات على الأقل' : 'Password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match', 'error');
      return;
    }
    setChangingPass(true);
    try {
      await changeUserPassword({
        user_id: user.id,
        current_password: currentPassword,
        new_password: newPassword
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast(isAr ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
    } catch (err) {
      showToast(err.message || (isAr ? 'فشل تغيير كلمة المرور' : 'Password change failed'), 'error');
    } finally {
      setChangingPass(false);
    }
  };

  // Initials generator for avatar
  const getInitials = (name) => {
    if (!name) return 'ع';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Calculate Loyalty Points (e.g., 50 points base or 1 point per 5000 IQD from orders)
  const loyaltyPoints = orders.length > 0
    ? orders.reduce((sum, ord) => sum + Math.floor(Number(ord.total_amount || 0) / 10000), 0)
    : 0;

  const displayName = user?.name || user?.username || (isAr ? 'مستخدم المتجر' : 'Store Member');
  const displayEmail = user?.email || (isAr ? 'user@example.com' : 'user@example.com');
  const displayPhone = user?.phone && user.phone !== '-' ? user.phone : (isAr ? 'لم تتم إضافة رقم هاتف' : 'Not specified');

  return (
    <div className="account-page-wrapper" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      {toast && (
        <div className={`account-toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="container account-page-container">
        {/* Top Header Row */}
        <div className="account-top-header">
          <div className="account-title-group">
            <span className="account-title-accent"></span>
            <h1 className="account-main-title">{isAr ? 'حسابي' : 'My Account'}</h1>
          </div>

          <button
            type="button"
            className="account-back-btn"
            onClick={onBackToStore}
            title={isAr ? 'العودة للمتجر' : 'Back to Store'}
          >
            {isAr ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            <span>{isAr ? 'العودة للمتجر والتسوق' : 'Back to Store'}</span>
          </button>
        </div>

        {/* Two Columns Grid */}
        <div className="account-layout-grid">
          {/* =========================================================================
              SIDEBAR (RIGHT COLUMN IN RTL)
             ========================================================================= */}
          <aside className="account-sidebar-col">
            {/* 1. Profile Summary Card */}
            <div className="account-profile-card glass-panel">
              <div className="profile-card-banner">
                <span className="banner-badge-role">
                  <ShieldCheck size={12} />
                  <span>{isAdmin ? (isAr ? 'مسؤول (Admin)' : 'Admin') : (isAr ? 'عميل معتمد' : 'Verified')}</span>
                </span>
              </div>

              <div className="profile-card-body">
                <div className="profile-header-main">
                  <div className="profile-avatar-wrapper">
                    {user?.avatar_url && !user.avatar_url.includes('dicebear') ? (
                      <img src={user.avatar_url} alt={displayName} className="profile-avatar-img" />
                    ) : (
                      <div className="profile-avatar-initials">
                        {getInitials(displayName)}
                      </div>
                    )}
                  </div>

                  <div className="profile-user-info-stack">
                    <div className="profile-name-badge-row">
                      <h3 className="profile-user-name">{displayName}</h3>
                      <span className="profile-inline-role-badge">
                        <ShieldCheck size={11} />
                        <span>{isAdmin ? (isAr ? 'مسؤول' : 'Admin') : (isAr ? 'عميل معتمد' : 'Member')}</span>
                      </span>
                    </div>
                    <span className="profile-user-email">
                      <Mail size={12} />
                      <span>{displayEmail}</span>
                    </span>
                  </div>
                </div>

                {/* Quick Profile Stats Grid (Loyalty, Orders, Addresses) */}
                <div className="profile-quick-stats-grid">
                  <div className="profile-stat-tile loyalty-tile">
                    <span className="stat-tile-label">{isAr ? 'نقاط الولاء' : 'Loyalty Points'}</span>
                    <strong className="stat-tile-value text-orange">⭐ {loyaltyPoints}</strong>
                  </div>
                  <button 
                    type="button" 
                    className="profile-stat-tile clickable-tile"
                    onClick={() => setActiveTab('orders')}
                    title={isAr ? 'عرض الطلبات' : 'View Orders'}
                  >
                    <span className="stat-tile-label">{isAr ? 'الطلبات' : 'Orders'}</span>
                    <strong className="stat-tile-value">📦 {orders.length}</strong>
                  </button>
                  <button 
                    type="button" 
                    className="profile-stat-tile clickable-tile"
                    onClick={() => setActiveTab('addresses')}
                    title={isAr ? 'عرض العناوين' : 'View Addresses'}
                  >
                    <span className="stat-tile-label">{isAr ? 'العناوين' : 'Addresses'}</span>
                    <strong className="stat-tile-value">📍 {addresses.length}</strong>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Navigation Menu Card */}
            <nav className="account-nav-card">
              <ul className="account-nav-list">
                {/* Personal Info */}
                <li>
                  <button
                    type="button"
                    className={`account-nav-btn ${activeTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveTab('info')}
                  >
                    <div className="nav-btn-icon-label">
                      <User size={18} className="nav-icon" />
                      <span>{isAr ? 'المعلومات الشخصية' : 'Personal Information'}</span>
                    </div>
                    {activeTab === 'info' && <span className="nav-active-dot"></span>}
                  </button>
                </li>

                {/* Addresses */}
                <li>
                  <button
                    type="button"
                    className={`account-nav-btn ${activeTab === 'addresses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('addresses')}
                  >
                    <div className="nav-btn-icon-label">
                      <MapPin size={18} className="nav-icon" />
                      <span>{isAr ? 'العناوين' : 'Addresses'}</span>
                    </div>
                    {activeTab === 'addresses' && <span className="nav-active-dot"></span>}
                  </button>
                </li>

                {/* Orders */}
                <li>
                  <button
                    type="button"
                    className={`account-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                  >
                    <div className="nav-btn-icon-label">
                      <ShoppingBag size={18} className="nav-icon" />
                      <span>{isAr ? 'الطلبات' : 'Orders'}</span>
                    </div>
                    {activeTab === 'orders' && <span className="nav-active-dot"></span>}
                  </button>
                </li>

                {/* Favorites / Wishlist */}
                <li>
                  <button
                    type="button"
                    className={`account-nav-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
                    onClick={() => setActiveTab('wishlist')}
                  >
                    <div className="nav-btn-icon-label">
                      <Heart size={18} className="nav-icon" />
                      <span>{isAr ? 'المفضلة' : 'Wishlist'}</span>
                    </div>
                    {activeTab === 'wishlist' && <span className="nav-active-dot"></span>}
                  </button>
                </li>

                {/* Security */}
                <li>
                  <button
                    type="button"
                    className={`account-nav-btn ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                  >
                    <div className="nav-btn-icon-label">
                      <ShieldCheck size={18} className="nav-icon" />
                      <span>{isAr ? 'الأمان' : 'Security'}</span>
                    </div>
                    {activeTab === 'security' && <span className="nav-active-dot"></span>}
                  </button>
                </li>

                {/* Admin Dashboard Option (Only for Admin/Staff) */}
                {isAdmin && (
                  <li>
                    <button
                      type="button"
                      className="account-nav-btn admin-link"
                      onClick={onOpenAdmin}
                    >
                      <div className="nav-btn-icon-label">
                        <LayoutDashboard size={18} className="nav-icon text-orange" />
                        <span className="text-orange">{isAr ? 'لوحة التحكم' : 'Admin Dashboard'}</span>
                      </div>
                    </button>
                  </li>
                )}

                {/* Logout Option */}
                <li className="logout-li">
                  <button
                    type="button"
                    className="account-nav-btn logout-link"
                    onClick={onLogout}
                  >
                    <div className="nav-btn-icon-label">
                      <LogOut size={18} className="nav-icon text-red" />
                      <span className="text-red">{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
                    </div>
                  </button>
                </li>
              </ul>
            </nav>
          </aside>

          {/* =========================================================================
              MAIN CONTENT (LEFT COLUMN IN RTL)
             ========================================================================= */}
          <main className="account-main-col">
            {/* TAB 1: PERSONAL INFORMATION (+ OFFERS & ADDRESSES QUICK VIEW) */}
            {activeTab === 'info' && (
              <div className="account-sections-stack">
                {/* 1. Personal Information Card */}
                <section className="account-section-card glass-panel">
                  <div className="section-card-header">
                    <div className="section-title-with-bar">
                      <span className="section-bar-pink"></span>
                      <h2 className="section-title-text">
                        {isAr ? 'معلوماتي الشخصية' : 'Personal Information'}
                      </h2>
                    </div>

                    <button
                      type="button"
                      className="section-action-btn-cyan"
                      onClick={() => setIsEditProfileOpen(true)}
                    >
                      <Edit2 size={14} />
                      <span>{isAr ? 'تعديل البيانات' : 'Edit'}</span>
                    </button>
                  </div>

                  <div className="section-card-content">
                    <div className="account-info-tiles-grid">
                      <div className="account-info-tile">
                        <div className="info-tile-icon-wrap icon-user">
                          <User size={18} />
                        </div>
                        <div className="info-tile-data">
                          <span className="info-tile-label">{isAr ? 'الاسم الكامل' : 'Full Name'}</span>
                          <strong className="info-tile-value">{displayName}</strong>
                        </div>
                      </div>

                      <div className="account-info-tile">
                        <div className="info-tile-icon-wrap icon-phone">
                          <Phone size={18} />
                        </div>
                        <div className="info-tile-data">
                          <span className="info-tile-label">{isAr ? 'رقم الهاتف' : 'Phone Number'}</span>
                          <strong className="info-tile-value" dir="ltr">{displayPhone}</strong>
                        </div>
                      </div>

                      <div className="account-info-tile">
                        <div className="info-tile-icon-wrap icon-email">
                          <Mail size={18} />
                        </div>
                        <div className="info-tile-data">
                          <span className="info-tile-label">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</span>
                          <strong className="info-tile-value">{displayEmail}</strong>
                        </div>
                      </div>

                      <div className="account-info-tile">
                        <div className="info-tile-icon-wrap icon-shield">
                          <ShieldCheck size={18} />
                        </div>
                        <div className="info-tile-data">
                          <span className="info-tile-label">{isAr ? 'نوع الحساب والصلاحية' : 'Account Role'}</span>
                          <strong className="info-tile-value text-orange">
                            {isAdmin ? (isAr ? 'مدير المتجر (Admin)' : 'Administrator') : (isAr ? 'عميل معتمد' : 'Standard Member')}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 2. Offers & Discounts Banner */}
                <section className="account-promo-banner">
                  <div className="promo-text-side">
                    <span className="promo-subtitle">{isAr ? 'العروض والخصومات' : 'Offers & Discounts'}</span>
                    <h3 className="promo-main-heading">
                      {isAr
                        ? 'تصفّح أحدث العروض والخصومات المتاحة الآن.'
                        : 'Browse the latest deals and discounts available now.'}
                    </h3>
                  </div>

                  <button
                    type="button"
                    className="promo-action-btn"
                    onClick={onNavigateToDeals || onBackToStore}
                  >
                    <span>{isAr ? 'عرض العروض' : 'View Deals'}</span>
                    {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                  </button>
                </section>

                {/* 3. My Addresses Card */}
                <section className="account-section-card">
                  <div className="section-card-header">
                    <div className="section-title-with-bar">
                      <span className="section-bar-pink"></span>
                      <h2 className="section-title-text">{isAr ? 'عناويني' : 'My Addresses'}</h2>
                    </div>

                    <button
                      type="button"
                      className="section-action-btn-cyan"
                      onClick={() => setIsAddAddressOpen(true)}
                    >
                      <Plus size={15} />
                      <span>{isAr ? 'إضافة عنوان جديد' : 'Add New Address'}</span>
                    </button>
                  </div>

                  <div className="section-card-content">
                    {addresses.length === 0 ? (
                      <div className="empty-box-placeholder compact-empty-box">
                        <MapPin size={26} style={{ opacity: 0.5, marginBottom: '6px', color: 'var(--text-muted, #64748b)' }} />
                        <p>{isAr ? 'لم تقم بحفظ أي عناوين بعد.' : 'No saved addresses yet.'}</p>
                        <button
                          type="button"
                          className="section-action-btn-cyan"
                          style={{ marginTop: '10px' }}
                          onClick={() => setIsAddAddressOpen(true)}
                        >
                          <Plus size={14} />
                          <span>{isAr ? 'إضافة أول عنوان لك' : 'Add First Address'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="addresses-cards-grid">
                        {addresses.map((addr) => (
                          <div key={addr.id} className="user-address-card">
                            <div className="addr-header">
                              <span className="addr-city-tag">{addr.city}</span>
                              <button
                                type="button"
                                className="addr-del-btn"
                                onClick={() => handleDeleteAddress(addr.id)}
                                title={isAr ? 'حذف العنوان' : 'Delete'}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                            <p className="addr-street-text">{addr.street}</p>
                            {addr.phone && (
                              <p className="addr-phone-text" dir="ltr">
                                📞 {addr.phone}
                              </p>
                            )}
                            {addr.notes && <p className="addr-notes-text">📝 {addr.notes}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {/* TAB 2: ADDRESSES DEDICATED VIEW */}
            {activeTab === 'addresses' && (
              <section className="account-section-card">
                <div className="section-card-header">
                  <div className="section-title-with-bar">
                    <span className="section-bar-pink"></span>
                    <h2 className="section-title-text">{isAr ? 'عناويني' : 'My Addresses'}</h2>
                  </div>

                  <button
                    type="button"
                    className="section-action-btn-cyan"
                    onClick={() => setIsAddAddressOpen(true)}
                  >
                    <Plus size={15} />
                    <span>{isAr ? 'إضافة عنوان جديد' : 'Add New Address'}</span>
                  </button>
                </div>

                <div className="section-card-content">
                  {addresses.length === 0 ? (
                    <div className="empty-box-placeholder">
                      <p>{isAr ? 'ما عندك أي عنوان محفوظ بعد.' : 'You do not have any saved address yet.'}</p>
                      <button
                        type="button"
                        className="btn-pink-pill"
                        style={{ marginTop: '16px' }}
                        onClick={() => setIsAddAddressOpen(true)}
                      >
                        {isAr ? 'إضافة عنوانك الأول' : 'Add your first address'}
                      </button>
                    </div>
                  ) : (
                    <div className="addresses-cards-grid">
                      {addresses.map((addr) => (
                        <div key={addr.id} className="user-address-card">
                          <div className="addr-header">
                            <span className="addr-city-tag">{addr.city}</span>
                            <button
                              type="button"
                              className="addr-del-btn"
                              onClick={() => handleDeleteAddress(addr.id)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                          <p className="addr-street-text">{addr.street}</p>
                          {addr.phone && (
                            <p className="addr-phone-text" dir="ltr">
                              📞 {addr.phone}
                            </p>
                          )}
                          {addr.notes && <p className="addr-notes-text">📝 {addr.notes}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* TAB 3: ORDERS DEDICATED VIEW */}
            {activeTab === 'orders' && (
              <section className="account-section-card">
                <div className="section-card-header">
                  <div className="section-title-with-bar">
                    <span className="section-bar-pink"></span>
                    <h2 className="section-title-text">{isAr ? 'طلباتي' : 'My Orders'}</h2>
                  </div>
                </div>

                <div className="section-card-content">
                  {loadingOrders ? (
                    <div className="empty-box-placeholder">
                      <p>{isAr ? 'جاري جلب الطلبات...' : 'Loading orders...'}</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="empty-box-placeholder">
                      <p className="empty-state-msg">
                        {isAr ? 'ما عندك أي طلب لحد الآن.' : 'You have no orders yet.'}
                      </p>
                      <button
                        type="button"
                        className="btn-pink-pill"
                        onClick={onBackToStore}
                      >
                        {isAr ? 'تصفّح المنتجات' : 'Browse Products'}
                      </button>
                    </div>
                  ) : (
                    <div className="orders-history-list">
                      {orders.map((order) => (
                        <div key={order.id || order.order_number} className="user-order-item-card">
                          <div className="order-item-top-row">
                            <div className="order-id-date">
                              <span className="order-number-tag">
                                #{String(order.order_number).slice(0, 8)}
                              </span>
                              <span className="order-date-text">
                                <Calendar size={13} />
                                {new Date(order.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                              </span>
                            </div>

                            <span className={`order-status-badge ${order.status?.toLowerCase()}`}>
                              {order.status === 'PENDING' && (isAr ? 'قيد المراجعة' : 'Pending')}
                              {order.status === 'PROCESSING' && (isAr ? 'قيد التجهيز' : 'Processing')}
                              {order.status === 'SHIPPED' && (isAr ? 'تم الشحن' : 'Shipped')}
                              {order.status === 'DELIVERED' && (isAr ? 'مكتمل ومستلم' : 'Delivered')}
                              {order.status === 'CANCELLED' && (isAr ? 'ملغي' : 'Cancelled')}
                              {!['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status) && (order.status || 'Active')}
                            </span>
                          </div>

                          <div className="order-amount-row">
                            <span className="order-total-label">{isAr ? 'المجموع الكلي:' : 'Total Amount:'}</span>
                            <span className="order-total-price">
                              {Number(order.total_amount).toLocaleString()} {isAr ? 'د.ع' : 'IQD'}
                            </span>
                          </div>

                          {order.items && order.items.length > 0 && (
                            <div className="order-products-chips">
                              {order.items.map((it, idx) => (
                                <span key={idx} className="order-chip">
                                  {it.quantity}x {isAr ? (it.product?.name_ar || it.product?.name_en) : it.product?.name_en}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* TAB 4: WISHLIST DEDICATED VIEW */}
            {activeTab === 'wishlist' && (
              <section className="account-section-card">
                <div className="section-card-header">
                  <div className="section-title-with-bar">
                    <span className="section-bar-pink"></span>
                    <h2 className="section-title-text">{isAr ? 'المفضلة' : 'Wishlist'}</h2>
                  </div>
                </div>

                <div className="section-card-content">
                  {wishlist.length === 0 ? (
                    <div className="empty-box-placeholder">
                      <p className="empty-state-msg">
                        {isAr ? 'ما ضفت أي منتج للمفضلة بعد.' : 'You have not added any product to favorites yet.'}
                      </p>
                      <button
                        type="button"
                        className="btn-pink-pill"
                        onClick={onBackToStore}
                      >
                        {isAr ? 'تصفّح المنتجات' : 'Browse Products'}
                      </button>
                    </div>
                  ) : (
                    <div className="wishlist-cards-grid">
                      {wishlist.map((item) => (
                        <div key={item.id} className="account-wishlist-card">
                          <img
                            src={item.image_url || 'https://placehold.co/200x200/0f172a/ff6b00?text=3D+Part'}
                            alt={isAr ? item.name_ar : item.name_en}
                            className="wishlist-card-thumb"
                          />
                          <div className="wishlist-card-details">
                            <h4 className="wishlist-card-title">
                              {isAr ? item.name_ar : item.name_en}
                            </h4>
                            <span className="wishlist-card-price">
                              {Number(item.price).toLocaleString()} {isAr ? 'د.ع' : 'IQD'}
                            </span>

                            <div className="wishlist-card-actions">
                              <button
                                type="button"
                                className="wishlist-add-cart-btn"
                                onClick={() => {
                                  if (onAddToCart) onAddToCart(item);
                                  showToast(isAr ? 'تمت الإضافة إلى السلة' : 'Added to cart');
                                }}
                              >
                                {isAr ? 'إضافة للسلة' : 'Add to Cart'}
                              </button>
                              <button
                                type="button"
                                className="wishlist-remove-btn"
                                onClick={() => {
                                  if (onRemoveFromWishlist) onRemoveFromWishlist(item.id);
                                  showToast(isAr ? 'تم الحذف من المفضلة' : 'Removed from wishlist');
                                }}
                                title={isAr ? 'حذف من المفضلة' : 'Remove'}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* TAB 5: SECURITY / CHANGE PASSWORD */}
            {activeTab === 'security' && (
              <section className="account-section-card">
                <div className="section-card-header">
                  <div className="section-title-with-bar">
                    <span className="section-bar-pink"></span>
                    <h2 className="section-title-text">{isAr ? 'الأمان وتغيير كلمة المرور' : 'Security & Password'}</h2>
                  </div>
                </div>

                <div className="section-card-content">
                  <form onSubmit={handleChangePassword} className="security-form-box">
                    <div className="form-group">
                      <label className="account-form-label">
                        {isAr ? 'كلمة المرور الحالية' : 'Current Password'}
                      </label>
                      <div className="input-with-eye-wrap">
                        <input
                          type={showCurrentPass ? 'text' : 'password'}
                          required
                          className="account-form-input"
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="input-eye-btn"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          tabIndex={-1}
                        >
                          {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="account-form-label">
                        {isAr ? 'كلمة المرور الجديدة' : 'New Password'}
                      </label>
                      <div className="input-with-eye-wrap">
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          required
                          className="account-form-input"
                          placeholder={isAr ? '6 خانات على الأقل' : 'At least 6 characters'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="input-eye-btn"
                          onClick={() => setShowNewPass(!showNewPass)}
                          tabIndex={-1}
                        >
                          {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="account-form-label">
                        {isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                      </label>
                      <input
                        type="password"
                        required
                        className="account-form-input"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={changingPass}
                      className="btn-pink-pill"
                      style={{ marginTop: '12px' }}
                    >
                      {changingPass
                        ? (isAr ? 'جاري الحفظ...' : 'Saving...')
                        : (isAr ? 'حفظ كلمة المرور الجديدة' : 'Update Password')}
                    </button>
                  </form>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: EDIT PERSONAL INFORMATION
         ========================================================================= */}
      {isEditProfileOpen && (
        <div className="account-modal-overlay animate-fade">
          <div className="account-modal-card glass-panel" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="account-modal-header">
              <div className="section-title-with-bar">
                <span className="section-bar-pink"></span>
                <h3 className="section-title-text">{isAr ? 'تعديل البيانات الشخصية' : 'Edit Personal Info'}</h3>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setIsEditProfileOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="account-modal-form">
              <div className="form-group">
                <label className="account-form-label">{isAr ? 'الاسم الكامل *' : 'Full Name *'}</label>
                <input
                  type="text"
                  required
                  className="account-form-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={isAr ? 'الاسم الكامل' : 'Your name'}
                />
              </div>

              <div className="form-group">
                <label className="account-form-label">{isAr ? 'رقم الهاتف' : 'Phone Number'}</label>
                <input
                  type="tel"
                  className="account-form-input"
                  dir="ltr"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+964 770 000 0000"
                />
              </div>

              <div className="form-group">
                <label className="account-form-label">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                <input
                  type="email"
                  disabled
                  className="account-form-input disabled-input"
                  value={user?.email || ''}
                />
                <span className="form-sub-hint">
                  {isAr ? 'لا يمكن تعديل البريد الإلكتروني لأسباب أمنية.' : 'Email is locked.'}
                </span>
              </div>

              <div className="modal-actions-row">
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="btn-pink-pill"
                >
                  {updatingProfile
                    ? (isAr ? 'جاري الحفظ...' : 'Saving...')
                    : (isAr ? 'حفظ التغييرات' : 'Save Changes')}
                </button>
                <button
                  type="button"
                  className="btn-cancel-flat"
                  onClick={() => setIsEditProfileOpen(false)}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ADD NEW ADDRESS
         ========================================================================= */}
      {isAddAddressOpen && (
        <div className="account-modal-overlay animate-fade">
          <div className="account-modal-card glass-panel" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="account-modal-header">
              <div className="section-title-with-bar">
                <span className="section-bar-pink"></span>
                <h3 className="section-title-text">{isAr ? 'إضافة عنوان جديد' : 'Add New Address'}</h3>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setIsAddAddressOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="account-modal-form">
              <div className="form-group">
                <label className="account-form-label">{isAr ? 'المحافظة / المدينة *' : 'City *'}</label>
                <select
                  className="account-form-input"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                >
                  <option value="بغداد">بغداد</option>
                  <option value="البصرة">البصرة</option>
                  <option value="أربيل">أربيل</option>
                  <option value="النجف">النجف</option>
                  <option value="كربلاء">كربلاء</option>
                  <option value="السليمانية">السليمانية</option>
                  <option value="الموصل">الموصل</option>
                  <option value="بابل">بابل</option>
                  <option value="ديالى">ديالى</option>
                  <option value="الأنبار">الأنبار</option>
                  <option value="ذي قار">ذي قار</option>
                  <option value="صلاح الدين">صلاح الدين</option>
                  <option value="كركوك">كركوك</option>
                  <option value="واسط">واسط</option>
                  <option value="ميسان">ميسان</option>
                  <option value="المثنى">المثنى</option>
                  <option value="الديوانية">الديوانية</option>
                  <option value="دهوك">دهوك</option>
                </select>
              </div>

              <div className="form-group">
                <label className="account-form-label">{isAr ? 'تفاصيل العنوان / المنطقة والشارع *' : 'Street & Area *'}</label>
                <input
                  type="text"
                  required
                  className="account-form-input"
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  placeholder={isAr ? 'مثال: المنصور، شارع 14 رمضان، قرب...' : 'Area, street, nearest landmark'}
                />
              </div>

              <div className="form-group">
                <label className="account-form-label">{isAr ? 'رقم هاتف للتوصيل' : 'Delivery Phone'}</label>
                <input
                  type="tel"
                  className="account-form-input"
                  dir="ltr"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+964 770 000 0000"
                />
              </div>

              <div className="form-group">
                <label className="account-form-label">{isAr ? 'ملاحظات إضافية للتوصيل' : 'Delivery Notes'}</label>
                <input
                  type="text"
                  className="account-form-input"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder={isAr ? 'مثال: الاتصال قبل الوصول' : 'e.g. Call before arrival'}
                />
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="btn-pink-pill">
                  {isAr ? 'حفظ العنوان' : 'Save Address'}
                </button>
                <button
                  type="button"
                  className="btn-cancel-flat"
                  onClick={() => setIsAddAddressOpen(false)}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
