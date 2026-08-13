import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bell,
  UserCheck,
  Menu,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { GlobalSearchModal } from './GlobalSearchModal';
import { UserRoleSwitcherModal } from './UserRoleSwitcherModal';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { currentUser, currentRole } = useAuth();
  const { notificationsList = [], markNotificationRead, clearAllNotifications } = useApp();

  const [searchOpen, setSearchOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadNotifications = notificationsList.filter((n) => !n.read);

  const roleNames: Record<string, string> = {
    admin: 'Administrador',
    gestor: 'Gestor',
    assistente_social: 'Assistente Social',
    profissional_saude: 'Profissional de Saúde',
    educador: 'Educador',
    financeiro: 'Financeiro',
    voluntario: 'Voluntário',
  };

  const todayBR = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 lg:px-8 flex items-center justify-between shadow-2xs max-w-full overflow-hidden">
        {/* Left Side: Mobile Menu Button & Search */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-xs font-medium w-28 sm:w-64 cursor-pointer shrink-0 min-w-0"
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate flex-1 text-left">Buscar acolhidos...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border rounded text-slate-400">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Side: Quick Role Switcher, Date, Notifications, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          {/* Date Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium capitalize">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span>{todayBR}</span>
          </div>

          {/* Quick Role Switcher Button */}
          <button
            onClick={() => setRoleSwitcherOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:border-sky-800 dark:text-sky-300 transition-colors text-xs font-semibold cursor-pointer shrink-0"
            title="Alternar Perfil/Nível de Acesso para teste de Permissões"
          >
            <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 shrink-0" />
            <span className="hidden sm:inline">Perfil: {roleNames[currentRole] || currentRole}</span>
            <span className="sm:hidden text-[11px] max-w-[80px] truncate">{roleNames[currentRole]?.split(' ')[0]}</span>
          </button>

          {/* Notifications Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Alertas e Pendências Administrativas"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </button>

            {/* Notifications Popover */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-fadeIn">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Notificações e Alertas
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {unreadNotifications.length} pendências não lidas
                    </p>
                  </div>
                  {unreadNotifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-sky-600 hover:underline font-medium cursor-pointer"
                    >
                      Marcar todas lidas
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notificationsList.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Nenhuma notificação cadastrada.
                    </div>
                  ) : (
                    notificationsList.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                          !notif.read ? 'bg-sky-50/40 dark:bg-sky-950/20' : ''
                        }`}
                      >
                        <div className="mt-0.5">
                          {notif.type === 'alerta_judicial' || notif.type === 'revisao_pia' ? (
                            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {notif.title}
                          </h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {notif.date}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Info */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
            />
            <div className="hidden md:block min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{currentUser.department}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* User Role Switcher Modal */}
      <UserRoleSwitcherModal isOpen={roleSwitcherOpen} onClose={() => setRoleSwitcherOpen(false)} />
    </>
  );
};
