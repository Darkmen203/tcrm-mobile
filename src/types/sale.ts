export interface SaleGood {
  price: number;
  quantity: number;
  unit: number;
  discount: number;
  sum_discounted: number;
  nomenclature: number;
}

export interface SalePayloadItem {
  dated: number;
  operation: 'Заказ';
  tax_included: boolean;
  tax_active: boolean;
  goods: SaleGood[];
  settings: { date_next_created: number | null };
  loyality_card_id?: number;
  warehouse: number;
  contragent?: number;
  paybox: number;
  organization: number;
  status: boolean;
  paid_rubles?: number;
  paid_lt?: number;
}

export type SalePayload = SalePayloadItem[];
