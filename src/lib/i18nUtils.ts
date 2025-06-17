export type Translations = Record<string, any>;

export function getNestedTranslation(translations: Translations, key: string): string {
  const parts = key.split('.');
  let result: any = translations;

  for (const part of parts) {
    if (result && typeof result === 'object' && part in result) {
      result = result[part];
    } else {
      return key;
    }
  }

  return typeof result === 'string' ? result : key;
}
