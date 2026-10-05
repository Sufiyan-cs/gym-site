'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { 
      name: 'Home', 
      path: '/dashboard', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    },
    { 
      name: 'Workouts', 
      path: '/dashboard/workouts', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.5 6.5h11"></path>
          <path d="M6.5 17.5h11"></path>
          <rect x="4" y="4" width="4" height="16" rx="1"></rect>
          <rect x="16" y="4" width="4" height="16" rx="1"></rect>
        </svg>
      )
    },
    { 
      name: 'Check In', 
      path: '/dashboard/checkin', 
      isCenter: true,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <rect x="7" y="7" width="3" height="3"></rect>
          <rect x="14" y="7" width="3" height="3"></rect>
          <rect x="7" y="14" width="3" height="3"></rect>
          <rect x="14" y="14" width="3" height="3"></rect>
        </svg>
      )
    },
    { 
      name: 'Progress', 
      path: '/dashboard/progress', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      )
    },
    { 
      name: 'Profile', 
      path: '/dashboard/profile', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      )
    },
  ];

  return (
    <>
      <style>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          background: rgba(20, 18, 16, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-top: 1px solid rgba(240, 234, 224, 0.08);
          padding: 8px 12px 24px 12px;
          display: flex;
          justify-content: space-around;
          align-items: center;
          z-index: 50;
        }
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: var(--text-secondary);
          text-decoration: none;
          flex: 1;
        }
        .nav-item.active {
          color: var(--accent);
        }
        .nav-icon {
          transition: transform 0.2s ease;
        }
        .nav-item:active .nav-icon {
          transform: scale(0.9);
        }
        .nav-label {
          font-size: 11px;
          font-weight: 500;
        }
        .nav-center-wrap {
          position: relative;
          top: -24px;
          flex: 1;
          display: flex;
          justify-content: center;
        }
        .nav-center-btn {
          width: 64px;
          height: 64px;
          background: var(--accent);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #160D02;
          box-shadow: 0 8px 24px rgba(255, 154, 46, 0.3);
          border: 4px solid var(--bg);
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .nav-center-btn:active {
          transform: scale(0.95);
          background: var(--accent-dark);
        }
      `}</style>
      <nav className="bottom-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          
          if (item.isCenter) {
            return (
              <div key={item.path} className="nav-center-wrap">
                <Link href={item.path} className="nav-center-btn">
                  {item.icon}
                </Link>
              </div>
            );
          }

          return (
            <Link key={item.path} href={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
              <div className="nav-icon">{item.icon}</div>
              <span className="nav-label">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
