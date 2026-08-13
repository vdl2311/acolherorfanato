import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  DollarSign,
  UserCheck,
  FileText,
  ShieldCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (m: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const { currentRole, permissions, currentUser } = useAuth();
  const { activeTab, setActiveTab, childrenList = [], donationsList = [], notificationsList = [] } = useApp();

  const unreadNotifs = notificationsList.filter((n) => !n.read).length;
  const activeChildren = childrenList.filter((c) => c.status === 'ativo').length;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Painel Geral',
      icon: <LayoutDashboard className="w-5 h-5" />,
      show: true,
    },
    {
      id: 'children',
      label: 'Crianças e Adolescentes',
      icon: <Users className="w-5 h-5" />,
      badge: activeChildren,
      show: permissions.canViewChildren,
    },
    {
      id: 'donations',
      label: 'Gestão de Doações',
      icon: <HeartHandshake className="w-5 h-5" />,
      show: permissions.canViewDonations,
    },
    {
      id: 'financial',
      label: 'Gestão Financeira',
      icon: <DollarSign className="w-5 h-5" />,
      show: permissions.canViewFinancial,
    },
    {
      id: 'users',
      label: 'Usuários e Equipe',
      icon: <UserCheck className="w-5 h-5" />,
      show: permissions.canManageUsers || currentRole === 'admin' || currentRole === 'gestor',
    },
    {
      id: 'reports',
      label: 'Relatórios e PIA',
      icon: <FileText className="w-5 h-5" />,
      show: permissions.canExportData,
    },
    {
      id: 'lgpd',
      label: 'Segurança & LGPD',
      icon: <ShieldCheck className="w-5 h-5" />,
      badge: unreadNotifs > 0 ? unreadNotifs : undefined,
      show: currentRole === 'admin' || currentRole === 'gestor' || permissions.canViewAuditLogs,
    },
  ];

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    gestor: 'Gestor Geral',
    assistente_social: 'Assistente Social',
    profissional_saude: 'Saúde / Médico',
    educador: 'Educador',
    financeiro: 'Financeiro',
    voluntario: 'Voluntário',
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-slate-900 text-slate-100 border-r border-slate-800 transition-all duration-300 flex flex-col ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shrink-0 text-white font-bold shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-sm font-bold tracking-tight text-white leading-tight truncate">
                  ACOLHER
                </h1>
                <p className="text-[10px] text-slate-400 truncate">Gestão Infantojuvenil</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Current User Role Pill */}
        {!collapsed && (
          <div className="mx-3 mt-4 p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center gap-2.5">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-600 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-200 truncate">{currentUser.name}</p>
              <div className="mt-0.5">
                <Badge variant="cyan" size="sm">
                  {roleLabels[currentRole] || currentRole}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems
            .filter((item) => item.show)
            .map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-xs font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                  {!collapsed && item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                        isActive ? 'bg-sky-700 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>

        {/* Footer / Institution Info */}
        {!collapsed && (
          <div className="p-4 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 font-medium truncate">Lar Sementes do Amanhã</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Versão 2.4 (Auditada LGPD)</p>
          </div>
        )}
      </aside>
    </>
  );
};
