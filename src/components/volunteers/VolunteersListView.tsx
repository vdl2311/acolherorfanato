import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Plus, Search, ShieldCheck, Clock, Calendar, Phone, Mail, Award, Download } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatDateBR, maskCPF } from '../../utils/formatters';
import { exportToCSV } from '../../utils/export';
import { VolunteerModal } from './VolunteerModal';

export const VolunteersListView: React.FC = () => {
  const { volunteersList = [], logAudit } = useApp();
  const { permissions } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = volunteersList.filter((v) => {
    const q = searchTerm.toLowerCase();
    return (
      !q ||
      v.fullName.toLowerCase().includes(q) ||
      v.activityRole.toLowerCase().includes(q) ||
      (v.email && v.email.toLowerCase().includes(q))
    );
  });

  const totalVolunteers = volunteersList.filter((v) => v.status === 'ativo').length;
  const totalHoursMonth = volunteersList.reduce((acc, v) => acc + (v.monthlyHours || 0), 0);

  const handleExportCSV = () => {
    logAudit('EXPORTAR', 'VOLUNTARIOS', 'Exportação de quadro de voluntários em CSV');
    const headers = ['Nome', 'Atividade', 'Escala', 'Horas/Mês', 'Telefone', 'Status', 'Termo Assinado', 'Antecedentes'];
    const rows = filtered.map((v) => [
      v.fullName,
      v.activityRole,
      v.availabilitySchedule,
      v.monthlyHours,
      v.phone,
      v.status,
      v.volunteerTermSigned ? 'Sim' : 'Não',
      v.backgroundCheckVerified ? 'Verificado' : 'Pendente',
    ]);
    exportToCSV('Quadro_Voluntarios_Lar_Sementes', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-sky-600" />
            Gestão de Voluntários & Oficinas Pedagógicas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quadro de voluntários ativos, escalas de atividades, verificação de segurança e conformidade com a Lei nº 9.608/1998.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {permissions.canExportData && (
            <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExportCSV}>
              Exportar
            </Button>
          )}

          {permissions.canEditVolunteers && (
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
              Cadastrar Voluntário
            </Button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950/50">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500">Voluntários Ativos</span>
            <p className="text-lg font-black text-slate-900 dark:text-slate-100">{totalVolunteers} Colaboradores</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500">Total de Horas Doadas/Mês</span>
            <p className="text-lg font-black text-slate-900 dark:text-slate-100">{totalHoursMonth} Horas Dedicadas</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500">Conformidade Legal & Segurança</span>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">100% Antecedentes Verificados</p>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar voluntário ou oficina..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>
      </Card>

      {/* Grid of Volunteer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((vol) => (
          <Card key={vol.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{vol.fullName}</h3>
                  <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold mt-0.5">{vol.activityRole}</p>
                </div>
                <Badge variant={vol.status === 'ativo' ? 'success' : 'neutral'}>
                  {vol.status.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <p className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <strong>Escala:</strong> {vol.availabilitySchedule}
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <strong>Carga Horária:</strong> {vol.monthlyHours}h / mês
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <strong>Contato:</strong> {vol.phone}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-[11px]">
                {vol.backgroundCheckVerified && (
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 font-semibold border border-emerald-200">
                    Antecedentes OK
                  </span>
                )}
                {vol.volunteerTermSigned && (
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 font-semibold border border-indigo-200">
                    Termo Lei 9.608/98 Assinado
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between">
              <span>Voluntário desde {formatDateBR(vol.startDate)}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <VolunteerModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
