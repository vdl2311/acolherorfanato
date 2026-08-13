export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const processRow = (row: (string | number)[]) => {
    return row
      .map((val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(';');
  };

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(processRow)].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(filename: string, data: unknown) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printDocumentHTML(title: string, htmlContent: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permita popups para imprimir relatórios.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; line-height: 1.5; font-size: 13px; margin: 0; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; }
        .header h1 { font-size: 18px; margin: 0 0 4px 0; color: #0369a1; text-transform: uppercase; }
        .header p { margin: 2px 0; color: #64748b; font-size: 11px; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 14px; font-weight: bold; background: #f1f5f9; padding: 6px 10px; border-left: 4px solid #0284c7; margin-bottom: 10px; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .field { margin-bottom: 6px; }
        .field-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; display: block; }
        .field-value { font-size: 12px; font-weight: 500; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
        th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
        th { background: #f8fafc; font-weight: bold; }
        .footer { margin-top: 40px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 10px; color: #94a3b8; }
        .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
        .sig-line { width: 45%; text-align: center; border-top: 1px solid #334155; padding-top: 4px; font-size: 11px; }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Associação Lar Esperança & Acolhimento Sementes do Amanhã</h1>
        <p>CNPJ: 12.345.678/0001-90 | Registro Conselho Municipal dos Direitos da Criança e do Adolescente (CMDCA nº 104)</p>
        <p>Rua das Acácias, 450 - São Paulo/SP | Tel: (11) 3456-7890 | email: contato@sementesdoamanha.org.br</p>
      </div>
      <h2>${title}</h2>
      ${htmlContent}
      <div class="footer">
        <p>Documento oficial gerado pelo Sistema Acolher em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')} — Protegido pela Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).</p>
      </div>
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
