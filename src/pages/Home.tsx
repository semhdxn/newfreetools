import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Play, RotateCcw, Sparkles } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { Footer } from '@/components/Footer';
import { AdBanner } from '@/components/AdBanner';
import { PremiumPopup } from '@/components/PremiumPopup';
import { ADSENSE_SLOTS } from '@/lib/adConfig';
import { premiumUrl } from '@/lib/links';
import { trackEvent } from '@/lib/analytics';
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
const PREMIUM_FEATURES = [
  'Save results securely and build a record for each young person',
  'Professional PDF reports, and comparisons to see progress over time',
  'Gentle review reminders, plus a completely ad-free experience',
];

const TOOL_ACCENTS: Record<ToolId, { bg: string; border: string; btn: string }> = {
  sensory: { bg: 'hsl(200 70% 95%)', border: 'hsl(200 55% 80%)', btn: 'hsl(200 65% 38%)' },
  behaviour: { bg: 'hsl(30 75% 94%)', border: 'hsl(30 60% 80%)', btn: 'hsl(26 80% 38%)' },
  'home-behaviour': { bg: 'hsl(266 50% 96%)', border: 'hsl(266 40% 84%)', btn: 'hsl(266 45% 47%)' },
  'student-voice': { bg: 'hsl(46 80% 93%)', border: 'hsl(46 60% 78%)', btn: 'hsl(40 85% 34%)' },
  mwm: { bg: 'hsl(150 40% 94%)', border: 'hsl(150 35% 79%)', btn: 'hsl(150 45% 30%)' },
};

export default function Home() {
  const [sessions, setSessions] = useState<ToolSession[]>([]);
  useEffect(() => setSessions(listSessions()), []);

  const sessionFor = (id: ToolId) => sessions.find((s) => s.toolId === id);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <PremiumPopup />
      <div>
        {/* The logo now lives in the shared white heading bar (src/components/Header.tsx),
            rendered once for every page in App.tsx — no need to repeat it here. */}
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">SEMH Free Tools</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Free questionnaires for sensory, behaviour and wellbeing, plus a chronology builder. No account, nothing uploaded:
          everything stays in your browser, and you download your results as a CSV.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
                      <Link
                        to={tool.path}
                        className="flex-1"
                        onClick={() => trackEvent('tool_card_click', { tool: tool.id, resumed: Boolean(s) })}
                      >
                        <Button className="w-full text-white hover:opacity-90" variant="accent" size={s ? 'md' : 'lg'} style={{ backgroundColor: accent.btn }}>
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
          <Card className="flex flex-col border" style={{ backgroundColor: 'hsl(220 18% 95%)', borderColor: 'hsl(220 14% 82%)' }}>
            <h2 className="font-display text-lg font-bold">Chronology Builder</h2>
            <p className="mt-1 inline-block self-start rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">Testing — moving to the premium toolkit</p>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">
              Turn a young person's written history into a clear visual timeline, with a one-page PDF, PNG and offline HTML report.
            </p>
            <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              Temporarily free while we test it; it will become part of the premium SEMH Toolkit. Not saved anywhere, including this browser, so use Export CSV to keep your work.
            </p>
            <div className="mt-4 flex gap-2">
              <Link to="/chronology" className="flex-1">
                <Button className="w-full" variant="accent" size="lg">
                  <Play className="h-4 w-4 mr-1.5" />
                  Start
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        <AdBanner slot={ADSENSE_SLOTS.homeBanner} label="Advertisement" className="mt-8" />

        <Card className="mt-8 border-accent/40 bg-accent/5">
          <h2 className="font-display text-base font-bold">Privacy</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Never enter a child's name, initials or any other identifying detail. Each questionnaire gets a random ID such as{' '}
            <span className="font-mono">brave-otter-42</span>. Answers are saved only in this browser, so clearing your browser data
            or switching device removes them. The Chronology Builder saves nothing at all, so export a CSV to keep your work.
          </p>
        </Card>

        <section className="mt-10 overflow-hidden rounded-2xl border border-primary/30 bg-primary/5">
          <div className="p-5 sm:p-6">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              SEMH Toolkit Premium
            </p>
            <h2 className="mt-3 font-display text-xl font-extrabold sm:text-2xl">Ready to go beyond a one-off check?</h2>

            <ul className="mt-4 space-y-2">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={premiumUrl('home_section', 'home')}
                className="sm:w-auto"
                onClick={() => trackEvent('premium_cta_click', { tool: 'home', location: 'home_section' })}
              >
                <Button variant="accent" size="lg" className="w-full sm:w-auto">
                  Explore the full toolkit
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </a>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">&pound;9.99/month</span> or{' '}
                <span className="font-semibold text-foreground">&pound;100/year</span>.
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
          qualified professional. See <a className="underline" href={premiumUrl('home_footnote', 'home')}>the full SEMH Toolkit</a> for saved records and reports.
        </p>

        <Footer />
      </div>

    </div>
  );
}
