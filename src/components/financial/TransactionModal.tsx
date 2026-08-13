import React, { useState } from 'react';
import { Transaction } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, Select, Textarea } from '../common/Input';
import { useApp } from '../../context/AppContext';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction } = useApp();

  const [type, setType] = useState<Transaction['type']>('saida');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Alimentação & Nutrição');
  const [costCenter, setCostCenter] = useState('Subvenção Municipal SUAS');
  const [bankAccount, setBankAccount] = useState('Banco do Brasil - Conta Acolhimento 01');
  const [paymentStatus, setPaymentStatus] = useState<Transaction['paymentStatus']>('pago');
  const [paymentMethod, setPaymentMethod] = useState<Transaction['paymentMethod']>('pix');
  const [documentNumber, setDocumentNumber] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplier, setSupplier] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    addTransaction({
      type,
      description,
      amount: Number(amount),
      category,
      costCenter,
      bankAccount,
      paymentStatus,
      paymentMethod,
      documentNumber: documentNumber || undefined,
      dueDate,
      paymentDate: paymentStatus === 'pago' ? paymentDate : undefined,
      supplierOrPayee: supplier || undefined,
    });

    onClose();
    setDescription('');
    setAmount('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lançamento Financeiro de Caixa & Tesouraria"
      subtitle="Registro de receitas (Subvenções, Doações) e despesas de custeio com vinculação de centro de custo"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Tipo de Lançamento"
            options={[
              { value: 'saida', label: 'Saída / Despesa de Custeio' },
              { value: 'entrada', label: 'Entrada / Receita (Subvenção/Doação)' },
            ]}
            value={type}
            onChange={(e) => setType(e.target.value as Transaction['type'])}
          />

          <Input
            label="Valor do Lançamento (R$)"
            type="number"
            step="0.01"
            placeholder="250.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <Input
          label="Descrição Detalhada do Lançamento"
          placeholder="Ex: Compra de hortifrúti semanal para as refeições dos acolhidos"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Categoria de Custeio"
            options={
              type === 'saida'
                ? [
                    { value: 'Alimentação & Nutrição', label: 'Alimentação & Nutrição' },
                    { value: 'Saúde & Farmácia', label: 'Saúde & Farmácia' },
                    { value: 'Material de Higiene & Limpeza', label: 'Material de Higiene & Limpeza' },
                    { value: 'Vestuário & Calçados', label: 'Vestuário & Calçados' },
                    { value: 'Educação & Material Escolar', label: 'Educação & Material Escolar' },
                    { value: 'Folha de Pagamento & Encargos', label: 'Folha de Pagamento & Encargos' },
                    { value: 'Serviços de Utilidade Pública (Água/Luz/Gás)', label: 'Serviços (Água/Luz/Internet)' },
                    { value: 'Manutenção da Unidade', label: 'Manutenção da Unidade' },
                    { value: 'Outras Despesas', label: 'Outras Despesas' },
                  ]
                : [
                    { value: 'Subvenção Municipal SUAS', label: 'Subvenção Municipal SUAS' },
                    { value: 'Repasse Estadual / Federal', label: 'Repasse Estadual / Federal' },
                    { value: 'Doações Pessoas Físicas', label: 'Doações Pessoas Físicas' },
                    { value: 'Doações Pessoas Jurídicas / Editais', label: 'Doações Pessoas Jurídicas / Editais' },
                    { value: 'Bazar & Eventos Beneficentes', label: 'Bazar & Eventos Beneficentes' },
                  ]
            }
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <Select
            label="Centro de Custo / Projeto"
            options={[
              { value: 'Subvenção Municipal SUAS', label: 'Subvenção Municipal SUAS' },
              { value: 'Recursos Próprios / Doações', label: 'Recursos Próprios / Doações' },
              { value: 'Fundo Municipal dos Direitos da Criança (FUMCAD)', label: 'FMB / FUMCAD' },
            ]}
            value={costCenter}
            onChange={(e) => setCostCenter(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Conta Bancária Destino/Origem"
            options={[
              { value: 'Banco do Brasil - Conta Acolhimento 01', label: 'BB - Conta Acolhimento 01' },
              { value: 'Caixa Econômica - Conta Convênio 02', label: 'CEF - Conta Convênio 02' },
              { value: 'Caixa Interno (Espécie)', label: 'Caixa Interno (Espécie)' },
            ]}
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
          />

          <Select
            label="Forma de Pagamento"
            options={[
              { value: 'pix', label: 'Pix / Transferência' },
              { value: 'boleto', label: 'Boleto Bancário' },
              { value: 'cartao', label: 'Cartão Corporativo' },
              { value: 'dinheiro', label: 'Dinheiro (Caixa Físico)' },
            ]}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as Transaction['paymentMethod'])}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Status do Pagamento"
            options={[
              { value: 'pago', label: 'Pago / Concluído' },
              { value: 'pendente', label: 'Pendente (A Pagar)' },
              { value: 'cancelado', label: 'Cancelado' },
            ]}
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as Transaction['paymentStatus'])}
          />

          <Input
            label="Data de Vencimento"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />

          {paymentStatus === 'pago' && (
            <Input
              label="Data da Quitação"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Fornecedor / Favorecido (CNPJ/CPF)"
            placeholder="Ex: Hortifrúti Central LTDA"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
          />
          <Input
            label="Nº do Comprovante / NF"
            placeholder="Ex: NF-e 10492"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" type="submit">Salvar Lançamento</Button>
        </div>
      </form>
    </Modal>
  );
};
