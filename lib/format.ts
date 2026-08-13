const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export function formatDateArabic(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  const day = date.getDate();
  const month = ARABIC_MONTHS[date.getMonth()] ?? "";
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

export function getReadingTime(content?: string | null): number {
  if (!content) return 3;
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

export function getArticleExcerpt(
  article: { content?: string | null; title: string },
  maxLength = 140,
): string {
  if (article.content) {
    return truncateText(stripHtml(article.content), maxLength);
  }
  return article.title;
}
