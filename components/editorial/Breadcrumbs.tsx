import Link from "next/link";

type Crumb = {
  label: string;
  href?: string;
};

type Props = {
  items: Crumb[];
};

export default function Breadcrumbs({ items }: Props) {
  return (
    <nav aria-label="مسار التصفح" className="site-container py-4 mt-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--text-muted)]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="text-[var(--border-medium)]">
                  /
                </span>
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-[var(--primary)] transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast
                      ? "text-[var(--text-primary)] font-medium truncate max-w-[200px] sm:max-w-none"
                      : ""
                  }
                  aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
