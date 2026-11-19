import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NearbyDonors from './pages/NearbyDonors';
import CreateRequest from './pages/CreateRequest';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/donors" element={<ProtectedRoute><NearbyDonors /></ProtectedRoute>} />
        <Route path="/request" element={<ProtectedRoute><CreateRequest /></ProtectedRoute>} />
      </Routes>
    </>
  );
}
