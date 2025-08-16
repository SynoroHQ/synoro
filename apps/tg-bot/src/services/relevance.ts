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
