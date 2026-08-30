import { Star } from 'lucide-react';

export function PremiumFeatureBanner() {
  return (
    <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <Star className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-sm text-yellow-900">Premium feature—temporarily available</p>
        <p className="text-xs text-yellow-800 mt-1">
          This feature is part of our premium toolkit during our rebuild phase and will be available for a limited time.
        </p>
      </div>
    </div>
  );
}
