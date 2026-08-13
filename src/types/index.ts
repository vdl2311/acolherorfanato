export type UserRole =
  | 'admin'
  | 'gestor'
  | 'assistente_social'
  | 'profissional_saude'
  | 'educador'
  | 'financeiro'
  | 'voluntario';

export interface RolePermission {
  role: UserRole;
  label: string;
  description: string;
  canViewChildren: boolean;
  canEditChildren: boolean;
  canViewMedical: boolean;
  canEditMedical: boolean;
  canViewLegalFamily: boolean;
  canEditLegalFamily: boolean;
  canViewDonations: boolean;
  canEditDonations: boolean;
  canViewFinancial: boolean;
  canEditFinancial: boolean;
  canManageUsers: boolean;
  canViewAuditLogs: boolean;
  canExportData: boolean;
  canEditVolunteers?: boolean;
  canEditSettings?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  cpf: string;
  phone: string;
  active: boolean;
  avatarUrl?: string;
  department: string;
  registrationNumber: string;
  lastLoginAt?: string;
  createdAt: string;
}

export type ChildStatus = 'ativo' | 'transferido' | 'desacolhido' | 'em_adocao';

export type SexType = 'masculino' | 'feminino' | 'outro';

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  phone?: string;
  address?: string;
  cpf?: string;
  authorizedVisitor: boolean;
  visitationSchedule?: string;
  notes?: string;
}

export interface HealthRecord {
  id: string;
  date: string;
  type: 'consulta' | 'vacina' | 'medicamento' | 'exame' | 'atendimento_psicologico' | 'emergencia';
  title: string;
  doctorOrProfessional: string;
  crmOrRegister?: string;
  facility: string;
  diagnosisOrReason: string;
  prescriptionOrTreatment?: string;
  nextFollowUpDate?: string;
  isConfidential: boolean;
}

export interface Allergy {
  id: string;
  allergen: string;
  severity: 'leve' | 'moderada' | 'grave';
  reaction: string;
}

export interface ContinuousMedication {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
  endDate?: string;
}

export interface EducationRecord {
  id: string;
  schoolName: string;
  grade: string;
  shift: 'matutino' | 'vespertino' | 'noturno' | 'integral';
  academicYear: number;
  performanceScore?: string;
  attendancePercentage?: number;
  iepNotes?: string;
  tutoringInfo?: string;
  schoolContactPhone?: string;
  teacherName?: string;
}

export interface Occurrence {
  id: string;
  date: string;
  time: string;
  category: 'comportamental' | 'saude' | 'escolar' | 'oficina' | 'visita_familiar' | 'judicial' | 'outros';
  title: string;
  description: string;
  reportedBy: string;
  reporterRole: UserRole;
  severity: 'baixa' | 'media' | 'alta' | 'critica';
  actionTaken?: string;
}

export interface ChildDocument {
  id: string;
  title: string;
  type: 'certidao_nascimento' | 'rg' | 'cpf' | 'guia_acolhimento' | 'decisao_judicial' | 'cartao_vacina' | 'historico_escolar' | 'laudo_medico' | 'outros';
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  fileUrl: string;
  isSensitive: boolean;
}

export interface PiaPlan {
  id: string;
  updatedAt: string;
  responsibleSocialWorker: string;
  familyReunificationGoal: string;
  healthGoals: string;
  educationGoals: string;
  socialIntegrationGoals: string;
  nextJudicialReviewDate: string;
  status: 'em_elaboracao' | 'vigente' | 'em_revisao' | 'concluido';
}

export interface Child {
  id: string;
  code: string;
  fullName: string;
  socialName?: string;
  photoUrl?: string;
  birthDate: string;
  sex: SexType;
  rg?: string;
  cpf?: string;
  birthCertificateNum?: string;
  status: ChildStatus;
  
  admissionDate: string;
  admissionReason: string;
  originFacility: string;
  judicialProcessNumber?: string;
  responsibleJudge?: string;
  courtDistrict?: string;
  
  exitDate?: string;
  exitReason?: string;
  destinationDetails?: string;

  allergies: Allergy[];
  continuousMedications: ContinuousMedication[];
  healthHistory: HealthRecord[];
  educationHistory: EducationRecord[];
  familyMembers: FamilyMember[];
  occurrences: Occurrence[];
  documents: ChildDocument[];
  piaPlan?: PiaPlan;
  
  generalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type DonationType = 'financeira' | 'alimentos' | 'vestuario' | 'brinquedos' | 'higiene_limpeza' | 'moveis_equipamentos' | 'outro' | 'bens_produtos';

export type DonationCategory =
  | 'alimentacao'
  | 'vestuario'
  | 'higiene_limpeza'
  | 'medicamentos'
  | 'brinquedos_pedagogico'
  | 'moveis_equipamentos'
  | 'obras_manutencao'
  | 'geral';

export interface Donor {
  id?: string;
  name: string;
  type?: 'pessoa_fisica' | 'pessoa_juridica' | 'anónimo' | 'ong_parceira';
  cpfCnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface Donation {
  id: string;
  code?: string;
  receiptNumber?: string;
  donorName?: string;
  donorCpfCnpj?: string;
  donorPhone?: string;
  donorEmail?: string;
  donor?: Donor;
  type: DonationType;
  date: string;
  amount?: number;
  itemDescription?: string;
  quantity?: number;
  unit?: string;
  estimatedValue?: number;
  category?: DonationCategory;
  paymentMethod?: string;
  destination?: string;
  receiptIssued?: boolean;
  proofDocumentUrl?: string;
  notes?: string;
  createdAt?: string;
}

export type TransactionType = 'entrada' | 'saida';

export type ExpenseCategory =
  | 'alimentacao'
  | 'pessoal_folha'
  | 'saude_medicamentos'
  | 'educacao_oficinas'
  | 'utilidades_agua_luz'
  | 'manutencao_reforma'
  | 'vestuario_higiene'
  | 'administrativo'
  | 'outras_despesas'
  | string;

export interface Transaction {
  id: string;
  code?: string;
  type: TransactionType;
  date?: string;
  amount: number;
  category: ExpenseCategory;
  costCenter?: string;
  bankAccount?: string;
  description: string;
  payeeOrPayer?: string;
  supplierOrPayee?: string;
  documentNumber?: string;
  paymentMethod?: string;
  paymentStatus: 'pago' | 'pendente' | 'cancelado';
  dueDate?: string;
  paymentDate?: string;
  proofUrl?: string;
  donationId?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface Volunteer {
  id: string;
  fullName: string;
  cpf?: string;
  phone: string;
  email?: string;
  activityRole: string;
  availabilitySchedule: string;
  status: 'ativo' | 'inativo';
  monthlyHours: number;
  backgroundCheckVerified: boolean;
  volunteerTermSigned: boolean;
  startDate: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'CRIAR' | 'EDITAR' | 'EXCLUIR' | 'VISUALIZAR_SENSIVEL' | 'EXPORTAR' | 'LOGIN' | 'ALTERAR_PERMISSAO';
  module: 'ACOLHIDOS' | 'DOACOES' | 'FINANCEIRO' | 'USUARIOS' | 'SEGURANCA' | 'RELATORIOS' | 'VOLUNTARIOS' | 'LGPD' | 'CONFIGURACOES';
  targetId?: string;
  targetType?: string;
  targetDescription: string;
  ipAddress?: string;
  justification?: string;
  details?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'alerta_judicial' | 'vacina_pendente' | 'revisao_pia' | 'caixa_baixo' | 'doacao_nova' | 'info';
  date: string;
  read: boolean;
  linkModule?: string;
  targetId?: string;
}

export interface SystemSettings {
  institutionName: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  directorName?: string;
  presidentName?: string;
  socialWorkerName?: string;
  cressNumber?: string;
  technicalResponsible?: string;
  maxCapacity: number;
  lgpdDataRetentionMonths?: number;
  automaticSessionTimeoutMinutes?: number;
  themeMode?: 'light' | 'dark';
}
