import { useState, useMemo, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { ToolShell, StepNav } from '@/components/ToolShell';
import { Plus, ArrowLeft, Gauge, Download } from 'lucide-react';
import { MWM_GLOBAL_CRITERIA } from '@/data/mwmCriteriaData';
import { useToolSession } from '@/lib/useToolSession';
import { AdBanner } from '@/components/AdBanner';
import { ADSENSE_SLOTS } from '@/lib/adConfig';
import {
  MwmQuestionnaire,
  CustomQuestion,
  generateId,
  saveQuestionnaire,
  loadQuestionnaire,
  getAllQuestionnaires,
  deleteQuestionnaire,
} from '@/lib/mwm/localStorage';
import { downloadPdf } from '@/lib/mwm/generatePdf';
import CriteriaPicker from '@/components/mwm/CriteriaPicker';
import SelectedCriteriaList from '@/components/mwm/SelectedCriteriaList';
import CustomCriteriaForm from '@/components/mwm/CustomCriteriaForm';

type MwmPhase = 'index' | 'builder' | 'download';

interface MwmToolState {
  phase: MwmPhase;
  activeQuestionnaireId: string | null;
  // Builder state
  builderTitle: string;
  builderDescription: string;
  builderSelectedIds: string[];
  builderCustomQuestions: CustomQuestion[];
  builderCustomQuestionInput: string;
  // Download state
  downloadCountdown: number;
}

function initialState(): MwmToolState {
  return {
    phase: 'index',
    activeQuestionnaireId: null,
    builderTitle: '',
    builderDescription: '',
    builderSelectedIds: [],
    builderCustomQuestions: [],
    builderCustomQuestionInput: '',
    downloadCountdown: 5,
  };
}

export default function MwmTool() {
  const { state, childId, setState, restart } = useToolSession<MwmToolState>('mwm', initialState());

  const [templates, setTemplates] = useState<MwmQuestionnaire[]>([]);

  // Sync templates
  useEffect(() => {
    setTemplates(getAllQuestionnaires());
  }, [state.phase]);

  const activeQuestionnaire = useMemo(
    () => (state.activeQuestionnaireId ? loadQuestionnaire(state.activeQuestionnaireId) : null),
    [state.activeQuestionnaireId]
  );

  const selectedCriteria = useMemo(
    () => MWM_GLOBAL_CRITERIA.filter((c) => state.builderSelectedIds.includes(c.id)),
    [state.builderSelectedIds]
  );

  // ========== BUILDER HANDLERS ==========
  const handleBuilderToggle = (id: string) => {
    setState((prev) => {
      const ids = prev.builderSelectedIds;
      return {
        ...prev,
        builderSelectedIds: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
      };
    });
  };

  const handleBuilderMove = (id: string, direction: -1 | 1) => {
    setState((prev) => {
      const ids = [...prev.builderSelectedIds];
      const idx = ids.indexOf(id);
      if (idx < 0) return prev;
      const nextIdx = idx + direction;
      if (nextIdx < 0 || nextIdx >= ids.length) return prev;
      [ids[idx], ids[nextIdx]] = [ids[nextIdx], ids[idx]];
      return { ...prev, builderSelectedIds: ids };
    });
  };

  const handleBuilderRemove = (id: string) => {
    setState((prev) => ({
      ...prev,
      builderSelectedIds: prev.builderSelectedIds.filter((x) => x !== id),
    }));
  };

  const handleCustomQuestionAdd = () => {
    const text = state.builderCustomQuestionInput.trim();
    if (text.length === 0) return;

    const newQuestion: CustomQuestion = {
      id: generateId(),
      text,
      order: state.builderCustomQuestions.length,
    };

    setState((prev) => ({
      ...prev,
      builderCustomQuestions: [...prev.builderCustomQuestions, newQuestion],
      builderCustomQuestionInput: '',
    }));
  };

  const handleCustomQuestionRemove = (id: string) => {
    setState((prev) => ({
      ...prev,
      builderCustomQuestions: prev.builderCustomQuestions.filter((x) => x.id !== id),
    }));
  };

  const handleBuilderCreatePdf = () => {
    if (state.builderTitle.trim().length === 0 || selectedCriteria.length === 0) return;

    const q: MwmQuestionnaire = {
      id: generateId(),
      title: state.builderTitle.trim(),
      description: state.builderDescription.trim(),
      selectedCriteriaIds: state.builderSelectedIds,
      customQuestions: state.builderCustomQuestions.length > 0 ? state.builderCustomQuestions : undefined,
      createdAt: new Date().toISOString(),
    };

    saveQuestionnaire(q);
    setTemplates(getAllQuestionnaires());

    // Start countdown
    setState((prev) => ({
      ...prev,
      activeQuestionnaireId: q.id,
      phase: 'download',
      downloadCountdown: 5,
    }));
  };

  // ========== DOWNLOAD COUNTDOWN ==========
  useEffect(() => {
    if (state.phase !== 'download') return;

    if (state.downloadCountdown <= 0) {
      // Trigger download
      if (activeQuestionnaire) {
        downloadPdf({
          title: activeQuestionnaire.title,
          description: activeQuestionnaire.description,
          criteria: selectedCriteria,
          customQuestions: activeQuestionnaire.customQuestions,
          createdDate: new Date().toLocaleDateString(),
        });
      }
      // Go back to index
      setTimeout(() => {
        setState((prev) => ({ ...initialState(), phase: 'index' }));
        setTemplates(getAllQuestionnaires());
      }, 500);
      return;
    }

    const timer = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        downloadCountdown: prev.downloadCountdown - 1,
      }));
    }, 1000);

    return () => clearTimeout(timer);
  }, [state.phase, state.downloadCountdown, activeQuestionnaire, selectedCriteria]);

  // ========== INDEX / START SCREEN ==========
  if (state.phase === 'index') {
    return (
      <ToolShell title="Measure What Matters" childId={childId} onRestart={restart}>
        <div className="space-y-4">
          <Card className="bg-primary/5 border-primary/40">
            <div className="p-4 space-y-2 text-sm">
              <p className="font-medium flex items-center gap-2">
                <Gauge className="h-4 w-4 text-primary" />
                Create questionnaire forms to print and use
              </p>
              <p className="text-muted-foreground">
                Build a questionnaire from our criteria bank, then download a printable PDF form.
              </p>
            </div>
          </Card>

          <Button className="w-full" onClick={() => setState((prev) => ({ ...prev, phase: 'builder' }))}>
            <Plus className="h-4 w-4 mr-2" /> New Questionnaire
          </Button>

          <AdBanner toolId="mwm" slot={ADSENSE_SLOTS.homeBanner} />

          {templates.length > 0 && (
            <Card>
              <div className="p-4">
                <h3 className="font-medium mb-3 text-sm">Your questionnaires</h3>
                <div className="space-y-2">
                  {templates.map((t) => (
                    <div key={t.id} className="flex items-center justify-between border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{t.title}</p>
                        {t.description && <p className="text-xs text-muted-foreground truncate">{t.description}</p>}
                        <p className="text-xs text-muted-foreground">{t.selectedCriteriaIds.length} criteria</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const loaded = loadQuestionnaire(t.id);
                            if (loaded) {
                              setState((prev) => ({
                                ...initialState(),
                                activeQuestionnaireId: t.id,
                                builderTitle: loaded.title,
                                builderDescription: loaded.description,
                                builderSelectedIds: loaded.selectedCriteriaIds,
                                builderCustomQuestions: loaded.customQuestions || [],
                                phase: 'builder',
                              }));
                            }
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm('Delete this questionnaire?')) {
                              deleteQuestionnaire(t.id);
                              setTemplates(getAllQuestionnaires());
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </ToolShell>
    );
  }

  // ========== BUILDER ==========
  if (state.phase === 'builder') {
    const canCreate = state.builderTitle.trim().length > 0 && selectedCriteria.length > 0;

    return (
      <ToolShell
        title="Build a questionnaire"
        childId={childId}
        stepIndex={1}
        stepCount={2}
        stepLabel="Builder"
        onRestart={() => setState((prev) => ({ ...initialState(), phase: 'index' }))}
        footer={
          <StepNav
            onBack={() => setState((prev) => ({ ...prev, phase: 'index' }))}
            onNext={handleBuilderCreatePdf}
            nextDisabled={!canCreate}
            nextLabel="Create PDF"
          />
        }
      >
        <div className="space-y-4">
          {/* Details */}
          <Card>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Term 2 check-in"
                  value={state.builderTitle}
                  onChange={(e) => setState((prev) => ({ ...prev, builderTitle: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                <textarea
                  placeholder="Add any notes or instructions for this questionnaire"
                  value={state.builderDescription}
                  onChange={(e) => setState((prev) => ({ ...prev, builderDescription: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  rows={2}
                />
              </div>
            </div>
          </Card>

          {/* Selected Criteria */}
          <Card>
            <div className="p-4">
              <h3 className="font-medium text-sm mb-3">Selected criteria (order will appear on form)</h3>
              <SelectedCriteriaList selected={selectedCriteria} onMove={handleBuilderMove} onRemove={handleBuilderRemove} />
            </div>
          </Card>

          {/* Criteria Bank */}
          <Card>
            <div className="p-4">
              <h3 className="font-medium text-sm mb-3">Criteria bank (pick from 35 outcomes)</h3>
              <CriteriaPicker selected={selectedCriteria} onToggle={(c) => handleBuilderToggle(c.id)} />
            </div>
          </Card>

          {/* Custom Criteria */}
          <Card>
            <div className="p-4">
              <CustomCriteriaForm />
            </div>
          </Card>

          {/* Custom Questions */}
          <Card>
            <div className="p-4 space-y-3">
              <h3 className="font-medium text-sm">Add custom questions (optional)</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 'Demonstrates resilience when facing challenges'"
                  value={state.builderCustomQuestionInput}
                  onChange={(e) => setState((prev) => ({ ...prev, builderCustomQuestionInput: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCustomQuestionAdd();
                    }
                  }}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCustomQuestionAdd}
                  disabled={state.builderCustomQuestionInput.trim().length === 0}
                >
                  Add
                </Button>
              </div>
              {state.builderCustomQuestions.length > 0 && (
                <div className="space-y-2 mt-3 pt-3 border-t">
                  {state.builderCustomQuestions.map((q, idx) => (
                    <div key={q.id} className="flex items-start justify-between gap-2 p-2 bg-gray-50 rounded">
                      <div className="flex-1 text-sm">
                        <span className="font-medium">{state.builderSelectedIds.length + idx + 1}.</span> {q.text}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCustomQuestionRemove(q.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <AdBanner toolId="mwm" slot={ADSENSE_SLOTS.inputBanner} />
        </div>
      </ToolShell>
    );
  }

  // ========== DOWNLOAD (Countdown) ==========
  if (state.phase === 'download') {
    return (
      <ToolShell title="Creating your PDF..." childId={childId} onRestart={restart}>
        <div className="space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <div className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <Download className="h-12 w-12 text-blue-600 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-blue-900">Your form is ready!</h2>
              <p className="text-blue-800">
                Your questionnaire PDF will download automatically in{' '}
                <span className="text-3xl font-bold text-blue-600">{state.downloadCountdown}</span> seconds.
              </p>
              <p className="text-sm text-blue-700">You can print it from your browser or save it as a PDF.</p>
            </div>
          </Card>

          <Card>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-sm mb-2">Questionnaire details:</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Title:</dt>
                  <dd className="font-medium">{activeQuestionnaire?.title}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Criteria:</dt>
                  <dd className="font-medium">{selectedCriteria.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Statements:</dt>
                  <dd className="font-medium">{selectedCriteria.reduce((sum, c) => sum + c.statements.length, 0)}</dd>
                </div>
              </dl>
            </div>
          </Card>

          <AdBanner toolId="mwm" slot={ADSENSE_SLOTS.resultsBanner} />
        </div>
      </ToolShell>
    );
  }

  // Fallback
  return <ToolShell title="Measure What Matters" childId={childId} onRestart={restart} />;
}
