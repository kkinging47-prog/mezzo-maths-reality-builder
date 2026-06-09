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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/worlds" element={<WorldsPage />} />
      <Route path="/student/project/:projectId" element={<ProjectPage />} />
      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
      <Route path="/school-admin/dashboard" element={<SchoolAdminDashboard />} />
      <Route path="/sponsor/dashboard" element={<SponsorDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
