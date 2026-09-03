import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import { Footer } from '@/components/Footer';

const FAQS: { q: string; a: string }[] = [
  {
    q: 'What is this site?',
    a: 'Five free, standalone SEMH (Social, Emotional and Mental Health) questionnaires — Sensory, Behaviour, Home Behaviour, Pupil Voice and Measure What Matters. Each one runs entirely in your browser and ends with a CSV download of your results.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No. There are no accounts, no sign-up and no login anywhere on this site.',
  },
  {
    q: "Is my child's information safe?",
    a: "Yes — none of it is ever sent anywhere. Every questionnaire is calculated in your own browser and saved only to that browser's local storage, tagged with a randomly generated ID (like brave-otter-42) rather than a name. See the full Privacy Policy for details.",
  },
  {
    q: 'What happens if I clear my browser data or switch devices?',
    a: "You'll lose anything saved on this site — in-progress or completed questionnaires — since it only ever existed in that one browser. Download the CSV for anything you want to keep before doing either.",
  },
  {
    q: 'How do I keep a copy of my results?',
    a: 'Download the CSV at the end of each questionnaire. It saves straight to your device and is yours to keep, print or share as you choose.',
  },
  {
    q: 'Can I get a PDF report instead of a CSV?',
    a: "Not on this free site — a formatted PDF report is a feature of the full, paid SEMH Toolkit. You'll see a \"Download PDF\" button on most results pages that explains this rather than actually producing a PDF.",
  },
  {
    q: 'How is this different from the full SEMH Toolkit?',
    a: 'The full SEMH Toolkit is our subscription platform: accounts, securely saved records you can revisit, PDF reports, a fuller strategy library, saved young-person rosters and more. This site is a free, simplified, client-only version of five of its questionnaires, with no account and no saved records beyond your own browser.',
  },
  {
    q: 'Why do I see adverts?',
    a: "Running and developing these tools costs money, and this free version doesn't charge you anything. Google AdSense adverts, and on some results pages Amazon affiliate product suggestions, help cover that cost.",
  },
  {
    q: 'Is Pupil Voice different from the others?',
    a: "Yes. It's designed for a young person to complete about themselves, so it's kept completely free of adverts and product suggestions on every screen — nothing is monetised there.",
  },
  {
    q: 'Are these tools a diagnosis?',
    a: 'No. They are reflection and planning tools, not a clinical or diagnostic assessment, and they do not replace advice from a qualified professional.',
  },
  {
    q: 'Who are these tools for?',
    a: 'Parents, carers, teachers, SENCOs and other professionals supporting a child — plus Pupil Voice, which is for the young person themselves.',
  },
  {
    q: 'How do I get in touch?',
    a: 'This free tools site doesn’t have its own contact form. For questions, including about the full SEMH Toolkit, visit semh.co.uk.',
  },
];

export default function Faq() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Frequently Asked Questions</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Questions specific to the SEMH Free Tools site. For how your information is handled, see the{' '}
        <Link className="underline" to="/privacy">Privacy Policy</Link>.
      </p>

      <div className="mt-6 space-y-3">
        {FAQS.map((item) => (
          <Card key={item.q}>
            <h2 className="font-display text-base font-bold">{item.q}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{item.a}</p>
          </Card>
        ))}
      </div>

      <p className="mt-10 text-xs text-muted-foreground">
        <Link className="underline" to="/">← Back to the free tools</Link>
      </p>

      <Footer />
    </div>
  );
}
