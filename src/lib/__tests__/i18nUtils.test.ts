import { getNestedTranslation } from '../i18n';

describe('getNestedTranslation', () => {
  it('returns the value for a nested key', () => {
    const translations = { a: { b: 'c' } };
    expect(getNestedTranslation(translations, 'a.b')).toBe('c');
  });

  it('returns the key when not found', () => {
    const translations = { a: { b: 'c' } };
    expect(getNestedTranslation(translations, 'a.x')).toBe('a.x');
  });
});
