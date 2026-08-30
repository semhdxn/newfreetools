import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, RotateCcw } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { Footer } from '@/components/Footer';
import { TOOL_LABELS, clearAllSessions, clearSession, listSessions, type ToolId, type ToolSession } from '@/lib/storage';

const TOOLS: { id: ToolId; path: string; blurb: string; enabled: boolean }[] = [
  { id: 'sensory', path: '/sensory', blurb: 'Tick the statements that sound like the child and see which sensory areas stand out.', enabled: true },
  { id: 'behaviour', path: '/behaviour', blurb: 'Rate how often behaviours happen in school to explore possible functions.', enabled: false },
  { id: 'home-behaviour', path: '/home-behaviour', blurb: 'A parent-friendly check of behaviour and wellbeing at home, with advice.', enabled: false },
  { id: 'student-voice', path: '/student-voice', blurb: "A child-friendly questionnaire so the young person's own view is heard.", enabled: false },
  { id: 'mwm', path: '/mwm', blurb: 'Choose the outcomes that matter and score progress against them.', enabled: false },
];

export default function Home() {
  const [sessions, setSessions] = useState<ToolSession[]>([]);
  useEffect(() => setSessions(listSessions()), []);

  const sessionFor = (id: ToolId) => sessions.find((s) => s.toolId === id);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold sm:text-4xl">SEMH Free Tools</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Five free questionnaires for sensory, behaviour and wellbeing. Everything runs in your browser — there is no account, no
        upload and no server. When you finish, you download your results as a CSV spreadsheet.
      </p>

      <Card className="mt-6 border-accent/40 bg-accent/5">
        <h2 className="font-display text-base font-bold">Privacy</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Never enter a child's name, initials or any other identifying detail. Each questionnaire is labelled with a randomly
          generated ID such as <span className="font-mono">brave-otter-42</span>. Answers are saved only in this browser, so clearing
          your browser data or using another device will remove them.
        </p>
      </Card>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {TOOLS.map((tool) => {
          const s = sessionFor(tool.id);
          return (
            <Card key={tool.id} className={`flex flex-col ${!tool.enabled ? 'opacity-50' : ''}`}>
              <h2 className="font-display text-lg font-bold">{TOOL_LABELS[tool.id]}</h2>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{tool.blurb}</p>
              {!tool.enabled && (
                <p className="mt-3 rounded-lg bg-yellow-100 px-3 py-2 text-xs font-semibold text-yellow-800">
                  Finalising - Back Soon
                </p>
              )}
              {s && (
                <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                  Saved on this device — ID <span className="font-mono">{s.childId}</span>
                  {s.completed ? ' (completed)' : ' (in progress)'}
                </p>
              )}
              <div className="mt-4 flex gap-2">
                {tool.enabled ? (
                  <>
                    <Link to={tool.path} className="flex-1">
                      <Button className="w-full" variant="accent" size={s ? 'md' : 'lg'}>
                        <Play className="h-4 w-4 mr-1.5" />
                        {s ? 'Resume' : 'Start'}
                      </Button>
                    </Link>
                    {s && (
                      <Link
                        to={tool.path}
                        className="flex-1"
                        onClick={(e) => {
                          if (
                            !window.confirm(`Clear the saved ${TOOL_LABELS[tool.id]} answers on this device and start a new one?`)
                          ) {
                            e.preventDefault();
                            return;
                          }
                          clearSession(tool.id);
                          setSessions((prev) => prev.filter((sess) => sess.toolId !== tool.id));
                        }}
                      >
                        <Button className="w-full" variant="outline" size="md">
                          <RotateCcw className="h-4 w-4 mr-1.5" />
                          Clear &amp; start new
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <Button className="w-full" disabled variant="accent" size={s ? 'md' : 'lg'}>
                    <Play className="h-4 w-4 mr-1.5" />
                    Coming Soon
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {sessions.length > 0 && (
        <div className="mt-10 border-t border-border pt-6">
          <Button
            variant="outline"
            onClick={() => {
              if (window.confirm('Delete all saved answers from this browser?')) {
                clearAllSessions();
                setSessions([]);
              }
            }}
          >
            Clear all saved data
          </Button>
        </div>
      )}

      <p className="mt-10 text-xs text-muted-foreground">
        These tools are for reflection and planning. They are not a diagnostic assessment and do not replace advice from a
        qualified professional. See <Link className="underline" to="/">the full SEMH Toolkit</Link> for saved records and reports.
      </p>

      <Footer />
    </div>
  );
}
