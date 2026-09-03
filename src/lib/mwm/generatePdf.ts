import { MwmCriteria } from '@/data/mwmCriteriaData';
import { CustomQuestion } from './localStorage';

export interface QuestionnaireForPdf {
  title: string;
  description: string;
  criteria: MwmCriteria[];
  customQuestions?: CustomQuestion[];
  createdDate: string;
}

export function generatePrintableHtml(questionnaire: QuestionnaireForPdf): string {
  const { title, description, criteria, customQuestions = [], createdDate } = questionnaire;

  let statementCounter = 1;

  // Generate criteria sections with numbered statements
  const criteriaHtml = criteria
    .map(
      (c) => `
    <div style="margin-bottom: 35px; page-break-inside: avoid;">
      <h2 style="font-size: 16px; font-weight: 600; margin: 0 0 16px 0; color: #1f2937; text-transform: uppercase; letter-spacing: 0.5px;">
        ${escapeHtml(c.name)}
      </h2>
      ${c.statements
        .map(
          (s) => `
        <div style="margin-bottom: 18px; display: flex; align-items: flex-start; gap: 16px;">
          <div style="font-size: 14px; color: #4b5563; min-width: 300px;">
            <span style="font-weight: 500;">${statementCounter++}.</span> ${escapeHtml(s.statement_text)}
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: nowrap; margin-top: 2px;">
            ${[1, 2, 3, 4, 5]
              .map(
                (num) => `
              <div style="width: 32px; height: 32px; border: 2px solid #4b5563; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 500; background: white; color: #4b5563;">
                <input type="checkbox" style="width: 20px; height: 20px; cursor: pointer; margin: 0;" />
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  `
    )
    .join('');

  // Generate custom questions section
  const customQuestionsHtml =
    customQuestions && customQuestions.length > 0
      ? `
    <div style="margin-top: 40px; margin-bottom: 35px; page-break-inside: avoid; border-top: 2px solid #f43f5e; padding-top: 25px;">
      <h2 style="font-size: 16px; font-weight: 600; margin: 0 0 16px 0; color: #1f2937; text-transform: uppercase; letter-spacing: 0.5px;">
        Additional Questions
      </h2>
      ${customQuestions
        .map(
          (q) => `
        <div style="margin-bottom: 18px; display: flex; align-items: flex-start; gap: 16px;">
          <div style="font-size: 14px; color: #4b5563; min-width: 300px;">
            <span style="font-weight: 500;">${statementCounter++}.</span> ${escapeHtml(q.text)}
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: nowrap; margin-top: 2px;">
            ${[1, 2, 3, 4, 5]
              .map(
                (num) => `
              <div style="width: 32px; height: 32px; border: 2px solid #4b5563; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 500; background: white; color: #4b5563;">
                <input type="checkbox" style="width: 20px; height: 20px; cursor: pointer; margin: 0;" />
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  `
      : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - Measure What Matters</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.5;
      color: #2d3748;
      background: #f9fafb;
    }
    
    body {
      padding: 0;
      margin: 0;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      .page-break {
        page-break-before: always;
      }
    }
    
    .print-container {
      background: white;
      max-width: 900px;
      margin: 0 auto;
    }
    
    .print-actions {
      background: #f3f4f6;
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      gap: 10px;
    }
    
    .print-actions.no-print {
      display: flex;
    }
    
    .btn-print {
      padding: 10px 16px;
      background: #f43f5e;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s;
    }
    
    .btn-print:hover {
      background: #e91e63;
    }
    
    /* Logo Header */
    .logo-header {
      display: flex;
      align-items: center;
      padding: 20px;
      background: white;
      border-bottom: 4px solid #f43f5e;
    }
    
    .logo-header img {
      height: 60px;
      margin-right: 16px;
    }
    
    .logo-text {
      font-size: 12px;
      color: #9ca3af;
      letter-spacing: 2px;
      font-weight: 600;
    }
    
    /* Main content */
    .content {
      padding: 40px;
    }
    
    .form-title {
      font-size: 32px;
      font-weight: 700;
      color: #f43f5e;
      margin-bottom: 8px;
    }
    
    .form-subtitle {
      font-size: 13px;
      color: #9ca3af;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 24px;
    }
    
    .form-description {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    
    .form-date {
      font-size: 12px;
      color: #9ca3af;
      text-align: right;
      margin-bottom: 24px;
    }
    
    .instructions {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 16px;
      margin-bottom: 32px;
      border-radius: 4px;
      font-size: 13px;
      line-height: 1.6;
      color: #1e40af;
    }
    
    .scale-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 24px;
      font-weight: 500;
    }
    
    .scale-label strong {
      color: #2d3748;
    }
    
    .criteria-section {
      margin-bottom: 35px;
      page-break-inside: avoid;
    }
    
    .criteria-title {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 18px;
      color: #1f2937;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .statement-row {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 18px;
      page-break-inside: avoid;
    }
    
    .statement-text {
      font-size: 14px;
      color: #4b5563;
      flex: 1;
      min-width: 280px;
      line-height: 1.5;
    }
    
    .statement-text span {
      font-weight: 600;
      color: #1f2937;
      margin-right: 4px;
    }
    
    .checkbox-group {
      display: flex;
      gap: 8px;
      flex-wrap: nowrap;
      margin-top: 2px;
      min-width: fit-content;
    }
    
    .checkbox-box {
      width: 32px;
      height: 32px;
      border: 2px solid #4b5563;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border-radius: 2px;
    }
    
    .checkbox-box input {
      width: 20px;
      height: 20px;
      cursor: pointer;
      margin: 0;
      accent-color: #f43f5e;
    }
    
    .custom-section {
      margin-top: 40px;
      padding-top: 25px;
      border-top: 2px solid #f43f5e;
      page-break-inside: avoid;
    }
    
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 11px;
      color: #9ca3af;
      text-align: center;
    }
    
    .footer p {
      margin-bottom: 8px;
    }
    
    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
    
    .footer a:hover {
      text-decoration: underline;
    }
    
    @page {
      margin: 20mm;
      size: A4;
    }
  </style>
</head>
<body>
  <div class="print-actions no-print">
    <button class="btn-print" onclick="window.print()">🖨️ Print to PDF</button>
  </div>
  
  <div class="print-container">
    <!-- Logo Header -->
    <div class="logo-header">
      <img src="/semh-logo.jpg" alt="SEMH Logo" />
      <div class="logo-text">Measure What Matters</div>
    </div>
    
    <!-- Main Content -->
    <div class="content">
      <div class="form-title">${escapeHtml(title)}</div>
      <div class="form-subtitle">Assessment Questionnaire</div>
      
      ${description ? `<div class="form-description"><strong>Notes:</strong> ${escapeHtml(description)}</div>` : ''}
      
      <div class="form-date">${createdDate}</div>
      
      <div class="instructions">
        <strong>Instructions:</strong> Rate each statement on a scale of 1 (Never) to 5 (Always). Tick the box that best describes the young person right now.
      </div>
      
      <div class="scale-label">
        <strong>1 = Never  •  2 = Rarely  •  3 = Sometimes  •  4 = Often  •  5 = Always</strong>
      </div>
      
      <!-- Criteria Sections -->
      ${criteriaHtml}
      
      <!-- Custom Questions Section -->
      ${customQuestionsHtml}
      
      <!-- Footer -->
      <div class="footer">
        <p><strong>SEMH Toolkit</strong></p>
        <p>Visit <a href="https://www.semh.co.uk">semh.co.uk</a> for more resources and support</p>
        <p style="margin-top: 12px; font-size: 10px;">© ${new Date().getFullYear()} SEMH. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

export function downloadPdf(questionnaire: QuestionnaireForPdf): void {
  const html = generatePrintableHtml(questionnaire);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const link = document.createElement('a');
  const filename = `MWM-${questionnaire.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.html`;
  link.setAttribute('href', URL.createObjectURL(blob));
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
