export default function AdminDashboard() {
  return (
    <>
      <style>{`
        .ad-page {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .ad-title {
          font-family: 'Anton', sans-serif;
          font-size: 36px;
          color: var(--text-primary);
        }
        
        .ad-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (min-width: 768px) {
          .ad-stats { grid-template-columns: repeat(4, 1fr); }
        }
        .ad-stat-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
        }
        .ad-stat-label {
          font-size: 11px;
          color: var(--text-secondary);
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .ad-stat-val {
          font-family: 'Anton', sans-serif;
          font-size: 36px;
          color: var(--text-primary);
          line-height: 1;
        }
        .ad-stat-val.success { color: var(--success); }
        .ad-stat-val.accent { color: var(--accent); }
        
        .ad-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 768px) {
          .ad-grid { grid-template-columns: repeat(2, 1fr); }
        }
        
        .ad-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 20px;
        }
        .ad-card-title {
          font-family: 'Anton', sans-serif;
          font-size: 20px;
          color: var(--text-primary);
          margin-bottom: 16px;
        }
        .ad-card-title.danger { color: var(--error); }
        
        .ad-list {
          display: flex;
          flex-direction: column;
        }
        .ad-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--line);
        }
        .ad-item:last-child { border-bottom: none; padding-bottom: 0; }
        .ad-item-name {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 15px;
        }
        .ad-item-sub {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 2px;
        }
        
        .ad-btn {
          background: transparent;
          border: 1px solid var(--line);
          color: var(--text-primary);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .ad-btn:hover { border-color: var(--text-secondary); }
        
        .ad-actions {
          display: flex;
          gap: 8px;
        }
        .ad-icon-btn {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #160D02;
          font-weight: bold;
          cursor: pointer;
        }
        .ad-icon-btn.ok { background: var(--success); }
        .ad-icon-btn.no { background: var(--error); color: white; }
      `}</style>
      
      <div className="ad-page">
        <h1 className="ad-title">OVERVIEW</h1>
        
        <div className="ad-stats">
          <div className="ad-stat-card">
            <div className="ad-stat-label">TOTAL MEMBERS</div>
            <div className="ad-stat-val">142</div>
          </div>
          <div className="ad-stat-card">
            <div className="ad-stat-label">ACTIVE SUBS</div>
            <div className="ad-stat-val success">118</div>
          </div>
          <div className="ad-stat-card">
            <div className="ad-stat-label">CHECKED IN</div>
            <div className="ad-stat-val accent">24</div>
          </div>
          <div className="ad-stat-card">
            <div className="ad-stat-label">REV THIS MONTH</div>
            <div className="ad-stat-val">₹84k</div>
          </div>
        </div>

        <div className="ad-grid">
          <div className="ad-card">
            <h3 className="ad-card-title danger">EXPIRING SOON (5)</h3>
            <div className="ad-list">
              {[1,2,3].map(i => (
                <div key={i} className="ad-item">
                  <div>
                    <div className="ad-item-name">John Doe {i}</div>
                    <div className="ad-item-sub">Ends in 2 days</div>
                  </div>
                  <button className="ad-btn">NOTIFY</button>
                </div>
              ))}
            </div>
          </div>

          <div className="ad-card">
            <h3 className="ad-card-title">PENDING PAYMENTS (2)</h3>
            <div className="ad-list">
              {[1,2].map(i => (
                <div key={i} className="ad-item">
                  <div>
                    <div className="ad-item-name">Jane Smith {i}</div>
                    <div className="ad-item-sub">₹1500 (Elite)</div>
                  </div>
                  <div className="ad-actions">
                    <button className="ad-icon-btn ok">✓</button>
                    <button className="ad-icon-btn no">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
