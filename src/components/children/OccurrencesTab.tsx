import React, { useState } from 'react';
import { Child, Occurrence, UserRole } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Activity, Plus, AlertCircle, Sparkles, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Input, Select, Textarea } from '../common/Input';
import { formatDateBR } from '../../utils/formatters';

interface OccurrencesTabProps {
  child: Child;
}

export const OccurrencesTab: React.FC<OccurrencesTabProps> = ({ child }) => {
  const { addOccurrence } = useApp();
  const { currentUser, currentRole } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState<Occurrence['category']>('oficina');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Occurrence['severity']>('baixa');
  const [actionTaken, setActionTaken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    addOccurrence(child.id, {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      category,
      title,
      description,
      reportedBy: currentUser.name,
      reporterRole: currentRole as UserRole,
      severity,
      actionTaken: actionTaken || undefined,
    });

    setModalOpen(false);
    setTitle('');
    setDescription('');
    setActionTaken('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-600" />
            Diário de Bordo & Ocorrências Diárias
          </h3>
          <p className="text-xs text-slate-500">Registro de rotina, oficinas pedagógicas, comportamento e acontecimentos relevantes.</p>
        </div>

        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
          Registrar Ocorrência / Atividade
        </Button>
      </div>

      {/* Occurrences Stream */}
      {child.occurrences.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
          Nenhuma ocorrência ou atividade registrada até o momento.
        </div>
      ) : (
        <div className="space-y-3">
          {child.occurrences.map((occ) => (
            <div key={occ.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{occ.title}</span>
                  <Badge variant={occ.severity === 'alta' || occ.severity === 'critica' ? 'error' : occ.severity === 'media' ? 'warning' : 'info'}>
                    {occ.category}
                  </Badge>
                </div>
                <span className="font-mono text-slate-400">
                  {formatDateBR(occ.date)} às {occ.time}
                </span>
              </div>

              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{occ.description}</p>

              {occ.actionTaken && (
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                  <strong>Medida Adotada / Conduta:</strong> {occ.actionTaken}
                </div>
              )}

              <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <span>Registrado por: <strong>{occ.reportedBy}</strong> ({occ.reporterRole})</span>
                <span className="capitalize">Gravidade: {occ.severity}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Occurrence */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nova Ocorrência / Atividade Diária" maxWidth="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Categoria"
              options={[
                { value: 'oficina', label: 'Oficina / Atividade Pedagógica' },
                { value: 'comportamental', label: 'Comportamental / Convivência' },
                { value: 'saude', label: 'Saúde / Ocorrência Médica' },
                { value: 'escolar', label: 'Escolar / Desempenho' },
                { value: 'visita_familiar', label: 'Visita Familiar' },
                { value: 'judicial', label: 'Acompanhamento Judicial / Audiência' },
                { value: 'outros', label: 'Outros' },
              ]}
              value={category}
              onChange={(e) => setCategory(e.target.value as Occurrence['category'])}
            />

            <Select
              label="Nível de Relevância / Gravidade"
              options={[
                { value: 'baixa', label: 'Baixa (Rotina / Elogio)' },
                { value: 'media', label: 'Média (Atenção moderada)' },
                { value: 'alta', label: 'Alta (Intervenção imediata)' },
                { value: 'critica', label: 'Crítica (Alerta institucional)' },
              ]}
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Occurrence['severity'])}
            />
          </div>

          <Input label="Título Curto da Ocorrência" placeholder="Ex: Participação na Oficina de Artes" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea label="Descrição Detalhada do Fato" placeholder="Relate com objetividade os fatos observados..." value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} />
          <Textarea label="Providências / Ação Adotada Pela Equipe" placeholder="Encaminhamento, orientação verbal, comunicação ao serviço social..." value={actionTaken} onChange={(e) => setActionTaken(e.target.value)} rows={2} />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" type="submit">Salvar Ocorrência</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
