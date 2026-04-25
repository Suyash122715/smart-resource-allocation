import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Public
import Landing from './pages/public/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import PostNeed from './pages/admin/PostNeed';
import TaskDetail from './pages/admin/TaskDetail';

// Volunteer
import VolunteerLayout from './components/volunteer/VolunteerLayout';
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import VolunteerProfile from './pages/volunteer/VolunteerProfile';
import VolunteerTask from './pages/volunteer/VolunteerTask';

const PrivateRoute = ({ children, role }: { children: React.ReactNode; role?: 'admin' | 'volunteer' }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) return <Navigate to={user?.role === 'admin' ? '/admin' : '/volunteer'} replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<PrivateRoute role="admin"><AdminLayout /></PrivateRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="post-need" element={<PostNeed />} />
        <Route path="task/:id" element={<TaskDetail />} />
      </Route>

      {/* Volunteer */}
      <Route path="/volunteer" element={<PrivateRoute role="volunteer"><VolunteerLayout /></PrivateRoute>}>
        <Route index element={<VolunteerDashboard />} />
        <Route path="profile" element={<VolunteerProfile />} />
        <Route path="task/:id" element={<VolunteerTask />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
