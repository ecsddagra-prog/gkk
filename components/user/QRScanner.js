import { useState } from 'react';
import styles from '../../styles/QRScanner.module.css';

export default function QRScanner({ subscription, broadcast, onSuccess }) {
  const [qrToken, setQrToken] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!qrToken) {
      alert('Please enter QR code');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/subscriptions/delivery-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_token: qrToken,
          subscription_id: subscription.id,
          broadcast_id: broadcast.id,
          quantity,
          amount: calculateAmount(quantity)
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Delivery confirmed successfully!');
        onSuccess();
      } else {
        alert(data.error || 'Failed to confirm delivery');
      }
    } catch (error) {
      alert('Error confirming delivery');
    } finally {
      setLoading(false);
    }
  };

  const calculateAmount = (qty) => {
    return qty * 50; // Example calculation
  };

  return (
    <div className={styles.scanner}>
      <h2>Confirm Delivery</h2>
      
      <div className={styles.form}>
        <div className={styles.field}>
          <label>Scan Provider QR Code</label>
          <input
            type="text"
            placeholder="Enter QR code or scan"
            value={qrToken}
            onChange={(e) => setQrToken(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
          />
        </div>

        <div className={styles.summary}>
          <p>Amount: ₹{calculateAmount(quantity)}</p>
        </div>

        <button 
          className={styles.confirmBtn}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? 'Confirming...' : 'Confirm Delivery'}
        </button>
      </div>
    </div>
  );
}
