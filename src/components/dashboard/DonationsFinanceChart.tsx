import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Card } from '../common/Card';
import { Transaction, Donation } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface DonationsFinanceChartProps {
  transactionsList: Transaction[];
  donationsList: Donation[];
}

export const DonationsFinanceChart: React.FC<DonationsFinanceChartProps> = ({
  transactionsList = [],
  donationsList = [],
}) => {
  const chartData = [
    { mes: 'Mai/26', entradas: 12500, saídas: 8900 },
    { mes: 'Jun/26', entradas: 18200, saídas: 11400 },
    { mes: 'Jul/26', entradas: 14000, saídas: 9800 },
    { mes: 'Ago/26', entradas: 15500, saídas: 8640.5 },
  ];

  const totalEntradas = transactionsList
    .filter((t) => t.type === 'entrada' && t.paymentStatus === 'pago')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSaidas = transactionsList
    .filter((t) => t.type === 'saida' && t.paymentStatus === 'pago')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <Card>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Fluxo Financeiro & Doações
          </h3>
          <p className="text-xs text-slate-500">Comparativo mensal de Entradas (Doações/Subvenção) vs Saídas</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="text-emerald-600 dark:text-emerald-400">Entradas: {formatCurrency(totalEntradas)}</span>
          <span className="text-rose-600 dark:text-rose-400">Saídas: {formatCurrency(totalSaidas)}</span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="mes" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `R$${v/1000}k`} />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Valor']}
              contentStyle={{ borderRadius: '12px', borderColor: '#cbd5e1', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Bar dataKey="entradas" name="Entradas (Doações/Receitas)" fill="#10b981" radius={[6, 6, 0, 0]} />
            <Bar dataKey="saídas" name="Saídas (Despesas)" fill="#f43f5e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
