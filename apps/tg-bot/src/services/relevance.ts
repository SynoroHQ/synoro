export function isObviousSpam(text: string): boolean {
  const t = (text || "").trim();
  if (t.length < 3) return true;

  // Too many URLs
  const urlCount = (t.match(/https?:\/\//gi) || []).length;
  if (urlCount >= 2) return true;

  // Excessive character repetition (e.g., "hhhhhhhhhh")
  if (/(.)\1{9,}/.test(t)) return true;

  // Mostly non-alphanumeric (emojis/symbols only)
  const alnum = t.replace(/[^\p{L}\p{N}]+/gu, "");
  if (alnum.length < 2 && t.length > 10) return true;

  return false;
}

export function isLikelyRelevantText(text: string): boolean {
  const t = (text || "").trim();
  if (!t) return false;
  if (isObviousSpam(t)) return false;
  // Has at least some letters or numbers
  if (!/[\p{L}\p{N}]/u.test(t)) return false;
  return t.length >= 3;
}

export function shouldLog(parsed: unknown): boolean {
  // Log only if we could extract a structured task
  return parsed != null;
}

export function extractTags(text: string): string[] {
  const t = (text || "").trim();
  if (!t) return [];
  const matches = t.match(/#([\p{L}][\p{L}\p{N}_-]*)/gu) || [];
  return matches
    .map((m) => m.slice(1))
    .filter((tag) => tag.length > 0)
    .slice(0, 20);
}
