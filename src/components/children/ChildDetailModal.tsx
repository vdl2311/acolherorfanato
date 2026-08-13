import React, { useState } from 'react';
import { Child } from '../../types';
import { Modal } from '../common/Modal';
import { Tabs } from '../common/Tabs';
import { HealthTab } from './HealthTab';
import { EducationTab } from './EducationTab';
import { FamilyTab } from './FamilyTab';
import { OccurrencesTab } from './OccurrencesTab';
import { DocumentsTab } from './DocumentsTab';
import { PiaPlanModal } from './PiaPlanModal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { MaskedText } from '../common/MaskedText';
import {
  User,
  Heart,
  GraduationCap,
  Users as FamilyIcon,
  Activity,
  FileText,
  ShieldCheck,
  Printer,
  Calendar,
  MapPin,
  Clock,
  Edit2,
} from 'lucide-react';
import { calculateAge, formatDateBR, maskCPF, maskJudicialProcess } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { printDocumentHTML } from '../../utils/export';

interface ChildDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: Child | null;
  onEdit?: (child: Child) => void;
}

export const ChildDetailModal: React.FC<ChildDetailModalProps> = ({
  isOpen,
  onClose,
  child,
  onEdit,
}) => {
  const { logAudit } = useApp();
  const { permissions } = useAuth();

  const [activeTab, setActiveTab] = useState('dados');
  const [piaModalOpen, setPiaModalOpen] = useState(false);

  if (!isOpen || !child) return null;

  const ageInfo = calculateAge(child.birthDate);

  const tabs = [
    { id: 'dados', label: 'Dados Pessoais & Acolhimento', icon: <User className="w-4 h-4" /> },
    { id: 'saude', label: 'Saúde & Prontuário', icon: <Heart className="w-4 h-4" />, badge: child.healthHistory.length },
    { id: 'educacao', label: 'Educação & Escola', icon: <GraduationCap className="w-4 h-4" />, badge: child.educationHistory.length },
    { id: 'familia', label: 'Família & Visitas', icon: <FamilyIcon className="w-4 h-4" />, badge: child.familyMembers.length },
    { id: 'ocorrencias', label: 'Ocorrências & Diário', icon: <Activity className="w-4 h-4" />, badge: child.occurrences.length },
    { id: 'documentos', label: 'Anexos & Documentos', icon: <FileText className="w-4 h-4" />, badge: child.documents.length },
  ];

  const handlePrintDossier = () => {
    logAudit('EXPORTAR', 'ACOLHIDOS', `Impressão do Prontuário Completo do Acolhido: ${child.fullName}`, child.id);

    const htmlContent = `
      <div class="section">
        <div class="section-title">1. Dados Cadastrais e de Acolhimento</div>
        <div class="grid">
          <div class="field"><span class="field-label">Nome Completo:</span> <span class="field-value">${child.fullName}</span></div>
          <div class="field"><span class="field-label">Código:</span> <span class="field-value">${child.code}</span></div>
          <div class="field"><span class="field-label">Data Nasc.:</span> <span class="field-value">${formatDateBR(child.birthDate)} (${ageInfo.text})</span></div>
          <div class="field"><span class="field-label">Sexo:</span> <span class="field-value">${child.sex}</span></div>
          <div class="field"><span class="field-label">Data Acolhimento:</span> <span class="field-value">${formatDateBR(child.admissionDate)}</span></div>
          <div class="field"><span class="field-label">Status:</span> <span class="field-value">${child.status.toUpperCase()}</span></div>
        </div>
        <div class="field" style="margin-top: 8px;"><span class="field-label">Motivo do Acolhimento:</span> <span class="field-value">${child.admissionReason}</span></div>
        <div class="field" style="margin-top: 4px;"><span class="field-label">Origem / Vara:</span> <span class="field-value">${child.originFacility} • ${child.courtDistrict || 'S/D'}</span></div>
      </div>

      <div class="section">
        <div class="section-title">2. Histórico Clínico e Alergias</div>
        <p><strong>Alergias:</strong> ${child.allergies.map((a) => `${a.allergen} (${a.severity})`).join(', ') || 'Nenhuma'}</p>
        <table>
          <thead>
            <tr><th>Data</th><th>Atendimento</th><th>Profissional</th><th>Diagnóstico</th></tr>
          </thead>
          <tbody>
            ${child.healthHistory
              .map(
                (h) =>
                  `<tr><td>${formatDateBR(h.date)}</td><td>${h.title}</td><td>${h.doctorOrProfessional}</td><td>${h.diagnosisOrReason}</td></tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">3. Vida Escolar</div>
        ${child.educationHistory
          .map(
            (e) =>
              `<p><strong>${e.schoolName}</strong> - ${e.grade} (${e.shift}) - Desempenho: ${e.performanceScore || 'N/A'}</p>`
          )
          .join('')}
      </div>

      <div class="section">
        <div class="section-title">4. Plano Individual de Atendimento (PIA)</div>
        <p><strong>Meta Familiar:</strong> ${child.piaPlan?.familyReunificationGoal || 'Em elaboração'}</p>
        <p><strong>Próxima Revisão Trimestral:</strong> ${formatDateBR(child.piaPlan?.nextJudicialReviewDate)}</p>
      </div>
    `;

    printDocumentHTML(`Prontuário Individual do Acolhido — ${child.fullName}`, htmlContent);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Prontuário do Acolhido: ${child.fullName}`}
        subtitle={`Código: ${child.code} • Idade: ${ageInfo.text}`}
        maxWidth="6xl"
      >
        <div className="space-y-6">
          {/* Header Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={child.photoUrl || 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80'}
                alt={child.fullName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{child.fullName}</h3>
                  <Badge variant={child.status === 'ativo' ? 'success' : 'neutral'}>
                    {child.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nascimento: {formatDateBR(child.birthDate)} ({ageInfo.text}) • Sexo: <span className="capitalize">{child.sex}</span>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Acolhido em: <strong>{formatDateBR(child.admissionDate)}</strong> via {child.originFacility}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="primary"
                size="sm"
                icon={<ShieldCheck className="w-4 h-4" />}
                onClick={() => setPiaModalOpen(true)}
              >
                Plano PIA (ECA)
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={<Printer className="w-4 h-4" />}
                onClick={handlePrintDossier}
              >
                Imprimir Prontuário
              </Button>

              {permissions.canEditChildren && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Edit2 className="w-4 h-4" />}
                  onClick={() => onEdit?.(child)}
                >
                  Editar
                </Button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          {/* Tab Content Panels */}
          <div className="pt-2">
            {activeTab === 'dados' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Identification Column */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Identificação Civil</h4>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-slate-500 block">Nome Social:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{child.socialName || 'Não registrado'}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">CPF (Protegido LGPD):</span>
                      <MaskedText
                        value={child.cpf}
                        maskedValue={maskCPF(child.cpf)}
                        label="CPF do Acolhido"
                        targetId={child.id}
                        targetDescription={`CPF de ${child.fullName}`}
                        sensitiveType="cpf"
                      />
                    </div>

                    <div>
                      <span className="text-slate-500 block">RG:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{child.rg || 'Não informado'}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Matrícula da Certidão de Nascimento:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 break-all">{child.birthCertificateNum || 'Não informada'}</span>
                    </div>
                  </div>
                </div>

                {/* Legal / Admission Column */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Acompanhamento Judicial & Acolhimento</h4>

                  <div className="space-y-2">
                    <div>
                      <span className="text-slate-500 block">Processo Judicial (LGPD/ECA):</span>
                      <MaskedText
                        value={child.judicialProcessNumber}
                        maskedValue={maskJudicialProcess(child.judicialProcessNumber)}
                        label="Número do Processo Judicial"
                        targetId={child.id}
                        targetDescription={`Processo da Infância de ${child.fullName}`}
                        sensitiveType="processo"
                      />
                    </div>

                    <div>
                      <span className="text-slate-500 block">Juiz(a) / Vara Competente:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {child.responsibleJudge || 'S/D'} ({child.courtDistrict || child.originFacility})
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Motivo e Origem do Acolhimento:</span>
                      <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border">
                        {child.admissionReason}
                      </p>
                    </div>

                    {child.generalNotes && (
                      <div>
                        <span className="text-slate-500 block">Observações Gerais da Equipe:</span>
                        <p className="text-slate-600 dark:text-slate-300 italic mt-0.5">{child.generalNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'saude' && <HealthTab child={child} />}
            {activeTab === 'educacao' && <EducationTab child={child} />}
            {activeTab === 'familia' && <FamilyTab child={child} />}
            {activeTab === 'ocorrencias' && <OccurrencesTab child={child} />}
            {activeTab === 'documentos' && <DocumentsTab child={child} />}
          </div>
        </div>
      </Modal>

      {/* Pia Plan Modal */}
      <PiaPlanModal
        isOpen={piaModalOpen}
        onClose={() => setPiaModalOpen(false)}
        child={child}
      />
    </>
  );
};
