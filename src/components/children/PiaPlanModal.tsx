import React, { useState } from 'react';
import { Child, PiaPlan } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, FileCheck, Calendar, Printer, Save } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, Select, Textarea } from '../common/Input';
import { Badge } from '../common/Badge';
import { formatDateBR } from '../../utils/formatters';
import { printDocumentHTML } from '../../utils/export';

interface PiaPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: Child;
}

export const PiaPlanModal: React.FC<PiaPlanModalProps> = ({ isOpen, onClose, child }) => {
  const { updatePiaPlan, logAudit } = useApp();
  const { permissions, currentUser } = useAuth();

  const currentPia = child.piaPlan;

  const [responsibleWorker, setResponsibleWorker] = useState(
    currentPia?.responsibleSocialWorker || currentUser.name
  );
  const [familyGoal, setFamilyGoal] = useState(
    currentPia?.familyReunificationGoal || 'Fortalecimento de vínculos com a família biológica/extensa.'
  );
  const [healthGoal, setHealthGoal] = useState(
    currentPia?.healthGoals || 'Acompanhamento pediátrico e vacinação em dia.'
  );
  const [educationGoal, setEducationGoal] = useState(
    currentPia?.educationGoals || 'Manter assiduidade escolar superior a 90%.'
  );
  const [socialGoal, setSocialGoal] = useState(
    currentPia?.socialIntegrationGoals || 'Participação em oficinas de música, esportes e recreação.'
  );
  const [nextReviewDate, setNextReviewDate] = useState(
    currentPia?.nextJudicialReviewDate || new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<PiaPlan['status']>(currentPia?.status || 'vigente');

  if (!isOpen) return null;

  const handleSavePia = (e: React.FormEvent) => {
    e.preventDefault();
    updatePiaPlan(child.id, {
      responsibleSocialWorker: responsibleWorker,
      familyReunificationGoal: familyGoal,
      healthGoals: healthGoal,
      educationGoals: educationGoal,
      socialIntegrationGoals: socialGoal,
      nextJudicialReviewDate: nextReviewDate,
      status,
    });
    onClose();
  };

  const handlePrintPia = () => {
    logAudit('EXPORTAR', 'ACOLHIDOS', `Impressão do Plano Individual de Atendimento (PIA) de ${child.fullName}`, child.id);

    const htmlContent = `
      <div class="section">
        <div class="section-title">1. Dados de Identificação do Acolhido</div>
        <div class="grid">
          <div class="field"><span class="field-label">Nome Completo:</span> <span class="field-value">${child.fullName}</span></div>
          <div class="field"><span class="field-label">Código Único:</span> <span class="field-value">${child.code}</span></div>
          <div class="field"><span class="field-label">Data de Nascimento:</span> <span class="field-value">${formatDateBR(child.birthDate)}</span></div>
          <div class="field"><span class="field-label">Data de Acolhimento:</span> <span class="field-value">${formatDateBR(child.admissionDate)}</span></div>
          <div class="field"><span class="field-label">Processo Judicial:</span> <span class="field-value">${child.judicialProcessNumber || 'S/N'}</span></div>
          <div class="field"><span class="field-label">Vara de Origem:</span> <span class="field-value">${child.courtDistrict || child.originFacility}</span></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">2. Diretrizes e Metas do PIA (Art. 101 Lei 8.069/1990 - ECA)</div>
        <div class="field"><span class="field-label">Assistente Social Responsável:</span> <span class="field-value">${responsibleWorker}</span></div>
        <div class="field" style="margin-top: 10px;"><span class="field-label">Reintegração Familiar / Adoção:</span> <span class="field-value">${familyGoal}</span></div>
        <div class="field" style="margin-top: 10px;"><span class="field-label">Acompanhamento de Saúde e Nutrição:</span> <span class="field-value">${healthGoal}</span></div>
        <div class="field" style="margin-top: 10px;"><span class="field-label">Educação e Desenvolvimento Pedagógico:</span> <span class="field-value">${educationGoal}</span></div>
        <div class="field" style="margin-top: 10px;"><span class="field-label">Convivência Comunitária e Cultura:</span> <span class="field-value">${socialGoal}</span></div>
      </div>

      <div class="section">
        <div class="section-title">3. Prazos e Controle de Revisão Judicial</div>
        <div class="grid">
          <div class="field"><span class="field-label">Data de Elaboração/Revisão:</span> <span class="field-value">${formatDateBR(currentPia?.updatedAt || new Date().toISOString())}</span></div>
          <div class="field"><span class="field-label">Próxima Revisão Trimestral:</span> <span class="field-value">${formatDateBR(nextReviewDate)}</span></div>
          <div class="field"><span class="field-label">Status do Plano:</span> <span class="field-value">${status.toUpperCase()}</span></div>
        </div>
      </div>

      <div class="signatures">
        <div class="sig-line">
          <strong>${responsibleWorker}</strong><br/>
          Assistente Social Responsável (CRESS)
        </div>
        <div class="sig-line">
          <strong>Coordenação Geral da Instituição</strong><br/>
          Associação Lar Sementes do Amanhã
        </div>
      </div>
    `;

    printDocumentHTML(`Plano Individual de Atendimento (PIA) — ${child.fullName}`, htmlContent);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Plano Individual de Atendimento (PIA - ECA)"
      subtitle={`Documento obrigatório de planejamento para o acolhido ${child.fullName} (${child.code})`}
      maxWidth="3xl"
    >
      <form onSubmit={handleSavePia} className="space-y-5">
        <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
              Conformidade Legal ECA (Art. 101 - Lei nº 8.069/1990)
            </span>
          </div>
          <Badge variant="purple">Revisão Trimestral</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Assistente Social Responsável"
            value={responsibleWorker}
            onChange={(e) => setResponsibleWorker(e.target.value)}
            required
          />
          <Select
            label="Status do Plano PIA"
            options={[
              { value: 'vigente', label: 'Vigente / Em Execução' },
              { value: 'em_elaboracao', label: 'Em Elaboração' },
              { value: 'em_revisao', label: 'Em Revisão Judicial' },
              { value: 'concluido', label: 'Concluído (Desacolhimento)' },
            ]}
            value={status}
            onChange={(e) => setStatus(e.target.value as PiaPlan['status'])}
          />
        </div>

        <Textarea
          label="1. Plano de Reintegração Familiar / Adoção (Metas Principais)"
          value={familyGoal}
          onChange={(e) => setFamilyGoal(e.target.value)}
          rows={3}
          required
        />

        <Textarea
          label="2. Acompanhamento e Metas de Saúde"
          value={healthGoal}
          onChange={(e) => setHealthGoal(e.target.value)}
          rows={2}
          required
        />

        <Textarea
          label="3. Metas Educacionais e Vida Escolar"
          value={educationGoal}
          onChange={(e) => setEducationGoal(e.target.value)}
          rows={2}
          required
        />

        <Textarea
          label="4. Convivência Comunitária e Integração Social"
          value={socialGoal}
          onChange={(e) => setSocialGoal(e.target.value)}
          rows={2}
          required
        />

        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <Input
            label="Data de Limite para Próxima Revisão Judicial Trimestral"
            type="date"
            value={nextReviewDate}
            onChange={(e) => setNextReviewDate(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" type="button" icon={<Printer className="w-4 h-4" />} onClick={handlePrintPia}>
            Imprimir PIA (PDF)
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancelar
            </Button>
            {permissions.canEditChildren && (
              <Button variant="primary" size="sm" type="submit" icon={<Save className="w-4 h-4" />}>
                Salvar Atualização do PIA
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};
