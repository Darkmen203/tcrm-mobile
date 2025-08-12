import type { SalePayload } from "@/types/sale";
import type { SaleFormState } from "./schema";
import { round2 } from "@/utils/money";

export function buildPayload(form: SaleFormState): SalePayload {
  const rawTotal = (form.goods ?? []).reduce((sum, g) => {
    const price = Number(g.price) || 0;
    const qty = Math.max(1, Number(g.quantity) || 1);
    const disc = Number(g.discount ?? 0) || 0;
    const sumDisc = Number(g.sum_discounted ?? 0) || 0;
    return sum + (price * qty - disc - sumDisc);
  }, 0);

  const total = round2(rawTotal);
  const taxRate = 0.0476;
  const paid_lt = round2(total * taxRate);
  const paid_rubles = round2(total - paid_lt);

  return [{
    dated: Math.floor(Date.now() / 1000),
    operation: 'Заказ',
    tax_included: true,
    tax_active: true,
    goods: form.goods.map(g => ({
      price: g.price,
      quantity: g.quantity,
      unit: g.unit,
      discount: g.discount ?? 0,
      sum_discounted: g.sum_discounted ?? 0,
      nomenclature: g.nomenclature,
    })),
    settings: { date_next_created: null },
    loyality_card_id: form.loyality_card_id || undefined,
    warehouse: form.warehouse,
    contragent: form.contragent || undefined,
    paybox: form.paybox,
    organization: form.organization,
    status: !!form.conduct,

    paid_rubles,
    paid_lt,
  }]
}
