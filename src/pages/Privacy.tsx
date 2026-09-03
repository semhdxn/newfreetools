import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import { Footer } from '@/components/Footer';

/**
 * Privacy policy for THIS standalone, client-only site specifically — not a
 * copy of the premium SEMH Toolkit's policy, which covers a server, accounts
 * and stored records that this build deliberately doesn't have.
 */
export default function Privacy() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">For the SEMH Free Tools site only — last updated September 2026.</p>

      <Card className="mt-6 space-y-3">
        <h2 className="font-display text-base font-bold">The short version</h2>
        <p className="text-sm text-muted-foreground">
          This site has no account, no server and no database. Every questionnaire runs entirely in your browser: your
          answers, scores and any young person's pseudonymous ID never leave your device unless you choose to download
          or email a CSV yourself. We don't collect, see or store any of it. We only use Google Analytics to see overall,
          anonymised site usage if you accept the cookie banner (see "Analytics" below) — it never runs on Pupil Voice,
          it's off by default until you accept, and it never sees your actual answers.
        </p>
      </Card>

      <div className="mt-6 space-y-6">
        <section>
          <h2 className="font-display text-lg font-bold">No accounts, no server-side processing</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Unlike the full SEMH Toolkit (our premium, subscription platform), this free site doesn't ask you to sign up
            or log in, and it doesn't have a backend that receives, processes or stores your answers. Every calculation —
            scoring, results, advice — happens with JavaScript running in your own browser. There is nothing for us to
            intercept, log or lose, because it's never sent to us in the first place.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold">Where your answers actually live</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Each questionnaire autosaves to your browser's local storage, tagged only with a randomly generated,
            meaningless ID such as <span className="font-mono">brave-otter-42</span> — never a child's name, initials or
            any other identifying detail (the tools explicitly ask you not to enter any). That data stays on your device
            and in that specific browser. Clearing your browser data, using a private/incognito window, or opening the
            site on a different device or browser will not carry it over — and we have no way to retrieve it for you,
            because we never had a copy.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold">Downloads</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            When you download a CSV of your results, the file is generated locally in your browser and saved straight to
            your device — it is not uploaded to a server first. If you choose to save, print or share that file
            afterwards, that's outside our control, same as any file on your computer.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold">Advertising and affiliate links</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            These tools are free to use because most pages carry Google AdSense adverts and, on some results pages,
            Amazon Associates affiliate product links. Loading an advert means a script from Google runs in your browser
            and may use cookies or similar technology to help serve and measure ads — that's governed by Google's own
            privacy policy, not this one, and we don't pass your questionnaire answers to Google or anyone else. Clicking
            an affiliate product link takes you to Amazon, governed by Amazon's privacy policy. The Pupil Voice tool,
            which a young person completes directly, is kept completely free of adverts and product links on every
            screen.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold">Analytics</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We use Google Analytics to understand overall usage of this site — for example, which tools are used and how
            often — so we know what's worth improving. Analytics does not run by default: the first time you visit, a
            cookie banner asks whether you're happy for it to run, and nothing is collected unless and until you choose
            "Accept". If you choose "Reject" (or simply don't respond), no analytics script runs and no analytics
            cookies are set. Once accepted, a script from Google runs in your browser and may use cookies or similar
            technology to recognise repeat visits; it can see general technical details like your approximate location
            (from your IP address, which we have configured Google Analytics to anonymise), browser and device type,
            and the pages you visit on this site. It never sees your questionnaire answers, scores or any young
            person's pseudonymous ID — those stay local to your browser as described above and are never part of what
            analytics receives. As with adverts, the Pupil Voice tool is excluded from analytics entirely, on every
            screen — you won't even see the cookie banner there.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold">Cookies</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This site's own code doesn't set any cookies — there's no account or session to track. Aside from a single,
            strictly-necessary entry in your browser's local storage that remembers whether you accepted or rejected
            the cookie banner (so we don't ask again every visit), the third-party services above (ads, analytics, and
            the Google Fonts used for the site's typefaces) are what may set cookies of their own — and, for analytics,
            only after you accept. See their respective privacy policies for details.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold">Children's information</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            These questionnaires are designed to be completed by a parent, carer or professional about a child, using a
            pseudonymous ID rather than any identifying detail — except Pupil Voice, which is designed for a young
            person to complete about themselves, and is kept free of ads, product suggestions, the cookie banner and
            analytics tracking for that reason.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold">Questions</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This page describes the free tools site only. For anything about the full SEMH Toolkit or to get in touch,
            see the main <a className="text-primary underline" href="https://www.semh.co.uk" target="_blank" rel="noreferrer noopener">semh.co.uk</a> site.
          </p>
        </section>
      </div>

      <p className="mt-10 text-xs text-muted-foreground">
        <Link className="underline" to="/">← Back to the free tools</Link>
      </p>

      <Footer />
    </div>
  );
}
