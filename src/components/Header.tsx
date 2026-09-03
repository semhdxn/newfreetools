import { Link } from 'react-router-dom';

/**
 * White heading bar carrying the SEMH logo, shown at the top of every page
 * (Home and all five tools) so the brand mark has one consistent home
 * instead of being repeated differently — or not at all — per page.
 */
export function Header() {
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
