import HeaderNav from "@/components/editorial/HeaderNav";
import { Category, SiteSettings } from "@/lib/types";

type Props = {
  settings: SiteSettings;
  categories: Category[];
};

export default function Header({ settings, categories }: Props) {
  return <HeaderNav settings={settings} categories={categories} />;
}
