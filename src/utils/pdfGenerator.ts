import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Subscription, UserProfile } from '../types';
import { CATEGORIES } from '../data/categories';
import { calculateTotals, getCategoryBreakdown, formatCurrency, formatDate } from './calculations';

export function generateSubscriptionsPDF(subscriptions: Subscription[], userProfile: UserProfile | null) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const totals = calculateTotals(subscriptions);
  const categoriesBreakdown = getCategoryBreakdown(subscriptions);

  const cycleLabels: Record<string, string> = {
    monthly: 'Mensal',
    yearly: 'Anual',
    weekly: 'Semanal',
  };

  const statusLabels: Record<string, string> = {
    active: 'Ativa',
    paused: 'Pausada',
    cancelled: 'Cancelada',
  };

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeFormatted = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // --- HEADER SECTION ---
  // Teal Brand Bar
  doc.setFillColor(13, 148, 136); // #0d9488
  doc.rect(margin, 12, contentWidth, 22, 'F');

  // App Logo & Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Recorra', margin + 6, 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(204, 251, 241); // teal-100
  doc.text('Relatório Financeiro de Assinaturas', margin + 6, 29);

  // User and Date Meta (Right aligned in header)
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  const userName = userProfile?.name ? userProfile.name : 'Meu Controle Pessoal';
  doc.text(userName, pageWidth - margin - 6, 21, { align: 'right' });
  doc.setTextColor(204, 251, 241);
  doc.text(`Gerado em: ${dateFormatted} às ${timeFormatted}`, pageWidth - margin - 6, 28, { align: 'right' });

  // --- KPI SUMMARY CARDS (Top Metrics) ---
  const startYMetrics = 39;
  const cardWidth = (contentWidth - 8) / 3;
  const cardHeight = 18;

  // Card 1: Mensal Total
  doc.setFillColor(240, 253, 250); // teal-50
  doc.setDrawColor(204, 251, 241); // teal-100
  doc.roundedRect(margin, startYMetrics, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 118, 110); // teal-700
  doc.text('GASTO MENSAL ESTIMADO', margin + 4, startYMetrics + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(formatCurrency(totals.monthlyTotal), margin + 4, startYMetrics + 13.5);

  // Card 2: Projeção Anual
  const card2X = margin + cardWidth + 4;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(card2X, startYMetrics, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('PROJEÇÃO ANUAL', card2X + 4, startYMetrics + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(totals.yearlyTotal), card2X + 4, startYMetrics + 13.5);

  // Card 3: Assinaturas Ativas
  const card3X = card2X + cardWidth + 4;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(card3X, startYMetrics, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('ASSINATURAS ATIVAS', card3X + 4, startYMetrics + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`${totals.activeCount} de ${totals.totalCount} cadastradas`, card3X + 4, startYMetrics + 13.5);

  // --- SECTION 1: CATEGORY BREAKDOWN ---
  let currentY = startYMetrics + cardHeight + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Distribuição Mensal por Categoria', margin, currentY);

  currentY += 3;

  const categoryRows = categoriesBreakdown.map((item) => {
    const catLabel = CATEGORIES[item.category]?.label || item.category;
    return [
      catLabel,
      `${item.count} ${item.count === 1 ? 'assinatura' : 'assinaturas'}`,
      formatCurrency(item.amount),
      `${item.percentage.toFixed(1)}%`,
    ];
  });

  if (categoryRows.length === 0) {
    categoryRows.push(['Nenhuma assinatura ativa', '-', 'R$ 0,00', '0%']);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Categoria', 'Qtd. Assinaturas', 'Total Mensal (R$)', '% do Orçamento']],
    body: categoryRows,
    theme: 'plain',
    headStyles: {
      fillColor: [241, 245, 249], // slate-100
      textColor: [51, 65, 85],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.2,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [15, 23, 42] },
      1: { cellWidth: 35 },
      2: { cellWidth: 40, fontStyle: 'bold' },
      3: { cellWidth: 35, fontStyle: 'bold', textColor: [13, 148, 136] },
    },
  });

  // --- SECTION 2: FULL SUBSCRIPTIONS LIST ---
  const lastTable = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
  currentY = (lastTable ? lastTable.finalY : currentY + 40) + 8;

  // Check if we have enough space for section header and some table rows
  if (currentY > pageHeight - 40) {
    doc.addPage();
    currentY = 16;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Lista Completa de Assinaturas', margin, currentY);

  currentY += 3;

  // Sort subscriptions by Category, then by Name
  const sortedSubs = [...subscriptions].sort((a, b) => {
    const catA = CATEGORIES[a.category]?.label || a.category;
    const catB = CATEGORIES[b.category]?.label || b.category;
    if (catA !== catB) return catA.localeCompare(catB);
    return a.name.localeCompare(b.name);
  });

  const subsRows = sortedSubs.map((sub) => {
    const categoryLabel = CATEGORIES[sub.category]?.label || sub.category;
    const cycleLabel = cycleLabels[sub.billingCycle] || sub.billingCycle;
    const statusLabel = statusLabels[sub.status] || sub.status;
    const formattedAmount = formatCurrency(sub.amount);
    const formattedDate = formatDate(sub.nextBillingDate);
    const trialBadge = sub.isTrial ? 'Sim (Teste)' : 'Não';

    return [
      sub.name,
      categoryLabel,
      formattedAmount,
      cycleLabel,
      formattedDate,
      statusLabel,
      trialBadge,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Serviço', 'Categoria', 'Valor', 'Ciclo', 'Próx. Vencimento', 'Status', 'Teste']],
    body: subsRows.length > 0 ? subsRows : [['Nenhuma assinatura cadastrada', '-', '-', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: {
      fillColor: [13, 148, 136], // teal-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
      cellPadding: 2.2,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [15, 23, 42] },
      1: { textColor: [100, 116, 139] },
      2: { fontStyle: 'bold', textColor: [15, 23, 42] },
      3: { textColor: [71, 85, 105] },
      4: { textColor: [71, 85, 105] },
      5: { fontStyle: 'bold' },
      6: { textColor: [100, 116, 139] },
    },
    didParseCell: (data) => {
      // Highlight Status column
      if (data.section === 'body' && data.column.index === 5) {
        const text = data.cell.raw as string;
        if (text === 'Ativa') {
          data.cell.styles.textColor = [13, 148, 136]; // Teal
        } else if (text === 'Pausada') {
          data.cell.styles.textColor = [217, 119, 6]; // Amber
        } else if (text === 'Cancelada') {
          data.cell.styles.textColor = [225, 29, 72]; // Rose
        }
      }
    },
  });

  // --- FOOTER ON ALL PAGES ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400

    // Footer divider
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    doc.text(
      `Recorra • Gerado em ${dateFormatted} às ${timeFormatted} • Armazenamento seguro no dispositivo`,
      margin,
      pageHeight - 6
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  // Save the PDF
  const filename = `recorra_relatorio_${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
