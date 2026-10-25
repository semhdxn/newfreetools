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
      <p className="mt-2 text-sm text-muted-foreground">For the SEMH Free Tools site only — last updated 25 October 2026.</p>

      <Card className="mt-6 space-y-3">
        <h2 className="font-display text-base font-bold">The short version</h2>
        <p className="text-sm text-muted-foreground">
          This site has no account, no server and no database. Every questionnaire runs entirely in your browser: your
          answers, scores and any young person's pseudonymous ID never leave your device unless you choose to download
          or email a CSV yourself. We don't collect, see or store any of it. We only use Google Analytics to see overall, anonymised site usage if you consent through Google's consent message (see "Analytics" below), and the site carries Google AdSense adverts and Amazon affiliate links (see "Advertising" below). Neither ever sees your actual answers, and neither runs on Pupil Voice or the Chronology Builder.
        </p>
        <p className="text-sm text-muted-foreground">
          The <strong>Chronology Builder</strong> is the one exception to the “saved in your browser” wording on this page: it
          saves nothing at all, not even in your browser (see below). It is also only temporarily available here while it is tested, before it moves into the premium SEMH Toolkit.
        </p>
      </Card>

      <div className="mt-6 space-y-6">
        <section>
          <h2 className="font-display text-lg font-bold">Who we are</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This site is run by SEMH.co.uk (“we”, “us”). Because the questionnaires never send us your answers, the only
            personal data we are responsible for is the limited usage information described under “Analytics” below. For
            any privacy question, or to exercise your rights, email{' '}
            <a className="text-primary underline" href="mailto:semhadmin@semh.co.uk">semhadmin@semh.co.uk</a>.
          </p>
        </section>

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
            Each of the five questionnaires (everything except the Chronology Builder) autosaves to your browser's local storage, tagged only with a randomly generated,
            meaningless ID such as <span className="font-mono">brave-otter-42</span> — never a child's name, initials or
            any other identifying detail (the tools explicitly ask you not to enter any). That data stays on your device
            and in that specific browser. Clearing your browser data, using a private/incognito window, or opening the
            site on a different device or browser will not carry it over — and we have no way to retrieve it for you,
            because we never had a copy.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold">The Chronology Builder: nothing is saved</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The Chronology Builder works differently from the questionnaires. Because a chronology can include sensitive
            history and a date of birth, it keeps everything in memory only: nothing is saved to local storage, session
            storage, cookies or anywhere else, and nothing is sent to us or anyone else. Closing or refreshing the tab clears
            it, and the tool warns you first if you have changes you haven't exported. The only way to keep your work is the
            CSV (or PNG, PDF or HTML file) you choose to download, which is created in your browser and saved straight to your
            device. The Chronology Builder is kept free of adverts, affiliate links, analytics and the consent message, and none of
            your entries are ever sent anywhere. Please use initials or a reference rather than a full name.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold">Downloads</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            When you download a CSV (or, in the Chronology Builder, a PNG, PDF or HTML file), the file is generated locally in your browser and saved straight to
            your device — it is not uploaded to a server first. If you choose to save, print or share that file
            afterwards, that's outside our control, same as any file on your computer.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold">Hosting and fonts</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The site is delivered as static files from Amazon Web Services (AWS). As with any website, the host receives
            basic technical details when your browser requests a page (such as your IP address, browser type and the page
            requested) and may keep them in routine server logs for security and reliability. We don't use these logs to
            identify you and they never include your questionnaire answers. The site's fonts are bundled with the site
            itself, so your browser does not contact Google Fonts or any other font service.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold">Advertising and affiliate links</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            These tools are free to use because most pages carry Google AdSense adverts (including panels at the side of
            pages and a short advert screen between sets of questions) and, on some results pages, Amazon Associates
            affiliate product links. Adverts are served through Google, which works with a large number of advertising partners (listed in Google's consent message). Google and those partners may use cookies, local storage, similar identifiers and approximate location to show and measure ads and to limit how often you see the same one. Where the law requires
            consent (including in the UK and European Economic Area), Google shows its own consent message the first time
            adverts load, and you can change your choice at any time through the privacy and cookie settings option it
            provides. Whether ads are personalised depends on that choice; Google's use of your data is governed by{' '}
            <a className="text-primary underline" href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer noopener">Google's advertising policy</a>,
            not this one. We don't pass your questionnaire answers to Google or anyone else, and adverts are never
            targeted using them.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Affiliate product suggestions are ordinary links. Nothing is sent to Amazon until you click one, after which you
            are on Amazon's site and its privacy and cookie policies apply. We may earn a small commission on qualifying
            purchases at no extra cost to you, and those links are marked as affiliate links (#ad). Products are
            suggestions only, not an endorsement of any brand.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            The Pupil Voice tool, which a young person completes directly, is kept completely free of adverts, product
            links, analytics and cookie prompts on every screen, and so is the Chronology Builder.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold">Analytics</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We use Google Analytics 4 to understand overall usage of this site, for example which tools are used and how
            often, so we know what's worth improving. Our legal basis is your consent. The first time you visit, Google's consent message (the same one used for adverts) asks about cookies and data use, including analytics. The analytics script is loaded on eligible pages either way, but analytics cookies and identifiers are denied until you consent. While it is denied, Google may receive limited, cookie-free signals that a page was opened (which, like any web request, come with your IP address and browser details; Google states it does not use these to identify you). If you decline, no analytics cookies are set.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            After you accept, Google Analytics may use cookies to recognise repeat visits and records general technical
            details such as approximate location, browser and device type, and the pages you view. Google Analytics 4
            does not log or store IP addresses. Analytics data is kept for no longer than 14 months. It never sees your
            questionnaire answers, scores or any young person's pseudonymous ID. You can change your choice at any time
            using the “Cookie settings” link at the bottom of any page. Pupil Voice and the Chronology Builder are excluded
            from analytics entirely, so you won't see the consent message there.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold">Cookies and local storage</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This site's own code does not set any cookies. It uses your browser's local storage to save your in-progress
            questionnaires so you can pick them up again, and to remember the date a reminder about the full SEMH Toolkit
            was last shown, so it appears at most once a day (entries beginning “semh-free-tools”). Neither is shared with anyone. Your consent choices are remembered by Google's consent message. Cookies that may be set by third parties are Google Analytics and Google AdSense, both only subject to your choice in Google's consent message. Amazon may set cookies
            only once you click through to its site. You can also block or delete cookies and local storage in your
            browser settings; the tools still work without them.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold">Children's information</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            These questionnaires are designed to be completed by a parent, carer or professional about a child, using a
            pseudonymous ID rather than any identifying detail — except Pupil Voice, which is designed for a young
            person to complete about themselves, and is kept free of ads, product suggestions, the consent message and
            analytics tracking for that reason.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold">Your rights</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Because your questionnaire answers stay on your device, there is nothing for us to access, correct or delete;
            you control them by downloading, deleting or clearing them in your own browser. For the limited analytics data,
            you can withdraw consent at any time (see “Cookie settings”) and, under UK data protection law, you have rights
            of access, correction, erasure, restriction and objection. Email{' '}
            <a className="text-primary underline" href="mailto:semhadmin@semh.co.uk">semhadmin@semh.co.uk</a> to use them. If you
            are unhappy with how we handle your data you can complain to the Information Commissioner's Office at{' '}
            <a className="text-primary underline" href="https://ico.org.uk" target="_blank" rel="noreferrer noopener">ico.org.uk</a>.
            Google may transfer analytics and advertising data outside the UK under its own safeguards.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold">Questions</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This page describes the free tools site only. Email{' '}
            <a className="text-primary underline" href="mailto:semhadmin@semh.co.uk">semhadmin@semh.co.uk</a> with any question. For the full SEMH Toolkit, see the main <a className="text-primary underline" href="https://www.semh.co.uk" target="_blank" rel="noreferrer noopener">semh.co.uk</a> site.
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
