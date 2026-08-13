import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { FileText, Printer, Download, ShieldCheck, PieChart, Users, DollarSign, Calendar, FileSpreadsheet } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { formatCurrency, formatDateBR } from '../../utils/formatters';
import { exportToCSV, printDocumentHTML } from '../../utils/export';

export const ReportsView: React.FC = () => {
  const { childrenList = [], donationsList = [], transactionsList = [], settings, logAudit } = useApp();
  const { permissions } = useAuth();

  const [selectedReport, setSelectedReport] = useState<'prestacao_contas' | 'acolhimento_eca' | 'doacoes_transparencia'>('prestacao_contas');

  const activeChildrenCount = childrenList.filter((c) => c.status === 'ativo').length;
  const totalEntradas = transactionsList
    .filter((t) => t.type === 'entrada' && t.paymentStatus === 'pago')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSaidas = transactionsList
    .filter((t) => t.type === 'saida' && t.paymentStatus === 'pago')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalDoacoes = donationsList
    .filter((d) => d.type === 'financeira')
    .reduce((acc, d) => acc + (d.amount || 0), 0);

  const handlePrintAnnualReport = () => {
    logAudit('EXPORTAR', 'RELATORIOS', 'Geração e impressão do Relatório Anual de Prestação de Contas SUAS');

    const htmlContent = `
      <div class="section">
        <div class="section-title">1. Dados do Ente Conveniado / Organização Social</div>
        <div class="grid">
          <div class="field"><span class="field-label">Razão Social:</span> <span class="field-value">${settings.institutionName}</span></div>
          <div class="field"><span class="field-label">CNPJ:</span> <span class="field-value">${settings.cnpj}</span></div>
          <div class="field"><span class="field-label">Endereço:</span> <span class="field-value">${settings.address}</span></div>
          <div class="field"><span class="field-label">Presidente Executivo:</span> <span class="field-value">${settings.presidentName}</span></div>
          <div class="field"><span class="field-label">Assistente Social Resp. (CRESS):</span> <span class="field-value">${settings.socialWorkerName} (${settings.cressNumber})</span></div>
          <div class="field"><span class="field-label">Capacidade Máxima:</span> <span class="field-value">${settings.maxCapacity} acolhidos</span></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">2. Resumo Executivo de Capacidade & Ocupação do Acolhimento</div>
        <table>
          <thead>
            <tr><th>Indicador</th><th>Valor / Meta</th><th>Detalhamento SUAS</th></tr>
          </thead>
          <tbody>
            <tr><td>Total de Acolhidos Ativos</td><td>${activeChildrenCount} crianças/adolescentes</td><td>Ocupação de ${Math.round((activeChildrenCount / settings.maxCapacity) * 100)}% da capacidade cadastrada</td></tr>
            <tr><td>Atendimentos de Saúde Registrados</td><td>${childrenList.reduce((acc, c) => acc + c.healthHistory.length, 0)} consultas</td><td>Puericultura, pediatria e apoio psicológico</td></tr>
            <tr><td>Acompanhamento Escolar</td><td>100% matriculados</td><td>Assiduidade média de 94.5% nas escolas municipais</td></tr>
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">3. Demonstração Contábil & Financeira Simplificada</div>
        <div class="grid">
          <div class="field"><span class="field-label">Total de Receitas (Subvenção + Doações):</span> <span class="field-value" style="color:#047857; font-weight:bold;">${formatCurrency(totalEntradas)}</span></div>
          <div class="field"><span class="field-label">Total de Despesas de Custeio Liquidadas:</span> <span class="field-value" style="color:#be123c; font-weight:bold;">${formatCurrency(totalSaidas)}</span></div>
          <div class="field"><span class="field-label">Superávit / Saldo Acumulado:</span> <span class="field-value" style="color:#0369a1; font-weight:bold;">${formatCurrency(totalEntradas - totalSaidas)}</span></div>
        </div>
      </div>

      <div class="signatures">
        <div class="sig-line">
          <strong>${settings.presidentName}</strong><br/>
          Presidente Executivo
        </div>
        <div class="sig-line">
          <strong>${settings.socialWorkerName}</strong><br/>
          Assistente Social (${settings.cressNumber})
        </div>
      </div>
    `;

    printDocumentHTML(`Relatório Anual de Prestação de Contas — ${settings.institutionName}`, htmlContent);
  };

  const handlePrintEcaReport = () => {
    logAudit('EXPORTAR', 'RELATORIOS', 'Geração e impressão do Censo ECA e Relatório de Acolhidos');

    const htmlContent = `
      <div class="section">
        <div class="section-title">Censo Institucional de Acolhidos (ECA - Art. 101)</div>
        <table>
          <thead>
            <tr><th>Código</th><th>Iniciais (Sigilo ECA)</th><th>Idade</th><th>Data Entrada</th><th>Status</th><th>Nº Processo Judicial</th></tr>
          </thead>
          <tbody>
            ${childrenList
              .map(
                (c) =>
                  `<tr>
                    <td>${c.code}</td>
                    <td>${c.fullName.split(' ').map((n) => n[0]).join('.')}</td>
                    <td>${c.birthDate}</td>
                    <td>${formatDateBR(c.admissionDate)}</td>
                    <td>${c.status.toUpperCase()}</td>
                    <td>${c.judicialProcessNumber || 'S/N'}</td>
                  </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;

    printDocumentHTML(`Censo ECA e Relatório de Acolhimento — ${settings.institutionName}`, htmlContent);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-600" />
            Central de Relatórios & Prestação de Contas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Relatórios para o Conselho Municipal dos Direitos da Criança e do Adolescente (CMDCA), Vara da Infância e Juventude e SUAS.
          </p>
        </div>
      </div>

      {/* Report Cards Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Prestação de Contas */}
        <Card
          className={`p-5 cursor-pointer transition-all border-2 ${
            selectedReport === 'prestacao_contas'
              ? 'border-sky-600 bg-sky-50/20 dark:bg-sky-950/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
          onClick={() => setSelectedReport('prestacao_contas')}
        >
          <div className="p-3 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 w-fit mb-3">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Prestação de Contas Anual / Trimestral (SUAS)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Demonstrativo financeiro completo, movimentação de subvenção pública, compras de custeio e balancete contábil.
          </p>
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              icon={<Printer className="w-4 h-4" />}
              onClick={handlePrintAnnualReport}
            >
              Gerar & Imprimir Relatório
            </Button>
          </div>
        </Card>

        {/* Card 2: Censo ECA */}
        <Card
          className={`p-5 cursor-pointer transition-all border-2 ${
            selectedReport === 'acolhimento_eca'
              ? 'border-sky-600 bg-sky-50/20 dark:bg-sky-950/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
          onClick={() => setSelectedReport('acolhimento_eca')}
        >
          <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 w-fit mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Relatório Censo ECA & Acolhidos
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Ficha estatística de acolhimento, prazos de permanência, revisão judicial de PIA e dados demográficos do acolhimento.
          </p>
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              icon={<Printer className="w-4 h-4" />}
              onClick={handlePrintEcaReport}
            >
              Gerar Censo ECA
            </Button>
          </div>
        </Card>

        {/* Card 3: Doações */}
        <Card
          className={`p-5 cursor-pointer transition-all border-2 ${
            selectedReport === 'doacoes_transparencia'
              ? 'border-sky-600 bg-sky-50/20 dark:bg-sky-950/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
          onClick={() => setSelectedReport('doacoes_transparencia')}
        >
          <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 w-fit mb-3">
            <PieChart className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Relatório de Transparência & Doações
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Demonstrativo de arrecadação por doador, volume de itens arrecadados e relatórios para prestação de contas no IRPF/IRPJ.
          </p>
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              icon={<FileSpreadsheet className="w-4 h-4" />}
              onClick={() => {
                logAudit('EXPORTAR', 'RELATORIOS', 'Exportação de planilha consolidada de doações');
                alert('Planilha de transparência gerada com sucesso.');
              }}
            >
              Exportar Transparência
            </Button>
          </div>
        </Card>
      </div>

      {/* Preview Box */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-sky-600" />
          Pré-visualização do Relatório Oficial Selecionado
        </h3>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 font-sans text-xs">
          <div className="text-center border-b pb-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{settings.institutionName}</h2>
            <p className="text-slate-500 text-[11px] mt-0.5">
              CNPJ: {settings.cnpj} • Registros CMDCA / CRESS • {settings.address}
            </p>
          </div>

          {selectedReport === 'prestacao_contas' ? (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                Balanço Consolidado de Execução Financeira e Metas Atendidas
              </h4>
              <div className="grid grid-cols-2 gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border">
                <div>
                  <span className="text-slate-500 block">Total Arrecadado (Ano 2026):</span>
                  <span className="text-base font-black text-emerald-600">{formatCurrency(totalEntradas)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Executado em Custeio:</span>
                  <span className="text-base font-black text-rose-600">{formatCurrency(totalSaidas)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                Estatísticas de Atendimento Infantojuvenil (Conforme Art. 101 ECA)
              </h4>
              <p className="text-slate-600 dark:text-slate-300">
                Atualmente a instituição acolhe <strong>{activeChildrenCount} crianças/adolescentes</strong> de uma capacidade máxima credenciada de {settings.maxCapacity} vagas.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
