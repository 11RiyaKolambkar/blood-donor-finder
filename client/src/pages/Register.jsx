import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import { requestFCMToken } from '../services/firebase';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', bloodGroup: 'A+', role: 'recipient' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Registered successfully!');
      // Get location + FCM token after registration
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const fcmToken = await requestFCMToken();
          await api.put('/auth/location', {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            fcmToken: fcmToken || '',
          });
        });
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
        <h2 style={{ color: 'var(--blood-red)', marginBottom: '1.5rem', textAlign: 'center' }}>🩸 Create Account</h2>
        <form onSubmit={handleSubmit}>
          {['name', 'email', 'phone'].map((field) => (
            <div className="form-group" key={field}>
              <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input type={field === 'email' ? 'email' : 'text'} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} required />
            </div>
          ))}
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Blood Group</label>
            <select value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
              {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="recipient">Recipient (need blood)</option>
              <option value="donor">Donor (can donate)</option>
            </select>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--gray)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--blood-red)' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
