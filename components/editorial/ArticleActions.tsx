"use client";

import { Bookmark, Heart, Share2 } from "lucide-react";
import { useState } from "react";

type Props = {
  title: string;
  url: string;
};

export default function ArticleActions({ title, url }: Props) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(128);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }

  function handleLike() {
    setLiked((prev) => {
      setLikeCount((count) => (prev ? count - 1 : count + 1));
      return !prev;
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-full)] border border-[var(--border-light)] text-sm font-semibold text-[var(--text-body)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
        <Share2 className="w-4 h-4" aria-hidden="true" />
        مشاركة
      </button>

      <button
        type="button"
        onClick={() => setBookmarked((v) => !v)}
        aria-pressed={bookmarked}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-full)] border text-sm font-semibold transition-colors ${
          bookmarked
            ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]"
            : "border-[var(--border-light)] text-[var(--text-body)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
        }`}>
        <Bookmark className="w-4 h-4" aria-hidden="true" />
        حفظ
      </button>

      <button
        type="button"
        onClick={handleLike}
        aria-pressed={liked}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-full)] border text-sm font-semibold transition-colors ${
          liked
            ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]"
            : "border-[var(--border-light)] text-[var(--text-body)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
        }`}>
        <Heart
          className={`w-4 h-4 ${liked ? "fill-[var(--primary)]" : ""}`}
          aria-hidden="true"
        />
        {likeCount}
      </button>
    </div>
  );
}
