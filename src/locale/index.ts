export type SupportedLocale = 'en' | 'id';

const STORAGE_KEY = 'globs.locale';

export function resolveLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'en';

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'en' || saved === 'id') return saved;

  const browserLocale = navigator.languages?.[0] ?? navigator.language ?? 'en';
  return browserLocale.toLowerCase().startsWith('id') ? 'id' : 'en';
}

export function setLocale(locale: SupportedLocale): void {
  window.localStorage.setItem(STORAGE_KEY, locale);
}

export const messages: Record<SupportedLocale, Record<string, string>> = {
  en: {
    searchPlaceholder: 'Explore anything happening in the world...',
    trending: 'Trending',
    latest: 'Latest',
    worldNow: 'World Now',
    explore: 'Explore',
    support: 'Support GlobS',
    supportLabel: 'Buy me a coffee',
    loading: 'Loading...',
    unavailable: 'Information temporarily unavailable.'
  },
  id: {
    searchPlaceholder: 'Jelajahi apa yang sedang terjadi di dunia...',
    trending: 'Sedang Tren',
    latest: 'Terbaru',
    worldNow: 'Dunia Saat Ini',
    explore: 'Jelajahi',
    support: 'Dukung GlobS',
    supportLabel: 'Belikan saya kopi',
    loading: 'Memuat...',
    unavailable: 'Informasi sementara tidak tersedia.'
  }
};
