import React, { useState } from 'react';
import { Child, EducationRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, GraduationCap, Plus, School, Award, Phone } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Input, Select, Textarea } from '../common/Input';

interface EducationTabProps {
  child: Child;
}

export const EducationTab: React.FC<EducationTabProps> = ({ child }) => {
  const { addEducationRecord } = useApp();
  const { permissions } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [grade, setGrade] = useState('');
  const [shift, setShift] = useState<EducationRecord['shift']>('matutino');
  const [performance, setPerformance] = useState('');
  const [attendance, setAttendance] = useState<number>(100);
  const [iepNotes, setIepNotes] = useState('');
  const [phone, setPhone] = useState('');
  const [teacher, setTeacher] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName || !grade) return;

    addEducationRecord(child.id, {
      schoolName,
      grade,
      shift,
      academicYear: new Date().getFullYear(),
      performanceScore: performance || 'Satisfeito',
      attendancePercentage: Number(attendance),
      iepNotes: iepNotes || undefined,
      schoolContactPhone: phone || undefined,
      teacherName: teacher || undefined,
    });

    setModalOpen(false);
    setSchoolName('');
    setGrade('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-sky-600" />
            Histórico Escolar & Vida Acadêmica
          </h3>
          <p className="text-xs text-slate-500">Matrículas, desempenho escolar, assiduidade e Atendimento Educacional Especializado (AEE).</p>
        </div>

        {permissions.canEditChildren && (
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
            Adicionar Registro Escolar
          </Button>
        )}
      </div>

      {/* Education Cards */}
      {child.educationHistory.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
          Nenhuma escola ou registro pedagógico cadastrado para este acolhido.
        </div>
      ) : (
        <div className="space-y-4">
          {child.educationHistory.map((edu) => (
            <div key={edu.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <School className="w-4 h-4 text-sky-600" />
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{edu.schoolName}</h4>
                    <Badge variant="cyan">Ano Letivo {edu.academicYear}</Badge>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                    Série/Ano: {edu.grade} • Turno: <span className="capitalize">{edu.shift}</span>
                  </p>
                </div>

                {edu.attendancePercentage && (
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Frequência Escolar</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {edu.attendancePercentage}%
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <div>
                  <span className="font-semibold text-slate-500 block uppercase tracking-wider text-[10px]">Avaliação / Rendimento</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{edu.performanceScore || 'Em avaliação'}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block uppercase tracking-wider text-[10px]">Professor(a) / Contato Escola</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {edu.teacherName || 'Não informado'} {edu.schoolContactPhone ? `(${edu.schoolContactPhone})` : ''}
                  </p>
                </div>
              </div>

              {edu.iepNotes && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-200 block">Observações AEE / Apoio Especializado:</span>
                  <p className="text-amber-800 dark:text-amber-300 mt-0.5">{edu.iepNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Education Record */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Cadastrar Registro Escolar" maxWidth="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome da Escola / Instituição" placeholder="Ex: EMEF Professor Paulo Freire" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Série / Turma" placeholder="Ex: 4º ano Ensino Fundamental" value={grade} onChange={(e) => setGrade(e.target.value)} required />
            <Select
              label="Turno"
              options={[
                { value: 'matutino', label: 'Matutino (Manhã)' },
                { value: 'vespertino', label: 'Vespertino (Tarde)' },
                { value: 'integral', label: 'Integral' },
                { value: 'noturno', label: 'Noturno' },
              ]}
              value={shift}
              onChange={(e) => setShift(e.target.value as EducationRecord['shift'])}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Rendimento / Desempenho" placeholder="Ex: Ótimo, Média 8.5" value={performance} onChange={(e) => setPerformance(e.target.value)} />
            <Input label="Frequência Escolar (%)" type="number" min="0" max="100" value={attendance} onChange={(e) => setAttendance(Number(e.target.value))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Professor(a) de Referência" placeholder="Nome do docente" value={teacher} onChange={(e) => setTeacher(e.target.value)} />
            <Input label="Telefone da Secretaria/Escola" placeholder="(11) 2222-3333" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <Textarea label="Observações de Apoio Educacional (AEE / Tutoria)" placeholder="Informações de necessidade de reforço escolar ou adaptação curricular..." value={iepNotes} onChange={(e) => setIepNotes(e.target.value)} rows={2} />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" type="submit">Salvar Registro</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
