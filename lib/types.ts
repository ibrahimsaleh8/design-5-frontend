// Shared TypeScript types for the CMS frontend

export type Category = {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  _count?: {
    articles: number;
  };
};
export type ArticleImage = {
  id: string;
  imageUrl: string;
  alt: string;
  articleId: string;
};

export type CustomSection = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  content?: string | null;
  coverImageUrl?: string | null;
  coverImageId?: string | null;
  keywords?: string[];
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  images?: ArticleImage[];
};

export type HomepageCategory = {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  articles: Article[];
};

export type SiteSettings = {
  id: number;
  projectName: string;
  logo: string | null;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  heroTitle: string | null;
  heroDescription: string | null;
  heroImage: string | null;
};

export type SocialLinks = {
  id: number;
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
  youtube: string | null;
  whatsapp: string | null;
  phoneNumber: string | null;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type SitemapItem = {
  title: string;
  slug: string;
};

export type SitemapData = {
  categories: SitemapItem[];
  articles: SitemapItem[];
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
};
