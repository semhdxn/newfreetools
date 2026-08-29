import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { TOOL_LABELS, clearAllSessions, listSessions, type ToolId, type ToolSession } from '@/lib/storage';

const TOOLS: { id: ToolId; path: string; blurb: string }[] = [
  { id: 'sensory', path: '/sensory', blurb: 'Tick the statements that sound like the child and see which sensory areas stand out.' },
  { id: 'behaviour', path: '/behaviour', blurb: 'Rate how often behaviours happen in school to explore possible functions.' },
  { id: 'home-behaviour', path: '/home-behaviour', blurb: 'A parent-friendly check of behaviour and wellbeing at home, with advice.' },
  { id: 'student-voice', path: '/student-voice', blurb: "A child-friendly questionnaire so the young person's own view is heard." },
  { id: 'mwm', path: '/mwm', blurb: 'Choose the outcomes that matter and score progress against them.' },
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
            <Card key={tool.id} className="flex flex-col">
              <h2 className="font-display text-lg font-bold">{TOOL_LABELS[tool.id]}</h2>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{tool.blurb}</p>
              {s && (
                <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                  Saved on this device — ID <span className="font-mono">{s.childId}</span>
                  {s.completed ? ' (completed)' : ' (in progress)'}
                </p>
              )}
              <Link to={tool.path} className="mt-4">
                <Button className="w-full" variant="accent" size="lg">
                  {s ? 'Resume' : 'Start'}
                </Button>
              </Link>
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
    </div>
  );
}
