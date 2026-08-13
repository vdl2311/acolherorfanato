import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Child, ChildStatus } from '../../types';
import {
  Search,
  Plus,
  Filter,
  User,
  Calendar,
  FileText,
  Eye,
  Edit2,
  Trash2,
  Heart,
  BookOpen,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { Badge, BadgeVariant } from '../common/Badge';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { calculateAge, formatDateBR } from '../../utils/formatters';
import { exportToCSV } from '../../utils/export';
import { ChildDetailModal } from './ChildDetailModal';
import { ChildFormModal } from './ChildFormModal';

interface ChildrenListViewProps {
  onSelectChild?: (child: Child) => void;
  onOpenCreateModal?: () => void;
  onEditChild?: (child: Child) => void;
}

export const ChildrenListView: React.FC<ChildrenListViewProps> = ({
  onSelectChild,
  onOpenCreateModal,
  onEditChild,
}) => {
  const { childrenList = [], deleteChild, logAudit } = useApp();
  const { permissions } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [sexFilter, setSexFilter] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Fallback local modal states
  const [selectedChildForDetail, setSelectedChildForDetail] = useState<Child | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [childToEdit, setChildToEdit] = useState<Child | null>(null);

  const handleSelectChild = (child: Child) => {
    if (onSelectChild) {
      onSelectChild(child);
    } else {
      setSelectedChildForDetail(child);
      setDetailModalOpen(true);
    }
  };

  const handleOpenCreateModal = () => {
    if (onOpenCreateModal) {
      onOpenCreateModal();
    } else {
      setChildToEdit(null);
      setFormModalOpen(true);
    }
  };

  const handleEditChild = (child: Child) => {
    if (onEditChild) {
      onEditChild(child);
    } else {
      setChildToEdit(child);
      setFormModalOpen(true);
    }
  };

  const filtered = childrenList.filter((child) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      child.fullName.toLowerCase().includes(q) ||
      child.code.toLowerCase().includes(q) ||
      (child.socialName && child.socialName.toLowerCase().includes(q)) ||
      (child.judicialProcessNumber && child.judicialProcessNumber.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'todos' || child.status === statusFilter;
    const matchesSex = sexFilter === 'todos' || child.sex === sexFilter;

    return matchesSearch && matchesStatus && matchesSex;
  });

  const getStatusBadge = (status: ChildStatus) => {
    switch (status) {
      case 'ativo':
        return <Badge variant="success">Ativo no Acolhimento</Badge>;
      case 'em_adocao':
        return <Badge variant="purple">Em Processo de Adoção</Badge>;
      case 'transferido':
        return <Badge variant="warning">Transferido</Badge>;
      case 'desacolhido':
        return <Badge variant="neutral">Desacolhido (Reintegrado/Maioridade)</Badge>;
    }
  };

  const handleExportCSV = () => {
    logAudit('EXPORTAR', 'ACOLHIDOS', 'Exportação de relatório CSV da lista de acolhidos');
    const headers = ['Código', 'Nome Completo', 'Nome Social', 'Data Nasc.', 'Sexo', 'Status', 'Data Entrada', 'Motivo Acolhimento', 'Nº Processo'];
    const rows = filtered.map((c) => [
      c.code,
      c.fullName,
      c.socialName || '-',
      c.birthDate,
      c.sex,
      c.status,
      c.admissionDate,
      c.admissionReason,
      c.judicialProcessNumber || '-',
    ]);
    exportToCSV('Relatorio_Acolhidos_Acolher', headers, rows);
  };

  const handleDelete = (child: Child) => {
    const reason = prompt(`Confirmar exclusão do cadastro de ${child.fullName}? Digite o motivo para auditoria:`);
    if (reason && reason.trim()) {
      deleteChild(child.id, reason.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User className="w-6 h-6 text-sky-600" />
            Crianças e Adolescentes Acolhidos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastro individual, acompanhamento de saúde, escolar, familiar, ocorrências e Plano Individual de Atendimento (PIA).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {permissions.canExportData && (
            <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExportCSV}>
              Exportar CSV
            </Button>
          )}

          {permissions.canEditChildren && (
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreateModal}>
              Cadastrar Acolhido
            </Button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, código, processo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Status:
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            >
              <option value="todos">Todos os Status</option>
              <option value="ativo">Ativo no Acolhimento</option>
              <option value="em_adocao">Em Processo de Adoção</option>
              <option value="transferido">Transferido</option>
              <option value="desacolhido">Desacolhido</option>
            </select>

            <select
              value={sexFilter}
              onChange={(e) => setSexFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            >
              <option value="todos">Todos os Sexos</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
            </select>

            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shrink-0">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 text-xs font-medium cursor-pointer ${
                  viewMode === 'cards' ? 'bg-sky-600 text-white' : 'bg-slate-50 text-slate-600 dark:bg-slate-800'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-xs font-medium cursor-pointer ${
                  viewMode === 'table' ? 'bg-sky-600 text-white' : 'bg-slate-50 text-slate-600 dark:bg-slate-800'
                }`}
              >
                Tabela
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Main List Display */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhum acolhido encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Ajuste os filtros de busca ou cadastre um novo acolhido para começar.
          </p>
        </Card>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((child) => {
            const ageInfo = calculateAge(child.birthDate);
            return (
              <Card key={child.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  {/* Card Header: Photo & Code */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={child.photoUrl || 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80'}
                        alt={child.fullName}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                      />
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 line-clamp-1">
                          {child.fullName}
                        </h3>
                        {child.socialName && (
                          <p className="text-xs text-sky-600 font-semibold">"{child.socialName}"</p>
                        )}
                        <p className="text-xs text-slate-500 mt-0.5">{ageInfo.text}</p>
                      </div>
                    </div>
                    <Badge variant="cyan">{child.code}</Badge>
                  </div>

                  {/* Status & Legal Details */}
                  <div>{getStatusBadge(child.status)}</div>

                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="truncate">
                      <strong>Entrada:</strong> {formatDateBR(child.admissionDate)}
                    </p>
                    <p className="truncate">
                      <strong>Origem:</strong> {child.originFacility}
                    </p>
                    <p className="truncate">
                      <strong>Processo:</strong> {child.judicialProcessNumber || 'Em autuação'}
                    </p>
                  </div>

                  {/* Quick Indicator Tags */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px]">
                    {child.allergies.length > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/40 font-semibold border border-rose-200">
                        {child.allergies.length} Alergia(s)
                      </span>
                    )}
                    {child.piaPlan && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 font-semibold border border-indigo-200">
                        PIA Vigente
                      </span>
                    )}
                    {child.educationHistory.length > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 dark:bg-sky-950/40 font-semibold border border-sky-200">
                        Matriculado
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => handleSelectChild(child)}
                  >
                    Prontuário Completo
                  </Button>

                  <div className="flex items-center gap-1">
                    {permissions.canEditChildren && (
                      <button
                        onClick={() => handleEditChild(child)}
                        className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Editar Acolhido"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    {permissions.canEditChildren && (
                      <button
                        onClick={() => handleDelete(child)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Excluir do cadastro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs min-w-[750px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="p-3 whitespace-nowrap">Código</th>
                  <th className="p-3">Nome do Acolhido</th>
                  <th className="p-3 whitespace-nowrap">Idade / Nasc.</th>
                  <th className="p-3 whitespace-nowrap">Status</th>
                  <th className="p-3 whitespace-nowrap">Entrada</th>
                  <th className="p-3 whitespace-nowrap">Processo Judicial</th>
                  <th className="p-3 text-right whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((child) => (
                  <tr key={child.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-sky-600 whitespace-nowrap">{child.code}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{child.fullName}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {calculateAge(child.birthDate).text} ({formatDateBR(child.birthDate)})
                    </td>
                    <td className="p-3 whitespace-nowrap">{getStatusBadge(child.status)}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{formatDateBR(child.admissionDate)}</td>
                    <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{child.judicialProcessNumber || 'S/N'}</td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <Button size="sm" variant="ghost" onClick={() => handleSelectChild(child)}>
                        Ver Prontuário
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Fallback Modals when rendered standalone */}
      <ChildDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        child={selectedChildForDetail}
        onEdit={(child) => {
          setDetailModalOpen(false);
          handleEditChild(child);
        }}
      />

      <ChildFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        initialChild={childToEdit}
      />
    </div>
  );
};
