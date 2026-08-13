import NewsletterForm from "@/components/editorial/NewsletterForm";
import { Mail } from "lucide-react";

export default function NewsletterBlock() {
  return (
    <section className="site-container py-8 md:py-12 my-6 mx-auto">
      <div className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--bg-section)] px-6 py-8 md:px-10 md:py-10">
        <div className="grid md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-center">
          <div
            className="hidden md:flex items-center justify-center w-32 h-32 rounded-[var(--radius-xl)] bg-[var(--secondary-light)] shrink-0"
            aria-hidden="true">
            <Mail className="w-14 h-14 text-[var(--secondary)]" />
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[var(--text-heading)] mb-1">
                أفكار ملهمة. كل أسبوع.
              </h2>
              <p className="text-[var(--text-body)] text-sm md:text-base">
                اشترك في نشرتنا البريدية لتصلك أبرز المقالات والتحليلات مباشرة
                إلى بريدك.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </div>
    </section>
  );
}
