import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Eye, Download, Search, FileText, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatDateTimeBR } from '../../utils/formatters';
import { exportToCSV } from '../../utils/export';

export const LgpdAuditView: React.FC = () => {
  const { auditLogsList = [], logAudit } = useApp();
  const { permissions, currentRole } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('todos');

  const filteredLogs = auditLogsList.filter((log) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      log.userName.toLowerCase().includes(q) ||
      log.targetDescription.toLowerCase().includes(q) ||
      (log.justification && log.justification.toLowerCase().includes(q));

    const matchesAction = actionFilter === 'todos' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleExportCSV = () => {
    logAudit('EXPORTAR', 'LGPD', 'Exportação de trilha de auditoria e registros LGPD');
    const headers = ['Data/Hora', 'Usuário', 'Perfil', 'Ação', 'Módulo', 'Alvo', 'Justificativa LGPD'];
    const rows = filteredLogs.map((l) => [
      formatDateTimeBR(l.timestamp),
      l.userName,
      l.userRole,
      l.action,
      l.targetType,
      l.targetDescription,
      l.justification || '-',
    ]);
    exportToCSV('Trilha_Auditoria_LGPD_Lar_Sementes', headers, rows);
  };

  const permissionMatrix = [
    { module: 'Dados Pessoais do Acolhido', admin: 'Total', assistente: 'Total', saude: 'Somente Leitura', educador: 'Sem Acesso CPF/Proc.', financeiro: 'Sem Acesso' },
    { module: 'Prontuário Médico e Vacinas', admin: 'Total', assistente: 'Leitura/Edição', saude: 'Total Completo', educador: 'Somente Alergias', financeiro: 'Sem Acesso' },
    { module: 'Histórico Escolar', admin: 'Total', assistente: 'Total', saude: 'Leitura', educador: 'Total Completo', financeiro: 'Sem Acesso' },
    { module: 'Vínculo Familiar & Processo', admin: 'Total', assistente: 'Total Completo', saude: 'Sem Acesso', educador: 'Sem Acesso', financeiro: 'Sem Acesso' },
    { module: 'Movimentação Financeira', admin: 'Total', assistente: 'Sem Acesso', saude: 'Sem Acesso', educador: 'Sem Acesso', financeiro: 'Total Completo' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-sky-600" />
            Conformidade LGPD & Trilha de Auditoria
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro imutável de acessos a dados sensíveis (Lei 13.709/2018), segredo de justiça ECA e matriz de permissões por perfil.
          </p>
        </div>

        {permissions.canExportData && (
          <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExportCSV}>
            Exportar Auditoria (CSV)
          </Button>
        )}
      </div>

      {/* LGPD Banner */}
      <Card className="p-5 bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white shadow-md">
        <div className="flex items-start gap-3">
          <Lock className="w-6 h-6 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Proteção de Dados Sensíveis de Crianças e Adolescentes</h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Em estrita conformidade com o Art. 14 da LGPD (Lei nº 13.709/2018) e o Princípio do Melhor Interesse do Acolhido (ECA - Lei nº 8.069/1990), o acesso a CPFs, nomes de familiares e processos judiciais é criptografado, mascarado na interface e auditado com obrigatoriedade de justificativa prévia.
            </p>
          </div>
        </div>
      </Card>

      {/* Audit Logs Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Histórico em Tempo Real de Acessos Auditados
          </h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar log ou usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              />
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            >
              <option value="todos">Todas as Ações</option>
              <option value="VISUALIZAR_SENSIVEL">LGPD Sensível</option>
              <option value="CRIAR">Criar</option>
              <option value="EDITAR">Editar</option>
              <option value="EXCLUIR">Excluir</option>
              <option value="EXPORTAR">Exportar</option>
            </select>
          </div>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="p-3">Data / Hora</th>
                  <th className="p-3">Usuário & Perfil</th>
                  <th className="p-3">Ação</th>
                  <th className="p-3">Descrição do Evento</th>
                  <th className="p-3">Justificativa Registrada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-mono text-slate-400 whitespace-nowrap">
                      {formatDateTimeBR(log.timestamp)}
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                      {log.userName}
                      <span className="text-[10px] text-slate-400 block font-normal">{log.userRole}</span>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          log.action === 'VISUALIZAR_SENSIVEL'
                            ? 'warning'
                            : log.action === 'EXCLUIR'
                            ? 'error'
                            : log.action === 'CRIAR'
                            ? 'success'
                            : 'info'
                        }
                      >
                        {log.action}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                      {log.targetDescription}
                    </td>
                    <td className="p-3">
                      {log.justification ? (
                        <span className="font-mono text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded">
                          "{log.justification}"
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Security Matrix */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Matriz Institucional de Controle de Acesso (RBAC)
        </h3>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="p-3">Módulo de Dados</th>
                  <th className="p-3">Administrador</th>
                  <th className="p-3">Assistente Social</th>
                  <th className="p-3">Profissional Saúde</th>
                  <th className="p-3">Educador / Cuidador</th>
                  <th className="p-3">Financeiro / Doador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {permissionMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{row.module}</td>
                    <td className="p-3 text-emerald-600 font-semibold">{row.admin}</td>
                    <td className="p-3 text-emerald-600 font-semibold">{row.assistente}</td>
                    <td className="p-3 text-sky-600 font-semibold">{row.saude}</td>
                    <td className="p-3 text-amber-600 font-semibold">{row.educador}</td>
                    <td className="p-3 text-slate-400">{row.financeiro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
