import React from 'react';
import { X, Database, CheckCircle, Server, Terminal, Shield, ArrowRight } from 'lucide-react';
import { API_BASE } from '../api';

export default function SystemStatusModal({
  isOpen,
  onClose,
  systemStatus,
  t,
  lang
}) {
  if (!isOpen) return null;

  const dbEngine = systemStatus?.database?.engine || 'SQLite';
  const isPostgres = dbEngine.toLowerCase().includes('postgres');
  const isOnline = systemStatus?.status === 'online';

  return (
    <div className="modal-backdrop animate-fade" onClick={onClose}>
      <div className="modal-container status-modal glass-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="status-modal-header">
          <div className="modal-icon-badge glow-orange">
            <Database size={24} className="text-orange" />
          </div>
          <div>
            <h3 className="modal-heading">{t.dbStatusModalTitle}</h3>
            <p className="modal-subheading">
              {lang === 'ar'
                ? 'تفاصيل الربط بين الواجهة الأمامية (Node/React) والباك إند (Django) وقواعد البيانات'
                : 'Full architecture status between Node/React Frontend, Django Backend, and Dual DB'}
            </p>
          </div>
        </div>

        {/* Current Live State */}
        <div className="status-cards-grid">
          <div className="status-stat-card glass-panel">
            <div className="stat-label">
              <Server size={15} className="text-orange" />
              <span>Backend API</span>
            </div>
            <div className="stat-value">
              <span className={`pulse-dot ${isOnline ? 'online' : 'checking'}`}></span>
              {isOnline ? 'Django 6.1 (Online)' : 'Connecting...'}
            </div>
            <div className="stat-hint">{API_BASE}</div>
          </div>

          <div className="status-stat-card glass-panel">
            <div className="stat-label">
              <Database size={15} className={isPostgres ? 'text-amber' : 'text-orange'} />
              <span>Active Database</span>
            </div>
            <div className="stat-value text-orange">
              {dbEngine}
            </div>
            <div className="stat-hint">
              {isPostgres ? 'Production Mode' : 'Development Mode (Local SQLite)'}
            </div>
          </div>
        </div>

        {/* Dual Database Explanation Box */}
        <div className="architecture-box">
          <h4 className="arch-title">
            <Shield size={16} className="text-orange" />
            {lang === 'ar' ? 'هيكلية قاعدة البيانات المزدوجة (Dual DB Architecture):' : 'Dual DB Architecture Strategy:'}
          </h4>

          <div className="arch-steps">
            <div className={`arch-step-card ${!isPostgres ? 'active-step' : ''}`}>
              <div className="step-title-row">
                <span className="step-tag">1. Development (وضع التطوير)</span>
                {!isPostgres && <span className="badge badge-orange">النشط حالياً</span>}
              </div>
              <p className="step-desc">
                {lang === 'ar'
                  ? 'يستخدم افتراضياً قاعدة بيانات SQLite محلية (db.sqlite3) بدون الحاجة لأي إعداد خادم إضافي.'
                  : 'Defaults to fast local SQLite (db.sqlite3) with zero configuration required.'}
              </p>
              <code>DATABASES['default'] = sqlite3 (db.sqlite3)</code>
            </div>

            <div className={`arch-step-card ${isPostgres ? 'active-step' : ''}`}>
              <div className="step-title-row">
                <span className="step-tag">2. Production (وضع النشر والإنتاج)</span>
                {isPostgres && <span className="badge badge-amber">النشط حالياً</span>}
              </div>
              <p className="step-desc">
                {lang === 'ar'
                  ? 'بمجرد ضبط متغير البيئة ENVIRONMENT=production أو تزويد DATABASE_URL، يتحول جانكو تلقائياً إلى PostgreSQL (Postgres) مع مشغل psycopg.'
                  : 'Automatically switches to PostgreSQL via psycopg when ENVIRONMENT=production or DATABASE_URL is set.'}
              </p>
              <code>DATABASES['default'] = postgresql (psycopg / dj-database-url)</code>
            </div>
          </div>
        </div>

        {/* How to activate Postgres snippet */}
        <div className="config-code-box">
          <div className="code-header">
            <Terminal size={14} />
            <span>backend/.env</span>
          </div>
          <pre className="code-block">
{`# للتفعيل في السيرفر أو وضع النشر:
ENVIRONMENT=production
USE_POSTGRES=true
DATABASE_URL=postgresql://user:password@localhost:5432/printpart_db`}
          </pre>
        </div>

        <button className="btn btn-secondary modal-done-btn" onClick={onClose}>
          {lang === 'ar' ? 'إغلاق' : 'Close'}
        </button>
      </div>
    </div>
  );
}
