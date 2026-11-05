import type { CountMessage } from './types';

export function formatMessage(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (placeholder, key: string) =>
    Object.hasOwn(values, key) ? String(values[key]) : placeholder,
  );
}

export function formatCount(message: CountMessage, count: number, locale: string) {
  const rule = new Intl.PluralRules(locale).select(count);
  return formatMessage(message[rule] ?? message.other, {
    count: new Intl.NumberFormat(locale).format(count),
  });
}
