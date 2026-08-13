import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Activity, ShieldCheck, UserCheck, HeartHandshake, DollarSign } from 'lucide-react';
import { AuditLog } from '../../types';
import { formatDateTimeBR } from '../../utils/formatters';

interface RecentActivityWidgetProps {
  auditLogs: AuditLog[];
  onNavigateAudit: () => void;
}

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({
  auditLogs,
  onNavigateAudit,
}) => {
  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'CRIAR':
        return <Badge size="sm" variant="success">Criar</Badge>;
      case 'EDITAR':
        return <Badge size="sm" variant="info">Editar</Badge>;
      case 'EXCLUIR':
        return <Badge size="sm" variant="error">Excluir</Badge>;
      case 'VISUALIZAR_SENSIVEL':
        return <Badge size="sm" variant="warning">LGPD Sensível</Badge>;
      case 'EXPORTAR':
        return <Badge size="sm" variant="purple">Exportar</Badge>;
      default:
        return <Badge size="sm" variant="neutral">{action}</Badge>;
    }
  };

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-sky-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Histórico Recente & Trilha de Auditoria
          </h3>
        </div>
        <button
          onClick={onNavigateAudit}
          className="text-xs font-semibold text-sky-600 hover:underline cursor-pointer"
        >
          Ver Trilha Completa
        </button>
      </div>

      <div className="space-y-3">
        {auditLogs.slice(0, 5).map((log) => (
          <div
            key={log.id}
            className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 dark:text-slate-100">{log.userName}</span>
                <span className="text-[10px] text-slate-400">({log.userRole})</span>
                {getActionBadge(log.action)}
              </div>
              <p className="text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                {log.targetDescription}
              </p>
              {log.justification && (
                <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded mt-1 font-mono">
                  Justificativa LGPD: "{log.justification}"
                </p>
              )}
            </div>
            <span className="text-[10px] text-slate-400 shrink-0 font-mono">
              {formatDateTimeBR(log.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
