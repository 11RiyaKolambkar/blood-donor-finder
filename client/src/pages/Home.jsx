import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <div className="hero">
        <div style={{ fontSize: '5rem' }}>🩸</div>
        <h1>Save Lives, Donate Blood</h1>
        <p>Connect with nearby blood donors instantly during emergencies.<br />Every second counts — find the right donor in minutes.</p>
        <div className="hero-actions">
          <Link to="/register"><button className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0.8rem 2rem' }}>Register as Donor</button></Link>
          <Link to="/login"><button className="btn btn-outline" style={{ fontSize: '1.1rem', padding: '0.8rem 2rem' }}>Find Blood Now</button></Link>
        </div>
      </div>
      <div className="container" style={{ padding: '3rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: '📍', title: 'Geo-Based Search', desc: 'MongoDB $near query finds donors within kilometers — sorted nearest first.' },
            { icon: '🔔', title: 'Emergency Alerts', desc: 'Firebase Cloud Messaging sends push notifications to matching donors instantly.' },
            { icon: '📱', title: 'Mobile App', desc: 'Flutter app for Android with Google Maps, real-time notifications, and location tracking.' },
            { icon: '🔒', title: 'Secure & Fast', desc: 'JWT authentication, bcrypt passwords, Express.js REST API.' },
          ].map((f) => (
            <div className="card" key={f.title} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{f.icon}</div>
              <h3 style={{ color: 'var(--blood-red)', marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
