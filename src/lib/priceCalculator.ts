import { Product } from '@/data/products';

export interface CalculationInput {
  product: Product;
  quantity: number;
  width_cm?: number;
  height_cm?: number;
  has_white_layer?: boolean;
}

export interface CalculationResult {
  unit_price: number;
  subtotal: number;
  delivery_cost: number;
  vat: number;
  total: number;
  production_time_days: number;
  discount_percent: number;
}

export function calculatePrice(input: CalculationInput): CalculationResult {
  const { product, quantity, has_white_layer } = input;

  // Найти подходящий ценовой уровень
  let unit_price = product.base_price;
  let discount_percent = 0;

  for (const tier of product.price_tiers) {
    if (quantity >= tier.from && (tier.to === null || quantity <= tier.to)) {
      unit_price = tier.price;
      discount_percent = Math.round(((product.base_price - tier.price) / product.base_price) * 100);
      break;
    }
  }

  // Добавить стоимость белого слоя (если применимо)
  if (has_white_layer && product.colors.includes('CMYK+White')) {
    unit_price += Math.round(unit_price * 0.2); // +20% за белый слой
  }

  const subtotal = unit_price * quantity;

  // Расчет доставки (бесплатная при заказе > 500,000 UZS)
  const delivery_cost = subtotal > 500000 ? 0 : 50000;

  // НДС 15%
  const vat = Math.round((subtotal + delivery_cost) * 0.15);

  const total = subtotal + delivery_cost + vat;

  return {
    unit_price,
    subtotal,
    delivery_cost,
    vat,
    total,
    production_time_days: product.production_time_days,
    discount_percent
  };
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price) + ' UZS';
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ru-RU').format(num);
}