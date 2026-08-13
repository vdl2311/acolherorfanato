import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, RolePermission } from '../types';
import { initialUsers, initialRolePermissions } from '../data/initialData';

interface AuthContextType {
  currentUser: User;
  currentRole: UserRole;
  permissions: RolePermission;
  availableUsers: User[];
  availablePermissions: RolePermission[];
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (key: keyof RolePermission) => boolean;
  isRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availableUsers, setAvailableUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('acolher_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('acolher_current_user_id') || initialUsers[0].id;
  });

  const currentUser = availableUsers.find((u) => u.id === currentUserId) || availableUsers[0];

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('acolher_current_role') as UserRole) || currentUser.role;
  });

  useEffect(() => {
    localStorage.setItem('acolher_current_user_id', currentUser.id);
  }, [currentUser.id]);

  useEffect(() => {
    localStorage.setItem('acolher_current_role', currentRole);
  }, [currentRole]);

  const permissions =
    initialRolePermissions.find((p) => p.role === currentRole) || initialRolePermissions[0];

  const switchUser = (userId: string) => {
    const found = availableUsers.find((u) => u.id === userId);
    if (found) {
      setCurrentUserId(found.id);
      setCurrentRole(found.role);
    }
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
  };

  const hasPermission = (key: keyof RolePermission): boolean => {
    return Boolean(permissions[key]);
  };

  const isRole = (...roles: UserRole[]): boolean => {
    return roles.includes(currentRole);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        permissions,
        availableUsers,
        availablePermissions: initialRolePermissions,
        switchUser,
        switchRole,
        hasPermission,
        isRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
