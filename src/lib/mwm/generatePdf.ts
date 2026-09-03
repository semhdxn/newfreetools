import html2pdf from 'html2pdf.js';
import { MwmCriteria } from '@/data/mwmCriteriaData';
import { CustomQuestion } from './localStorage';

export interface QuestionnaireForPdf {
  title: string;
  description: string;
  criteria: MwmCriteria[];
  customQuestions?: CustomQuestion[];
  createdDate: string;
}

function createPdfContent(questionnaire: QuestionnaireForPdf): HTMLElement {
  const { title, description, criteria, customQuestions = [], createdDate } = questionnaire;

  let statementCounter = 1;

  const container = document.createElement('div');
  container.style.cssText = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.5;
    color: #2d3748;
    padding: 40px;
    background: white;
    max-width: 900px;
  `;

  // Logo Header
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    align-items: center;
    padding-bottom: 20px;
    margin-bottom: 20px;
    border-bottom: 4px solid #f43f5e;
  `;

  const logo = document.createElement('img');
  logo.src = '/semh-logo.jpg';
  logo.style.cssText = `
    height: 60px;
    margin-right: 16px;
  `;
  logo.alt = 'SEMH Logo';

  const headerText = document.createElement('div');
  headerText.style.cssText = `
    font-size: 12px;
    color: #9ca3af;
    letter-spacing: 2px;
    font-weight: 600;
  `;
  headerText.textContent = 'MEASURE WHAT MATTERS';

  header.appendChild(logo);
  header.appendChild(headerText);
  container.appendChild(header);

  // Title Section
  const titleDiv = document.createElement('h1');
  titleDiv.style.cssText = `
    font-size: 32px;
    font-weight: 700;
    color: #f43f5e;
    margin: 20px 0 8px 0;
  `;
  titleDiv.textContent = title;
  container.appendChild(titleDiv);

  const subtitleDiv = document.createElement('div');
  subtitleDiv.style.cssText = `
    font-size: 13px;
    color: #9ca3af;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 16px;
  `;
  subtitleDiv.textContent = 'Assessment Questionnaire';
  container.appendChild(subtitleDiv);

  if (description) {
    const descDiv = document.createElement('div');
    descDiv.style.cssText = `
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 8px;
    `;
    descDiv.innerHTML = `<strong>Notes:</strong> ${escapeHtml(description)}`;
    container.appendChild(descDiv);
  }

  const dateDiv = document.createElement('div');
  dateDiv.style.cssText = `
    font-size: 12px;
    color: #9ca3af;
    text-align: right;
    margin-bottom: 24px;
  `;
  dateDiv.textContent = createdDate;
  container.appendChild(dateDiv);

  // Instructions
  const instructions = document.createElement('div');
  instructions.style.cssText = `
    background: #eff6ff;
    border-left: 4px solid #3b82f6;
    padding: 16px;
    margin-bottom: 24px;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.6;
    color: #1e40af;
  `;
  instructions.innerHTML = `
    <strong>Instructions:</strong> Rate each statement on a scale of 1 (Never) to 5 (Always). Tick the box that best describes the young person right now.
  `;
  container.appendChild(instructions);

  // Scale Label
  const scaleLabel = document.createElement('div');
  scaleLabel.style.cssText = `
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 24px;
    font-weight: 500;
  `;
  scaleLabel.innerHTML = `<strong>1 = Never  •  2 = Rarely  •  3 = Sometimes  •  4 = Often  •  5 = Always</strong>`;
  container.appendChild(scaleLabel);

  // Criteria Sections
  criteria.forEach((criterion) => {
    const section = document.createElement('div');
    section.style.cssText = `
      margin-bottom: 32px;
      page-break-inside: avoid;
    `;

    const criteriaTitle = document.createElement('h2');
    criteriaTitle.style.cssText = `
      font-size: 15px;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: #1f2937;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    `;
    criteriaTitle.textContent = criterion.name;
    section.appendChild(criteriaTitle);

    criterion.statements.forEach((statement) => {
      const row = document.createElement('div');
      row.style.cssText = `
        display: flex;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 16px;
        page-break-inside: avoid;
      `;

      const textDiv = document.createElement('div');
      textDiv.style.cssText = `
        font-size: 14px;
        color: #4b5563;
        flex: 1;
        min-width: 250px;
        line-height: 1.5;
      `;
      textDiv.innerHTML = `<span style="font-weight: 600; color: #1f2937; margin-right: 4px;">${statementCounter++}.</span> ${escapeHtml(statement.statement_text)}`;
      row.appendChild(textDiv);

      const checkboxGroup = document.createElement('div');
      checkboxGroup.style.cssText = `
        display: flex;
        gap: 6px;
        flex-wrap: nowrap;
        margin-top: 2px;
        min-width: fit-content;
      `;

      for (let i = 1; i <= 5; i++) {
        const checkbox = document.createElement('div');
        checkbox.style.cssText = `
          width: 28px;
          height: 28px;
          border: 2px solid #4b5563;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 2px;
          font-size: 11px;
          font-weight: 600;
          color: #4b5563;
        `;
        checkbox.textContent = '';
        checkboxGroup.appendChild(checkbox);
      }

      row.appendChild(checkboxGroup);
      section.appendChild(row);
    });

    container.appendChild(section);
  });

  // Custom Questions Section
  if (customQuestions.length > 0) {
    const customSection = document.createElement('div');
    customSection.style.cssText = `
      margin-top: 32px;
      padding-top: 20px;
      border-top: 2px solid #f43f5e;
      page-break-inside: avoid;
    `;

    const customTitle = document.createElement('h2');
    customTitle.style.cssText = `
      font-size: 15px;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: #1f2937;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    `;
    customTitle.textContent = 'Additional Questions';
    customSection.appendChild(customTitle);

    customQuestions.forEach((q) => {
      const row = document.createElement('div');
      row.style.cssText = `
        display: flex;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 16px;
        page-break-inside: avoid;
      `;

      const textDiv = document.createElement('div');
      textDiv.style.cssText = `
        font-size: 14px;
        color: #4b5563;
        flex: 1;
        min-width: 250px;
        line-height: 1.5;
      `;
      textDiv.innerHTML = `<span style="font-weight: 600; color: #1f2937; margin-right: 4px;">${statementCounter++}.</span> ${escapeHtml(q.text)}`;
      row.appendChild(textDiv);

      const checkboxGroup = document.createElement('div');
      checkboxGroup.style.cssText = `
        display: flex;
        gap: 6px;
        flex-wrap: nowrap;
        margin-top: 2px;
        min-width: fit-content;
      `;

      for (let i = 1; i <= 5; i++) {
        const checkbox = document.createElement('div');
        checkbox.style.cssText = `
          width: 28px;
          height: 28px;
          border: 2px solid #4b5563;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 2px;
        `;
        checkboxGroup.appendChild(checkbox);
      }

      row.appendChild(checkboxGroup);
      customSection.appendChild(row);
    });

    container.appendChild(customSection);
  }

  // Footer
  const footer = document.createElement('div');
  footer.style.cssText = `
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
    font-size: 11px;
    color: #9ca3af;
    text-align: center;
  `;
  footer.innerHTML = `
    <p><strong>SEMH Toolkit</strong></p>
    <p>Visit <a href="https://www.semh.co.uk" style="color: #3b82f6; text-decoration: none;">semh.co.uk</a> for more resources and support</p>
    <p style="margin-top: 8px; font-size: 10px;">© ${new Date().getFullYear()} SEMH. All rights reserved.</p>
  `;
  container.appendChild(footer);

  return container;
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
  const element = createPdfContent(questionnaire);
  document.body.appendChild(element);

  const filename = `MWM-${questionnaire.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;

  const options = {
    margin: [10, 10, 10, 10],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, logging: false },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
  };

  html2pdf().set(options).from(element).save().then(() => {
    document.body.removeChild(element);
  });
}
