import jsPDF from 'jspdf';
import type { SensoryArea, Statement } from '@/data/types';
import { RESPONSE_TYPE_LABEL } from '@/data/sensoryData';

interface AreaResult {
  area: SensoryArea;
  areaStatements: Statement[];
  matched: Statement[];
  percentage: number;
  shown: Statement[];
}

interface PdfReportData {
  childId: string;
  completedDate: string;
  results: AreaResult[];
  selectedAreas: string[];
  selectedStrategies: Record<string, string[]>;
}

export function generateSensoryPdf(data: PdfReportData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 15;

  const addPage = () => {
    doc.addPage();
    yPos = 15;
  };

  // Helper functions
  const addHeading = (text: string, size = 16) => {
    doc.setFontSize(size);
    doc.setTextColor(204, 31, 49); // Brand red
    doc.text(text, 15, yPos);
    yPos += size * 0.5;
  };

  const addText = (text: string, size = 10, color = [0, 0, 0] as [number, number, number]) => {
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, pageWidth - 30);
    doc.text(lines, 15, yPos);
    yPos += lines.length * size * 0.4;
  };

  const addSpacing = (height = 5) => {
    yPos += height;
  };

  const checkPageSpace = (needed = 20) => {
    if (yPos + needed > pageHeight - 15) {
      addPage();
    }
  };

  // Header
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('SEMH', 15, 12);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Sensory Suggester Report', pageWidth - 15, 12, { align: 'right' });

  addHeading('Sensory Suggester Report', 24);
  addSpacing(3);

  // Date
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(data.completedDate, pageWidth - 15, 25, { align: 'right' });

  // Disclaimer
  addText(
    'This report displays selected sensory profile statements and corresponding strategies. It is not professional, specialist or medical advice regarding sensory processing needs or diagnosis.',
    9,
    [100, 100, 100]
  );

  addSpacing(8);

  // Info boxes
  doc.setDrawColor(204, 31, 49);
  doc.setFillColor(204, 31, 49);
  doc.rect(15, yPos, 30, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('Initials', 16, yPos + 6);
  yPos += 8;

  doc.setDrawColor(200, 200, 200);
  doc.rect(15, yPos, 30, 8);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.text(data.childId, 16, yPos + 6);
  yPos += 12;

  doc.setFillColor(204, 31, 49);
  doc.rect(15, yPos - 12, 30, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('Date completed', 16, yPos - 6);

  doc.setDrawColor(200, 200, 200);
  doc.rect(15, yPos - 4, 30, 8);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.text(data.completedDate, 16, yPos + 2);

  yPos += 12;

  // Profile matrix section
  checkPageSpace(40);
  addHeading('Profile matrix', 14);
  addSpacing(3);

  const selectedResults = data.results.filter((r) => data.selectedAreas.includes(r.area.id));

  // Create matrix table
  const startY = yPos;
  const colWidth = (pageWidth - 30) / 4;

  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);

  // Headers
  doc.text('Sensory area', 15, yPos);
  doc.setFillColor(230, 63, 99);
  doc.rect(15 + colWidth, yPos - 3, colWidth, 5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('Over-responsive', 15 + colWidth + 2, yPos + 1);

  doc.setFillColor(50, 100, 180);
  doc.rect(15 + colWidth * 2, yPos - 3, colWidth, 5, 'F');
  doc.text('Under-responsive', 15 + colWidth * 2 + 2, yPos + 1);

  doc.setFillColor(34, 160, 92);
  doc.rect(15 + colWidth * 3, yPos - 3, colWidth, 5, 'F');
  doc.text('Sensory Seeking', 15 + colWidth * 3 + 2, yPos + 1);

  yPos += 8;
  doc.setTextColor(0, 0, 0);

  // Rows
  selectedResults.forEach((result) => {
    checkPageSpace(8);
    doc.text(result.area.label, 15, yPos);

    const overResp = result.area.responseTypes.includes('over-responsive');
    const underResp = result.area.responseTypes.includes('under-responsive');
    const seeking = result.area.responseTypes.includes('sensory-seeking');

    if (overResp) {
      doc.text(`${result.percentage}%`, 15 + colWidth + 10, yPos);
    } else {
      doc.text('—', 15 + colWidth + 10, yPos);
    }

    if (underResp) {
      doc.text(`${result.percentage}%`, 15 + colWidth * 2 + 10, yPos);
    } else {
      doc.text('—', 15 + colWidth * 2 + 10, yPos);
    }

    if (seeking) {
      doc.text(`${result.percentage}%`, 15 + colWidth * 3 + 10, yPos);
    } else {
      doc.text('—', 15 + colWidth * 3 + 10, yPos);
    }

    yPos += 6;
  });

  addSpacing(5);

  // Areas in detail
  selectedResults.forEach((result) => {
    checkPageSpace(30);
    addHeading(result.area.label, 12);
    addText(`${result.percentage}% match`, 9, [100, 100, 100]);
    addSpacing(3);

    // Matched statements
    if (result.matched.length > 0) {
      addText('Observed:', 9, [0, 0, 0]);
      result.matched.forEach((stmt) => {
        addText(`• ${stmt.text}`, 8, [80, 80, 80]);
      });
      addSpacing(3);
    }
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const pageCount = (doc as any).internal.pages.length - 1;
  doc.text(`${data.childId} · Completed ${data.completedDate}`, 15, pageHeight - 10);
  doc.text(`Page 1 of ${pageCount}`, pageWidth - 15, pageHeight - 10, { align: 'right' });

  // Download
  const filename = `sensory-report-${data.childId}-${data.completedDate.replace(/\//g, '-')}.pdf`;
  doc.save(filename);
}
