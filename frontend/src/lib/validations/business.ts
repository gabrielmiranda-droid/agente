import { z } from "zod";

export const businessProfileSchema = z.object({
  business_name: z.string().min(2, "Informe o nome do negócio."),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  neighborhood: z.string().optional().or(z.literal("")),
  delivery_fee: z.coerce.number().min(0).nullable().optional(),
  estimated_delivery_time: z.string().optional().or(z.literal("")),
  accepts_pickup: z.boolean(),
  payment_methods_text: z.string().optional().or(z.literal("")),
  welcome_message: z.string().optional().or(z.literal("")),
  out_of_hours_message: z.string().optional().or(z.literal(""))
});

export type BusinessProfileSchema = z.infer<typeof businessProfileSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, "Informe o nome da categoria."),
  active: z.boolean()
});

export type CategorySchema = z.infer<typeof categorySchema>;

export const productSchema = z.object({
  category_id: z.coerce.number().nullable().optional(),
  name: z.string().min(2, "Informe o nome do produto."),
  description: z.string().optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Informe um preço válido."),
  promotional_price: z.coerce.number().min(0).nullable().optional(),
  active: z.boolean(),
  featured: z.boolean(),
  display_order: z.coerce.number().min(0)
});

export type ProductSchema = z.infer<typeof productSchema>;

export const addonSchema = z.object({
  product_id: z.coerce.number().min(1, "Selecione um produto."),
  name: z.string().min(2, "Informe o nome do adicional."),
  price: z.coerce.number().min(0, "Informe um preço válido."),
  active: z.boolean()
});

export type AddonSchema = z.infer<typeof addonSchema>;

export const businessHourSchema = z.object({
  day_of_week: z.coerce.number().min(0).max(6),
  open_time: z.string().min(1, "Informe a hora de abertura."),
  close_time: z.string().min(1, "Informe a hora de fechamento."),
  active: z.boolean()
});

export type BusinessHourSchema = z.infer<typeof businessHourSchema>;

export const promotionSchema = z.object({
  title: z.string().min(2, "Informe o título da promoção."),
  description: z.string().optional().or(z.literal("")),
  active: z.boolean(),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal(""))
});

export type PromotionSchema = z.infer<typeof promotionSchema>;
