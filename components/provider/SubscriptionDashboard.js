import { useState, useEffect } from 'react';
import styles from '../../styles/SubscriptionDashboard.module.css';

export default function SubscriptionDashboard() {
  const [broadcasts, setBroadcasts] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [responses, setResponses] = useState({});
  const [qrToken, setQrToken] = useState('');
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    fetchDashboardData();
    generateQRToken();
  }, []);

  const fetchDashboardData = async () => {
    const res = await fetch('/api/provider/subscription-dashboard');
    const data = await res.json();
    if (data.success) {
      setBroadcasts(data.broadcasts || []);
      setSubscribers(data.subscribers || []);
      setResponses(data.responses || {});
      setAnalytics(data.analytics || {});
    }
  };

  const generateQRToken = async () => {
    const res = await fetch('/api/subscriptions/qr-generate', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      setQrToken(data.token);
    }
  };

  const createBroadcast = async (broadcastData) => {
    const res = await fetch('/api/subscriptions/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(broadcastData)
    });
    const data = await res.json();
    if (data.success) {
      fetchDashboardData();
    }
  };

  return (
    <div className={styles.dashboard}>
      <h1>Subscription Control Center</h1>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h3>Total Subscribers</h3>
          <p className={styles.statValue}>{subscribers.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Accepted Today</h3>
          <p className={styles.statValue}>{responses.accepted || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Rejected</h3>
          <p className={styles.statValue}>{responses.rejected || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Pending</h3>
          <p className={styles.statValue}>{responses.pending || 0}</p>
        </div>
      </div>

      <div className={styles.qrSection}>
        <h2>Delivery QR Code</h2>
        <div className={styles.qrCode}>
          {qrToken && (
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrToken}`}
              alt="Delivery QR Code"
            />
          )}
          <button onClick={generateQRToken} className={styles.refreshBtn}>
            Refresh QR
          </button>
        </div>
      </div>

      <BroadcastSection onCreate={createBroadcast} />
      <AcceptedUsersList users={subscribers.filter(s => responses[s.id] === 'accepted')} />
      <LedgerSection />
      <AnalyticsSection analytics={analytics} />
    </div>
  );
}

function BroadcastSection({ onCreate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({ title, description });
    setTitle('');
    setDescription('');
  };

  return (
    <div className="broadcast-section">
      <h2>Create Broadcast</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <button type="submit">Send Broadcast</button>
      </form>
    </div>
  );
}

function AcceptedUsersList({ users }) {
  return (
    <div className="accepted-users">
      <h2>Accepted Users Today</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Quantity</th>
            <th>Location</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.quantity}</td>
              <td>{user.location}</td>
              <td><span className="badge-delivered">Accepted</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LedgerSection() {
  return (
    <div className="ledger-section">
      <h2>Ledger Overview</h2>
      <p>Total Outstanding: ₹0</p>
    </div>
  );
}

function AnalyticsSection({ analytics }) {
  return (
    <div className="analytics-section">
      <h2>Analytics</h2>
      <div className="analytics-grid">
        <div>Daily Deliveries: {analytics.daily || 0}</div>
        <div>Monthly Deliveries: {analytics.monthly || 0}</div>
        <div>Revenue: ₹{analytics.revenue || 0}</div>
      </div>
    </div>
  );
}
