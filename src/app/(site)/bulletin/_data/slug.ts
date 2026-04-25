const DATE_PREFIX = /^(\d{4}-\d{2}-\d{2})(?:-(.*))?$/;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildSlug(date: string, sermonTitle: string): string {
  const titleSlug = slugify(sermonTitle);
  return titleSlug ? `${date}-${titleSlug}` : date;
}

export function parseDateFromSlug(slug: string): string | null {
  const match = DATE_PREFIX.exec(slug);
  return match ? match[1] : null;
}
