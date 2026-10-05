'use client';

interface SubscriptionProps {
  planName: string;
  daysRemaining: number;
  status: 'active' | 'expiring' | 'expired';
}

export default function SubscriptionCard({ planName, daysRemaining, status }: SubscriptionProps) {
  const isExpiring = status === 'expiring';
  const isExpired = status === 'expired';
  
  return (
    <>
      <style>{`
        .sub-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        .sub-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        .sub-label {
          font-size: 13px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
          font-weight: 500;
        }
        .sub-title {
          font-family: 'Anton', sans-serif;
          font-size: 28px;
          color: var(--text-primary);
          line-height: 1;
          letter-spacing: 0.02em;
        }
        .sub-badge {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .sub-badge.active {
          background: rgba(48, 209, 88, 0.15);
          color: var(--success);
        }
        .sub-badge.expiring {
          background: rgba(255, 154, 46, 0.15);
          color: var(--accent);
        }
        .sub-badge.expired {
          background: rgba(255, 69, 58, 0.15);
          color: var(--error);
        }
        .sub-progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 8px;
        }
        .sub-progress-label {
          color: var(--text-secondary);
        }
        .sub-progress-value {
          font-weight: 600;
          color: var(--text-primary);
        }
        .sub-progress-track {
          width: 100%;
          height: 6px;
          background: var(--surface-2);
          border-radius: 4px;
          overflow: hidden;
        }
        .sub-progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.4s ease;
        }
        .sub-progress-fill.active { background: var(--success); }
        .sub-progress-fill.expiring { background: var(--accent); }
        .sub-progress-fill.expired { background: var(--error); }
        
        .sub-btn {
          width: 100%;
          background: var(--accent);
          color: #160D02;
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-family: 'Anton', sans-serif;
          font-size: 15px;
          letter-spacing: 0.05em;
          margin-top: 20px;
          cursor: pointer;
          transition: transform 0.1s, opacity 0.2s;
        }
        .sub-btn:active {
          transform: scale(0.98);
        }
      `}</style>
      <div className="sub-card">
        <div className="sub-header">
          <div>
            <div className="sub-label">Current Plan</div>
            <div className="sub-title">{planName}</div>
          </div>
          <div className={`sub-badge ${status}`}>
            {status}
          </div>
        </div>
        
        <div>
          <div className="sub-progress-header">
            <span className="sub-progress-label">Time Remaining</span>
            <span className="sub-progress-value">{Math.max(0, daysRemaining)} Days</span>
          </div>
          <div className="sub-progress-track">
            <div 
              className={`sub-progress-fill ${status}`} 
              style={{ width: `${Math.min(100, Math.max(0, (daysRemaining / 30) * 100))}%` }}
            ></div>
          </div>
        </div>
        
        {(isExpiring || isExpired) && (
          <button className="sub-btn">
            RENEW SUBSCRIPTION
          </button>
        )}
      </div>
    </>
  );
}
