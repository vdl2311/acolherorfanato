import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from './StatCard';
import { AgeDistributionChart } from './AgeDistributionChart';
import { DonationsFinanceChart } from './DonationsFinanceChart';
import { PendingAlertsWidget } from './PendingAlertsWidget';
import { RecentActivityWidget } from './RecentActivityWidget';
import { Users, HeartHandshake, DollarSign, PlusCircle, FileText, Shield, ArrowUpRight, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../common/Button';

interface DashboardViewProps {
  onOpenChildModal: () => void;
  onOpenDonationModal: () => void;
  onOpenTransactionModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenChildModal,
  onOpenDonationModal,
  onOpenTransactionModal,
}) => {
  const { childrenList = [], donationsList = [], transactionsList = [], auditLogsList = [], settings, setActiveTab } = useApp();
  const { currentUser, permissions } = useAuth();

  const activeChildren = childrenList.filter((c) => c.status === 'ativo').length;
  const newAdmissionsMonth = childrenList.filter(
    (c) => c.admissionDate && c.admissionDate.startsWith('2026-08')
  ).length;

  const totalDonationsAmountMonth = donationsList
    .filter((d) => d.type === 'financeira' && d.date.startsWith('2026-08'))
    .reduce((acc, d) => acc + (d.amount || 0), 0);

  const totalEntradas = transactionsList
    .filter((t) => t.type === 'entrada' && t.paymentStatus === 'pago')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSaidas = transactionsList
    .filter((t) => t.type === 'saida' && t.paymentStatus === 'pago')
    .reduce((acc, t) => acc + t.amount, 0);

  const currentBalance = totalEntradas - totalSaidas;

  return (
    <div className="space-y-6">
      {/* Top Banner Greeting */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs">
              CNPJ: {settings.cnpj}
            </span>
            <span className="text-xs text-sky-200">Capacidade: {activeChildren}/{settings.maxCapacity} acolhidos</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Painel Administrativo — {settings.institutionName}
          </h2>
          <p className="text-xs text-sky-100 max-w-2xl">
            Gestão integrada de acolhimento infantojuvenil, acompanhamento em conformidade com ECA e LGPD.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {permissions.canEditChildren && (
            <Button
              variant="secondary"
              size="sm"
              icon={<PlusCircle className="w-4 h-4 text-sky-600" />}
              onClick={onOpenChildModal}
            >
              Novo Acolhido
            </Button>
          )}

          {permissions.canEditDonations && (
            <Button
              variant="secondary"
              size="sm"
              icon={<HeartHandshake className="w-4 h-4 text-purple-600" />}
              onClick={onOpenDonationModal}
            >
              Nova Doação
            </Button>
          )}

          {permissions.canEditFinancial && (
            <Button
              variant="secondary"
              size="sm"
              icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
              onClick={onOpenTransactionModal}
            >
              Lançamento
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            icon={<FileText className="w-4 h-4 text-white" />}
            className="border-white/30 text-white hover:bg-white/10 dark:hover:bg-white/10"
            onClick={() => setActiveTab('reports')}
          >
            Relatórios
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Acolhidos Ativos"
          value={activeChildren}
          subtitle={`Ocupação: ${Math.round((activeChildren / settings.maxCapacity) * 100)}% da capacidade`}
          icon={<Users className="w-6 h-6" />}
          color="sky"
          trend="+1 este mês"
          trendType="positive"
          onClick={() => setActiveTab('children')}
        />

        <StatCard
          title="Novos Acolhimentos"
          value={newAdmissionsMonth}
          subtitle="Entradas no mês de Agosto"
          icon={<TrendingUp className="w-6 h-6" />}
          color="emerald"
          trend="No prazo ECA"
          trendType="positive"
          onClick={() => setActiveTab('children')}
        />

        <StatCard
          title="Doações no Mês"
          value={formatCurrency(totalDonationsAmountMonth)}
          subtitle="Volume financeiro arrecadado em Agosto"
          icon={<HeartHandshake className="w-6 h-6" />}
          color="purple"
          trend="+12% arrecadação"
          trendType="positive"
          onClick={() => setActiveTab('donations')}
        />

        <StatCard
          title="Saldo Acumulado"
          value={formatCurrency(currentBalance)}
          subtitle={`Entradas: ${formatCurrency(totalEntradas)} | Saídas: ${formatCurrency(totalSaidas)}`}
          icon={<DollarSign className="w-6 h-6" />}
          color={currentBalance >= 0 ? 'emerald' : 'rose'}
          trend="Equilíbrio financeiro"
          trendType={currentBalance >= 0 ? 'positive' : 'negative'}
          onClick={() => setActiveTab('financial')}
        />
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgeDistributionChart childrenList={childrenList} />
        <DonationsFinanceChart transactionsList={transactionsList} donationsList={donationsList} />
      </div>

      {/* Alerts & Audit Stream Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PendingAlertsWidget
          childrenList={childrenList}
          onNavigateChildren={() => setActiveTab('children')}
        />
        <RecentActivityWidget
          auditLogs={auditLogsList}
          onNavigateAudit={() => setActiveTab('lgpd')}
        />
      </div>
    </div>
  );
};
