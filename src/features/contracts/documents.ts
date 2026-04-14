import jsPDF from "jspdf";

import {
  buildContractClauseExplanations,
  buildContractSignatureSummary,
  buildContractWordHtml,
  buildProposalSummary,
  stripLegacySignaturePlaceholders,
  type ContractBuilderPayload,
} from "@/lib/contract-builder";

function buildPdfFileName(title: string) {
  return title.replace(/[^a-zA-Z0-9]/g, "_");
}

function drawWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  pageHeight: number,
  bottomMargin: number,
) {
  const lines = doc.splitTextToSize(text, maxWidth);
  let nextY = y;

  for (const line of lines) {
    if (nextY > pageHeight - bottomMargin) {
      doc.addPage();
      nextY = 18;
    }
    doc.text(line, x, nextY);
    nextY += lineHeight;
  }

  return nextY;
}

export type ContractPdfOptions = {
  assinaturaAdmin?: string | null;
  assinaturaCliente?: string | null;
  proposal?: ContractBuilderPayload | null;
  contractanteSignedName?: string | null;
  signedAt?: string | null;
};

export function generateContractPDF(
  titulo: string,
  corpo: string,
  options?: ContractPdfOptions,
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const maxWidth = pageWidth - margin * 2;
  const summary = options?.proposal ? buildProposalSummary(options.proposal) : null;
  const explanations = options?.proposal ? buildContractClauseExplanations(options.proposal) : [];
  const cleanedBody = stripLegacySignaturePlaceholders(corpo);
  const signatureSummary = buildContractSignatureSummary(options?.proposal, {
    contractanteSignedName: options?.contractanteSignedName,
    signedAt: options?.signedAt,
  });

  doc.setFillColor(123, 31, 162);
  doc.rect(0, 0, pageWidth / 3, 14, "F");
  doc.setFillColor(232, 51, 74);
  doc.rect(pageWidth / 3, 0, pageWidth / 3, 14, "F");
  doc.setFillColor(194, 24, 91);
  doc.rect((pageWidth / 3) * 2, 0, pageWidth / 3, 14, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("NovaesWeb • Contrato Comercial Premium", margin, 9);

  doc.setTextColor(19, 13, 26);
  doc.setFontSize(16);
  doc.text(titulo, margin, 26);

  let y = 38;

  if (summary) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(92, 77, 104);
    doc.setFontSize(9.5);
    y = drawWrappedText(
      doc,
      "Proposta premium gerada pelo montador comercial da NovaesWeb com escopo selecionado, condições financeiras, bloco de escopo e corpo contratual consolidado.",
      margin,
      y,
      maxWidth,
      5,
      pageHeight,
      18,
    );

    const cardWidth = (maxWidth - 8) / 2;
    const drawSummaryCard = (title: string, lines: string[], x: number, startY: number) => {
      const contentLines = lines.flatMap((line) => doc.splitTextToSize(line, cardWidth - 10));
      const cardHeight = Math.max(26, 16 + contentLines.length * 4.4);
      doc.setDrawColor(236, 223, 244);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, startY, cardWidth, cardHeight, 4, 4, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(141, 60, 176);
      doc.text(title.toUpperCase(), x + 5, startY + 7);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(55, 43, 64);
      let cardY = startY + 13;
      contentLines.forEach((line) => {
        doc.text(line, x + 5, cardY);
        cardY += 4.4;
      });
      return cardHeight;
    };

    y += 4;
    const leftHeight = drawSummaryCard(summary.contractante.title, summary.contractante.lines, margin, y);
    const rightHeight = drawSummaryCard(summary.contratada.title, summary.contratada.lines, margin + cardWidth + 8, y);
    y += Math.max(leftHeight, rightHeight) + 8;
    const comercialHeight = drawSummaryCard(summary.comercial.title, summary.comercial.lines, margin, y);
    y += comercialHeight + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(141, 60, 176);
    doc.text("PLANO E SERVIÇOS CONTRATADOS", margin, y);
    y += 7;

    const serviceLines: string[] = [];
    if (summary.selectedPlan) {
      serviceLines.push(`${summary.selectedPlan.name} — ${summary.selectedPlan.pricing}`);
    }
    if (summary.customScope) {
      serviceLines.push(`Escopo customizado: ${summary.customScope}`);
    }
    summary.selectedServices.forEach((service) => {
      serviceLines.push(`${service.name} — ${service.pricing}`);
      if (service.description) {
        serviceLines.push(`Descrição: ${service.description}`);
      }
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.4);
    doc.setTextColor(41, 31, 50);
    serviceLines.forEach((line) => {
      if (y > pageHeight - 22) {
        doc.addPage();
        y = 18;
      }
      const wrapped = doc.splitTextToSize(`• ${line}`, maxWidth);
      wrapped.forEach((entry: string) => {
        if (y > pageHeight - 22) {
          doc.addPage();
          y = 18;
        }
        doc.text(entry, margin, y);
        y += 4.8;
      });
      y += 1;
    });

    if (summary.pricingBreakdown.length > 0) {
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(141, 60, 176);
      doc.text("FECHAMENTO FINANCEIRO", margin, y);
      y += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.4);
      doc.setTextColor(41, 31, 50);
      summary.pricingBreakdown.forEach((line) => {
        const wrapped = doc.splitTextToSize(`• ${line}`, maxWidth);
        wrapped.forEach((entry: string) => {
          if (y > pageHeight - 22) {
            doc.addPage();
            y = 18;
          }
          doc.text(entry, margin, y);
          y += 4.8;
        });
      });
      y += 3;
    }

    if (y > pageHeight - 28) {
      doc.addPage();
      y = 18;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(141, 60, 176);
    doc.text(summary.scopeNotice.title.toUpperCase(), margin, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.4);
    doc.setTextColor(41, 31, 50);
    summary.scopeNotice.lines.forEach((line) => {
      y = drawWrappedText(doc, line, margin, y, maxWidth, 4.8, pageHeight, 18);
      y += 1.5;
    });

    y += 3;
    doc.setDrawColor(240, 216, 234);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  }

  if (explanations.length > 0) {
    if (y > pageHeight - 28) {
      doc.addPage();
      y = 18;
    }

    doc.setFont("helvetica", "bold");
    doc.setTextColor(141, 60, 176);
    doc.setFontSize(10);
    doc.text("CONTRATO EXPLICADO EM LINGUAGEM SIMPLES", margin, y);
    y += 7;

    explanations.forEach((item) => {
      if (y > pageHeight - 26) {
        doc.addPage();
        y = 18;
      }

      doc.setFont("helvetica", "bold");
      doc.setTextColor(76, 33, 102);
      doc.setFontSize(9.8);
      y = drawWrappedText(
        doc,
        `Cláusula ${item.number} — ${item.title}`,
        margin,
        y,
        maxWidth,
        4.9,
        pageHeight,
        18,
      );

      doc.setFont("helvetica", "normal");
      doc.setTextColor(41, 31, 50);
      doc.setFontSize(9.6);
      y = drawWrappedText(doc, item.explanation, margin, y + 1, maxWidth, 4.8, pageHeight, 18);
      y += 3.5;
    });

    doc.setDrawColor(240, 216, 234);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  }

  doc.setFont("helvetica", "bold");
  doc.setTextColor(19, 13, 26);
  doc.setFontSize(11);
  doc.text("CONTRATO MESTRE UNIVERSAL DE PRESTAÇÃO DE SERVIÇOS DIGITAIS NOVAESWEB", margin, y);
  y += 7;

  const paragraphs = cleanedBody.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.2);
  doc.setTextColor(31, 23, 40);

  for (const paragraph of paragraphs) {
    const isClause =
      /^CLÁUSULA\s+\d+/i.test(paragraph) ||
      /^CONTRATO /i.test(paragraph) ||
      /^CONTRATANTE:/i.test(paragraph) ||
      /^CONTRATADA:/i.test(paragraph);
    if (isClause) {
      if (y > pageHeight - 24) {
        doc.addPage();
        y = 18;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.6);
      doc.setTextColor(90, 34, 122);
      y = drawWrappedText(doc, paragraph, margin, y, maxWidth, 5.1, pageHeight, 18);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.2);
      doc.setTextColor(31, 23, 40);
      y += 1.5;
      continue;
    }

    y = drawWrappedText(doc, paragraph, margin, y, maxWidth, 5, pageHeight, 18);
    y += 2.5;
  }

  if (signatureSummary) {
    const sectionHeight = 70;
    const cardGap = 8;
    const cardWidth = (maxWidth - cardGap) / 2;
    const cardHeight = 30;

    if (y > pageHeight - 90) {
      doc.addPage();
      y = 18;
    }

    y += 6;
    doc.setDrawColor(236, 223, 244);
    doc.setFillColor(250, 244, 251);
    doc.roundedRect(margin, y, maxWidth, sectionHeight, 6, 6, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(141, 60, 176);
    doc.text("ACEITE E ASSINATURA", pageWidth / 2, y + 8, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.2);
    doc.setTextColor(97, 84, 109);
    doc.text(signatureSummary.locationAndDate, pageWidth / 2, y + 14, { align: "center" });

    const drawSignatureCard = (x: number, startY: number, role: string, name: string, caption: string) => {
      doc.setDrawColor(236, 223, 244);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, startY, cardWidth, cardHeight, 5, 5, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.setTextColor(139, 121, 152);
      doc.text(role.toUpperCase(), x + cardWidth / 2, startY + 6.5, { align: "center" });
      doc.setDrawColor(194, 24, 91);
      doc.line(x + 8, startY + 12.5, x + cardWidth - 8, startY + 12.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(31, 23, 40);
      doc.text(name, x + cardWidth / 2, startY + 20, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(109, 95, 119);
      doc.text(caption, x + cardWidth / 2, startY + 25.5, { align: "center" });
    };

    const cardsY = y + 20;
    drawSignatureCard(margin, cardsY, "Contratante", signatureSummary.contractanteName, signatureSummary.contractanteCaption);
    drawSignatureCard(margin + cardWidth + cardGap, cardsY, "Contratada", signatureSummary.contratadaName, signatureSummary.contratadaCaption);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.4);
    doc.setTextColor(109, 95, 119);
    doc.text(signatureSummary.note, pageWidth / 2, y + sectionHeight - 6, { align: "center" });
    y += sectionHeight + 4;
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(240, 216, 234);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(109, 95, 119);
    doc.text("NovaesWeb • Estrutura digital premium • Documento gerado no painel administrativo", margin, pageHeight - 7);
  }

  doc.save(`${buildPdfFileName(titulo)}.pdf`);
}

export function downloadWordDocument(
  title: string,
  body: string,
  proposal?: ContractBuilderPayload | null,
  signatureOptions?: {
    contractanteSignedName?: string | null;
    signedAt?: string | null;
  },
) {
  const blob = new Blob([buildContractWordHtml(title, body, proposal, signatureOptions)], {
    type: "application/msword;charset=utf-8",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${buildPdfFileName(title)}.doc`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
