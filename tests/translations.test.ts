import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { companyConfig } from '@/config/company';
import { locales } from '@/config/site';
import { namespaces } from '@/i18n/resources';

const root = join(__dirname, '..', 'src');
const read = (p: string) => JSON.parse(readFileSync(join(root, p), 'utf8')) as unknown;

/** Key paths of a JSON value, with array lengths encoded so arrays must match too. */
function shape(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) return [`${prefix}[${value.length}]`, ...value.flatMap((v, i) => shape(v, `${prefix}[${i}]`))];
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => shape(v, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}

const placeholders = (s: string) => (s.match(/\{\{\s*\w+\s*\}\}/g) ?? []).sort().join(',');

function strings(value: unknown, prefix = ''): [string, string][] {
  if (typeof value === 'string') return [[prefix, value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${prefix}[${i}]`));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => strings(v, `${prefix}.${k}`));
  return [];
}

describe('translations', () => {
  for (const ns of namespaces) {
    it(`${ns}.json has the same keys in every language`, () => {
      const en = shape(read(`locales/en/${ns}.json`));
      for (const l of locales) expect(shape(read(`locales/${l}/${ns}.json`)), `${l}/${ns}`).toEqual(en);
    });

    it(`${ns}.json keeps the same placeholders in every language`, () => {
      const en = new Map(strings(read(`locales/en/${ns}.json`)));
      for (const l of locales) {
        for (const [key, value] of strings(read(`locales/${l}/${ns}.json`))) {
          expect(placeholders(value), `${l}/${ns}${key}`).toBe(placeholders(en.get(key) ?? ''));
        }
      }
    });
  }

  it('every language has a translation file for every namespace and a chat knowledge base', () => {
    for (const l of locales) {
      const files = readdirSync(join(root, 'locales', l));
      for (const ns of namespaces) expect(files).toContain(`${ns}.json`);
      expect(() => read(`content/chat/${l}.json`)).not.toThrow();
    }
  });

  it('never hardcodes company contact data in content files', () => {
    const digits = companyConfig.contact.phone.replace(/\D/g, '').slice(3);
    for (const l of locales) {
      const files = [...namespaces.map((ns) => `locales/${l}/${ns}.json`), `content/chat/${l}.json`];
      for (const f of files) {
        const text = readFileSync(join(root, f), 'utf8');
        expect(text.replace(/\D/g, ''), f).not.toContain(digits);
        for (const name of Object.values(companyConfig.owner.localizedName)) expect(text, f).not.toContain(name);
      }
    }
  });
});
