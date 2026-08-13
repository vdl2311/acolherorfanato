import React, { useState } from 'react';
import { Volunteer } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, Select, Textarea } from '../common/Input';
import { useApp } from '../../context/AppContext';

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VolunteerModal: React.FC<VolunteerModalProps> = ({ isOpen, onClose }) => {
  const { addVolunteer } = useApp();

  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [activity, setActivity] = useState('Reforço Escolar & Tutoria');
  const [availability, setAvailability] = useState('Terças e Quintas - Tarde');
  const [hours, setHours] = useState('8');
  const [backgroundChecked, setBackgroundChecked] = useState(true);
  const [termSigned, setTermSigned] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    addVolunteer({
      fullName,
      cpf: cpf || undefined,
      phone,
      email: email || undefined,
      activityRole: activity,
      availabilitySchedule: availability,
      status: 'ativo',
      monthlyHours: Number(hours),
      backgroundCheckVerified: backgroundChecked,
      volunteerTermSigned: termSigned,
      startDate: new Date().toISOString().split('T')[0],
    });

    onClose();
    setFullName('');
    setPhone('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cadastrar Novo Voluntário"
      subtitle="Adesão ao Programa de Voluntariado Institucional em conformidade com a Lei nº 9.608/1998"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome Completo do Voluntário"
          placeholder="Ex: Dra. Juliana Menezes"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Telefone / WhatsApp"
            placeholder="(11) 97777-6666"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <Input
            label="E-mail"
            type="email"
            placeholder="voluntario@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Área de Atuação / Oficina"
            options={[
              { value: 'Reforço Escolar & Tutoria', label: 'Reforço Escolar & Tutoria' },
              { value: 'Recreação & Atividades Lúdicas', label: 'Recreação & Atividades Lúdicas' },
              { value: 'Oficina de Música & Artes', label: 'Oficina de Música & Artes' },
              { value: 'Apoio de Enfermagem & Saúde', label: 'Apoio de Enfermagem & Saúde' },
              { value: 'Bazar & Eventos Beneficentes', label: 'Bazar & Eventos Beneficentes' },
              { value: 'Culinária & Gastronomia', label: 'Culinária & Gastronomia' },
            ]}
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
          />

          <Input
            label="Horas Dedicadas Por Mês"
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            required
          />
        </div>

        <Input
          label="Escala de Disponibilidade"
          placeholder="Ex: Sábados das 14h às 17h"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          required
        />

        <Input
          label="CPF (Para consulta de antecedentes civis)"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
        />

        <div className="space-y-2 pt-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="bgCheck"
              checked={backgroundChecked}
              onChange={(e) => setBackgroundChecked(e.target.checked)}
              className="rounded text-sky-600"
            />
            <label htmlFor="bgCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Certidão Negativa de Antecedentes Criminais Verificada
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="termCheck"
              checked={termSigned}
              onChange={(e) => setTermSigned(e.target.checked)}
              className="rounded text-sky-600"
            />
            <label htmlFor="termCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Termo de Adesão ao Trabalho Voluntário Assinado (Lei 9.608/98)
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" type="submit">Cadastrar Voluntário</Button>
        </div>
      </form>
    </Modal>
  );
};
