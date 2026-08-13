import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ShieldAlert, AlertCircle, Syringe, Calendar, CheckCircle } from 'lucide-react';
import { Child } from '../../types';
import { formatDateBR } from '../../utils/formatters';

interface PendingAlertsWidgetProps {
  childrenList: Child[];
  onNavigateChildren: () => void;
}

export const PendingAlertsWidget: React.FC<PendingAlertsWidgetProps> = ({
  childrenList = [],
  onNavigateChildren,
}) => {
  const activeChildren = childrenList.filter((c) => c.status === 'ativo');

  // Find judicial reviews, vaccines, APLV diets, etc.
  const alerts: { id: string; childName: string; title: string; category: string; date?: string; severity: 'alta' | 'media' | 'info' }[] = [];

  activeChildren.forEach((child) => {
    if (child.piaPlan?.nextJudicialReviewDate) {
      alerts.push({
        id: `pia-${child.id}`,
        childName: child.fullName,
        title: 'Revisão Judicial do PIA (Trimestral ECA)',
        category: 'Judicial / PIA',
        date: child.piaPlan.nextJudicialReviewDate,
        severity: 'alta',
      });
    }

    if (child.allergies && child.allergies.length > 0) {
      alerts.push({
        id: `alg-${child.id}`,
        childName: child.fullName,
        title: `Restrição Alimentar Grave (${child.allergies[0].allergen})`,
        category: 'Saúde / Dieta',
        severity: 'media',
      });
    }

    if (child.continuousMedications && child.continuousMedications.length > 0) {
      alerts.push({
        id: `med-${child.id}`,
        childName: child.fullName,
        title: `Uso de Medicamento Contínuo (${child.continuousMedications[0].medicationName})`,
        category: 'Farmácia / Tratamento',
        severity: 'info',
      });
    }
  });

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Alertas & Pendências Administrativas
          </h3>
        </div>
        <button
          onClick={onNavigateChildren}
          className="text-xs font-semibold text-sky-600 hover:underline cursor-pointer"
        >
          Ver Todos Acolhidos
        </button>
      </div>

      <div className="space-y-2.5">
        {alerts.slice(0, 4).map((alert) => (
          <div
            key={alert.id}
            onClick={onNavigateChildren}
            className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5">
                {alert.severity === 'alta' ? (
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                ) : alert.severity === 'media' ? (
                  <Syringe className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-sky-500 shrink-0" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{alert.childName}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{alert.title}</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <Badge
                size="sm"
                variant={alert.severity === 'alta' ? 'error' : alert.severity === 'media' ? 'warning' : 'info'}
              >
                {alert.category}
              </Badge>
              {alert.date && (
                <span className="text-[10px] text-slate-400 block mt-1">
                  Data: {formatDateBR(alert.date)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
