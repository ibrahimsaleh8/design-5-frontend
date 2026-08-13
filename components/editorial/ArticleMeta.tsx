import {
  formatDateArabic,
  getReadingTime,
} from "@/lib/format";
import { Clock } from "lucide-react";

type Props = {
  date: string;
  content?: string | null;
  className?: string;
  showIcon?: boolean;
};

export default function ArticleMeta({
  date,
  content,
  className = "",
  showIcon = true,
}: Props) {
  const readingTime = getReadingTime(content);

  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--text-muted)] ${className}`}>
      <time dateTime={date}>{formatDateArabic(date)}</time>
      <span className="text-[var(--border-medium)]" aria-hidden="true">
        ·
      </span>
      <span className="inline-flex items-center gap-1">
        {showIcon && <Clock className="w-3.5 h-3.5" aria-hidden="true" />}
        {readingTime} دقائق قراءة
      </span>
    </div>
  );
}
