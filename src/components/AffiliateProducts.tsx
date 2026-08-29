import { ExternalLink } from 'lucide-react';
import type { ToolId } from '@/lib/storage';
import { adsEnabledFor } from '@/lib/adConfig';
import { getProductsForArea, getProductsForAreas, productUrl, type AffiliateProduct } from '@/data/affiliateProducts';

/** Centred pill, used once near the top of a results page. */
export function AffiliateDisclosureBanner({ toolId, className = '' }: { toolId: ToolId; className?: string }) {
  if (!adsEnabledFor(toolId)) return null;
  return (
    <div className={`text-center ${className}`}>
      <span className="inline-block rounded-full border border-border/50 bg-muted/50 px-4 py-2 text-[11px] text-muted-foreground">
        As an Amazon Associate SEMH.co.uk earns from qualifying purchases, which helps fund these tools.
      </span>
    </div>
  );
}

/** Compact inline variant placed directly above a product grid. */
export function AffiliateDisclosureInline({ toolId, className = '' }: { toolId: ToolId; className?: string }) {
  if (!adsEnabledFor(toolId)) return null;
  return (
    <p className={`text-xs font-medium text-muted-foreground ${className}`}>
      Affiliate links (#ad) · <span className="italic">As an Amazon Associate we earn from qualifying purchases.</span>
    </p>
  );
}

function AffiliateProductCard({ product }: { product: AffiliateProduct }) {
  return (
    <a
      href={productUrl(product)}
      target="_blank"
      rel="sponsored noopener noreferrer nofollow"
      aria-label={`${product.title} (affiliate link, opens Amazon in a new tab)`}
      className="flex items-start gap-3 rounded-md border border-border bg-card p-3 transition-colors hover:bg-accent/10"
    >
      <div className="flex-1">
        <p className="line-clamp-2 text-sm font-medium text-foreground">{product.title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
      </div>
      <ExternalLink className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
    </a>
  );
}

/**
 * Recommended-products grid for a single area, dropped at the bottom of a
 * strategy/result card. Renders nothing if the area has no products, if ads
 * are excluded for this tool (Pupil Voice), or if the tool has no affiliate
 * catalogue at all (Measure What Matters).
 */
export function AreaProductGrid({
  toolId,
  areaId,
  className = '',
}: {
  toolId: ToolId;
  areaId: string;
  className?: string;
}) {
  if (!adsEnabledFor(toolId)) return null;
  const products = getProductsForArea(areaId);
  if (products.length === 0) return null;

  return (
    <div className={`mt-4 space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3 ${className}`}>
      <AffiliateDisclosureInline toolId={toolId} />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <AffiliateProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

/** Same as AreaProductGrid but merges products across several area/category keys. */
export function MultiAreaProductGrid({
  toolId,
  areaIds,
  className = '',
}: {
  toolId: ToolId;
  areaIds: string[];
  className?: string;
}) {
  if (!adsEnabledFor(toolId)) return null;
  const products = getProductsForAreas(areaIds);
  if (products.length === 0) return null;

  return (
    <div className={`mt-4 space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3 ${className}`}>
      <AffiliateDisclosureInline toolId={toolId} />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <AffiliateProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
