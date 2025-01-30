// import { z } from 'zod';

// const StylingSchema = z.object({
//   className: z.string().optional(),
//   style: z.record(z.string(), z.string()).optional(),
// });

// const BaseComponentSchema = z.object({
//   type: z.string(),
//   id: z.string().optional(),
//   styling: StylingSchema.optional(),
// });

// const HeadingSchema = BaseComponentSchema.extend({
//   type: z.literal('heading'),
//   level: z.number().min(1).max(6),
//   content: z.string(),
// });

// const ParagraphSchema = BaseComponentSchema.extend({
//   type: z.literal('paragraph'),
//   content: z.string(),
// });

// const TableSchema = BaseComponentSchema.extend({
//   type: z.literal('table'),
//   rows: z.array(z.array(z.string())),
// });

// const ImageSchema = BaseComponentSchema.extend({
//   type: z.literal('image'),
//   src: z.string(),
//   alt: z.string().optional(),
// });

// const ListItemSchema = BaseComponentSchema.extend({
//   type: z.literal('listItem'),
//   content: z.string(),
// });

// const ListSchema = BaseComponentSchema.extend({
//   type: z.union([z.literal('unorderedList'), z.literal('orderedList')]),
//   items: z.array(ListItemSchema),
// });

// const InputSchema = BaseComponentSchema.extend({
//   type: z.literal('input'),
//   inputType: z.string().optional(),
//   placeholder: z.string().optional(),
//   name: z.string(),
//   value: z.string().optional(),
// });

// const ButtonSchema = BaseComponentSchema.extend({
//   type: z.literal('button'),
//   label: z.string(),
//   action: z.string().optional(),
// });

// const ContainerSchema = BaseComponentSchema.extend({
//   type: z.literal('container'),
//   children: z.array(z.lazy(() => ComponentSchema)),
// });

// const ComponentSchema = z.discriminatedUnion('type', [
//   HeadingSchema,
//   ParagraphSchema,
//   TableSchema,
//   ImageSchema,
//   ListSchema,
//   ListItemSchema,
//   InputSchema,
//   ButtonSchema,
//   ContainerSchema,
// ]);

// const DocumentSchema = z.object({
//   type: z.literal('container'),
//   children: z.array(ComponentSchema),
// });

// export { ComponentSchema, DocumentSchema };
