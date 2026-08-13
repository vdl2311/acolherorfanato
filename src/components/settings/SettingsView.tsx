import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Settings, Save, Building, Shield, User, Phone, Mail, MapPin, Moon, Sun, CheckCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input, Textarea } from '../common/Input';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, logAudit } = useApp();
  const { permissions } = useAuth();

  const [institutionName, setInstitutionName] = useState(settings.institutionName);
  const [cnpj, setCnpj] = useState(settings.cnpj);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [maxCapacity, setMaxCapacity] = useState(String(settings.maxCapacity));
  const [presidentName, setPresidentName] = useState(settings.presidentName);
  const [socialWorkerName, setSocialWorkerName] = useState(settings.socialWorkerName);
  const [cressNumber, setCressNumber] = useState(settings.cressNumber);
  const [themeMode, setThemeMode] = useState(settings.themeMode);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissions.canEditSettings) return;

    updateSettings({
      institutionName,
      cnpj,
      address,
      phone,
      email,
      maxCapacity: Number(maxCapacity),
      presidentName,
      socialWorkerName,
      cressNumber,
      themeMode,
    });

    logAudit('EDITAR', 'CONFIGURACOES', 'Atualização das configurações institucionais');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-sky-600" />
          Configurações da Instituição & Parâmetros de Acolhimento
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Cadastros institucionais, dados do termo de convênio SUAS/CMDCA e corpo técnico responsável.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          Configurações atualizadas com sucesso e salvas na sessão.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Institution Info Card */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-sky-600" />
            Identificação da Unidade de Acolhimento (Casa Lar / Orfanato)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Razão Social / Nome da Entidade"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              required
            />
            <Input
              label="CNPJ da Instituição"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              required
            />
          </div>

          <Textarea
            label="Endereço Completo da Unidade"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            rows={2}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Telefone Institucional"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="E-mail Institucional"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Capacidade Máxima Credenciada (Acolhidos)"
              type="number"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Responsible Staff Card */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-sky-600" />
            Responsáveis Técnicos e Diretoria Executiva
          </h3>

          <Input
            label="Nome do Presidente / Diretor Executivo"
            value={presidentName}
            onChange={(e) => setPresidentName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Assistente Social Responsável"
              value={socialWorkerName}
              onChange={(e) => setSocialWorkerName(e.target.value)}
              required
            />
            <Input
              label="Registro Profissional CRESS"
              value={cressNumber}
              onChange={(e) => setCressNumber(e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Theme Settings Card */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Sun className="w-4 h-4 text-sky-600" />
            Preferências de Visualização e Interface
          </h3>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold ${
                themeMode === 'light'
                  ? 'border-sky-600 bg-sky-50 text-sky-700 dark:bg-sky-950/40'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500'
              }`}
            >
              <Sun className="w-4 h-4" /> Tema Claro (Padrão)
            </button>

            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold ${
                themeMode === 'dark'
                  ? 'border-sky-600 bg-sky-50 text-sky-700 dark:bg-sky-950/40'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500'
              }`}
            >
              <Moon className="w-4 h-4" /> Tema Escuro
            </button>
          </div>
        </Card>

        {permissions.canEditSettings && (
          <div className="flex justify-end pt-2">
            <Button variant="primary" size="md" icon={<Save className="w-4 h-4" />} type="submit">
              Salvar Alterações
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};
