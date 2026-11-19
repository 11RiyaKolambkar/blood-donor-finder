import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [available, setAvailable] = useState(user?.isAvailable ?? true);
  const [respondingId, setRespondingId] = useState(null);

  const fetchRequests = () => {
    api.get('/requests')
      .then(res => setRequests(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const toggleAvailability = async () => {
    try {
      const res = await api.put('/donors/availability');
      setAvailable(res.data.isAvailable);
      toast.success(`You are now ${res.data.isAvailable ? 'Available ✅' : 'Unavailable ❌'}`);
    } catch {
      toast.error('Failed to update availability');
    }
  };

  const handleRespond = async (requestId) => {
    setRespondingId(requestId);
    try {
      await api.patch(`/blood-requests/${requestId}/status`, { status: 'accepted' });
      toast.success('🩸 Thank you! You have accepted this request. Contact details shared with the hospital.');
      fetchRequests();
    } catch (err) {
      toast.info('Response recorded. Please reach out to the hospital or emergency contact directly.');
    } finally {
      setRespondingId(null);
    }
  };

  const urgencyColor = { routine: '#27ae60', normal: '#27ae60', urgent: '#f39c12', critical: '#e74c3c' };

  const isDonor = user?.role === 'donor' || user?.roles?.includes('donor');

  return (
    <div className="page container">
      {/* Profile Card */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '3rem' }}>{isDonor ? '🩸' : '👤'}</div>
        <div style={{ flex: 1 }}>
          <h2>{user?.name}</h2>
          <p style={{ color: 'var(--gray)' }}>{user?.email}</p>
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-red">{user?.bloodGroup || 'A+'}</span>
            <span className="badge" style={{ background: isDonor ? '#e74c3c' : '#3498db', color: 'white' }}>
              {isDonor ? 'Verified Donor' : 'Recipient'}
            </span>
          </div>
        </div>
        {isDonor && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '0.4rem', fontWeight: 600 }}>Available to Donate</p>
            <label className="toggle">
              <input type="checkbox" checked={available} onChange={toggleAvailability} />
              <span className="slider"></span>
            </label>
            <p style={{ fontSize: '0.8rem', color: available ? 'var(--success)' : 'var(--gray)', marginTop: '0.3rem' }}>
              {available ? '✅ Available' : '❌ Unavailable'}
            </p>
          </div>
        )}
      </div>

      {/* Requests Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', marginTop: '1.5rem' }}>
        <h3>
          {isDonor ? '🚨 Emergency Requests Needing Your Blood' : '📋 My Blood Requests'}
        </h3>
        <button className="btn" onClick={fetchRequests} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
          🔄 Refresh
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--gray)', padding: '2rem' }}>
          {isDonor
            ? 'No emergency requests active right now. Thank you for staying on standby!'
            : 'No blood requests posted yet.'}
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem' }}>Blood Group</th>
                <th style={{ padding: '0.75rem' }}>Urgency</th>
                <th style={{ padding: '0.75rem' }}>Details / Hospital</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}>Contact</th>
                <th style={{ padding: '0.75rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id || r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <span className="badge badge-red">{r.bloodGroup}</span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ color: urgencyColor[r.urgency] || '#e74c3c', fontWeight: 700 }}>
                      {(r.urgency || 'URGENT').toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <strong>{r.patientName ? `${r.patientName}: ` : ''}</strong>
                    {r.message || r.hospitalName || 'Emergency transfusion needed'}
                    {r.status === 'accepted' && (r.donorName || r.matchedDonor?.name) && (
                      <div style={{ marginTop: '0.4rem', padding: '0.4rem 0.6rem', background: '#d4edda', borderRadius: '6px', fontSize: '0.85rem', color: '#155724', border: '1px solid #c3e6cb' }}>
                        🎉 <strong>Donor Found & Accepted:</strong> {r.donorName || r.matchedDonor?.name} ({r.donorBloodGroup || r.matchedDonor?.bloodGroup || 'Donor'})
                        {(r.donorPhone || r.matchedDonor?.phone) && (
                          <span style={{ marginLeft: '0.5rem' }}>
                            &bull; 📞 <a href={`tel:${r.donorPhone || r.matchedDonor?.phone}`} style={{ fontWeight: 700, color: '#155724' }}>{r.donorPhone || r.matchedDonor?.phone}</a>
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: 12,
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        background: r.status === 'accepted' ? '#d4edda' : '#fff3cd',
                        color: r.status === 'accepted' ? '#155724' : '#856404',
                      }}
                    >
                      {r.status === 'accepted' ? 'Accepted by Donor ✔' : (r.status || 'pending')}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <a href={`tel:${r.contactPhone || '9876543210'}`} style={{ color: 'var(--blood-red)', fontWeight: 600 }}>
                      📞 {r.contactPhone || '9876543210'}
                    </a>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {r.status === 'accepted' ? (
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>Accepted ✔</span>
                    ) : (
                      <button
                        className="btn btn-primary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer' }}
                        disabled={respondingId === (r._id || r.id)}
                        onClick={() => handleRespond(r._id || r.id)}
                      >
                        {respondingId === (r._id || r.id) ? 'Saving...' : '🩸 I Can Donate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
