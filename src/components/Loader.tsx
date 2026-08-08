interface LoaderProps {
  copy?: string;
  className?: string;
}

export default function Loader({
  copy = "Gathering your lines…",
  className = "",
}: LoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-5 px-6 py-16 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="loader-line" aria-hidden="true" />
      <p className="animate-breathe font-serif text-xl text-ink-soft">{copy}</p>
    </div>
  );
}
