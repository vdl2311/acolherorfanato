import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Child,
  Donation,
  Donor,
  Transaction,
  User,
  AuditLog,
  SystemNotification,
  SystemSettings,
  HealthRecord,
  EducationRecord,
  FamilyMember,
  Occurrence,
  ChildDocument,
  PiaPlan,
  Volunteer,
} from '../types';
import {
  initialChildren,
  initialDonations,
  initialDonors,
  initialTransactions,
  initialAuditLogs,
  initialNotifications,
  initialSettings,
  initialUsers,
  initialVolunteers,
} from '../data/initialData';
import { generateCode } from '../utils/formatters';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface AppContextType {
  childrenList: Child[];
  donorsList: Donor[];
  donationsList: Donation[];
  transactionsList: Transaction[];
  usersList: User[];
  volunteersList: Volunteer[];
  auditLogsList: AuditLog[];
  notificationsList: SystemNotification[];
  settings: SystemSettings;
  toasts: ToastMessage[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Actions
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  logAudit: (
    action: AuditLog['action'],
    module: AuditLog['module'],
    targetDescription: string,
    targetId?: string,
    justification?: string,
    details?: string
  ) => void;

  // Volunteers management
  addVolunteer: (volunteerData: Omit<Volunteer, 'id'>) => void;

  // Children management
  addChild: (childData: Omit<Child, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => void;
  updateChild: (id: string, childData: Partial<Child>) => void;
  deleteChild: (id: string, reason: string) => void;
  addHealthRecord: (childId: string, record: Omit<HealthRecord, 'id'>) => void;
  addEducationRecord: (childId: string, record: Omit<EducationRecord, 'id'>) => void;
  addFamilyMember: (childId: string, member: Omit<FamilyMember, 'id'>) => void;
  addOccurrence: (childId: string, occurrence: Omit<Occurrence, 'id'>) => void;
  addDocument: (childId: string, doc: Omit<ChildDocument, 'id' | 'uploadedAt'>) => void;
  updatePiaPlan: (childId: string, pia: Omit<PiaPlan, 'id' | 'updatedAt'>) => void;

  // Donations management
  addDonation: (donationData: Omit<Donation, 'id' | 'code' | 'createdAt'>) => void;
  updateDonation: (id: string, donationData: Partial<Donation>) => void;
  issueDonationReceipt: (id: string) => void;

  // Financial management
  addTransaction: (txData: Omit<Transaction, 'id' | 'code' | 'createdAt'>) => void;
  updateTransaction: (id: string, txData: Partial<Transaction>) => void;

  // Users management
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  toggleUserActive: (id: string) => void;

  // Settings
  updateSettings: (newSettings: Partial<SystemSettings>) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [childrenList, setChildrenList] = useState<Child[]>(() => {
    try {
      const saved = localStorage.getItem('acolher_children');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : initialChildren;
    } catch {
      return initialChildren;
    }
  });

  const [donorsList, setDonorsList] = useState<Donor[]>(() => {
    try {
      const saved = localStorage.getItem('acolher_donors');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : initialDonors;
    } catch {
      return initialDonors;
    }
  });

  const [donationsList, setDonationsList] = useState<Donation[]>(() => {
    try {
      const saved = localStorage.getItem('acolher_donations');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : initialDonations;
    } catch {
      return initialDonations;
    }
  });

  const [transactionsList, setTransactionsList] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('acolher_transactions');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [usersList, setUsersList] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('acolher_users');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : initialUsers;
    } catch {
      return initialUsers;
    }
  });

  const [volunteersList, setVolunteersList] = useState<Volunteer[]>(() => {
    try {
      const saved = localStorage.getItem('acolher_volunteers');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : initialVolunteers;
    } catch {
      return initialVolunteers;
    }
  });

  const [auditLogsList, setAuditLogsList] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('acolher_audit_logs');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : initialAuditLogs;
    } catch {
      return initialAuditLogs;
    }
  });

  const [notificationsList, setNotificationsList] = useState<SystemNotification[]>(() => {
    try {
      const saved = localStorage.getItem('acolher_notifications');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : initialNotifications;
    } catch {
      return initialNotifications;
    }
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('acolher_settings');
      return saved ? JSON.parse(saved) : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('acolher_children', JSON.stringify(childrenList));
  }, [childrenList]);

  useEffect(() => {
    localStorage.setItem('acolher_donors', JSON.stringify(donorsList));
  }, [donorsList]);

  useEffect(() => {
    localStorage.setItem('acolher_donations', JSON.stringify(donationsList));
  }, [donationsList]);

  useEffect(() => {
    localStorage.setItem('acolher_transactions', JSON.stringify(transactionsList));
  }, [transactionsList]);

  useEffect(() => {
    localStorage.setItem('acolher_users', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem('acolher_volunteers', JSON.stringify(volunteersList));
  }, [volunteersList]);

  useEffect(() => {
    localStorage.setItem('acolher_audit_logs', JSON.stringify(auditLogsList));
  }, [auditLogsList]);

  useEffect(() => {
    localStorage.setItem('acolher_notifications', JSON.stringify(notificationsList));
  }, [notificationsList]);

  useEffect(() => {
    localStorage.setItem('acolher_settings', JSON.stringify(settings));
  }, [settings]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast-' + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const logAudit = useCallback(
    (
      action: AuditLog['action'],
      module: AuditLog['module'],
      targetDescription: string,
      targetId?: string,
      justification?: string,
      details?: string
    ) => {
      const storedUserRaw = localStorage.getItem('acolher_current_user_id');
      const currentUser = usersList.find((u) => u.id === storedUserRaw) || usersList[0];

      const newLog: AuditLog = {
        id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action,
        module,
        targetId,
        targetDescription,
        ipAddress: '189.120.44.' + Math.floor(Math.random() * 200 + 10),
        justification,
        details,
      };

      setAuditLogsList((prev) => [newLog, ...prev]);
    },
    [usersList]
  );

  // Actions implementation
  const addChild = (childData: Omit<Child, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => {
    const newId = 'child-' + Date.now();
    const code = generateCode('ACO', childrenList.length + 1);
    const now = new Date().toISOString().split('T')[0];

    const newChild: Child = {
      ...childData,
      id: newId,
      code,
      createdAt: now,
      updatedAt: now,
    };

    setChildrenList((prev) => [newChild, ...prev]);
    logAudit('CRIAR', 'ACOLHIDOS', `Novo acolhimento registrado: ${newChild.fullName} (${code})`, newId);
    addToast({
      type: 'success',
      title: 'Acolhido Cadastrado com Sucesso!',
      message: `${newChild.fullName} foi inserido sob o código ${code}.`,
    });
  };

  const updateChild = (id: string, childData: Partial<Child>) => {
    const now = new Date().toISOString().split('T')[0];
    let updatedName = '';

    setChildrenList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          updatedName = childData.fullName || item.fullName;
          return { ...item, ...childData, updatedAt: now };
        }
        return item;
      })
    );

    logAudit('EDITAR', 'ACOLHIDOS', `Cadastro de acolhido atualizado: ${updatedName}`, id);
    addToast({
      type: 'success',
      title: 'Informações Atualizadas',
      message: `Os dados de ${updatedName} foram salvos com sucesso.`,
    });
  };

  const deleteChild = (id: string, reason: string) => {
    const child = childrenList.find((c) => c.id === id);
    if (!child) return;

    setChildrenList((prev) => prev.filter((c) => c.id !== id));
    logAudit('EXCLUIR', 'ACOLHIDOS', `Exclusão de cadastro de acolhido: ${child.fullName}`, id, reason);
    addToast({
      type: 'warning',
      title: 'Cadastro Removido',
      message: `O acolhido ${child.fullName} foi removido do sistema.`,
    });
  };

  const addHealthRecord = (childId: string, record: Omit<HealthRecord, 'id'>) => {
    const newRecord: HealthRecord = {
      ...record,
      id: 'hlth-' + Date.now(),
    };

    setChildrenList((prev) =>
      prev.map((c) => (c.id === childId ? { ...c, healthHistory: [newRecord, ...c.healthHistory] } : c))
    );

    const child = childrenList.find((c) => c.id === childId);
    logAudit('CRIAR', 'ACOLHIDOS', `Registro médico/saúde adicionado para ${child?.fullName}: ${record.title}`, childId);
    addToast({ type: 'success', title: 'Registro de Saúde Salvo' });
  };

  const addEducationRecord = (childId: string, record: Omit<EducationRecord, 'id'>) => {
    const newRecord: EducationRecord = {
      ...record,
      id: 'edu-' + Date.now(),
    };

    setChildrenList((prev) =>
      prev.map((c) => (c.id === childId ? { ...c, educationHistory: [newRecord, ...c.educationHistory] } : c))
    );

    const child = childrenList.find((c) => c.id === childId);
    logAudit('CRIAR', 'ACOLHIDOS', `Histórico escolar adicionado para ${child?.fullName}: ${record.schoolName}`, childId);
    addToast({ type: 'success', title: 'Registro Escolar Salvo' });
  };

  const addFamilyMember = (childId: string, member: Omit<FamilyMember, 'id'>) => {
    const newMember: FamilyMember = {
      ...member,
      id: 'fam-' + Date.now(),
    };

    setChildrenList((prev) =>
      prev.map((c) => (c.id === childId ? { ...c, familyMembers: [...c.familyMembers, newMember] } : c))
    );

    const child = childrenList.find((c) => c.id === childId);
    logAudit('CRIAR', 'ACOLHIDOS', `Membro familiar adicionado para ${child?.fullName}: ${member.name}`, childId);
    addToast({ type: 'success', title: 'Familiar Cadastrado' });
  };

  const addOccurrence = (childId: string, occurrence: Omit<Occurrence, 'id'>) => {
    const newOccurrence: Occurrence = {
      ...occurrence,
      id: 'occ-' + Date.now(),
    };

    setChildrenList((prev) =>
      prev.map((c) => (c.id === childId ? { ...c, occurrences: [newOccurrence, ...c.occurrences] } : c))
    );

    const child = childrenList.find((c) => c.id === childId);
    logAudit('CRIAR', 'ACOLHIDOS', `Ocorrência/Atividade salva para ${child?.fullName}: ${occurrence.title}`, childId);
    addToast({ type: 'info', title: 'Ocorrência Registrada' });
  };

  const addDocument = (childId: string, doc: Omit<ChildDocument, 'id' | 'uploadedAt'>) => {
    const newDoc: ChildDocument = {
      ...doc,
      id: 'doc-' + Date.now(),
      uploadedAt: new Date().toISOString().split('T')[0],
    };

    setChildrenList((prev) =>
      prev.map((c) => (c.id === childId ? { ...c, documents: [newDoc, ...c.documents] } : c))
    );

    const child = childrenList.find((c) => c.id === childId);
    logAudit('CRIAR', 'ACOLHIDOS', `Documento anexo adicionado para ${child?.fullName}: ${doc.title}`, childId);
    addToast({ type: 'success', title: 'Documento Anexado' });
  };

  const updatePiaPlan = (childId: string, pia: Omit<PiaPlan, 'id' | 'updatedAt'>) => {
    const updatedPia: PiaPlan = {
      ...pia,
      id: 'pia-' + Date.now(),
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setChildrenList((prev) =>
      prev.map((c) => (c.id === childId ? { ...c, piaPlan: updatedPia } : c))
    );

    const child = childrenList.find((c) => c.id === childId);
    logAudit('EDITAR', 'ACOLHIDOS', `Plano Individual de Atendimento (PIA) atualizado para ${child?.fullName}`, childId);
    addToast({ type: 'success', title: 'Plano PIA Atualizado com Sucesso' });
  };

  // Donations implementation
  const addDonation = (donationData: Omit<Donation, 'id' | 'code' | 'createdAt'>) => {
    const newId = 'don-' + Date.now();
    const code = generateCode('DON', donationsList.length + 1);
    const now = new Date().toISOString().split('T')[0];

    const newDonation: Donation = {
      ...donationData,
      id: newId,
      code,
      createdAt: now,
    };

    setDonationsList((prev) => [newDonation, ...prev]);

    // Check if donor exists in donorsList, else add
    if (!donorsList.some((d) => d.id === donationData.donor.id)) {
      setDonorsList((prev) => [donationData.donor, ...prev]);
    }

    // If financial, automatically create transaction entry
    if (donationData.type === 'financeira' && donationData.amount) {
      const newTx: Transaction = {
        id: 'trx-' + Date.now(),
        code: generateCode('TRX', transactionsList.length + 1),
        type: 'entrada',
        date: donationData.date,
        amount: donationData.amount,
        category: 'doacao_financeira',
        description: `Doação Financeira: ${donationData.donor.name} (${donationData.notes || 'Sem observações'})`,
        payeeOrPayer: donationData.donor.name,
        paymentMethod: donationData.paymentMethod || 'pix',
        paymentStatus: 'pago',
        donationId: newId,
        createdBy: 'Sistema Automático',
        createdAt: now,
      };
      setTransactionsList((prev) => [newTx, ...prev]);
    }

    logAudit('CRIAR', 'DOACOES', `Nova doação registrada (${code}): ${donationData.donor.name}`, newId);
    addToast({ type: 'success', title: 'Doação Cadastrada!', message: `Registrada sob o código ${code}.` });
  };

  const updateDonation = (id: string, donationData: Partial<Donation>) => {
    setDonationsList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...donationData } : d))
    );
    logAudit('EDITAR', 'DOACOES', `Doação atualizada`, id);
    addToast({ type: 'success', title: 'Doação Atualizada' });
  };

  const issueDonationReceipt = (id: string) => {
    const receiptNumber = 'REC-2026-' + Math.floor(Math.random() * 900 + 100);
    setDonationsList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, receiptIssued: true, receiptNumber } : d))
    );
    logAudit('CRIAR', 'DOACOES', `Recibo de Doação emitido: ${receiptNumber}`, id);
    addToast({ type: 'success', title: 'Recibo de Doação Emitido', message: `Número ${receiptNumber}` });
  };

  // Financial implementation
  const addTransaction = (txData: Omit<Transaction, 'id' | 'code' | 'createdAt'>) => {
    const newId = 'trx-' + Date.now();
    const code = generateCode('TRX', transactionsList.length + 1);
    const now = new Date().toISOString().split('T')[0];

    const newTx: Transaction = {
      ...txData,
      id: newId,
      code,
      createdAt: now,
    };

    setTransactionsList((prev) => [newTx, ...prev]);
    logAudit('CRIAR', 'FINANCEIRO', `Movimentação financeira (${txData.type.toUpperCase()}): ${txData.description}`, newId);
    addToast({ type: 'success', title: 'Lançamento Financeiro Salvo', message: `${code}` });
  };

  const updateTransaction = (id: string, txData: Partial<Transaction>) => {
    setTransactionsList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...txData } : t))
    );
    logAudit('EDITAR', 'FINANCEIRO', `Movimentação financeira atualizada`, id);
    addToast({ type: 'success', title: 'Lançamento Atualizado' });
  };

  // Volunteers management implementation
  const addVolunteer = (volunteerData: Omit<Volunteer, 'id'>) => {
    const newId = 'vol-' + Date.now();
    const newVolunteer: Volunteer = {
      ...volunteerData,
      id: newId,
    };

    setVolunteersList((prev) => [newVolunteer, ...prev]);
    logAudit('CRIAR', 'VOLUNTARIOS', `Novo voluntário cadastrado: ${volunteerData.fullName} (${volunteerData.activityRole})`, newId);
    addToast({ type: 'success', title: 'Voluntário Cadastrado!', message: `${volunteerData.fullName}` });
  };

  // User management implementation
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newId = 'usr-' + Date.now();
    const newUser: User = {
      ...userData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUsersList((prev) => [newUser, ...prev]);
    logAudit('CRIAR', 'USUARIOS', `Novo usuário cadastrado: ${userData.name} (${userData.role})`, newId);
    addToast({ type: 'success', title: 'Usuário Criado com Sucesso' });
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...userData } : u))
    );
    logAudit('EDITAR', 'USUARIOS', `Dados do usuário atualizados`, id);
    addToast({ type: 'success', title: 'Usuário Atualizado' });
  };

  const toggleUserActive = (id: string) => {
    const user = usersList.find((u) => u.id === id);
    if (!user) return;
    const nextStatus = !user.active;

    setUsersList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: nextStatus } : u))
    );

    logAudit('ALTERAR_PERMISSAO', 'USUARIOS', `Status do usuário ${user.name} alterado para ${nextStatus ? 'Ativo' : 'Inativo'}`, id);
    addToast({ type: 'warning', title: `Usuário ${nextStatus ? 'Ativado' : 'Desativado'}` });
  };

  // Settings
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logAudit('EDITAR', 'SEGURANCA', 'Configurações gerais do sistema alteradas');
    addToast({ type: 'success', title: 'Configurações da Instituição Salvas' });
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotificationsList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotificationsList((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast({ type: 'info', title: 'Notificações Marcadas como Lidas' });
  };

  return (
    <AppContext.Provider
      value={{
        childrenList,
        donorsList,
        donationsList,
        transactionsList,
        usersList,
        volunteersList,
        auditLogsList,
        notificationsList,
        settings,
        toasts,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        addToast,
        removeToast,
        logAudit,
        addVolunteer,
        addChild,
        updateChild,
        deleteChild,
        addHealthRecord,
        addEducationRecord,
        addFamilyMember,
        addOccurrence,
        addDocument,
        updatePiaPlan,
        addDonation,
        updateDonation,
        issueDonationReceipt,
        addTransaction,
        updateTransaction,
        addUser,
        updateUser,
        toggleUserActive,
        updateSettings,
        markNotificationRead,
        clearAllNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
