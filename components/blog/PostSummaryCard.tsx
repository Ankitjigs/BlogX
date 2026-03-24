interface PostSummaryCardProps {
  short?: string | null;
  long?: string | null;
  bullets?: unknown;
}

function normalizeBullets(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
}

export default function PostSummaryCard({
  short,
  long,
  bullets,
}: PostSummaryCardProps) {
  const list = normalizeBullets(bullets);
  const hasSummary = Boolean(short || long || list.length);
  if (!hasSummary) return null;

  return (
    <section className="mb-10 rounded-2xl border border-primary/20 bg-primary/5 p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
        <span>AI Summary</span>
      </div>
      {short && <p className="text-base font-medium text-foreground">{short}</p>}
      {long && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{long}</p>}
      {list.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {list.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
