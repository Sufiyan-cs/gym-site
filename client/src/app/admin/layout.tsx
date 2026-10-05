'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ color: 'var(--accent)', fontFamily: 'Anton, sans-serif', fontSize: '22px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>VERIFYING ADMIN...</div>
      </div>
    );
  }

  const navs = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Members', path: '/admin/members' },
    { name: 'Subscriptions', path: '/admin/subs' },
  ];

  return (
    <>
      <style>{`
        .admin-layout {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 768px) {
          .admin-layout { flex-direction: row; }
        }
        .admin-sidebar {
          width: 100%;
          background: var(--surface);
          border-bottom: 1px solid var(--line);
          padding: 20px;
        }
        @media (min-width: 768px) {
          .admin-sidebar {
            width: 260px;
            border-bottom: none;
            border-right: 1px solid var(--line);
            height: 100vh;
            position: sticky;
            top: 0;
            display: flex;
            flex-direction: column;
          }
        }
        .admin-brand {
          font-family: 'Anton', sans-serif;
          font-size: 20px;
          letter-spacing: 0.1em;
          color: var(--accent);
          margin-bottom: 24px;
        }
        .admin-nav {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        @media (min-width: 768px) {
          .admin-nav {
            flex-direction: column;
            overflow-x: visible;
            flex: 1;
          }
        }
        .admin-nav::-webkit-scrollbar { display: none; }
        
        .admin-nav-item {
          padding: 12px 16px;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          border-radius: 8px;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .admin-nav-item:hover { color: var(--text-primary); }
        .admin-nav-item.active {
          background: rgba(255, 154, 46, 0.1);
          color: var(--accent);
        }
        
        .admin-logout {
          padding: 12px 16px;
          color: var(--error);
          font-size: 14px;
          font-weight: 600;
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          border-radius: 8px;
          margin-top: auto;
        }
        .admin-logout:hover { background: rgba(255, 69, 58, 0.1); }
        
        .admin-main {
          flex: 1;
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
      `}</style>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-brand">ADMIN PANEL</div>
          <nav className="admin-nav">
            {navs.map(n => (
              <Link 
                key={n.path} 
                href={n.path}
                className={`admin-nav-item ${pathname === n.path ? 'active' : ''}`}
              >
                {n.name}
              </Link>
            ))}
            <button onClick={logout} className="admin-logout">
              LOGOUT
            </button>
          </nav>
        </aside>
        <main className="admin-main">
          {children}
        </main>
      </div>
    </>
  );
}
