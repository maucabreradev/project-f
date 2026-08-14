import { z } from "zod";

export const ulidSchema = z.string().length(26).regex(/^[0-9A-HJKMNP-TV-Z]{26}$/);

export const emailSchema = z.string().email().toLowerCase().max(254);

export const passwordSchema = z.string().min(8).max(128);

export const usernameSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9_-]+$/)
  .toLowerCase();

export const characterNameSchema = z.string().min(1).max(100);

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const paginationResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  });

export const errorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fieldErrors: z.record(z.array(z.string())).optional(),
    details: z.unknown().optional(),
  }),
});

export const csrfTokenSchema = z.string().min(1);

export const rankSchema = z.enum(["webmaster", "administrator", "moderator", "user"]);

export const boardKindSchema = z.enum(["category", "forum", "subforum"]);

export const threadStateSchema = z.enum(["open", "closed", "archived", "soft-deleted"]);

export const icOocSchema = z.enum(["ic", "ooc"]);

export const memberStatusSchema = z.enum(["active", "inactive"]);

export const confirmationStateSchema = z.enum(["unconfirmed", "confirmed"]);

export const approvalStateSchema = z.enum(["pending", "approved", "rejected"]);

export const characterStatusSchema = z.enum(["active", "deleted"]);

export const banTargetTypeSchema = z.enum(["email", "ip"]);

export const banDurationTypeSchema = z.enum(["permanent", "until"]);

export const banStateSchema = z.enum(["active", "appealed", "revoked", "expired"]);

export const appealStateSchema = z.enum(["open", "approved", "rejected"]);

export const moderationActionTypeSchema = z.enum([
  "edit",
  "close",
  "open",
  "archive",
  "unarchive",
  "delete",
  "pin",
  "move",
  "currency-adjust",
  "inventory-adjust",
  "ban",
]);

export const itemStockModelSchema = z.enum(["infinite", "limited", "unique"]);

export const itemKindSchema = z.enum(["inventory-item", "cosmetic"]);

export const transactionTypeSchema = z.enum(["earn", "purchase", "sale", "refund", "adjust"]);

export const actorTypeSchema = z.enum(["system", "staff", "member"]);

export const earnRuleTypeSchema = z.enum([
  "per-thread",
  "per-post",
  "login-streak",
  "interest",
  "birthday",
]);

export const notificationTypeSchema = z.enum([
  "reply-thread",
  "reply-participation",
  "reply-post",
  "mention",
  "appeal-resolved",
  "currency-birthday",
  "currency-interest",
]);

export const registrationModeSchema = z.enum(["open", "approval"]);

export const imagesAllowedSchema = z.union([z.literal(0), z.literal(1)]);

export const booleanSchema = z.union([z.literal(0), z.literal(1)]);

export const timestampSchema = z.number().int().positive();

export const jsonSchema = z.string().transform((val) => JSON.parse(val));

export const positiveIntegerSchema = z.number().int().positive();

export const nonNegativeIntegerSchema = z.number().int().nonnegative();

export const percentageSchema = z.number().int().min(0).max(100);

export const currencyAmountSchema = z.number().int();

export const dateRangeSchema = z.object({
  start: z.number().int().positive(),
  end: z.number().int().positive().optional(),
});

export const reasonSchema = z.string().min(1).max(1000);

export const iconSchema = z.string().min(1).max(100);

export const imageRefSchema = z.string().url().or(z.string().min(1));

export const thresholdSchema = z.object({
  min: z.number().int().nonnegative().optional(),
  max: z.number().int().positive().optional(),
});

export const moderationScopeSchema = z.object({
  global: z.boolean(),
  boards: z.array(ulidSchema),
  canEditEconomy: z.boolean(),
});

export const quickLoginSchema = z.object({
  characterId: ulidSchema,
  createdAt: timestampSchema,
});

export const boardPermissionsSchema = z.object({
  boardId: ulidSchema,
  rank: rankSchema,
  canRead: booleanSchema,
  canWrite: booleanSchema,
});

export const colorsSchema = z.object({
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  background: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  text: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export const defaultPermissionsSchema = z.record(
  z.enum(["webmaster", "administrator", "moderator", "user"]),
  z.object({
    read: z.boolean(),
    write: z.boolean(),
  })
);

export const sheetFieldSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(["text", "textarea", "select", "number", "boolean", "image"]),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
    })
    .optional(),
});

export const sheetFieldsSchema = z.array(sheetFieldSchema);

export const aiCriteriaSchema = z.string().max(5000).optional();

export const apiKeyCiphertextSchema = z.string().optional();