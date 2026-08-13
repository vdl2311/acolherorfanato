import React from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { UserCheck, Shield, Check } from 'lucide-react';
import { Badge } from '../common/Badge';

interface UserRoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserRoleSwitcherModal: React.FC<UserRoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { availableUsers, availablePermissions, currentUser, currentRole, switchUser, switchRole } = useAuth();

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Alternar Perfil do Usuário e Nível de Acesso (RBAC)"
      subtitle="Simulação de controle de permissões em tempo real conforme exigência de segurança LGPD"
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Section 1: Select User Account */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            1. Selecionar Usuário da Equipe
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableUsers.map((user) => {
              const isSelected = user.id === currentUser.id;
              return (
                <div
                  key={user.id}
                  onClick={() => {
                    switchUser(user.id);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 border"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.department}</p>
                      <span className="inline-block mt-0.5">
                        <Badge size="sm" variant="cyan">
                          {user.role}
                        </Badge>
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-sky-600 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Direct Role Override */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            2. Forçar Nível de Permissão (Role-Based Access)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {availablePermissions.map((perm) => {
              const isRoleActive = currentRole === perm.role;
              return (
                <button
                  key={perm.role}
                  type="button"
                  onClick={() => {
                    switchRole(perm.role as UserRole);
                  }}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isRoleActive
                      ? 'border-sky-500 bg-sky-500 text-white font-medium'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{perm.label}</span>
                    {isRoleActive && <Check className="w-4 h-4 text-white shrink-0" />}
                  </div>
                  <p className={`text-[11px] mt-1 line-clamp-2 ${isRoleActive ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {perm.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-500 flex items-center justify-between">
          <span>Perfil Ativo: <strong>{currentUser.name}</strong> ({currentRole})</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 cursor-pointer text-xs"
          >
            Aplicar e Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
};
