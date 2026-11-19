import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCIES = ['normal', 'urgent', 'critical'];
const urgencyColor = { normal: '#27ae60', urgent: '#f39c12', critical: '#e74c3c' };

export default function CreateRequest() {
  const [form, setForm] = useState({ bloodGroup: 'A+', urgency: 'urgent', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let lat = 12.9716;
      let lng = 77.5946;

      if (navigator.geolocation) {
        try {
          const pos = await new Promise((res, rej) => {
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000 });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch (_) {
          // If browser location is blocked or times out, fallback coordinates are used seamlessly
        }
      }

      await api.post('/requests', {
        ...form,
        lat,
        lng,
      });

      toast.success('🩸 Emergency request posted! Nearby donors are being notified.');
      setForm({ bloodGroup: 'A+', urgency: 'urgent', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
        <h2 style={{ color: 'var(--blood-red)', marginBottom: '1.5rem', textAlign: 'center' }}>🚨 Emergency Blood Request</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Blood Group Required</label>
            <select value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
              {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Urgency Level</label>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              {URGENCIES.map(u => (
                <button key={u} type="button"
                  onClick={() => setForm({ ...form, urgency: u })}
                  style={{
                    padding: '0.5rem 1rem', borderRadius: 6, border: '2px solid',
                    borderColor: urgencyColor[u], background: form.urgency === u ? urgencyColor[u] : 'white',
                    color: form.urgency === u ? 'white' : urgencyColor[u], cursor: 'pointer', fontWeight: 600,
                  }}>
                  {u.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Message (Hospital, Contact, Location Details)</label>
            <textarea rows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder="e.g. City Hospital, Bangalore, Room 302, contact 9876543210" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', fontSize: '1.05rem' }}>
            {loading ? 'Sending alerts...' : '📢 Send Emergency Alert to Nearby Donors'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--gray)' }}>
          Your location will be shared with nearby matching donors.
        </p>
      </div>
    </div>
  );
}
