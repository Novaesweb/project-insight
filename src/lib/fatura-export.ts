import jsPDF from "jspdf";
import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, Packer } from "docx";
import { saveAs } from "file-saver";

interface FaturaData {
  descricao: string;
  valor: number;
  vencimento: string;
  data_emissao: string;
  status: string;
  clienteNome?: string;
}

const statusLabel: Record<string, string> = { paga: "Paga", pendente: "Pendente", atrasada: "Atrasada", pago: "Pago", em_atraso: "Em Atraso" };

function formatDate(d: string) {
  if (!d) return "—";
  const date = new Date(d + "T12:00:00");
  return date.toLocaleDateString("pt-BR");
}

function formatCurrency(v: number) {
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export function exportFaturaPDF(fatura: FaturaData) {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(232, 51, 74);
  doc.rect(0, 0, w, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("FATURA", 20, 25);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("WebNovaX", w - 20, 18, { align: "right" });
  doc.text("Soluções Digitais", w - 20, 25, { align: "right" });

  // Body
  doc.setTextColor(60, 60, 60);
  let y = 58;

  const addField = (label: string, value: string) => {
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.text(label, 20, y);
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text(value, 20, y + 6);
    y += 18;
  };

  if (fatura.clienteNome) addField("CLIENTE", fatura.clienteNome);
  addField("DESCRIÇÃO", fatura.descricao);
  addField("VALOR", formatCurrency(fatura.valor));
  addField("DATA DE EMISSÃO", formatDate(fatura.data_emissao));
  addField("VENCIMENTO", formatDate(fatura.vencimento));
  addField("STATUS", statusLabel[fatura.status] || fatura.status);

  // Divider
  y += 5;
  doc.setDrawColor(232, 51, 74);
  doc.setLineWidth(0.5);
  doc.line(20, y, w - 20, y);

  // Total box
  y += 12;
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(20, y, w - 40, 30, 3, 3, "F");
  doc.setFontSize(10);
  doc.setTextColor(140, 140, 140);
  doc.text("TOTAL A PAGAR", 30, y + 12);
  doc.setFontSize(18);
  doc.setTextColor(232, 51, 74);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(fatura.valor), w - 30, y + 20, { align: "right" });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.setFont("helvetica", "normal");
  doc.text("Documento gerado automaticamente pelo sistema WebNovaX", w / 2, 280, { align: "center" });

  doc.save(`fatura-${fatura.descricao.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}

export async function exportFaturaWord(fatura: FaturaData) {
  const borderNone = { top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } };

  const makeRow = (label: string, value: string) =>
    new TableRow({
      children: [
        new TableCell({ borders: borderNone, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20, color: "888888" })] })] }),
        new TableCell({ borders: borderNone, width: { size: 6000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: value, size: 22 })] })] }),
      ],
    });

  const rows = [];
  if (fatura.clienteNome) rows.push(makeRow("Cliente", fatura.clienteNome));
  rows.push(makeRow("Descrição", fatura.descricao));
  rows.push(makeRow("Valor", formatCurrency(fatura.valor)));
  rows.push(makeRow("Emissão", formatDate(fatura.data_emissao)));
  rows.push(makeRow("Vencimento", formatDate(fatura.vencimento)));
  rows.push(makeRow("Status", statusLabel[fatura.status] || fatura.status));

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ alignment: AlignmentType.LEFT, spacing: { after: 400 }, children: [new TextRun({ text: "FATURA", bold: true, size: 44, color: "E8334A" })] }),
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "WebNovaX — Soluções Digitais", size: 20, color: "888888" })] }),
        new Paragraph({ spacing: { after: 300 }, children: [] }),
        new Table({ rows, width: { size: 9000, type: WidthType.DXA } }),
        new Paragraph({ spacing: { before: 400 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 200 },
          children: [
            new TextRun({ text: "TOTAL: ", bold: true, size: 28 }),
            new TextRun({ text: formatCurrency(fatura.valor), bold: true, size: 32, color: "E8334A" }),
          ],
        }),
        new Paragraph({ spacing: { before: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Documento gerado automaticamente pelo sistema WebNovaX", size: 16, color: "BBBBBB" })] }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `fatura-${fatura.descricao.replace(/\s+/g, "-").toLowerCase()}.docx`);
}

export function exportFaturaCSV(fatura: FaturaData) {
  const rows = [
    ["Descrição", "Valor", "Emissão", "Vencimento", "Status", "Cliente"],
    [fatura.descricao, formatCurrency(fatura.valor), formatDate(fatura.data_emissao), formatDate(fatura.vencimento), statusLabel[fatura.status] || fatura.status, fatura.clienteNome || ""],
  ];
  const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `fatura-${fatura.descricao.replace(/\s+/g, "-").toLowerCase()}.csv`);
}


