import { useState, useEffect } from 'react';
import styles from '../../styles/SubscriptionPanel.module.css';

export default function SubscriptionPanel() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    fetchSubscriptions();
    fetchBroadcasts();
  }, []);

  const fetchSubscriptions = async () => {
    const res = await fetch('/api/user/subscriptions');
    const data = await res.json();
    if (data.success) {
      setSubscriptions(data.subscriptions || []);
    }
  };

  const fetchBroadcasts = async () => {
    const res = await fetch('/api/user/subscription-broadcasts');
    const data = await res.json();
    if (data.success) {
      setBroadcasts(data.broadcasts || []);
    }
  };

  const respondToBroadcast = async (broadcastId, subscriptionId, response, quantity = 1) => {
    const res = await fetch('/api/subscriptions/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ broadcast_id: broadcastId, subscription_id: subscriptionId, response, quantity })
    });
    const data = await res.json();
    if (data.success) {
      fetchBroadcasts();
    }
  };

  const viewLedger = async (subscriptionId) => {
    const res = await fetch(`/api/subscriptions/ledger?subscription_id=${subscriptionId}`);
    const data = await res.json();
    if (data.success) {
      setLedger(data.ledger || []);
    }
  };

  return (
    <div className={styles.panel}>
      <h1>My Subscriptions</h1>

      <div className={styles.subscriptionsList}>
        {subscriptions.map(sub => (
          <div key={sub.id} className={styles.subscriptionCard}>
            <h3>{sub.service_name}</h3>
            <p>Provider: {sub.provider_name}</p>
            <p>Status: <span className={`badge-${sub.status}`}>{sub.status}</span></p>
            <button onClick={() => viewLedger(sub.id)}>View Ledger</button>
          </div>
        ))}
      </div>

      <div className={styles.broadcastsSection}>
        <h2>Latest Updates</h2>
        {broadcasts.map(broadcast => (
          <BroadcastCard 
            key={broadcast.id} 
            broadcast={broadcast}
            onRespond={respondToBroadcast}
          />
        ))}
      </div>

      {ledger.length > 0 && (
        <div className={styles.ledgerSection}>
          <h2>Ledger</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map(entry => (
                <tr key={entry.id}>
                  <td>{new Date(entry.created_at).toLocaleDateString()}</td>
                  <td>{entry.transaction_type}</td>
                  <td>₹{entry.amount}</td>
                  <td>₹{entry.balance_after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BroadcastCard({ broadcast, onRespond }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="broadcast-card">
      <h3>{broadcast.title}</h3>
      <p>{broadcast.description}</p>
      <div className="broadcast-actions">
        <input 
          type="number" 
          min="1" 
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
        />
        <button 
          className="btn-accept"
          onClick={() => onRespond(broadcast.id, broadcast.subscription_id, 'accepted', quantity)}
        >
          Accept
        </button>
        <button 
          className="btn-reject"
          onClick={() => onRespond(broadcast.id, broadcast.subscription_id, 'rejected')}
        >
          Reject
        </button>
        <button 
          className="btn-not-today"
          onClick={() => onRespond(broadcast.id, broadcast.subscription_id, 'not_today')}
        >
          Not Today
        </button>
      </div>
    </div>
  );
}
