import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Donation } from '../../types';
import { HeartHandshake, Plus, Search, Filter, Download, Printer, DollarSign, Package } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDateBR, maskCPF } from '../../utils/formatters';
import { exportToCSV, printDocumentHTML } from '../../utils/export';
import { DonationModal } from './DonationModal';

export const DonationsListView: React.FC = () => {
  const { donationsList = [], settings, logAudit } = useApp();
  const { permissions } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('todos');

  const typeLabels: Record<string, string> = {
    financeira: 'Financeira',
    bens_produtos: 'Bens & Produtos',
    alimentos: 'Alimentos',
    vestuario: 'Vestuário',
    brinquedos: 'Brinquedos',
    higiene_limpeza: 'Higiene & Limpeza',
    moveis_equipamentos: 'Móveis & Equip.',
  };

  const filtered = donationsList.filter((d) => {
    const q = searchTerm.toLowerCase();
    const donorNameStr = d.donorName || d.donor?.name || '';
    const receiptStr = d.receiptNumber || d.code || '';
    const descStr = d.itemDescription || '';

    const matchesSearch =
      !q ||
      donorNameStr.toLowerCase().includes(q) ||
      receiptStr.toLowerCase().includes(q) ||
      descStr.toLowerCase().includes(q);

    const matchesType = typeFilter === 'todos' || d.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalFinancial = donationsList
    .filter((d) => d.type === 'financeira')
    .reduce((acc, d) => acc + (d.amount || 0), 0);

  const totalPhysicalItems = donationsList.filter((d) => d.type !== 'financeira').length;

  const handleExportCSV = () => {
    logAudit('EXPORTAR', 'DOACOES', 'Exportação de relatório CSV de doações');
    const headers = ['Nº Recibo', 'Doador', 'CPF/CNPJ', 'Data', 'Tipo', 'Valor (R$)', 'Descrição Itens'];
    const rows = filtered.map((d) => [
      d.receiptNumber || d.code || '-',
      d.donorName || d.donor?.name || 'Doador Anônimo',
      d.donorCpfCnpj || d.donor?.cpfCnpj || '-',
      d.date,
      d.type,
      d.amount ? d.amount.toFixed(2) : d.estimatedValue ? d.estimatedValue.toFixed(2) : '0.00',
      d.itemDescription || '-',
    ]);
    exportToCSV('Relatorio_Doacoes_Lar_Sementes', headers, rows);
  };

  const handlePrintReceipt = (donation: Donation) => {
    const receiptNo = donation.receiptNumber || donation.code || 'REC-2026';
    const donorName = donation.donorName || donation.donor?.name || 'Doador Anônimo';
    const donorDoc = donation.donorCpfCnpj || donation.donor?.cpfCnpj || '';

    logAudit('EXPORTAR', 'DOACOES', `Emissão de recibo impresso nº ${receiptNo} (${donorName})`);

    const htmlContent = `
      <div style="border: 2px solid #0284c7; padding: 25px; border-radius: 12px; max-width: 700px; margin: 0 auto; font-family: sans-serif;">
        <div style="text-align: center; border-b: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #0369a1; font-size: 20px; font-weight: bold;">${settings.institutionName}</h2>
          <p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;">CNPJ: ${settings.cnpj} • ${settings.address}</p>
          <p style="margin: 2px 0 0 0; color: #64748b; font-size: 12px;">Acolhimento Infantojuvenil com Proteção Social Especial</p>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 20px;">
          <div><strong>RECIBO DE DOAÇÃO Nº:</strong> <span style="color: #0369a1;">${receiptNo}</span></div>
          <div><strong>DATA:</strong> ${formatDateBR(donation.date)}</div>
        </div>

        <div style="font-size: 13px; line-height: 1.8; color: #334155; margin-bottom: 25px;">
          <p style="margin: 0;">Recebemos de <strong>${donorName}</strong> ${donorDoc ? `(CPF/CNPJ: ${donorDoc})` : ''}, com profunda gratidão, a seguinte doação destinada à manutenção das atividades de acolhimento:</p>

          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; margin: 15px 0;">
            ${
              donation.type === 'financeira'
                ? `<p style="margin:0; font-size: 16px; font-weight: bold; color: #047857;">VALOR: ${formatCurrency(donation.amount || 0)}</p>`
                : `<p style="margin:0; font-size: 14px; font-weight: bold;">DOAÇÃO DE MANTIMENTOS / MATERIAL FÍSICO:</p>
                   <p style="margin: 5px 0 0 0; color: #475569;">${donation.itemDescription} (${donation.quantity || 1} volume(s))</p>`
            }
          </div>

          <p style="margin: 0;">Declaramos que os recursos recebidos são integralmente aplicados na assistência e desenvolvimento das crianças e adolescentes acolhidos nesta instituição.</p>
        </div>

        <div style="margin-top: 50px; text-align: center;">
          <div style="border-top: 1px solid #94a3b8; width: 250px; margin: 0 auto; padding-top: 5px; font-size: 12px; font-weight: bold; color: #475569;">
            ${settings.presidentName || settings.directorName || 'Diretoria Executiva'}<br/>
            Diretoria Executiva / Tesouraria
          </div>
        </div>
      </div>
    `;

    printDocumentHTML(`Recibo de Doação ${receiptNo}`, htmlContent);
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-purple-600" />
            Gestão de Doações & Parcerias
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mapeamento de doadores, arrecadação financeira, doações de suprimentos e emissão de recibos fiscais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {permissions.canExportData && (
            <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExportCSV}>
              Exportar
            </Button>
          )}

          {permissions.canEditDonations && (
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
              Registrar Doação
            </Button>
          )}
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/50">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500">Total Arrecadado (Financeiro)</span>
            <p className="text-lg font-black text-slate-900 dark:text-slate-100">{formatCurrency(totalFinancial)}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950/50">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500">Doações Físicas Registradas</span>
            <p className="text-lg font-black text-slate-900 dark:text-slate-100">{totalPhysicalItems} Lotes de Mantimentos</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500">Total de Doadores Ativos</span>
            <p className="text-lg font-black text-slate-900 dark:text-slate-100">{donationsList.length} Doadores Registrados</p>
          </div>
        </Card>
      </div>

      {/* Toolbar Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar doador, recibo, item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 shrink-0">Filtrar por Categoria:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs w-full sm:w-auto"
            >
              <option value="todos">Todas as Doações</option>
              <option value="financeira">Financeira</option>
              <option value="alimentos">Alimentos / Cesta Básica</option>
              <option value="vestuario">Vestuário / Enxoval</option>
              <option value="brinquedos">Brinquedos & Recreação</option>
              <option value="higiene_limpeza">Higiene & Limpeza</option>
              <option value="moveis_equipamentos">Móveis & Equipamentos</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Donations Data Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase tracking-wider font-bold">
                <th className="p-3 whitespace-nowrap">Recibo</th>
                <th className="p-3 whitespace-nowrap">Data</th>
                <th className="p-3">Doador / Empresa</th>
                <th className="p-3 whitespace-nowrap">Tipo de Doação</th>
                <th className="p-3">Valor / Descrição do Lote</th>
                <th className="p-3 text-right whitespace-nowrap">Recibo Fiscal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((donation) => (
                <tr key={donation.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-purple-600 whitespace-nowrap">
                    {donation.receiptNumber || donation.code || 'REC-2026'}
                  </td>
                  <td className="p-3 text-slate-500 whitespace-nowrap">{formatDateBR(donation.date)}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                    {donation.donorName || donation.donor?.name || 'Doador Anônimo'}
                    {(donation.donorCpfCnpj || donation.donor?.cpfCnpj) && (
                      <span className="text-[10px] text-slate-400 block font-normal">
                        {donation.donorCpfCnpj || donation.donor?.cpfCnpj}
                      </span>
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <Badge variant={donation.type === 'financeira' ? 'success' : 'purple'}>
                      {typeLabels[donation.type] || donation.type}
                    </Badge>
                  </td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                    {donation.type === 'financeira' ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                        {formatCurrency(donation.amount || 0)}
                      </span>
                    ) : (
                      <span>
                        {donation.itemDescription} ({donation.quantity || 1} vol.)
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Printer className="w-3.5 h-3.5" />}
                      onClick={() => handlePrintReceipt(donation)}
                    >
                      Imprimir Recibo
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <DonationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
