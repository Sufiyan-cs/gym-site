'use client';

import { useAuth } from '@/lib/auth-context';

export default function TopBar() {
  const { user } = useAuth();
  
  return (
    <>
      <style>{`
        .topbar {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(20, 18, 16, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(240, 234, 224, 0.08);
          padding: 12px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .topbar-brand {
          font-family: 'Anton', sans-serif;
          font-size: 20px;
          letter-spacing: 0.08em;
          color: var(--text-primary);
        }
        .topbar-brand span {
          color: var(--accent);
        }
        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .topbar-bell {
          position: relative;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
        }
        .topbar-bell:hover {
          color: var(--text-primary);
        }
        .topbar-bell-dot {
          position: absolute;
          top: 2px;
          right: 4px;
          width: 8px;
          height: 8px;
          background: var(--accent);
          border-radius: 50%;
        }
        .topbar-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--surface-2);
          border: 1px solid rgba(240, 234, 224, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Anton', sans-serif;
          font-size: 15px;
          color: var(--text-primary);
        }
      `}</style>
      <header className="topbar">
        <div className="topbar-brand">
          AM-TIPPU <span>FITNESS</span>
        </div>
        <div className="topbar-actions">
          <button className="topbar-bell">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="topbar-bell-dot"></span>
          </button>
          <div className="topbar-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </header>
    </>
  );
}
