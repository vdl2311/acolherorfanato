import React, { useState } from 'react';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from './Modal';
import { Textarea } from './Input';
import { Button } from './Button';

interface MaskedTextProps {
  value?: string;
  maskedValue?: string;
  label?: string;
  targetId?: string;
  targetDescription: string;
  sensitiveType?: 'cpf' | 'rg' | 'processo' | 'prontuario' | 'texto';
  id?: string;
}

export const MaskedText: React.FC<MaskedTextProps> = ({
  value,
  maskedValue,
  label,
  targetId,
  targetDescription,
  sensitiveType = 'texto',
  id,
}) => {
  const { logAudit } = useApp();
  const { permissions, currentUser } = useAuth();
  const [revealed, setRevealed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [justification, setJustification] = useState('');
  const [error, setError] = useState('');

  if (!value) return <span className="text-slate-400 italic">Não informado</span>;

  const displayMasked = maskedValue || '••••••••••••••••';

  const handleRevealClick = () => {
    if (revealed) {
      setRevealed(false);
      return;
    }
    setModalOpen(true);
  };

  const handleConfirmReveal = () => {
    if (!justification.trim() || justification.trim().length < 5) {
      setError('Por favor, digite uma justificativa válida com no mínimo 5 caracteres.');
      return;
    }

    logAudit(
      'VISUALIZAR_SENSIVEL',
      'ACOLHIDOS',
      `Acesso a dado sensível (${label || sensitiveType}): ${targetDescription}`,
      targetId,
      justification.trim()
    );

    setRevealed(true);
    setModalOpen(false);
    setJustification('');
    setError('');
  };

  return (
    <div id={id} className="inline-flex items-center gap-2 max-w-full">
      <span className={`font-mono text-xs ${revealed ? 'text-slate-900 dark:text-slate-100 font-semibold bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-800' : 'text-slate-500 dark:text-slate-400'}`}>
        {revealed ? value : displayMasked}
      </span>

      <button
        type="button"
        onClick={handleRevealClick}
        className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 hover:underline cursor-pointer shrink-0"
        title={revealed ? 'Ocultar dado' : 'Revelar dado protegido (requer justificativa LGPD)'}
      >
        {revealed ? (
          <>
            <EyeOff className="w-3.5 h-3.5" /> Ocultar
          </>
        ) : (
          <>
            <Eye className="w-3.5 h-3.5" /> Revelar
          </>
        )}
      </button>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Acesso a Dado Sensível - LGPD / ECA"
        subtitle={`Operação monitorada sob registro de auditoria para o usuário ${currentUser.name}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Aviso de Privacidade e Auditoria</p>
              <p className="mt-0.5 text-amber-800 dark:text-amber-300">
                A visualização deste dado sensível será registrada no log de auditoria da instituição, identificando seu usuário, IP, horário e motivo informado.
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Campo Solicitado: <span className="font-bold text-slate-900 dark:text-slate-100">{label || 'Dado Confidencial'}</span>
            </label>
            <p className="text-xs text-slate-500 mt-0.5">{targetDescription}</p>
          </div>

          <Textarea
            label="Justificativa Legal / Motivo do Acesso"
            placeholder="Ex: Atualização de petição judicial, envio de relatório para Defensoria Pública, consulta de urgência..."
            value={justification}
            onChange={(e) => {
              setJustification(e.target.value);
              if (error) setError('');
            }}
            rows={3}
            error={error}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmReveal}>
              Confirmar e Visualizar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
