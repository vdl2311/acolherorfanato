import React, { useState } from 'react';
import { Donation, Donor } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, Select, Textarea } from '../common/Input';
import { useApp } from '../../context/AppContext';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const { addDonation } = useApp();

  const [donorName, setDonorName] = useState('');
  const [donorDoc, setDonorDoc] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [type, setType] = useState<Donation['type']>('financeira');
  const [amount, setAmount] = useState<string>('');
  const [itemDescription, setItemDescription] = useState('');
  const [quantity, setQuantity] = useState<string>('');
  const [estValue, setEstValue] = useState<string>('');
  const [receiptNumber, setReceiptNumber] = useState(`REC-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName) return;

    addDonation({
      donorName,
      donorCpfCnpj: donorDoc || undefined,
      donorPhone: donorPhone || undefined,
      donorEmail: donorEmail || undefined,
      type,
      amount: type === 'financeira' ? Number(amount) : undefined,
      itemDescription: type !== 'financeira' ? itemDescription : undefined,
      quantity: type !== 'financeira' ? Number(quantity) : undefined,
      estimatedValue: type !== 'financeira' && estValue ? Number(estValue) : undefined,
      date: new Date().toISOString().split('T')[0],
      receiptNumber,
      notes: notes || undefined,
    });

    onClose();
    setDonorName('');
    setAmount('');
    setItemDescription('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Nova Doação / Recibo Fiscal"
      subtitle="Registro de doações financeiras e doações físicas de mantimentos com emissão automática de recibo"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Donor info */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dados do Doador / Empresa Parceira</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Nome do Doador ou Razão Social"
              placeholder="Ex: Fundação Bradesco ou Maria das Dores"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              required
            />
            <Input
              label="CPF ou CNPJ (Para Recibo IRPF/IRPJ)"
              placeholder="000.000.000-00 ou 00.000.000/0001-00"
              value={donorDoc}
              onChange={(e) => setDonorDoc(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Telefone / WhatsApp"
              placeholder="(11) 98888-7777"
              value={donorPhone}
              onChange={(e) => setDonorPhone(e.target.value)}
            />
            <Input
              label="E-mail de Contato"
              type="email"
              placeholder="doador@email.com"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Donation Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Tipo de Doação"
            options={[
              { value: 'financeira', label: 'Financeira (Pix / Transferência / Boleto)' },
              { value: 'alimentos', label: 'Alimentos / Cesta Básica' },
              { value: 'vestuario', label: 'Roupas, Calçados e Enxoval' },
              { value: 'brinquedos', label: 'Brinquedos e Material Recreativo' },
              { value: 'higiene_limpeza', label: 'Material de Higiene e Limpeza' },
              { value: 'moveis_equipamentos', label: 'Móveis e Eletrodomésticos' },
              { value: 'outro', label: 'Outras Doações Físicas' },
            ]}
            value={type}
            onChange={(e) => setType(e.target.value as Donation['type'])}
          />

          <Input
            label="Número do Recibo Gerado"
            value={receiptNumber}
            onChange={(e) => setReceiptNumber(e.target.value)}
            required
          />
        </div>

        {type === 'financeira' ? (
          <div>
            <Input
              label="Valor da Doação (R$)"
              type="number"
              step="0.01"
              placeholder="150.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
        ) : (
          <div className="space-y-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
            <Input
              label="Descrição dos Itens Doados"
              placeholder="Ex: 5 Cestas Básicas completas e 10 fardos de leite"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Quantidade de Volumes/Itens"
                type="number"
                placeholder="5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <Input
                label="Valor Estimado Estimativo (R$ - Opcional)"
                type="number"
                step="0.01"
                placeholder="500.00"
                value={estValue}
                onChange={(e) => setEstValue(e.target.value)}
              />
            </div>
          </div>
        )}

        <Textarea
          label="Observações / Destinação da Doação"
          placeholder="Agradecimento enviado, finalidade específica do doador..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" type="submit">Salvar Doação & Emitir Recibo</Button>
        </div>
      </form>
    </Modal>
  );
};
