const COMBINING_MARK_MIN = 0x0300;
const COMBINING_MARK_MAX = 0x036f;

function stripDiacritics(input: string): string {
  return Array.from(input)
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code < COMBINING_MARK_MIN || code > COMBINING_MARK_MAX;
    })
    .join("");
}

export function slugify(input: string): string {
  return (
    stripDiacritics(input.normalize("NFKD"))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) || "pitch"
  );
}
