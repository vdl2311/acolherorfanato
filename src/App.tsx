import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ChildrenListView } from './components/children/ChildrenListView';
import { DonationsListView } from './components/donations/DonationsListView';
import { FinancialListView } from './components/financial/FinancialListView';
import { VolunteersListView } from './components/volunteers/VolunteersListView';
import { ReportsView } from './components/reports/ReportsView';
import { LgpdAuditView } from './components/lgpd/LgpdAuditView';
import { SettingsView } from './components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Top Navigation Bar */}
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Dynamic View Switcher */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'children' && <ChildrenListView />}
          {activeTab === 'donations' && <DonationsListView />}
          {activeTab === 'financial' && <FinancialListView />}
          {activeTab === 'users' && <VolunteersListView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'lgpd' && <LgpdAuditView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}
