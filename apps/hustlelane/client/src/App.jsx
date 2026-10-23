import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import FeedPage from './pages/FeedPage';
import OpportunityPage from './pages/OpportunityPage';
import PostPage from './pages/PostPage';
import ApplicationsPage from './pages/ApplicationsPage';
import LanesPage from './pages/LanesPage';
import LaneDetailPage from './pages/LaneDetailPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="boot">Loading HustleLane…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><FeedPage /></PrivateRoute>} />
      <Route path="/lanes" element={<PrivateRoute><LanesPage /></PrivateRoute>} />
      <Route path="/lanes/:source/:externalId" element={<PrivateRoute><LaneDetailPage /></PrivateRoute>} />
      <Route path="/opportunities/:id" element={<PrivateRoute><OpportunityPage /></PrivateRoute>} />
      <Route path="/post" element={<PrivateRoute><PostPage /></PrivateRoute>} />
      <Route path="/applications" element={<PrivateRoute><ApplicationsPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
