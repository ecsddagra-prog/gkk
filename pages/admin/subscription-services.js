import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/AdminSubscription.module.css';

export default function SubscriptionServices() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [subServices, setSubServices] = useState([]);
  const [config, setConfig] = useState({
    is_subscription_enabled: false,
    subscription_config: {
      billing_cycles: ['daily', 'weekly', 'monthly'],
      broadcast_mandatory: true,
      ledger_tracking: true
    }
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const res = await fetch('/api/admin/services');
    const data = await res.json();
    if (data.success) {
      setServices(data.services || []);
    }
  };

  const fetchSubServices = async (serviceId) => {
    const res = await fetch(`/api/admin/subscription-sub-services?service_id=${serviceId}`);
    const data = await res.json();
    if (data.success) {
      setSubServices(data.sub_services || []);
    }
  };

  const updateServiceConfig = async (serviceId) => {
    const res = await fetch('/api/admin/subscription-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: serviceId,
        ...config
      })
    });
    const data = await res.json();
    if (data.success) {
      alert('Configuration updated successfully');
      fetchServices();
    }
  };

  const addSubService = async (serviceId, subServiceData) => {
    const res = await fetch('/api/admin/subscription-sub-services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: serviceId,
        ...subServiceData
      })
    });
    const data = await res.json();
    if (data.success) {
      fetchSubServices(serviceId);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Subscription Services Configuration</h1>

      <div className={styles.grid}>
        <div className={styles.servicesList}>
          <h2>Services</h2>
          {services.map(service => (
            <div 
              key={service.id}
              className={`${styles.serviceCard} ${selectedService?.id === service.id ? styles.active : ''}`}
              onClick={() => {
                setSelectedService(service);
                fetchSubServices(service.id);
                setConfig({
                  is_subscription_enabled: service.is_subscription_enabled || false,
                  subscription_config: service.subscription_config || config.subscription_config
                });
              }}
            >
              <h3>{service.name}</h3>
              {service.is_subscription_enabled && (
                <span className={styles.badge}>Subscription Enabled</span>
              )}
            </div>
          ))}
        </div>

        {selectedService && (
          <div className={styles.configPanel}>
            <h2>Configure: {selectedService.name}</h2>

            <div className={styles.toggle}>
              <label>
                <input
                  type="checkbox"
                  checked={config.is_subscription_enabled}
                  onChange={(e) => setConfig({...config, is_subscription_enabled: e.target.checked})}
                />
                Enable Subscription Model
              </label>
            </div>

            {config.is_subscription_enabled && (
              <>
                <div className={styles.section}>
                  <h3>Billing Cycles</h3>
                  {['daily', 'weekly', 'monthly'].map(cycle => (
                    <label key={cycle}>
                      <input
                        type="checkbox"
                        checked={config.subscription_config.billing_cycles?.includes(cycle)}
                        onChange={(e) => {
                          const cycles = e.target.checked
                            ? [...(config.subscription_config.billing_cycles || []), cycle]
                            : config.subscription_config.billing_cycles.filter(c => c !== cycle);
                          setConfig({
                            ...config,
                            subscription_config: {...config.subscription_config, billing_cycles: cycles}
                          });
                        }}
                      />
                      {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                    </label>
                  ))}
                </div>

                <div className={styles.section}>
                  <h3>Settings</h3>
                  <label>
                    <input
                      type="checkbox"
                      checked={config.subscription_config.broadcast_mandatory}
                      onChange={(e) => setConfig({
                        ...config,
                        subscription_config: {...config.subscription_config, broadcast_mandatory: e.target.checked}
                      })}
                    />
                    Broadcast Mandatory
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={config.subscription_config.ledger_tracking}
                      onChange={(e) => setConfig({
                        ...config,
                        subscription_config: {...config.subscription_config, ledger_tracking: e.target.checked}
                      })}
                    />
                    Ledger Tracking
                  </label>
                </div>

                <SubServiceManager 
                  serviceId={selectedService.id}
                  subServices={subServices}
                  onAdd={addSubService}
                />
              </>
            )}

            <button 
              className={styles.saveBtn}
              onClick={() => updateServiceConfig(selectedService.id)}
            >
              Save Configuration
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SubServiceManager({ serviceId, subServices, onAdd }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: '',
    price: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(serviceId, formData);
    setFormData({ name: '', description: '', unit: '', price: '' });
    setShowForm(false);
  };

  return (
    <div className="sub-service-manager">
      <h3>Sub-Services</h3>
      
      <div className="sub-services-list">
        {subServices.map(sub => (
          <div key={sub.id} className="sub-service-item">
            <strong>{sub.name}</strong>
            {sub.price && <span>₹{sub.price} / {sub.unit}</span>}
          </div>
        ))}
      </div>

      {!showForm ? (
        <button onClick={() => setShowForm(true)}>Add Sub-Service</button>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name (e.g., Breakfast)"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <input
            type="text"
            placeholder="Unit (e.g., plate)"
            value={formData.unit}
            onChange={(e) => setFormData({...formData, unit: e.target.value})}
          />
          <input
            type="number"
            placeholder="Price (optional)"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
          />
          <div>
            <button type="submit">Add</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
