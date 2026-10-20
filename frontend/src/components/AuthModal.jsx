import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  ChevronLeft
} from 'lucide-react';
import { loginUser, registerUser, googleAuth } from '../api';
import './NeoAuth.css';

/**
 * Neo-Brutalist 3D Flip Card Auth Modal
 * Enhanced with interactive Google Account Chooser & "Remember Me" option
 */
export default function AuthModal({ isOpen, onClose, onLoginSuccess, lang }) {
  const isAr = lang === 'ar';
  const [isSignUp, setIsSignUp] = useState(false);
  const [mode, setMode] = useState('auth'); // 'auth' or 'google_chooser'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password visibility
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Remember Me state (persisted)
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      const saved = localStorage.getItem('printforge_remember_me');
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  // Form states with pre-filled remembered identifier
  const [loginIdentifier, setLoginIdentifier] = useState(() => {
    try {
      return localStorage.getItem('printforge_remember_identifier') || '';
    } catch {
      return '';
    }
  });
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Google Accounts state & "Add Another Account" mode
  const [googleAccounts, setGoogleAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem('printforge_google_accounts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'goog_1',
        name: 'Ahmed 3D Maker',
        email: 'ahmed.maker3d@gmail.com',
        phone: '+964 770 123 4567',
        avatarColor: '#EA4335'
      },
      {
        id: 'goog_2',
        name: 'أحمد العراقي',
        email: 'ahmed.iraqi.tech@gmail.com',
        phone: '+964 780 987 6543',
        avatarColor: '#4285F4'
      }
    ];
  });

  const [isAddingGoogleAccount, setIsAddingGoogleAccount] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [activeGoogleLoggingIn, setActiveGoogleLoggingIn] = useState(null);

  // Sync googleAccounts changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('printforge_google_accounts', JSON.stringify(googleAccounts));
    } catch {}
  }, [googleAccounts]);

  if (!isOpen) return null;

  // Handle Standard Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const user = await loginUser(loginIdentifier.trim(), loginPassword, rememberMe);
      
      // Handle Remember Me persistence
      if (rememberMe) {
        localStorage.setItem('printforge_remember_identifier', loginIdentifier.trim());
        localStorage.setItem('printforge_remember_me', 'true');
      } else {
        localStorage.removeItem('printforge_remember_identifier');
        localStorage.setItem('printforge_remember_me', 'false');
      }

      setSuccessMsg(isAr ? 'تم تسجيل الدخول بنجاح!' : 'Logged in successfully!');
      setTimeout(() => {
        onLoginSuccess(user);
        onClose();
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || (isAr ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  // Handle User Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (regPassword.length < 6) {
      setErrorMsg(isAr ? 'كلمة المرور يجب أن لا تقل عن 6 خانات' : 'Password must be >= 6 chars');
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = regEmail.trim().toLowerCase();
      const generatedUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || `user_${Date.now()}`;
      
      const user = await registerUser({
        name: regName.trim(),
        username: generatedUsername,
        email: cleanEmail,
        phone: '-',
        password: regPassword
      }, rememberMe);

      if (rememberMe) {
        localStorage.setItem('printforge_remember_identifier', cleanEmail);
        localStorage.setItem('printforge_remember_me', 'true');
      }

      setSuccessMsg(isAr ? 'تم إنشاء الحساب بنجاح، جاري نقلك...' : 'Account created successfully!');
      setTimeout(() => {
        onLoginSuccess(user);
        onClose();
      }, 600);
    } catch (err) {
      setErrorMsg(err.message || (isAr ? 'فشل إنشاء الحساب' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  // Google Login execution
  const handleExecuteGoogleAuth = async (email, name, phone = '-', customAvatar = null) => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    setActiveGoogleLoggingIn(email);
    try {
      const googleUser = await googleAuth({
        email: email.trim().toLowerCase(),
        name: name.trim() || email.split('@')[0],
        phone: phone ? phone.trim() : '-',
        google_id: 'goog_' + Date.now(),
        avatar_url: customAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=4285f4`
      }, rememberMe);

      if (rememberMe) {
        localStorage.setItem('printforge_remember_identifier', email.trim().toLowerCase());
        localStorage.setItem('printforge_remember_me', 'true');
      }

      setSuccessMsg(isAr ? `مرحباً بك ${googleUser.name}!` : `Welcome ${googleUser.name}!`);
      setTimeout(() => {
        onLoginSuccess(googleUser);
        onClose();
      }, 600);
    } catch (err) {
      setErrorMsg(err.message || (isAr ? 'فشل تسجيل الدخول عبر Google' : 'Google Auth failed'));
    } finally {
      setLoading(false);
      setActiveGoogleLoggingIn(null);
    }
  };

  // Click on Google button: checks for native GIS or displays Account Chooser
  const handleGoogleBtnClick = () => {
    setErrorMsg('');
    const clientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID;
    
    // If native Google OAuth is configured, trigger Google account prompt
    if (window.google?.accounts?.oauth2 && clientId) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              setLoading(true);
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const gData = await res.json();
                if (gData.email) {
                  handleExecuteGoogleAuth(gData.email, gData.name || gData.email.split('@')[0], '-', gData.picture);
                  return;
                }
              } catch (e) {
                console.warn('Failed to fetch Google profile:', e);
              } finally {
                setLoading(false);
              }
            }
          }
        });
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (e) {
        console.warn('Google GIS initTokenClient error:', e);
      }
    }

    // Default to the in-app Google Accounts Chooser
    setMode('google_chooser');
    setIsAddingGoogleAccount(false);
  };

  // Add a new custom Google account to the device list
  const handleAddCustomGoogleAccount = (e) => {
    e.preventDefault();
    const email = customGoogleEmail.trim().toLowerCase();
    const name = customGoogleName.trim() || email.split('@')[0];

    if (!email || !email.includes('@')) {
      setErrorMsg(isAr ? 'يرجى إدخال بريد إلكتروني صالح' : 'Please enter a valid email');
      return;
    }

    // Add to list if not already present
    const existing = googleAccounts.find(acc => acc.email.toLowerCase() === email);
    if (!existing) {
      const colors = ['#EA4335', '#4285F4', '#34A853', '#FBBC05', '#8E24AA'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const newAcc = {
        id: 'goog_' + Date.now(),
        name,
        email,
        phone: '-',
        avatarColor: randomColor
      };
      setGoogleAccounts(prev => [newAcc, ...prev]);
    }

    // Proceed with authentication
    handleExecuteGoogleAuth(email, name);
  };

  // Delete an account from the local list
  const handleDeleteGoogleAccount = (e, accId) => {
    e.stopPropagation();
    setGoogleAccounts(prev => prev.filter(acc => acc.id !== accId));
  };

  // Quick Preset demo credentials
  const fillCredential = (username, password) => {
    setLoginIdentifier(username);
    setLoginPassword(password);
    setErrorMsg('');
  };

  return (
    <div className="neo-auth-backdrop animate-fade" onClick={onClose}>
      <div className="neo-auth-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          className="neo-close-btn"
          onClick={onClose}
          title={isAr ? 'إغلاق' : 'Close'}
        >
          ✕
        </button>

        {mode === 'google_chooser' ? (
          /* ========================================================
              GOOGLE ACCOUNTS CHOOSER MODAL
             ======================================================== */
          <div className="neo-card-scene" style={{ height: 'auto', width: '350px' }}>
            <div
              className="neo-card-front"
              style={{
                position: 'relative',
                transform: 'none',
                height: 'auto',
                minHeight: '440px',
                padding: '24px 20px',
                gap: '12px'
              }}
            >
              {/* Google Brand Header */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" className="neo-google-svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <h3 className="neo-title" style={{ fontSize: '20px' }}>
                  {isAr ? 'اختيار حساب Google' : 'Choose an account'}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  {isAr ? 'للمتابعة وتسجيل الدخول إلى 3D PARTS' : 'to continue to 3D PARTS'}
                </span>
              </div>

              {errorMsg && <div className="neo-alert neo-alert-error">{errorMsg}</div>}
              {successMsg && <div className="neo-alert neo-alert-success">{successMsg}</div>}

              {/* Accounts List */}
              {!isAddingGoogleAccount ? (
                <>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                    {googleAccounts.map((acc) => (
                      <div
                        key={acc.id}
                        className="neo-google-account-card"
                        onClick={() => !loading && handleExecuteGoogleAuth(acc.email, acc.name, acc.phone)}
                      >
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: acc.avatarColor || '#4285F4',
                            color: '#fff',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '15px',
                            flexShrink: 0
                          }}
                        >
                          {acc.name ? acc.name[0].toUpperCase() : 'G'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, textAlign: isAr ? 'right' : 'left' }}>
                          <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--font-color)' }}>
                            {acc.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {acc.email}
                          </div>
                        </div>

                        {activeGoogleLoggingIn === acc.email ? (
                          <Loader2 size={18} className="spinner-rotate" style={{ color: '#2563eb' }} />
                        ) : (
                          <button
                            type="button"
                            className="neo-acc-delete-btn"
                            onClick={(e) => handleDeleteGoogleAccount(e, acc.id)}
                            title={isAr ? 'حذف من القائمة' : 'Remove account'}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Button to add another Google Account */}
                  <button
                    type="button"
                    className="neo-add-google-btn"
                    onClick={() => {
                      setIsAddingGoogleAccount(true);
                      setErrorMsg('');
                    }}
                  >
                    <Plus size={16} />
                    <span>{isAr ? 'استخدام حساب Google آخر...' : 'Use another account...'}</span>
                  </button>
                </>
              ) : (
                /* Form to Enter Custom Google Account */
                <form onSubmit={handleAddCustomGoogleAccount} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="neo-input-wrapper" style={{ width: '100%' }}>
                    <input
                      className="neo-input"
                      type="email"
                      placeholder={isAr ? 'البريد الإلكتروني (@gmail.com)' : 'Email (@gmail.com)'}
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      required
                      autoFocus
                    />
                    <span className="neo-input-icon">
                      <Mail size={16} />
                    </span>
                  </div>

                  <div className="neo-input-wrapper" style={{ width: '100%' }}>
                    <input
                      className="neo-input"
                      type="text"
                      placeholder={isAr ? 'الاسم الكامل (اختياري)' : 'Full Name (optional)'}
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                    />
                    <span className="neo-input-icon">
                      <User size={16} />
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="neo-submit-btn"
                    style={{ width: '100%', background: '#2563eb' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 size={18} className="spinner-rotate" />
                    ) : (
                      <span>{isAr ? 'متابعة وتسجيل الدخول' : 'Continue & Sign In'}</span>
                    )}
                  </button>

                  <button
                    type="button"
                    className="neo-submit-btn"
                    style={{ width: '100%', background: '#f1f5f9', color: '#1e293b' }}
                    onClick={() => setIsAddingGoogleAccount(false)}
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                </form>
              )}

              {/* Remember Me Option inside Google Chooser */}
              <div className="neo-remember-row" style={{ width: '100%', justifyContent: 'center', marginTop: '2px' }}>
                <label className="neo-remember-label">
                  <input
                    type="checkbox"
                    className="neo-remember-input"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="neo-remember-box">
                    {rememberMe && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span>{isAr ? 'تذكرني على هذا الجهاز' : 'Remember me on this device'}</span>
                </label>
              </div>

              {/* Back to standard login */}
              <button
                type="button"
                className="neo-submit-btn"
                style={{ width: '100%', marginTop: '4px', background: '#f1f5f9', color: '#1e293b', height: '38px', fontSize: '13px' }}
                onClick={() => {
                  setMode('auth');
                  setIsAddingGoogleAccount(false);
                  setErrorMsg('');
                }}
              >
                {isAr ? '← العودة لتسجيل الدخول العادي' : '← Back to standard login'}
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================
              NEO-BRUTALIST 3D FLIP CARD
             ======================================================== */
          <>
            {/* Top Switch Bar */}
            <div className="neo-switch-bar">
              <span
                className={`neo-switch-text login-text ${!isSignUp ? 'active' : 'inactive'}`}
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg('');
                }}
              >
                {isAr ? 'تسجيل الدخول' : 'Log in'}
              </span>

              <label className="neo-switch-label">
                <input
                  type="checkbox"
                  className="neo-toggle"
                  checked={isSignUp}
                  onChange={(e) => {
                    setIsSignUp(e.target.checked);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  aria-label="Toggle login and sign up"
                />
                <span className="neo-slider" />
              </label>

              <span
                className={`neo-switch-text signup-text ${isSignUp ? 'active' : 'inactive'}`}
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg('');
                }}
              >
                {isAr ? 'حساب جديد' : 'Sign up'}
              </span>
            </div>

            {/* 3D Flip Card Scene */}
            <div className="neo-card-scene">
              <div className={`neo-card-inner ${isSignUp ? 'is-flipped' : ''}`}>
                {/* ========================================================
                    FRONT FACE: LOG IN
                   ======================================================== */}
                <div className="neo-card-front" dir={isAr ? 'rtl' : 'ltr'}>
                  <h2 className="neo-title">{isAr ? 'تسجيل الدخول' : 'Log in'}</h2>

                  {/* Google Login Button */}
                  <button
                    type="button"
                    className="neo-google-btn"
                    dir={isAr ? 'rtl' : 'ltr'}
                    onClick={handleGoogleBtnClick}
                    title={isAr ? 'تسجيل الدخول باستخدام Google' : 'Sign in with Google'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" className="neo-google-svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <span>
                      {isAr ? (
                        <>
                          تسجيل الدخول باستخدام <bdi>Google</bdi>
                        </>
                      ) : (
                        'Sign in with Google'
                      )}
                    </span>
                  </button>

                  <div className="neo-divider">
                    <span>{isAr ? 'أو' : 'or'}</span>
                  </div>

                  {errorMsg && !isSignUp && (
                    <div className="neo-alert neo-alert-error">
                      <AlertCircle size={14} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && !isSignUp && (
                    <div className="neo-alert neo-alert-success">
                      <CheckCircle2 size={14} />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <form className="neo-form" onSubmit={handleLoginSubmit}>
                    <div className="neo-input-wrapper">
                      <input
                        className="neo-input"
                        name="email"
                        placeholder={isAr ? 'اسم المستخدم أو البريد الإلكتروني' : 'Email or Username'}
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                      />
                      <span className="neo-input-icon">
                        <User size={16} />
                      </span>
                    </div>

                    <div className="neo-input-wrapper">
                      <input
                        className="neo-input"
                        name="password"
                        placeholder={isAr ? 'كلمة المرور' : 'Password'}
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                      <span className="neo-input-icon">
                        <Lock size={16} />
                      </span>
                      <button
                        type="button"
                        className="neo-eye-toggle"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        tabIndex={-1}
                        title={showLoginPassword ? 'إخفاء' : 'إظهار'}
                      >
                        {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Remember Me Option */}
                    <div className="neo-remember-row">
                      <label className="neo-remember-label">
                        <input
                          type="checkbox"
                          className="neo-remember-input"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <span className="neo-remember-box">
                          {rememberMe && <Check size={12} strokeWidth={3} />}
                        </span>
                        <span>{isAr ? 'تذكرني على هذا الجهاز' : 'Remember me on this device'}</span>
                      </label>
                    </div>

                    {/* Quick Demo Credentials (Development Only) */}
                    {import.meta.env.DEV && (
                      <div className="neo-demo-bar">
                        <button
                          type="button"
                          className="neo-demo-chip"
                          onClick={() => fillCredential('admin', 'admin123')}
                          title={isAr ? 'دخول تجريبي بضغطة زر (وضع التطوير)' : 'Quick Demo Admin (Dev Mode)'}
                        >
                          <span>🔑</span>
                          <span>admin (المدير العام)</span>
                        </button>
                      </div>
                    )}

                    <button className="neo-submit-btn" type="submit" disabled={loading}>
                      {loading ? (
                        <Loader2 size={18} className="spinner-rotate" />
                      ) : (
                        <>
                          <span>{isAr ? 'دخول الحساب' : "Let`s go!"}</span>
                          {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* ========================================================
                    BACK FACE: SIGN UP
                   ======================================================== */}
                <div className="neo-card-back" dir={isAr ? 'rtl' : 'ltr'}>
                  <h2 className="neo-title">{isAr ? 'حساب جديد' : 'Sign up'}</h2>

                  {/* Google Login Button also on Sign up */}
                  <button
                    type="button"
                    className="neo-google-btn"
                    dir={isAr ? 'rtl' : 'ltr'}
                    onClick={handleGoogleBtnClick}
                    title={isAr ? 'التسجيل باستخدام Google' : 'Sign up with Google'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" className="neo-google-svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <span>
                      {isAr ? (
                        <>
                          إنشاء حساب باستخدام <bdi>Google</bdi>
                        </>
                      ) : (
                        'Sign up with Google'
                      )}
                    </span>
                  </button>

                  <div className="neo-divider">
                    <span>{isAr ? 'أو' : 'or'}</span>
                  </div>

                  {errorMsg && isSignUp && (
                    <div className="neo-alert neo-alert-error">
                      <AlertCircle size={14} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && isSignUp && (
                    <div className="neo-alert neo-alert-success">
                      <CheckCircle2 size={14} />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <form className="neo-form" onSubmit={handleRegisterSubmit}>
                    <div className="neo-input-wrapper">
                      <input
                        className="neo-input"
                        name="username"
                        placeholder={isAr ? 'الاسم الكامل' : 'Name'}
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                      />
                      <span className="neo-input-icon">
                        <User size={16} />
                      </span>
                    </div>

                    <div className="neo-input-wrapper">
                      <input
                        className="neo-input"
                        name="email"
                        placeholder={isAr ? 'البريد الإلكتروني' : 'Email'}
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                      />
                      <span className="neo-input-icon">
                        <Mail size={16} />
                      </span>
                    </div>

                    <div className="neo-input-wrapper">
                      <input
                        className="neo-input"
                        name="password"
                        placeholder={isAr ? 'كلمة المرور (6 خانات أو أكثر)' : 'Password'}
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                      />
                      <span className="neo-input-icon">
                        <Lock size={16} />
                      </span>
                      <button
                        type="button"
                        className="neo-eye-toggle"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        tabIndex={-1}
                        title={showRegPassword ? 'إخفاء' : 'إظهار'}
                      >
                        {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Remember Me Option on Signup */}
                    <div className="neo-remember-row">
                      <label className="neo-remember-label">
                        <input
                          type="checkbox"
                          className="neo-remember-input"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <span className="neo-remember-box">
                          {rememberMe && <Check size={12} strokeWidth={3} />}
                        </span>
                        <span>{isAr ? 'تذكرني على هذا الجهاز' : 'Remember me on this device'}</span>
                      </label>
                    </div>

                    <button className="neo-submit-btn alt" type="submit" disabled={loading}>
                      {loading ? (
                        <Loader2 size={18} className="spinner-rotate" />
                      ) : (
                        <>
                          <span>{isAr ? 'تأكيد الحساب' : 'Confirm!'}</span>
                          {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
