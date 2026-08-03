import { z } from "zod";

export const pageButtonSchema = z.object({
  id: z.string(),
  type: z.string(), // clé de PREDEFINED_BUTTON_TYPES, ou "custom"
  label: z.string(),
  url: z.string(),
  order: z.number(),
});

export const pageConfigSchema = z.object({
  banner: z.string().nullable(),
  buttons: z.array(pageButtonSchema),
});

export type PageButton = z.infer<typeof pageButtonSchema>;
export type PageConfig = z.infer<typeof pageConfigSchema>;

export const EMPTY_PAGE_CONFIG: PageConfig = { banner: null, buttons: [] };

/** Parses a Prisma Json value into a PageConfig, tolerating null/malformed data. */
export function parsePageConfig(value: unknown): PageConfig {
  const parsed = pageConfigSchema.safeParse(value);
  return parsed.success ? parsed.data : EMPTY_PAGE_CONFIG;
}

export function sortedButtons(config: PageConfig): PageButton[] {
  return [...config.buttons].sort((a, b) => a.order - b.order);
}
