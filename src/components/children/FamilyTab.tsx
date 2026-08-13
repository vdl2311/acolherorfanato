import React, { useState } from 'react';
import { Child, FamilyMember } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Users, UserCheck, Plus, Clock, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Input, Textarea } from '../common/Input';
import { MaskedText } from '../common/MaskedText';
import { maskCPF } from '../../utils/formatters';

interface FamilyTabProps {
  child: Child;
}

export const FamilyTab: React.FC<FamilyTabProps> = ({ child }) => {
  const { addFamilyMember } = useApp();
  const { permissions, currentRole } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [cpf, setCpf] = useState('');
  const [authorized, setAuthorized] = useState(true);
  const [visitation, setVisitation] = useState('');
  const [notes, setNotes] = useState('');

  const canViewFamily = permissions.canViewLegalFamily || currentRole === 'admin' || currentRole === 'assistente_social' || currentRole === 'gestor';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !relationship) return;

    addFamilyMember(child.id, {
      name,
      relationship,
      phone: phone || undefined,
      address: address || undefined,
      cpf: cpf || undefined,
      authorizedVisitor: authorized,
      visitationSchedule: visitation || undefined,
      notes: notes || undefined,
    });

    setModalOpen(false);
    setName('');
    setRelationship('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Vínculo Familiar & Visitantes Autorizados
          </h3>
          <p className="text-xs text-slate-500">
            Membros da família biológica/extensa, agendamento de visitas judiciais e reintegração familiar.
          </p>
        </div>

        {canViewFamily && (
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
            Cadastrar Familiar / Visitante
          </Button>
        )}
      </div>

      {!canViewFamily ? (
        <div className="p-8 text-center text-xs text-slate-400 border border-amber-200 bg-amber-50 rounded-xl">
          Informações judiciais e familiares restritas à equipe do Serviço Social e Gestão.
        </div>
      ) : child.familyMembers.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
          Nenhum familiar ou visitante cadastrado para este acolhido.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {child.familyMembers.map((fam) => (
            <div key={fam.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{fam.name}</h4>
                  <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 mt-0.5">{fam.relationship}</p>
                </div>

                <Badge variant={fam.authorizedVisitor ? 'success' : 'error'}>
                  {fam.authorizedVisitor ? 'Visita Autorizada' : 'Visita Suspensa'}
                </Badge>
              </div>

              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                {fam.cpf && (
                  <div className="flex items-center gap-2">
                    <strong>CPF:</strong>
                    <MaskedText
                      value={fam.cpf}
                      maskedValue={maskCPF(fam.cpf)}
                      label="CPF do Familiar"
                      targetId={child.id}
                      targetDescription={`CPF de ${fam.name} (${fam.relationship})`}
                      sensitiveType="cpf"
                    />
                  </div>
                )}

                {fam.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <strong>Telefone:</strong> {fam.phone}
                  </p>
                )}

                {fam.address && (
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <strong>Endereço:</strong> {fam.address}
                  </p>
                )}

                {fam.visitationSchedule && (
                  <p className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-semibold pt-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <strong>Horário de Visitas:</strong> {fam.visitationSchedule}
                  </p>
                )}
              </div>

              {fam.notes && (
                <div className="text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-800/20 p-2.5 rounded-lg border">
                  "{fam.notes}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Family Member */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Cadastrar Familiar / Visitante" maxWidth="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome Completo" placeholder="Nome do familiar" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Grau de Parentesco / Relação" placeholder="Ex: Mãe Biológica, Avó, Tio" value={relationship} onChange={(e) => setRelationship(e.target.value)} required />
            <Input label="CPF (Protegido LGPD)" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Telefone de Contato" placeholder="(11) 99999-8888" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="Escala / Horário de Visitas" placeholder="Ex: Sábados quinzenais 14h às 16h" value={visitation} onChange={(e) => setVisitation(e.target.value)} />
          </div>

          <Input label="Endereço Residencial" placeholder="Rua, Número, Bairro, Cidade/UF" value={address} onChange={(e) => setAddress(e.target.value)} />
          <Textarea label="Observações Sociais e Determinações Judiciais" placeholder="Acompanhamento do CRAS, supervisão do assistente social..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="authorized" checked={authorized} onChange={(e) => setAuthorized(e.target.checked)} className="rounded text-sky-600" />
            <label htmlFor="authorized" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Visitante com Autorização Judicial Deferida
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" type="submit">Salvar Familiar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
