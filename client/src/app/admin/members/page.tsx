'use client';

import { useState } from 'react';

const MOCK_MEMBERS = [
  { id: 1, name: 'John Doe', phone: '9876543210', status: 'active', lastCheckIn: '2 hours ago' },
  { id: 2, name: 'Jane Smith', phone: '9876543211', status: 'expiring', lastCheckIn: '1 day ago' },
  { id: 3, name: 'Bob Johnson', phone: '9876543212', status: 'expired', lastCheckIn: '5 days ago' },
];

export default function AdminMembers() {
  const [search, setSearch] = useState('');

  return (
    <>
      <style>{`
        .mem-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .mem-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .mem-title {
          font-family: 'Anton', sans-serif;
          font-size: 32px;
          color: var(--text-primary);
        }
        .mem-add-btn {
          background: var(--accent);
          color: #160D02;
          border: none;
          padding: 10px 16px;
          border-radius: 12px;
          font-family: 'Anton', sans-serif;
          font-size: 14px;
          cursor: pointer;
        }
        
        .mem-search {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 14px 16px;
          color: var(--text-primary);
          font-size: 15px;
          width: 100%;
          outline: none;
        }
        .mem-search:focus { border-color: var(--accent); }
        
        .mem-table-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 16px;
          overflow: hidden;
        }
        .mem-table-wrap {
          overflow-x: auto;
        }
        .mem-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .mem-table th {
          background: var(--surface-2);
          color: var(--text-secondary);
          font-size: 12px;
          text-transform: uppercase;
          font-weight: 500;
          padding: 16px;
        }
        .mem-table td {
          padding: 16px;
          border-bottom: 1px solid var(--line);
        }
        .mem-table tr:last-child td {
          border-bottom: none;
        }
        .mem-table tr:hover {
          background: rgba(240, 234, 224, 0.02);
        }
        
        .mem-name {
          font-weight: 600;
          color: var(--text-primary);
        }
        .mem-phone {
          color: var(--text-secondary);
          font-size: 14px;
        }
        
        .mem-status {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .mem-status.active { background: rgba(48, 209, 88, 0.15); color: var(--success); }
        .mem-status.expiring { background: rgba(255, 154, 46, 0.15); color: var(--accent); }
        .mem-status.expired { background: rgba(255, 69, 58, 0.15); color: var(--error); }
        
        .mem-date {
          color: var(--text-secondary);
          font-size: 14px;
        }
        .mem-action {
          color: var(--accent);
          background: none;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .mem-action:hover { text-decoration: underline; }
      `}</style>
      
      <div className="mem-page">
        <div className="mem-header">
          <h1 className="mem-title">MEMBERS</h1>
          <button className="mem-add-btn">ADD MEMBER</button>
        </div>

        <div>
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mem-search"
          />
        </div>

        <div className="mem-table-card">
          <div className="mem-table-wrap">
            <table className="mem-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Last Check-in</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_MEMBERS.map(m => (
                  <tr key={m.id}>
                    <td className="mem-name">{m.name}</td>
                    <td className="mem-phone">{m.phone}</td>
                    <td>
                      <span className={`mem-status ${m.status}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="mem-date">{m.lastCheckIn}</td>
                    <td>
                      <button className="mem-action">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
