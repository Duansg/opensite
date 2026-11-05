export type Locale = 'zh-CN' | 'en';

export type CountMessage = { other: string } & Partial<Record<Intl.LDMLPluralRule, string>>;

type MessageShape<T> = T extends { one: string; other: string }
  ? CountMessage
  : T extends string[]
    ? string[]
    : { [Key in keyof T]: T[Key] extends string ? string : MessageShape<T[Key]> };

// 从中文词典检查字段完整性，数量文案允许补充其他语言的复数规则。
export type Messages = MessageShape<typeof import('./zh-CN').default>;
