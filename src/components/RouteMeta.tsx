import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import seo from '@/seo/routes.json';

function setTag(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

const meta = (key: 'name' | 'property', name: string) => () => {
  const el = document.createElement('meta');
  el.setAttribute(key, name);
  return el;
};

/**
 * Keeps the tab title, description and canonical URL in step with the current
 * route during in-app navigation. Crawlers get the same values from the
 * per-route HTML written by scripts/prerender.mjs; both read src/seo/routes.json.
 */
export function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.replace(/\/+$/, '') || '/';
    const route = seo.routes.find((r) => r.path === path) ?? seo.routes[0];
    const url = `${seo.origin}${route.path === '/' ? '/' : `${route.path}/`}`;

    document.title = route.title;
    setTag('meta[name="description"]', meta('name', 'description'), 'content', route.description);
    setTag('meta[name="robots"]', meta('name', 'robots'), 'content', route.index === false ? 'noindex, follow' : 'index, follow');
    setTag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), 'href', url);
    setTag('meta[property="og:title"]', meta('property', 'og:title'), 'content', route.title);
    setTag('meta[property="og:description"]', meta('property', 'og:description'), 'content', route.description);
    setTag('meta[property="og:url"]', meta('property', 'og:url'), 'content', url);
    setTag('meta[name="twitter:title"]', meta('name', 'twitter:title'), 'content', route.title);
    setTag('meta[name="twitter:description"]', meta('name', 'twitter:description'), 'content', route.description);
  }, [pathname]);

  return null;
}
