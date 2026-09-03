interface LikertRowProps {
  statementId: string;
  text: string;
  value: number | undefined;
  onChange: (score: number) => void;
}

const SCALE = [
  { value: 1, label: 'Never' },
  { value: 2, label: 'Rarely' },
  { value: 3, label: 'Sometimes' },
  { value: 4, label: 'Often' },
  { value: 5, label: 'Always' },
];

export default function LikertRow({ statementId, text, value, onChange }: LikertRowProps) {
  return (
    <div className="border rounded-lg p-3 mb-3">
      <p className="text-sm font-medium mb-2">{text}</p>
      <div className="flex flex-wrap gap-2">
        {SCALE.map((s) => (
          <label key={s.value} className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="radio"
              name={statementId}
              value={s.value}
              checked={value === s.value}
              onChange={() => onChange(s.value)}
              className="w-4 h-4"
            />
            {s.label}
          </label>
        ))}
      </div>
    </div>
  );
}
