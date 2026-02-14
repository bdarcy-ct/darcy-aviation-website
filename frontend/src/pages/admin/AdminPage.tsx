import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import AdminLogin from '../../components/admin/AdminLogin';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminDashboard from './AdminDashboard';
import ContentEditor from './ContentEditor';
import MediaManager from './MediaManager';
import FAQManager from './FAQManager';
import SEOSettings from './SEOSettings';

const AdminPage: React.FC = () => {
  const { user, isLoading } = useAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-800 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-aviation-blue/30 border-t-gold animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/content" element={<ContentEditor />} />
        <Route path="/media" element={<MediaManager />} />
        <Route path="/faqs" element={<FAQManager />} />
        <Route path="/pages" element={<SEOSettings />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminPage;