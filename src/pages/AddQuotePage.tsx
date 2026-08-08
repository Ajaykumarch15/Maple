import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuotes } from "../store/quotes";
import { SOURCE_TYPES } from "../types";
import type { Quote, SourceType } from "../types";
import Loader from "../components/Loader";
import { CheckIcon, PlusIcon, XIcon } from "../components/icons";

const CURATED_TAGS = [
  "on-writing",
  "courage",
  "being-alive",
  "love",
  "loss",
  "time",
  "memory",
  "mindfulness",
  "nature",
  "work",
];

export default function AddQuotePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { getQuote, collections, addQuote, allTags } = useQuotes();

  const editId = params.get("edit");
  const [editing, setEditing] = useState<Quote | undefined>(undefined);
  const [formReady, setFormReady] = useState(false);

  const [text, setText] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("Book");
  const [work, setWork] = useState("");
  const [author, setAuthor] = useState("");
  const [reflection, setReflection] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [collection, setCollection] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const close = () => navigate(-1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!editId) {
      setEditing(undefined);
      setFormReady(true);
      return;
    }
    let active = true;
    setFormReady(false);
    getQuote(editId)
      .then((q) => {
        if (!active) return;
        if (!q) {
          close();
          return;
        }
        setEditing(q);
        setText(q.text ?? "");
        setSourceType(q.sourceType ?? "Book");
        setWork(q.work ?? "");
        setAuthor(q.author ?? "");
        setReflection(q.reflection ?? "");
        setTags(q.tags ?? []);
        setCollection(q.collections?.[0] ?? "");
        setFormReady(true);
      })
      .catch(() => {
        if (!active) return;
        setError("Couldn't load this entry. Please try again.");
        setFormReady(true);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, getQuote]);

  const suggestions = [
    ...new Set([...CURATED_TAGS, ...allTags, ...(editing?.tags ?? [])]),
  ]
    .filter((t) => !tags.includes(t))
    .slice(0, 10);

  const commitTagInput = () => {
    const clean = tagInput
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .trim();
    if (clean && !tags.includes(clean)) setTags((t) => [...t, clean]);
    setTagInput("");
  };

  const handleTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitTagInput();
    }
  };

  const handleSave = async () => {
    if (!text.trim()) {
      setError("A quote needs at least one line worth keeping.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const savedQuote = await addQuote(
        {
          text: text.trim(),
          sourceType,
          work: work.trim() || undefined,
          author: author.trim() || undefined,
          reflection: reflection.trim() || undefined,
          tags,
          collections: collection.trim() ? [collection.trim()] : [],
        },
        editId ?? undefined,
      );
      setSaved(true);
      window.setTimeout(() => navigate(`/quotes/${savedQuote.id}`), 650);
    } catch (err) {
      console.error("Failed to save quote", err);
      setSaving(false);
      setError(
        "Couldn't reach the server. Check that the API is running (npm run dev).",
      );
    }
  };

  const confirmationCopy = editing ? "Changes saved to Maple" : "Saved to Maple";

  return (
    <div className="animate-fade fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md">
      <div
        className="flex min-h-full items-start justify-center p-4 sm:p-8"
        onClick={close}
      >
        <div
          className="glass mt-4 w-full max-w-3xl animate-rise rounded-3xl border border-border shadow-pop sm:mt-10"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={editing ? "Edit save" : "New save"}
        >
          <div className="flex items-start justify-between border-b border-border px-5 py-6 sm:px-8">
            <div>
              <h2 className="font-serif text-[26px] tracking-tight text-ink">
                {editing ? "Edit save" : "New save"}
              </h2>
              <p className="eyebrow mt-1.5">
                {editing
                  ? "Amend the words you kept"
                  : "A line worth keeping, wherever it came from"}
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition hover:bg-card hover:text-ink"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          {!formReady ? (
            <Loader copy="Lifting this entry…" className="py-10" />
          ) : saved ? (
            <div className="flex flex-col items-center gap-6 px-8 py-20 text-center">
              <span className="saved-check">
                <CheckIcon className="h-6 w-6" />
              </span>
              <div>
                <p className="font-serif text-[26px] tracking-tight text-ink">
                  {confirmationCopy}
                </p>
                <p className="mt-2 text-[13px] text-ink-soft">
                  This line is now part of your commonplace book.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-7 px-5 py-8 sm:px-8">
                <div>
                  <label htmlFor="quote-text" className="eyebrow block">
                    The quote
                  </label>
                  <textarea
                    id="quote-text"
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      if (error) setError("");
                    }}
                    rows={4}
                    autoFocus
                    placeholder="The line that stopped you…"
                    className="input mt-3 resize-none font-serif text-[22px]! leading-[1.5]"
                  />
                  <p className="mt-2 text-right text-[11px] text-ink-faint">
                    {text.trim().length > 0
                      ? `${text.trim().split(/\s+/).length} words`
                      : ""}
                  </p>
                </div>

                <div>
                  <span className="eyebrow block">Source</span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SOURCE_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSourceType(t)}
                        className={
                          sourceType === t
                            ? "chip border-transparent bg-gradient-primary text-white shadow-[0_6px_16px_-8px_var(--mood-glow-strong)]"
                            : "chip hover:border-ink-soft/40 hover:text-ink"
                        }
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="work" className="eyebrow block">
                      Title / work
                    </label>
                    <input
                      id="work"
                      value={work}
                      onChange={(e) => setWork(e.target.value)}
                      placeholder="e.g. The Summer Day"
                      className="input mt-3"
                    />
                  </div>
                  <div>
                    <label htmlFor="author" className="eyebrow block">
                      Author / speaker
                    </label>
                    <input
                      id="author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Mary Oliver"
                      className="input mt-3"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reflection" className="eyebrow block">
                    Your reflection
                  </label>
                  <textarea
                    id="reflection"
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    rows={3}
                    placeholder="Why did this line stop you?"
                    className="input mt-3 resize-none font-cormorant italic"
                  />
                </div>

                <div>
                  <span className="eyebrow block">Tags</span>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent-soft px-3 py-1.5 text-[12px] font-medium text-accent-deep"
                      >
                        #{tag}
                        <button
                          type="button"
                          aria-label={`Remove tag ${tag}`}
                          onClick={() =>
                            setTags((t) => t.filter((x) => x !== tag))
                          }
                          className="text-accent-deep/70 transition hover:text-ink"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKey}
                      onBlur={commitTagInput}
                      placeholder={
                        tags.length === 0
                          ? "Add a tag, press Enter…"
                          : "Add another…"
                      }
                      className="min-w-[160px] flex-1 rounded-full border border-dashed border-border-strong bg-card px-4 py-1.5 text-[13px] text-ink outline-none transition placeholder:text-ink-faint focus:border-accent/60 focus:ring-4 focus:ring-accent/20"
                    />
                  </div>
                  {suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-ink-faint">
                        Suggestions
                      </span>
                      {suggestions.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setTags((t) => [...t, tag])}
                          className="chip hover:border-accent/50 hover:text-accent-deep"
                        >
                          <PlusIcon className="h-3 w-3" />
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="collection" className="eyebrow block">
                    Collection
                  </label>
                  <input
                    id="collection"
                    value={collection}
                    onChange={(e) => setCollection(e.target.value)}
                    list="collections-list"
                    placeholder="Choose one or type a new collection…"
                    className="input mt-3"
                  />
                  <datalist id="collections-list">
                    {collections.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                {error && (
                  <p className="rounded-xl border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                    {error}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-4 border-t border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
                <p className="text-[12px] text-ink-faint">
                  {editing
                    ? "Changes will be saved back to the original entry."
                    : "Saved privately to your commonplace book."}
                </p>
                <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:items-center sm:gap-3">
                  <button type="button" onClick={close} className="btn-ghost" disabled={saving}>
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary"
                  >
                    <PlusIcon className="h-4 w-4" />
                    {editing ? "Save changes" : "Save quote"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
