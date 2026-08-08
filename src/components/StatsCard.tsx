interface StatsCardProps {
  label: string;
  value: string | number;
  caption: string;
  delay?: number;
}

export default function StatsCard({
  label,
  value,
  caption,
  delay = 0,
}: StatsCardProps) {
  return (
    <div
      className="card animate-rise p-6"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="eyebrow">{label}</p>
      <p className="mt-3 font-serif text-[42px] leading-none tracking-tight text-ink">
        {value}
      </p>
      <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">{caption}</p>
    </div>
  );
}
