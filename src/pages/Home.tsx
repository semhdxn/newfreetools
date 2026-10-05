import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Play, RotateCcw, Sparkles } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { Footer } from '@/components/Footer';
import { AdBanner } from '@/components/AdBanner';
import { ADSENSE_SLOTS } from '@/lib/adConfig';
import { TOOL_LABELS, clearAllSessions, clearSession, listSessions, type ToolId, type ToolSession } from '@/lib/storage';

const TOOLS: { id: ToolId; path: string; blurb: string; enabled: boolean }[] = [
  { id: 'sensory', path: '/sensory', blurb: 'Tick the statements that sound like the child and see which sensory areas stand out.', enabled: true },
  { id: 'behaviour', path: '/behaviour', blurb: 'Rate how often behaviours happen in school to explore possible functions.', enabled: true },
  { id: 'home-behaviour', path: '/home-behaviour', blurb: 'A parent-friendly check of behaviour and wellbeing at home, with advice.', enabled: true },
  { id: 'student-voice', path: '/student-voice', blurb: "A child-friendly questionnaire so the young person's own view is heard.", enabled: true },
  { id: 'mwm', path: '/mwm', blurb: 'Choose the outcomes that matter and score progress against them.', enabled: true },
];

/** A distinct pastel accent per tool card — complementary pairings around the
 *  brand's pink/red primary (~354° hue), kept light enough that the existing
 *  dark foreground/muted-foreground text stays fully readable on top. */
const PREMIUM_URL = 'https://toolkit.semh.co.uk';

const PREMIUM_FEATURES = [
  'Save results securely and build a record for each young person (up to 50 young people and 250 assessments)',
  'Professional PDF reports to share with colleagues, parents and carers',
  'Compare up to 5 results over time to see progress',
  'Gentle email reminder 6 weeks after an assessment, so reviews don\'t get missed',
  'Bring in a parent\'s or pupil\'s CSV from these free tools and attach it to a record',
  'Fuller strategy libraries, completely ad-free',
];

const TOOL_ACCENTS: Record<ToolId, { bg: string; border: string }> = {
  sensory: { bg: 'hsl(200 70% 95%)', border: 'hsl(200 55% 80%)' },
  behaviour: { bg: 'hsl(30 75% 94%)', border: 'hsl(30 60% 80%)' },
  'home-behaviour': { bg: 'hsl(266 50% 96%)', border: 'hsl(266 40% 84%)' },
  'student-voice': { bg: 'hsl(46 80% 93%)', border: 'hsl(46 60% 78%)' },
  mwm: { bg: 'hsl(150 40% 94%)', border: 'hsl(150 35% 79%)' },
};

export default function Home() {
  const [sessions, setSessions] = useState<ToolSession[]>([]);
  useEffect(() => setSessions(listSessions()), []);

  const sessionFor = (id: ToolId) => sessions.find((s) => s.toolId === id);

  return (
    // The two <aside> rails only show at xl+ (they'd have nowhere to go on tablet/mobile),
    // so ads live down the side instead of stacked as banners between the card grid.
    <div className="mx-auto flex w-full max-w-[1400px] justify-center gap-6 px-4 py-10">
      <aside className="sticky top-6 hidden h-fit w-[160px] shrink-0 xl:block">
        <AdBanner slot={ADSENSE_SLOTS.homeBanner} label="Advertisement" orientation="vertical" />
      </aside>

      <div className="w-full max-w-4xl sm:px-6">
        {/* The logo now lives in the shared white heading bar (src/components/Header.tsx),
            rendered once for every page in App.tsx — no need to repeat it here. */}
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

        <div className="mt-4 flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <p>
            These are free, basic versions of the tools in the full SEMH Toolkit (premium) — saved records, richer reports and
            fuller strategy libraries live there. Adverts and sponsored products on this site help cover the cost of developing
            and running these free tools, so they can stay free to use.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {TOOLS.map((tool) => {
            const s = sessionFor(tool.id);
            const accent = TOOL_ACCENTS[tool.id];
            return (
              <Card
                key={tool.id}
                className={`flex flex-col border ${!tool.enabled ? 'opacity-50' : ''}`}
                style={{ backgroundColor: accent.bg, borderColor: accent.border }}
              >
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

        <section className="mt-10 overflow-hidden rounded-2xl border border-primary/30 bg-primary/5">
          <div className="p-6 sm:p-8">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              SEMH Toolkit Premium
            </p>
            <h2 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">Ready to go beyond a one-off check?</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              The free tools are a great starting point. The full SEMH Toolkit lets you keep records, track progress over time and
              produce reports you can share, all in one place.
            </p>

            <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href={PREMIUM_URL} className="sm:w-auto">
                <Button variant="accent" size="lg" className="w-full sm:w-auto">
                  Explore the full toolkit
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </a>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">&pound;9.99/month</span> or{' '}
                <span className="font-semibold text-foreground">&pound;100/year</span> (about two months free). Organisation plans
                available for schools and settings.
              </p>
            </div>
          </div>
        </section>

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
          qualified professional. See <a className="underline" href={PREMIUM_URL}>the full SEMH Toolkit</a> for saved records and reports.
        </p>

        <Footer />
      </div>

      <aside className="sticky top-6 hidden h-fit w-[160px] shrink-0 xl:block">
        <AdBanner slot={ADSENSE_SLOTS.homeBanner} label="Advertisement" orientation="vertical" />
      </aside>
    </div>
  );
}
