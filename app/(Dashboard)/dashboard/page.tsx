import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Newspaper,
  Settings,
  Share2,
  TrendingUp,
} from "lucide-react";

export default function Dashboard() {
  const cards = [
    {
      title: "المقالات والتصنيفات",
      description: "إدارة المقالات، إضافة مقال جديد، وتصنيف الأقسام",
      href: "/dashboard/articles",
      icon: Newspaper,
      stat: "إدارة المحتوى",
      gradient: "from-[#0D5048] to-[#0F766E]",
      lightBg: "bg-[#E6F4F1]",
      textColor: "text-[#0F766E]",
    },
    {
      title: "وسائل التواصل الاجتماعي",
      description: "تعديل روابط منصات التواصل (فيسبوك، انستغرام، تويتر، وغيرها)",
      href: "/dashboard/social-media",
      icon: Share2,
      stat: "التواصل",
      gradient: "from-[#1E3A5F] to-[#2563EB]",
      lightBg: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      title: "إعدادات الموقع",
      description: "تغيير اسم الموقع، الشعار، نصوص البانر، ومعلومات SEO",
      href: "/dashboard/settings",
      icon: Settings,
      stat: "الإعدادات",
      gradient: "from-[#5B4B8A] to-[#7C3AED]",
      lightBg: "bg-purple-50",
      textColor: "text-purple-700",
    },
  ];

  const quickStats = [
    { label: "المقالات", icon: FileText, value: "—", hint: "إدارة المحتوى" },
    { label: "الأقسام", icon: TrendingUp, value: "—", hint: "تصنيفات الموقع" },
    { label: "الإعدادات", icon: Settings, value: "—", hint: "SEO والبانر" },
  ];

  return (
    <div className="space-y-8" dir="rtl">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-[#0D5048] to-[#0F766E] p-6 md:p-8 text-white shadow-md">
        <div className="absolute -left-8 -bottom-8 text-white/5 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-40 h-40 fill-current">
            <path d="M50 0L100 50L50 100L0 50Z" />
          </svg>
        </div>
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 bg-[#C5A059] text-[#181512] text-[11px] font-extrabold px-3 py-0.5 rounded-full mb-3">
            <span>◆</span>
            <span>لوحة التحكم</span>
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
            مرحباً بك في لوحة التحكم
          </h1>
          <p className="mt-2 text-sm text-teal-100/90 max-w-xl leading-relaxed">
            اختر أحد الأقسام التالية لإدارة محتوى الموقع وإعداداته بشكل كامل
          </p>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-4 bg-white border border-[#E7E2D8] rounded-2xl p-4 shadow-sm"
            >
              <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#E6F4F1] text-[#0F766E]">
                <Icon className="w-5 h-5" />
              </span>
              <div>
                <p className="text-xs text-[#78716C] font-medium">{stat.label}</p>
                <p className="text-lg font-extrabold text-[#1C1917]">{stat.value}</p>
                <p className="text-[10px] text-[#78716C]">{stat.hint}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Cards */}
      <div>
        <h2 className="text-lg font-bold text-[#1C1917] mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-[#0F766E] rounded-full" />
          الأقسام الرئيسية
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group bg-white border border-[#E7E2D8] rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#0F766E]/30 transition-all duration-300 flex flex-col"
              >
                <div className={`h-2 bg-gradient-to-l ${card.gradient}`} />
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl text-white bg-gradient-to-br ${card.gradient} shadow-sm group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-6 h-6" />
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${card.lightBg} ${card.textColor}`}
                      >
                        {card.stat}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#1C1917] group-hover:text-[#0F766E] transition-colors">
                        {card.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-[#78716C] leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#F9F6F0] flex items-center justify-between text-xs font-bold text-[#57534E] group-hover:text-[#0F766E] transition-colors">
                    <span>انتقل للقسم</span>
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
