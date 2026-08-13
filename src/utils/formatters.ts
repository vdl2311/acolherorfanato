export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDateBR(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const [year, month, day] = dateString.split('-');
    if (year && month && day) {
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  } catch {
    return dateString;
  }
}

export function formatDateTimeBR(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function calculateAge(birthDateString: string): { years: number; months: number; text: string } {
  if (!birthDateString) return { years: 0, months: 0, text: 'Idade não informada' };
  
  const today = new Date();
  const birthDate = new Date(birthDateString);
  
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  
  if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
    years--;
    months += 12;
  }
  
  if (today.getDate() < birthDate.getDate()) {
    months--;
    if (months < 0) {
      months = 11;
    }
  }

  if (years === 0) {
    return { years, months, text: `${months} ${months === 1 ? 'mês' : 'meses'}` };
  } else if (months === 0) {
    return { years, months, text: `${years} ${years === 1 ? 'ano' : 'anos'}` };
  } else {
    return { years, months, text: `${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}` };
  }
}

export function getAgeCategory(birthDateString: string): '0-3' | '4-7' | '8-12' | '13-17' | '18+' {
  const { years } = calculateAge(birthDateString);
  if (years <= 3) return '0-3';
  if (years <= 7) return '4-7';
  if (years <= 12) return '8-12';
  if (years <= 17) return '13-17';
  return '18+';
}

export function maskCPF(cpf?: string, reveal = false): string {
  if (!cpf) return 'Não informado';
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return cpf;
  
  if (reveal) {
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
  }
  
  return `${clean.slice(0, 3)}.***.***-${clean.slice(9)}`;
}

export function maskCNPJ(cnpj?: string): string {
  if (!cnpj) return 'Não informado';
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return cnpj;
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12)}`;
}

export function maskJudicialProcess(processNum?: string, reveal = false): string {
  if (!processNum) return 'Não informado';
  if (reveal) return processNum;
  if (processNum.length < 8) return '••••••••';
  return `${processNum.slice(0, 7)}-**.****.*.**.****`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function generateCode(prefix: string, index: number): string {
  const year = new Date().getFullYear();
  const seq = String(index).padStart(3, '0');
  return `${prefix}-${year}-${seq}`;
}
