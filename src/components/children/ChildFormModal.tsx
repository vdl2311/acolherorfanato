import React, { useState, useEffect } from 'react';
import { Child, ChildStatus, SexType } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, Select, Textarea } from '../common/Input';
import { useApp } from '../../context/AppContext';

interface ChildFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialChild?: Child | null;
}

export const ChildFormModal: React.FC<ChildFormModalProps> = ({
  isOpen,
  onClose,
  initialChild,
}) => {
  const { addChild, updateChild } = useApp();

  const [fullName, setFullName] = useState('');
  const [socialName, setSocialName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [sex, setSex] = useState<SexType>('masculino');
  const [status, setStatus] = useState<ChildStatus>('ativo');
  const [admissionDate, setAdmissionDate] = useState('');
  const [admissionReason, setAdmissionReason] = useState('');
  const [originFacility, setOriginFacility] = useState('');
  const [processNum, setProcessNum] = useState('');
  const [judge, setJudge] = useState('');
  const [court, setCourt] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialChild) {
      setFullName(initialChild.fullName);
      setSocialName(initialChild.socialName || '');
      setPhotoUrl(initialChild.photoUrl || '');
      setBirthDate(initialChild.birthDate);
      setSex(initialChild.sex);
      setStatus(initialChild.status);
      setAdmissionDate(initialChild.admissionDate);
      setAdmissionReason(initialChild.admissionReason);
      setOriginFacility(initialChild.originFacility);
      setProcessNum(initialChild.judicialProcessNumber || '');
      setJudge(initialChild.responsibleJudge || '');
      setCourt(initialChild.courtDistrict || '');
      setCpf(initialChild.cpf || '');
      setRg(initialChild.rg || '');
      setNotes(initialChild.generalNotes || '');
    } else {
      setFullName('');
      setSocialName('');
      setPhotoUrl('');
      setBirthDate('');
      setSex('masculino');
      setStatus('ativo');
      setAdmissionDate(new Date().toISOString().split('T')[0]);
      setAdmissionReason('');
      setOriginFacility('Conselho Tutelar');
      setProcessNum('');
      setJudge('');
      setCourt('');
      setCpf('');
      setRg('');
      setNotes('');
    }
  }, [initialChild, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !birthDate || !admissionReason) return;

    if (initialChild) {
      updateChild(initialChild.id, {
        fullName,
        socialName: socialName || undefined,
        photoUrl: photoUrl || undefined,
        birthDate,
        sex,
        status,
        admissionDate,
        admissionReason,
        originFacility,
        judicialProcessNumber: processNum || undefined,
        responsibleJudge: judge || undefined,
        courtDistrict: court || undefined,
        cpf: cpf || undefined,
        rg: rg || undefined,
        generalNotes: notes || undefined,
      });
    } else {
      addChild({
        fullName,
        socialName: socialName || undefined,
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=200&auto=format&fit=crop&q=80',
        birthDate,
        sex,
        status,
        admissionDate,
        admissionReason,
        originFacility,
        judicialProcessNumber: processNum || undefined,
        responsibleJudge: judge || undefined,
        courtDistrict: court || undefined,
        cpf: cpf || undefined,
        rg: rg || undefined,
        allergies: [],
        continuousMedications: [],
        healthHistory: [],
        educationHistory: [],
        familyMembers: [],
        occurrences: [],
        documents: [],
        generalNotes: notes || undefined,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialChild ? `Editar Cadastro: ${initialChild.fullName}` : 'Novo Cadastro de Acolhido'}
      subtitle="Ficha de identificação para acolhimento infantojuvenil em conformidade com o ECA"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Nome Completo do Acolhido" placeholder="Ex: Gabriel Henrique da Silva" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input label="Nome Social / Apelido (Se houver)" placeholder="Ex: Biel" value={socialName} onChange={(e) => setSocialName(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input label="Data de Nascimento" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
          <Select
            label="Sexo"
            options={[
              { value: 'masculino', label: 'Masculino' },
              { value: 'feminino', label: 'Feminino' },
              { value: 'outro', label: 'Outro' },
            ]}
            value={sex}
            onChange={(e) => setSex(e.target.value as SexType)}
          />
          <Select
            label="Status de Permanência"
            options={[
              { value: 'ativo', label: 'Ativo no Acolhimento' },
              { value: 'em_adocao', label: 'Em Processo de Adoção' },
              { value: 'transferido', label: 'Transferido de Casa' },
              { value: 'desacolhido', label: 'Desacolhido (Reintegrado/Maioridade)' },
            ]}
            value={status}
            onChange={(e) => setStatus(e.target.value as ChildStatus)}
          />
        </div>

        {/* Admission Data */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dados do Acolhimento Judicial</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Data de Acolhimento / Entrada" type="date" value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} required />
            <Input label="Órgão de Origem / Solicitante" placeholder="Ex: Conselho Tutelar Zona Sul" value={originFacility} onChange={(e) => setOriginFacility(e.target.value)} required />
          </div>

          <Textarea label="Motivo do Acolhimento (Medida Protetiva / Vulnerabilidade)" placeholder="Descreva sucintamente o motivo do encaminhamento judicial..." value={admissionReason} onChange={(e) => setAdmissionReason(e.target.value)} required rows={2} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Nº do Processo Judicial" placeholder="0000000-00.2026.8.26.0001" value={processNum} onChange={(e) => setProcessNum(e.target.value)} />
            <Input label="Juiz(a) Responsável" placeholder="Dra. Patricia Alcantara" value={judge} onChange={(e) => setJudge(e.target.value)} />
            <Input label="Vara / Comarca" placeholder="1ª Vara da Infância" value={court} onChange={(e) => setCourt(e.target.value)} />
          </div>
        </div>

        {/* Civil Documents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="CPF (Opcional)" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(e.target.value)} />
          <Input label="RG (Opcional)" placeholder="00.000.000-0" value={rg} onChange={(e) => setRg(e.target.value)} />
        </div>

        <Textarea label="Observações Gerais da Equipe Técnica" placeholder="Outros detalhes sobre comportamento, alimentação, preferências..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" type="submit">
            {initialChild ? 'Salvar Alterações' : 'Concluir Cadastro'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
