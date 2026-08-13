import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Transaction } from '../../types';
import { DollarSign, Plus, Search, Filter, Download, ArrowUpRight, ArrowDownRight, Wallet, CheckCircle, Clock } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDateBR } from '../../utils/formatters';
import { exportToCSV } from '../../utils/export';
import { TransactionModal } from './TransactionModal';

export const FinancialListView: React.FC = () => {
  const { transactionsList = [], logAudit } = useApp();
  const { permissions } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  const filtered = transactionsList.filter((t) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.supplierOrPayee && t.supplierOrPayee.toLowerCase().includes(q)) ||
      (t.documentNumber && t.documentNumber.toLowerCase().includes(q));

    const matchesType = typeFilter === 'todos' || t.type === typeFilter;
    const matchesStatus = statusFilter === 'todos' || t.paymentStatus === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalEntradas = transactionsList
    .filter((t) => t.type === 'entrada' && t.paymentStatus === 'pago')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSaidas = transactionsList
    .filter((t) => t.type === 'saida' && t.paymentStatus === 'pago')
    .reduce((acc, t) => acc + t.amount, 0);

  const saldoAtual = totalEntradas - totalSaidas;

  const totalPendentesPagar = transactionsList
    .filter((t) => t.type === 'saida' && t.paymentStatus === 'pendente')
    .reduce((acc, t) => acc + t.amount, 0);

  const handleExportCSV = () => {
    logAudit('EXPORTAR', 'FINANCEIRO', 'Exportação de balancete financeiro em formato CSV');
    const headers = ['Vencimento', 'Descrição', 'Tipo', 'Categoria', 'Centro Custo', 'Valor (R$)', 'Status', 'Fornecedor', 'Comprovante'];
    const rows = filtered.map((t) => [
      t.dueDate,
      t.description,
      t.type,
      t.category,
      t.costCenter,
      t.amount.toFixed(2),
      t.paymentStatus,
      t.supplierOrPayee || '-',
      t.documentNumber || '-',
    ]);
    exportToCSV('Balancete_Financeiro_Acolhimento', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            Gestão Financeira & Prestação de Contas (SUAS)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Fluxo de caixa, controle de subvenções públicas, despesas de custeio e balancete contábil.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {permissions.canExportData && (
            <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExportCSV}>
              Exportar Balancete
            </Button>
          )}

          {permissions.canEditFinancial && (
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
              Lançamento Financeiro
            </Button>
          )}
        </div>
      </div>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total Receitas (Entradas)</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(totalEntradas)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Subvenções e Doações quitadas</span>
        </Card>

        <Card className="p-4 border-l-4 border-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total Despesas (Saídas)</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {formatCurrency(totalSaidas)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Custeio e manutenção pagos</span>
        </Card>

        <Card className="p-4 border-l-4 border-sky-500">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Saldo em Caixa & Bancos</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/40">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-xl font-black mt-2 ${saldoAtual >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-rose-600'}`}>
            {formatCurrency(saldoAtual)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Saldo operacional em contas</span>
        </Card>

        <Card className="p-4 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">A Pagar (Contas Pendentes)</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {formatCurrency(totalPendentesPagar)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Compromissos a liquidar</span>
        </Card>
      </div>

      {/* Toolbar Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar lançamento, fornecedor, nota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            >
              <option value="todos">Todas os Tipos</option>
              <option value="entrada">Entradas (Receitas)</option>
              <option value="saida">Saídas (Despesas)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            >
              <option value="todos">Todos os Status</option>
              <option value="pago">Pago / Quitado</option>
              <option value="pendente">Pendente / A Pagar</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Financial Transactions Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs min-w-[720px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase tracking-wider font-bold">
                <th className="p-3 whitespace-nowrap">Vencimento</th>
                <th className="p-3">Descrição / Fornecedor</th>
                <th className="p-3 whitespace-nowrap">Categoria</th>
                <th className="p-3 whitespace-nowrap">Centro de Custo</th>
                <th className="p-3 whitespace-nowrap">Valor (R$)</th>
                <th className="p-3 whitespace-nowrap">Status</th>
                <th className="p-3 text-right whitespace-nowrap">Comprovante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{formatDateBR(t.dueDate)}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                    {t.description}
                    {t.supplierOrPayee && (
                      <span className="text-[10px] text-slate-400 block font-normal">{t.supplierOrPayee}</span>
                    )}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{t.category}</td>
                  <td className="p-3 text-slate-500 font-medium whitespace-nowrap">{t.costCenter}</td>
                  <td className="p-3 font-extrabold text-sm whitespace-nowrap">
                    <span className={t.type === 'entrada' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                      {t.type === 'entrada' ? '+' : '-'} {formatCurrency(t.amount)}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <Badge variant={t.paymentStatus === 'pago' ? 'success' : 'warning'}>
                      {t.paymentStatus === 'pago' ? 'Pago' : 'Pendente'}
                    </Badge>
                  </td>
                  <td className="p-3 text-right font-mono text-slate-500 whitespace-nowrap">{t.documentNumber || 'S/N'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <TransactionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
