import { AlertCircle } from 'lucide-react';
import { PREMIUM_URL } from '@/lib/links';

export default function CustomCriteriaForm() {
  return (
    <div className="border-2 border-dashed rounded-lg p-4 bg-blue-50 border-blue-200">
      <div className="flex gap-2">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-blue-900">Custom criteria not available</p>
          <p className="text-blue-800">In this free tools version, use the global criteria bank. For custom criteria, <a className="underline" href={PREMIUM_URL}>upgrade to the full toolkit</a>.</p>
        </div>
      </div>
    </div>
  );
}
