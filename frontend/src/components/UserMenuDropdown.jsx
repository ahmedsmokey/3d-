import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
  Shield,
  ChevronDown,
  ChevronUp,
  Settings
} from 'lucide-react';

export default function UserMenuDropdown({
  user,
  onLogout,
  onOpenAdmin,
  onOpenAccount,
  lang,
  compact = true
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const isAdmin = user?.role === 'admin' || user?.is_staff || user?.is_superuser;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="user-menu-wrapper" ref={menuRef}>
      {/* Trigger Button in Header */}
      {compact ? (
        <button
          className={`nav-icon-btn user-icon-btn ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          title={user?.name || (lang === 'ar' ? 'حسابي' : 'Account')}
        >
          <User size={19} />
        </button>
      ) : (
        <button
          className="user-profile-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}&backgroundColor=ff6b00`}
            alt={user.name}
            className="user-avatar-img"
          />
          <div className="user-btn-details">
            <span className="user-btn-name">{user.name}</span>
            <span className={`user-role-micro ${isAdmin ? 'admin' : 'member'}`}>
              {isAdmin ? (lang === 'ar' ? 'مدير' : 'Admin') : (lang === 'ar' ? 'عضو' : 'Member')}
            </span>
          </div>
          {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="user-dropdown-menu glass-panel animate-fade">
          {/* User Profile Card */}
          <div className="dropdown-user-header">
            <img
              src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}&backgroundColor=ff6b00`}
              alt={user.name}
              className="dropdown-avatar-large"
            />
            <div className="dropdown-user-info">
              <h5 className="dropdown-user-name">{user.name}</h5>
              <span className="dropdown-user-email">{user.email || user.username}</span>
              {user.phone && user.phone !== '-' && (
                <span className="dropdown-user-phone" dir="ltr" style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                  {user.phone}
                </span>
              )}
              <div className="dropdown-role-badge" style={{ marginTop: '6px' }}>
                {isAdmin ? (
                  <span className="badge badge-orange">
                    <Shield size={12} />
                    {user?.role_name ? user.role_name : (lang === 'ar' ? 'مدير المتجر' : 'Administrator')}
                  </span>
                ) : (
                  <span className="badge badge-green">
                    {user?.role_name && user.role_name !== 'بلا دور'
                      ? user.role_name
                      : (lang === 'ar' ? 'عميل مسجل (Customer)' : 'Registered Customer')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          {/* Menu Items */}
          <div className="dropdown-items-list">
            {/* 1. Admin Dashboard Option (Only for Admins) */}
            {isAdmin && (
              <button
                className="dropdown-item-btn admin-highlight"
                onClick={() => {
                  setIsOpen(false);
                  onOpenAdmin();
                }}
              >
                <div className="item-icon-box bg-orange-soft">
                  <LayoutDashboard size={17} className="text-orange" />
                </div>
                <div className="item-text-col">
                  <span className="item-main-text font-bold text-orange">
                    {lang === 'ar' ? 'لوحة التحكم (الداشبورد)' : 'Admin Dashboard'}
                  </span>
                  <span className="item-sub-text">
                    {lang === 'ar' ? 'إدارة المنتجات، الطلبات، والعملاء' : 'Manage parts, orders & customers'}
                  </span>
                </div>
              </button>
            )}

            {/* 2. My Account Profile */}
            <button
              className="dropdown-item-btn"
              onClick={() => {
                setIsOpen(false);
                if (onOpenAccount) onOpenAccount();
              }}
            >
              <User size={16} />
              <span>{lang === 'ar' ? 'بيانات الحساب' : 'Account Profile'}</span>
            </button>

            {/* 3. Logout */}
            <div className="dropdown-divider"></div>
            <button
              className="dropdown-item-btn logout-btn"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
            >
              <LogOut size={16} className="text-red" />
              <span className="text-red">{lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
