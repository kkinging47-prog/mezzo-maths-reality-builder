import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import WorldsPage from './pages/WorldsPage';
import ProjectPage from './pages/ProjectPage';
import TeacherDashboard from './pages/TeacherDashboard';
import SchoolAdminDashboard from './pages/SchoolAdminDashboard';
import SponsorDashboard from './pages/SponsorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/student/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/worlds" element={<ProtectedRoute roles={['student']}><WorldsPage /></ProtectedRoute>} />
      <Route path="/student/project/:projectId" element={<ProtectedRoute roles={['student']}><ProjectPage /></ProtectedRoute>} />
      <Route path="/teacher/dashboard" element={<ProtectedRoute roles={['teacher','mezzo_staff']}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/school-admin/dashboard" element={<ProtectedRoute roles={['school_admin']}><SchoolAdminDashboard /></ProtectedRoute>} />
      <Route path="/sponsor/dashboard" element={<ProtectedRoute roles={['sponsor']}><SponsorDashboard /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
