import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Search, User, HeartHandshake, DollarSign, FileText, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDateBR } from '../../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { childrenList = [], donationsList = [], transactionsList = [], setActiveTab } = useApp();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via custom event or state
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedChildren = q
    ? childrenList.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          (c.socialName && c.socialName.toLowerCase().includes(q)) ||
          (c.judicialProcessNumber && c.judicialProcessNumber.toLowerCase().includes(q))
      )
    : [];

  const matchedDonations = q
    ? donationsList.filter(
        (d) =>
          d.code.toLowerCase().includes(q) ||
          d.donor.name.toLowerCase().includes(q) ||
          (d.itemDescription && d.itemDescription.toLowerCase().includes(q)) ||
          d.category.toLowerCase().includes(q)
      )
    : [];

  const matchedTransactions = q
    ? transactionsList.filter(
        (t) =>
          t.code.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.payeeOrPayer.toLowerCase().includes(q)
      )
    : [];

  const totalResults = matchedChildren.length + matchedDonations.length + matchedTransactions.length;

  const handleSelectResult = (tab: string) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Busca Global no Sistema" maxWidth="2xl">
      <div className="space-y-4">
        {/* Search Input Box */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite nome, CPF, código (ACO-2026-001), processo judicial, doador..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
          />
        </div>

        {/* Results Body */}
        {!q ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Comece a digitar para pesquisar em tempo real em todos os módulos.
          </div>
        ) : totalResults === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Nenhum resultado encontrado para "<span className="font-semibold text-slate-600">{query}</span>".
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-4 pr-1">
            {/* Children Section */}
            {matchedChildren.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Acolhidos ({matchedChildren.length})
                </h4>
                <div className="space-y-1.5">
                  {matchedChildren.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectResult('children')}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-sky-50/50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={c.photoUrl || 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=100&auto=format&fit=crop&q=80'}
                          alt={c.fullName}
                          className="w-9 h-9 rounded-full object-cover shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{c.fullName}</span>
                            <Badge size="sm" variant={c.status === 'ativo' ? 'success' : 'neutral'}>
                              {c.code}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Acolhido em: {formatDateBR(c.admissionDate)} • Processo: {c.judicialProcessNumber || 'S/N'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Donations Section */}
            {matchedDonations.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5" /> Doações ({matchedDonations.length})
                </h4>
                <div className="space-y-1.5">
                  {matchedDonations.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => handleSelectResult('donations')}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-purple-50/50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{d.donor.name}</span>
                          <Badge size="sm" variant="purple">
                            {d.code}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {d.type === 'financeira' ? formatCurrency(d.amount || 0) : d.itemDescription} • {formatDateBR(d.date)}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Transactions Section */}
            {matchedTransactions.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> Lançamentos Financeiros ({matchedTransactions.length})
                </h4>
                <div className="space-y-1.5">
                  {matchedTransactions.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleSelectResult('financial')}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-emerald-50/50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{t.description}</span>
                          <Badge size="sm" variant={t.type === 'entrada' ? 'success' : 'error'}>
                            {t.type === 'entrada' ? '+' : '-'} {formatCurrency(t.amount)}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Favorecido/Pagador: {t.payeeOrPayer} • Data: {formatDateBR(t.date)}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
