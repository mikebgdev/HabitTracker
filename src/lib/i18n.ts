export type Language = 'en' | 'es' | 'fr';

export type Translations = Record<string, any>;

export { getNestedTranslation } from './i18nUtils';

export async function loadTranslations(lang: string) {
  const modules = import.meta.glob('@/locales/*/*.json', { eager: true });
  const translations: Record<string, any> = {};

  for (const path in modules) {
    const match = path.match(/\/locales\/([^/]+)\/(.+)\.json$/);
    if (match && match[1] === lang) {
      const key = match[2];
      const mod = modules[path];
      if (mod && typeof mod === 'object' && 'default' in mod) {
        translations[key] = mod.default;
      }
    }
  }

  return translations;
}

