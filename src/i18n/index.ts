import { locale, site } from '../config.ts';
import zhCN from './zh-CN.ts';
import en from './en.ts';
import type { Locale, Messages } from './types';

export const dictionaries = { 'zh-CN': zhCN, en } satisfies Record<Locale, Messages>;

export const ui: Messages = dictionaries[locale];
export const siteMetadata = {
  title: `${site.name} — ${ui.site.tagline}`,
  description: ui.site.description,
};

export { formatMessage, formatCount } from './format.ts';
