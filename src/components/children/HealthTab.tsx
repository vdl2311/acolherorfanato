import React, { useState } from 'react';
import { Child, HealthRecord, Allergy, ContinuousMedication } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Heart, Stethoscope, Syringe, AlertTriangle, Plus, ShieldAlert, Lock } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatDateBR } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { Input, Select, Textarea } from '../common/Input';

interface HealthTabProps {
  child: Child;
}

export const HealthTab: React.FC<HealthTabProps> = ({ child }) => {
  const { addHealthRecord } = useApp();
  const { permissions, currentRole } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [recordType, setRecordType] = useState<HealthRecord['type']>('consulta');
  const [title, setTitle] = useState('');
  const [doctor, setDoctor] = useState('');
  const [facility, setFacility] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);

  const canViewConfidential = permissions.canViewMedical || currentRole === 'admin' || currentRole === 'profissional_saude' || currentRole === 'assistente_social';

  const handleSubmitRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !doctor || !diagnosis) return;

    addHealthRecord(child.id, {
      date: new Date().toISOString().split('T')[0],
      type: recordType,
      title,
      doctorOrProfessional: doctor,
      facility: facility || 'Unidade de Atendimento',
      diagnosisOrReason: diagnosis,
      prescriptionOrTreatment: prescription,
      nextFollowUpDate: nextDate || undefined,
      isConfidential,
    });

    setModalOpen(false);
    setTitle('');
    setDoctor('');
    setDiagnosis('');
    setPrescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            Prontuário de Saúde & Acompanhamento Médico
          </h3>
          <p className="text-xs text-slate-500">Histórico de consultas, vacinas, alergias e medicações contínuas.</p>
        </div>

        {permissions.canEditMedical && (
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
            Adicionar Registro de Saúde
          </Button>
        )}
      </div>

      {/* Allergies & Continuous Meds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Allergies Box */}
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 dark:bg-rose-950/20 dark:border-rose-900">
          <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> Alergias & Intolerâncias Registradas
          </h4>
          {child.allergies.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Nenhuma alergia relatada ou diagnosticada.</p>
          ) : (
            <div className="space-y-2">
              {child.allergies.map((alg) => (
                <div key={alg.id} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/60 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-rose-900 dark:text-rose-200">{alg.allergen}</span>
                    <Badge variant={alg.severity === 'grave' ? 'error' : 'warning'}>
                      Gravidade: {alg.severity}
                    </Badge>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">{alg.reaction}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Continuous Medications Box */}
        <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/40 dark:bg-sky-950/20 dark:border-sky-900">
          <h4 className="text-xs font-bold text-sky-900 dark:text-sky-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Syringe className="w-4 h-4 text-sky-600" /> Medicamentos de Uso Contínuo
          </h4>
          {child.continuousMedications.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Nenhum medicamento contínuo prescrito.</p>
          ) : (
            <div className="space-y-2">
              {child.continuousMedications.map((med) => (
                <div key={med.id} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-sky-100 dark:border-sky-900/60 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sky-900 dark:text-sky-200">{med.medicationName}</span>
                    <span className="font-mono text-[11px] text-sky-700 dark:text-sky-300">{med.dosage}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">Frequência: {med.frequency}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Prescrito por: {med.prescribedBy}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Consultations & Medical History Stream */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Histórico Clínico e Consultas</h4>
        {child.healthHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
            Nenhum histórico médico registrado ainda.
          </div>
        ) : (
          child.healthHistory.map((rec) => {
            if (rec.isConfidential && !canViewConfidential) {
              return (
                <div key={rec.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center gap-3">
                  <Lock className="w-5 h-5 text-amber-500" />
                  <div className="text-xs text-slate-500">
                    <p className="font-bold text-slate-700 dark:text-slate-300">Atendimento Médico/Psicológico Sigiloso</p>
                    <p className="text-[11px]">Acesso restrito ao Profissional de Saúde e Assistente Social responsável.</p>
                  </div>
                </div>
              );
            }

            return (
              <div key={rec.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{rec.title}</span>
                    <Badge variant="cyan">{rec.type}</Badge>
                    {rec.isConfidential && <Badge variant="warning">Confidencial</Badge>}
                  </div>
                  <span className="font-mono text-slate-400">{formatDateBR(rec.date)}</span>
                </div>

                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Profissional/Local:</strong> {rec.doctorOrProfessional} ({rec.facility})
                </p>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong>Diagnóstico/Parecer:</strong> {rec.diagnosisOrReason}
                  </p>
                  {rec.prescriptionOrTreatment && (
                    <p className="text-slate-600 dark:text-slate-400 mt-1.5 border-t border-slate-200 dark:border-slate-700 pt-1.5">
                      <strong>Prescrição / Conduta:</strong> {rec.prescriptionOrTreatment}
                    </p>
                  )}
                </div>

                {rec.nextFollowUpDate && (
                  <p className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                    Próximo Retorno Agendado: {formatDateBR(rec.nextFollowUpDate)}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add Health Record */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Novo Registro de Saúde / Consulta" maxWidth="lg">
        <form onSubmit={handleSubmitRecord} className="space-y-4">
          <Select
            label="Tipo de Atendimento"
            options={[
              { value: 'consulta', label: 'Consulta Pediátrica/Geral' },
              { value: 'vacina', label: 'Vacinação' },
              { value: 'medicamento', label: 'Prescrição de Medicamento' },
              { value: 'exame', label: 'Exame Laboratorial/Imagem' },
              { value: 'atendimento_psicologico', label: 'Atendimento Psicológico (Confidencial)' },
              { value: 'emergencia', label: 'Atendimento de Urgência/Hospitalar' },
            ]}
            value={recordType}
            onChange={(e) => setRecordType(e.target.value as HealthRecord['type'])}
          />

          <Input label="Título / Motivo do Atendimento" placeholder="Ex: Puericultura Trimestral" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Médico / Profissional de Saúde" placeholder="Dr. Nome (CRM)" value={doctor} onChange={(e) => setDoctor(e.target.value)} required />
            <Input label="Unidade de Saúde / Hospital" placeholder="UBS Central" value={facility} onChange={(e) => setFacility(e.target.value)} />
          </div>

          <Textarea label="Diagnóstico / Parecer Clínico" placeholder="Descreva os achados do exame clínico..." value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required rows={3} />
          <Textarea label="Tratamento / Medicamentos Prescritos" placeholder="Posologia, repouso, condutas..." value={prescription} onChange={(e) => setPrescription(e.target.value)} rows={2} />
          <Input label="Data do Próximo Retorno (Se houver)" type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="confidential" checked={isConfidential} onChange={(e) => setIsConfidential(e.target.checked)} className="rounded text-sky-600" />
            <label htmlFor="confidential" className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Marcar como registro sensível/confidencial (Visível apenas para equipe de Saúde/Assistência Social)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" type="submit">Salvar Registro</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
