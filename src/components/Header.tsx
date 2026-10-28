import { Link, useLocation } from 'react-router-dom';

/**
 * White heading bar carrying the SEMH logo, shown at the top of every page
 * (Home and all five tools) so the brand mark has one consistent home
 * instead of being repeated differently — or not at all — per page.
 */
export function Header() {
  // Pupil Voice has its own fixed top bar. Stacked on this header it covered the logo
  // and left a blank gap on phones, so the shared header is not shown there.
  const { pathname } = useLocation();
  if (pathname.replace(/^\//, '').split('/')[0] === 'student-voice') return null;

  return (
    <header className="w-full border-b border-border bg-white">
      <div className="mx-auto flex w-full max-w-4xl items-center px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center">
          <img
            src="/logo.png"
            alt="SEMH — Social, Emotional and Mental Health"
            className="h-10 w-auto object-contain sm:h-12"
          />
        </Link>
      </div>
    </header>
  );
}
