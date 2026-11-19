import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="navbar">
      <Link to="/" className="logo">🩸 BloodDonor</Link>
      <div>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/donors">Find Donors</Link>
            <Link to="/request">Emergency Request</Link>
            <span className="badge badge-red" style={{ marginLeft: '0.5rem' }}>{user.bloodGroup}</span>
            <button className="btn btn-sm" onClick={logout} style={{ marginLeft: '1rem', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
