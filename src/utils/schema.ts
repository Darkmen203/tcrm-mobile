import { z } from 'zod'

export const saleSchema = z.object({
  paybox: z.number(),
  organization: z.number(),
  warehouse: z.number(),

  price_type: z.number().optional(),
  contragent: z.number().optional(),

  loyality_card_id: z.number().optional(),
  goods: z.array(z.object({
    nomenclature: z.number(),
    unit: z.number(),
    quantity: z.number().positive({ message: 'Количество должно быть > 0' }),
    price: z.number().nonnegative({ message: 'Цена не может быть отрицательной' }),
    discount: z.number().min(0).default(0),
    sum_discounted: z.number().min(0).default(0),
    name: z.string().optional(),
  })).min(1, 'Добавьте хотя бы один товар'),
  paid_rubles: z.number().optional(),
  paid_lt: z.number().optional(),
  conduct: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (data.price_type == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['price_type'],
      message: 'Обязательное поле',
    })
  }
  if (data.contragent == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['contragent'],
      message: 'Обязательное поле',
    })
  }
})

export type SaleFormState = z.input<typeof saleSchema>
