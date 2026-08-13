import React, { useState } from 'react';
import { Child, ChildDocument } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { FileText, Download, Plus, ShieldCheck, Eye, File, Lock } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Input, Select } from '../common/Input';
import { formatDateBR } from '../../utils/formatters';

interface DocumentsTabProps {
  child: Child;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({ child }) => {
  const { addDocument, logAudit } = useApp();
  const { permissions, currentUser } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<ChildDocument['type']>('certidao_nascimento');
  const [fileName, setFileName] = useState('');
  const [isSensitive, setIsSensitive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle || !fileName) return;

    addDocument(child.id, {
      title: docTitle,
      type: docType,
      fileName,
      fileSize: '1.4 MB',
      uploadedBy: currentUser.name,
      fileUrl: '#',
      isSensitive,
    });

    setModalOpen(false);
    setDocTitle('');
    setFileName('');
  };

  const handleDownloadDoc = (doc: ChildDocument) => {
    logAudit(
      doc.isSensitive ? 'VISUALIZAR_SENSIVEL' : 'EXPORTAR',
      'ACOLHIDOS',
      `Download de documento anexo: ${doc.title} (${doc.fileName})`,
      child.id,
      doc.isSensitive ? 'Acesso ao arquivo em anexo no prontuário' : undefined
    );
    alert(`Simulação de download do documento: ${doc.fileName}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" />
            Organização de Documentos & Anexos
          </h3>
          <p className="text-xs text-slate-500">Documentação civil, decisões judiciais, guias de acolhimento e laudos periciais.</p>
        </div>

        {permissions.canEditChildren && (
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
            Anexar Documento
          </Button>
        )}
      </div>

      {child.documents.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
          Nenhum documento anexado ao prontuário até o momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {child.documents.map((doc) => (
            <div key={doc.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 shrink-0">
                  <File className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{doc.title}</h4>
                    {doc.isSensitive && <Badge variant="warning">Sigilo Judicial</Badge>}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">{doc.fileName} ({doc.fileSize})</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Anexado por {doc.uploadedBy} em {formatDateBR(doc.uploadedAt)}
                  </p>
                </div>
              </div>

              <Button variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={() => handleDownloadDoc(doc)}>
                Baixar
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Document */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Anexar Documento ao Prontuário" maxWidth="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Título do Documento" placeholder="Ex: Certidão de Nascimento Atualizada" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} required />
          <Select
            label="Tipo de Documento"
            options={[
              { value: 'certidao_nascimento', label: 'Certidão de Nascimento' },
              { value: 'guia_acolhimento', label: 'Guia de Acolhimento' },
              { value: 'decisao_judicial', label: 'Decisão Judicial / Mandado' },
              { value: 'rg', label: 'Carteira de Identidade (RG)' },
              { value: 'cpf', label: 'CPF' },
              { value: 'cartao_vacina', label: 'Cartão de Vacinação' },
              { value: 'historico_escolar', label: 'Histórico Escolar' },
              { value: 'laudo_medico', label: 'Laudo Pericial / Médico' },
              { value: 'outros', label: 'Outros Documentos' },
            ]}
            value={docType}
            onChange={(e) => setDocType(e.target.value as ChildDocument['type'])}
          />

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Nome do Arquivo Simulado
            </label>
            <input
              type="text"
              placeholder="Ex: Certidao_Nascimento.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="docSensitive" checked={isSensitive} onChange={(e) => setIsSensitive(e.target.checked)} className="rounded text-sky-600" />
            <label htmlFor="docSensitive" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Documento sob Segredo de Justiça / Sigiloso (Protegido por LGPD e ECA)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" type="submit">Confirmar e Anexar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
