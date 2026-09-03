import { MwmCriteria } from '@/data/mwmCriteriaData';

export interface CustomQuestion {
  id: string;
  text: string;
  order: number;
}

export interface MwmQuestionnaire {
  id: string;
  title: string;
  description: string;
  selectedCriteriaIds: string[];
  customQuestions?: CustomQuestion[];
  createdAt: string;
}

export interface MwmResponse {
  id: string;
  questionnaireId: string;
  answers: Record<string, number>; // statementId -> score (1-5)
  completedAt: string;
  method: 'digital' | 'printed_then_entered';
}

const QUESTIONNAIRE_KEY = 'mwm_questionnaires';
const RESPONSE_KEY = 'mwm_responses';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function saveQuestionnaire(q: MwmQuestionnaire): void {
  const all = getAllQuestionnaires();
  const existing = all.findIndex((x) => x.id === q.id);
  if (existing >= 0) {
    all[existing] = q;
  } else {
    all.push(q);
  }
  localStorage.setItem(QUESTIONNAIRE_KEY, JSON.stringify(all));
}

export function loadQuestionnaire(id: string): MwmQuestionnaire | null {
  const all = getAllQuestionnaires();
  return all.find((q) => q.id === id) ?? null;
}

export function getAllQuestionnaires(): MwmQuestionnaire[] {
  const stored = localStorage.getItem(QUESTIONNAIRE_KEY);
  try {
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function deleteQuestionnaire(id: string): void {
  const all = getAllQuestionnaires();
  localStorage.setItem(QUESTIONNAIRE_KEY, JSON.stringify(all.filter((q) => q.id !== id)));
  // Also delete associated responses
  const allResponses = getAllResponses();
  localStorage.setItem(RESPONSE_KEY, JSON.stringify(allResponses.filter((r) => r.questionnaireId !== id)));
}

export function saveResponse(r: MwmResponse): void {
  const all = getAllResponses();
  const existing = all.findIndex((x) => x.id === r.id);
  if (existing >= 0) {
    all[existing] = r;
  } else {
    all.push(r);
  }
  localStorage.setItem(RESPONSE_KEY, JSON.stringify(all));
}

export function loadResponse(id: string): MwmResponse | null {
  const all = getAllResponses();
  return all.find((r) => r.id === id) ?? null;
}

export function getAllResponses(): MwmResponse[] {
  const stored = localStorage.getItem(RESPONSE_KEY);
  try {
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getResponsesForQuestionnaire(questionnaireId: string): MwmResponse[] {
  return getAllResponses().filter((r) => r.questionnaireId === questionnaireId).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
}

export function deleteResponse(id: string): void {
  const all = getAllResponses();
  localStorage.setItem(RESPONSE_KEY, JSON.stringify(all.filter((r) => r.id !== id)));
}
