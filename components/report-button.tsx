'use client';

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Subscription } from '@/types';
import { formatCurrency } from '@/lib/util';

interface ReportButtonProps {
  subscriptions: Subscription[];
}

export function ReportButton({ subscriptions }: ReportButtonProps) {
  const handleDownload = async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([560, 720]);
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const textFont = await doc.embedFont(StandardFonts.Helvetica);
    const total = subscriptions.reduce((sum, item) => sum + item.monthlyCost, 0);

    page.drawText('SpendWise AI Audit Report', {
      x: 40,
      y: 680,
      size: 22,
      font,
      color: rgb(0.92, 0.64, 1),
    });
    page.drawText('Powered by SpendWise AI', { x: 40, y: 658, size: 10, font: textFont, color: rgb(0.75, 0.75, 0.85) });
    page.drawText(`Monthly SaaS spend: ${formatCurrency(total)}`, { x: 40, y: 620, size: 12, font: textFont, color: rgb(1, 1, 1) });
    page.drawText(`Tools audited: ${subscriptions.length}`, { x: 40, y: 600, size: 12, font: textFont, color: rgb(1, 1, 1) });

    page.drawRectangle({ x: 40, y: 520, width: 480, height: 56, color: rgb(0.08, 0.05, 0.18) });
    page.drawText('Recommendation summary', { x: 50, y: 548, size: 11, font, color: rgb(0.96, 0.82, 1) });
    page.drawText('Review low-usage and overlapping tools, reallocate seats, and optimize plan tiers for modern growth teams.', { x: 50, y: 532, size: 9, font: textFont, color: rgb(0.83, 0.83, 0.9), maxWidth: 440 });

    const lines = subscriptions.slice(0, 6).map((subscription, index) => `${subscription.name} • ${formatCurrency(subscription.monthlyCost)} • ${subscription.plan}`);
    lines.forEach((line, index) => {
      page.drawText(line, { x: 40, y: 500 - index * 18, size: 10, font: textFont, color: rgb(0.92, 0.92, 0.96) });
    });

    const pdfBytes = await doc.save();
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'spendwise-audit-report.pdf';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <button type="button" onClick={handleDownload} className="inline-flex items-center rounded-3xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
      Download premium report
    </button>
  );
}
