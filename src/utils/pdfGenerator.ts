import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Subscription, UserProfile } from '../types';
import { CATEGORIES } from '../data/categories';
import { calculateTotals, getCategoryBreakdown, formatCurrency, formatDate } from './calculations';

export function generateSubscriptionsPDF(
  subscriptions: Subscription[],
  userProfile: UserProfile | null,
  theme: 'light' | 'dark' = 'light'
) {
  const isDark = theme === 'dark';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Helper to draw background
  const drawPageBackground = () => {
    if (isDark) {
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    }
  };

  // Draw background on first page
  drawPageBackground();

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
  if (isDark) {
    doc.setFillColor(15, 118, 110); // teal-700
    doc.setDrawColor(20, 184, 166); // teal-500
    doc.roundedRect(margin, 12, contentWidth, 22, 2, 2, 'FD');
  } else {
    doc.setFillColor(13, 148, 136); // #0d9488
    doc.rect(margin, 12, contentWidth, 22, 'F');
  }

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
  if (isDark) {
    doc.setFillColor(19, 78, 74); // dark teal
    doc.setDrawColor(20, 184, 166); // teal-500
    doc.roundedRect(margin, startYMetrics, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(45, 212, 191); // teal-400
    doc.text('GASTO MENSAL ESTIMADO', margin + 4, startYMetrics + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(formatCurrency(totals.monthlyTotal), margin + 4, startYMetrics + 13.5);
  } else {
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
  }

  // Card 2: Projeção Anual
  const card2X = margin + cardWidth + 4;
  if (isDark) {
    doc.setFillColor(30, 41, 59); // slate-800
    doc.setDrawColor(51, 65, 85); // slate-700
    doc.roundedRect(card2X, startYMetrics, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('PROJEÇÃO ANUAL', card2X + 4, startYMetrics + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(248, 250, 252);
    doc.text(formatCurrency(totals.yearlyTotal), card2X + 4, startYMetrics + 13.5);
  } else {
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
  }

  // Card 3: Assinaturas Ativas
  const card3X = card2X + cardWidth + 4;
  if (isDark) {
    doc.setFillColor(30, 41, 59);
    doc.setDrawColor(51, 65, 85);
    doc.roundedRect(card3X, startYMetrics, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('ASSINATURAS ATIVAS', card3X + 4, startYMetrics + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(248, 250, 252);
    doc.text(`${totals.activeCount} de ${totals.totalCount} cadastradas`, card3X + 4, startYMetrics + 13.5);
  } else {
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
  }

  // --- SECTION 1: CATEGORY BREAKDOWN ---
  let currentY = startYMetrics + cardHeight + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  if (isDark) {
    doc.setTextColor(248, 250, 252);
  } else {
    doc.setTextColor(15, 23, 42);
  }
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
      fillColor: isDark ? [30, 41, 59] : [241, 245, 249],
      textColor: isDark ? [203, 213, 225] : [51, 65, 85],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.2,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: isDark ? [226, 232, 240] : [51, 65, 85],
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: isDark ? [22, 30, 46] : [250, 250, 250],
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: isDark ? [248, 250, 252] : [15, 23, 42] },
      1: { cellWidth: 35, textColor: isDark ? [148, 163, 184] : [100, 116, 139] },
      2: { cellWidth: 40, fontStyle: 'bold', textColor: isDark ? [248, 250, 252] : [15, 23, 42] },
      3: { cellWidth: 35, fontStyle: 'bold', textColor: isDark ? [45, 212, 191] : [13, 148, 136] },
    },
    willDrawPage: () => {
      drawPageBackground();
    },
  });

  // --- SECTION 2: FULL SUBSCRIPTIONS LIST ---
  const lastTable = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
  currentY = (lastTable ? lastTable.finalY : currentY + 40) + 8;

  // Check if we have enough space for section header and some table rows
  if (currentY > pageHeight - 40) {
    doc.addPage();
    drawPageBackground();
    currentY = 16;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  if (isDark) {
    doc.setTextColor(248, 250, 252);
  } else {
    doc.setTextColor(15, 23, 42);
  }
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
      fillColor: isDark ? [15, 118, 110] : [13, 148, 136], // teal-700 / teal-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: isDark ? [226, 232, 240] : [51, 65, 85],
      cellPadding: 2.2,
      lineColor: isDark ? [51, 65, 85] : [226, 232, 240],
      lineWidth: 0.2,
      fillColor: isDark ? [15, 23, 42] : [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: isDark ? [22, 30, 46] : [248, 250, 252],
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: isDark ? [248, 250, 252] : [15, 23, 42] },
      1: { textColor: isDark ? [148, 163, 184] : [100, 116, 139] },
      2: { fontStyle: 'bold', textColor: isDark ? [248, 250, 252] : [15, 23, 42] },
      3: { textColor: isDark ? [203, 213, 225] : [71, 85, 105] },
      4: { textColor: isDark ? [203, 213, 225] : [71, 85, 105] },
      5: { fontStyle: 'bold' },
      6: { textColor: isDark ? [148, 163, 184] : [100, 116, 139] },
    },
    didParseCell: (data) => {
      // Highlight Status column
      if (data.section === 'body' && data.column.index === 5) {
        const text = data.cell.raw as string;
        if (text === 'Ativa') {
          data.cell.styles.textColor = isDark ? [45, 212, 191] : [13, 148, 136]; // Teal
        } else if (text === 'Pausada') {
          data.cell.styles.textColor = isDark ? [251, 191, 36] : [217, 119, 6]; // Amber
        } else if (text === 'Cancelada') {
          data.cell.styles.textColor = isDark ? [251, 113, 133] : [225, 29, 72]; // Rose
        }
      }
    },
    willDrawPage: () => {
      drawPageBackground();
    },
  });

  // --- FOOTER ON ALL PAGES ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    if (isDark) {
      doc.setTextColor(148, 163, 184); // slate-400
      doc.setDrawColor(51, 65, 85);
    } else {
      doc.setTextColor(148, 163, 184); // slate-400
      doc.setDrawColor(226, 232, 240);
    }

    // Footer divider
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    doc.text(
      `Recorra • Gerado em ${dateFormatted} às ${timeFormatted} • Modo ${isDark ? 'Noturno' : 'Claro'} • Armazenamento seguro`,
      margin,
      pageHeight - 6
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  // Save the PDF
  const filename = `recorra_relatorio_${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
