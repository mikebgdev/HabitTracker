export async function loadTranslations(lang) {
    const modules = import.meta.glob('@/locales/*/*.json', { eager: true });
    const translations = {};
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
export function getNestedTranslation(translations, key) {
    const parts = key.split('.');
    let result = translations;
    for (const part of parts) {
        if (result && typeof result === 'object' && part in result) {
            result = result[part];
        }
        else {
            return key; // fallback
        }
    }
    return typeof result === 'string' ? result : key;
}
