import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card } from '../common/Card';
import { Child } from '../../types';
import { getAgeCategory } from '../../utils/formatters';

interface AgeDistributionChartProps {
  childrenList: Child[];
}

export const AgeDistributionChart: React.FC<AgeDistributionChartProps> = ({ childrenList = [] }) => {
  const activeChildren = childrenList.filter((c) => c.status === 'ativo');

  const ageCounts = {
    '0-3 anos': 0,
    '4-7 anos': 0,
    '8-12 anos': 0,
    '13-17 anos': 0,
  };

  activeChildren.forEach((child) => {
    const cat = getAgeCategory(child.birthDate);
    if (cat === '0-3') ageCounts['0-3 anos']++;
    else if (cat === '4-7') ageCounts['4-7 anos']++;
    else if (cat === '8-12') ageCounts['8-12 anos']++;
    else if (cat === '13-17' || cat === '18+') ageCounts['13-17 anos']++;
  });

  const data = [
    { name: '0 a 3 anos (Primeira Infância)', value: ageCounts['0-3 anos'], color: '#0284c7' },
    { name: '4 a 7 anos (Infância I)', value: ageCounts['4-7 anos'], color: '#10b981' },
    { name: '8 a 12 anos (Infância II)', value: ageCounts['8-12 anos'], color: '#f59e0b' },
    { name: '13 a 17 anos (Adolescência)', value: ageCounts['13-17 anos'], color: '#8b5cf6' },
  ];

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Faixa Etária dos Acolhidos
          </h3>
          <p className="text-xs text-slate-500">Distribuição por ciclo de desenvolvimento infantil</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 rounded-full">
          Total: {activeChildren.length}
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value} acolhido(s)`, 'Quantidade']}
              contentStyle={{ borderRadius: '12px', borderColor: '#cbd5e1', fontSize: '12px' }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
