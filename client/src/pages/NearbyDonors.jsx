import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { toast } from 'react-toastify';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
});

const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function NearbyDonors() {
  const [donors, setDonors] = useState([]);
  const [userPos, setUserPos] = useState(null);
  const [bloodGroup, setBloodGroup] = useState('');
  const [radius, setRadius] = useState(10000);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => toast.error('Location access denied')
    );
  }, []);

  const search = async () => {
    if (!userPos) return toast.error('Location not available');
    setLoading(true);
    try {
      const res = await api.get('/donors/nearby', {
        params: { lat: userPos[0], lng: userPos[1], radius, bloodGroup: bloodGroup || undefined },
      });
      setDonors(res.data.donors);
      toast.success(`Found ${res.data.count} donors nearby`);
    } catch { toast.error('Search failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page container">
      <h2 style={{ color: 'var(--blood-red)', marginBottom: '1rem' }}>📍 Find Nearby Donors</h2>
      <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: 1, minWidth: 150, marginBottom: 0 }}>
          <label>Blood Group</label>
          <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
            {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g || 'Any'}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: 150, marginBottom: 0 }}>
          <label>Radius: {radius / 1000} km</label>
          <input type="range" min="1000" max="50000" step="1000" value={radius} onChange={e => setRadius(+e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={search} disabled={loading}>
          {loading ? 'Searching...' : '🔍 Search'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1rem', marginTop: '1rem' }}>
        <div className="map-container">
          {userPos && (
            <MapContainer center={userPos} zoom={13} style={{ height: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={userPos}><Popup>📍 You are here</Popup></Marker>
              <Circle center={userPos} radius={radius} color="red" fillOpacity={0.05} />
              {donors.map(d => (
                <Marker key={d._id} position={[d.location.coordinates[1], d.location.coordinates[0]]} icon={redIcon}>
                  <Popup>
                    <strong>{d.name}</strong><br />
                    🩸 {d.bloodGroup} | 📞 {d.phone}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
        <div style={{ overflowY: 'auto', maxHeight: 400 }}>
          {donors.length === 0
            ? <div className="card" style={{ textAlign: 'center', color: 'var(--gray)' }}>Search to find donors</div>
            : donors.map(d => (
              <div className="card" key={d._id} style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{d.name}</strong>
                  <span className="badge badge-red">{d.bloodGroup}</span>
                </div>
                <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginTop: '0.3rem' }}>📞 {d.phone}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
