export interface Product {
  id: string;
  technology_id: string;
  name: string;
  description: string;
  base_price: number;
  min_quantity: number;
  unit: string;
  available_sizes: string[];
  colors: string[];
  image_url: string;
  production_time_days: number;
  price_tiers: PriceTier[];
  specifications: Record<string, string>;
}

export interface PriceTier {
  from: number;
  to: number | null;
  price: number;
}

export const products: Product[] = [
  {
    id: 'dtf-001',
    technology_id: 'dtf',
    name: 'DTF Термостикер Full Color',
    description: 'Профессиональные DTF (Direct to Film) термостикеры для нанесения на текстиль. Яркие CMYK цвета, высокая детализация до 1440 DPI. Подходит для хлопка, полиэстера и смесовых тканей.',
    base_price: 5000,
    min_quantity: 10,
    unit: 'шт',
    available_sizes: ['5x5', '10x10', '15x15', '20x20', '25x25', '30x30', '35x35', '40x40'],
    colors: ['CMYK Full Color', 'CMYK+White'],
    image_url: 'https://mgx-backend-cdn.metadl.com/generate/images/870663/2025-12-29/d86a54e5-1f98-4236-82f6-201f77c2717b.png',
    production_time_days: 3,
    price_tiers: [
      { from: 10, to: 49, price: 5000 },
      { from: 50, to: 99, price: 4500 },
      { from: 100, to: 199, price: 4000 },
      { from: 200, to: 499, price: 3500 },
      { from: 500, to: null, price: 3000 }
    ],
    specifications: {
      'Материал': 'PET пленка премиум качества',
      'Клей': 'Hot melt adhesive',
      'Температура нанесения': '160-180°C',
      'Давление': '4-6 бар (средне-высокое)',
      'Время прессования': '10-15 секунд',
      'Стирки': '50+ циклов при 40°C',
      'Разрешение печати': '1440 DPI',
      'Ткани': 'Хлопок, полиэстер, смесовые',
      'Отделение пленки': 'Холодное (cold peel)'
    }
  },
  {
    id: 'dtf-002',
    technology_id: 'dtf',
    name: 'DTF Gang Sheet (Лист)',
    description: 'Экономичный вариант - несколько дизайнов на одном листе. Идеально для малого бизнеса и стартапов. Размер листа 30x40см.',
    base_price: 15000,
    min_quantity: 1,
    unit: 'лист',
    available_sizes: ['30x40'],
    colors: ['CMYK Full Color', 'CMYK+White'],
    image_url: 'https://mgx-backend-cdn.metadl.com/generate/images/870663/2025-12-29/d86a54e5-1f98-4236-82f6-201f77c2717b.png',
    production_time_days: 2,
    price_tiers: [
      { from: 1, to: 4, price: 15000 },
      { from: 5, to: 9, price: 14000 },
      { from: 10, to: 19, price: 13000 },
      { from: 20, to: null, price: 12000 }
    ],
    specifications: {
      'Размер листа': '30x40 см',
      'Материал': 'PET пленка',
      'Клей': 'Hot melt adhesive',
      'Температура': '160-180°C',
      'Время': '10-15 секунд',
      'Макс. дизайнов': 'До 20 шт на листе',
      'Формат файла': 'PNG, PDF, AI, SVG'
    }
  },
  {
    id: 'vinyl-001',
    technology_id: 'vinyl',
    name: 'Виниловая наклейка Глянцевая',
    description: 'Долговечные виниловые наклейки с глянцевой поверхностью. Водостойкие, для внутреннего и наружного применения. Плоттерная резка высокой точности.',
    base_price: 3000,
    min_quantity: 20,
    unit: 'шт',
    available_sizes: ['5x5', '10x10', '15x15', '20x20', '25x25', '30x30'],
    colors: ['Белый', 'Черный', 'Красный', 'Синий', 'Зеленый', 'Желтый', 'Оранжевый', 'Розовый', 'Фиолетовый', 'Золотой', 'Серебряный'],
    image_url: 'https://mgx-backend-cdn.metadl.com/generate/images/870663/2025-12-29/3ee92153-ff29-4ba7-a770-f97b87c601fc.png',
    production_time_days: 2,
    price_tiers: [
      { from: 20, to: 49, price: 3000 },
      { from: 50, to: 99, price: 2700 },
      { from: 100, to: 199, price: 2400 },
      { from: 200, to: 499, price: 2000 },
      { from: 500, to: null, price: 1800 }
    ],
    specifications: {
      'Материал': 'ПВХ винил премиум',
      'Толщина': '80 микрон',
      'Клей': 'Акриловый перманентный',
      'Поверхность': 'Глянцевая',
      'Температура': '150-160°C',
      'Время': '10-12 секунд',
      'Стойкость': 'До 5 лет (наружное применение)',
      'Водостойкость': 'Полная',
      'Резка': 'Плоттерная высокоточная'
    }
  },
  {
    id: 'vinyl-002',
    technology_id: 'vinyl',
    name: 'Виниловая наклейка Матовая',
    description: 'Элегантные матовые виниловые наклейки. Отсутствие бликов, премиум внешний вид. Идеально для логотипов и брендинга.',
    base_price: 3200,
    min_quantity: 20,
    unit: 'шт',
    available_sizes: ['5x5', '10x10', '15x15', '20x20', '25x25', '30x30'],
    colors: ['Белый', 'Черный', 'Красный', 'Синий', 'Зеленый', 'Серый'],
    image_url: 'https://mgx-backend-cdn.metadl.com/generate/images/870663/2025-12-29/3ee92153-ff29-4ba7-a770-f97b87c601fc.png',
    production_time_days: 2,
    price_tiers: [
      { from: 20, to: 49, price: 3200 },
      { from: 50, to: 99, price: 2900 },
      { from: 100, to: 199, price: 2600 },
      { from: 200, to: null, price: 2200 }
    ],
    specifications: {
      'Материал': 'ПВХ винил премиум',
      'Толщина': '80 микрон',
      'Клей': 'Акриловый',
      'Поверхность': 'Матовая',
      'Температура': '150-160°C',
      'Время': '10-12 секунд',
      'Стойкость': 'До 5 лет',
      'Эффект': 'Без бликов'
    }
  },
  {
    id: 'uv-001',
    technology_id: 'uv_dtf',
    name: 'UV DTF Стикер Премиум',
    description: 'UV DTF стикеры для нанесения на твердые поверхности. Подходит для стекла, металла, пластика, дерева. Глянцевый эффект, высокая стойкость к УФ и царапинам.',
    base_price: 7000,
    min_quantity: 10,
    unit: 'шт',
    available_sizes: ['5x5', '10x10', '15x15', '20x20', '25x25', '30x30'],
    colors: ['CMYK+White Full Color'],
    image_url: 'https://mgx-backend-cdn.metadl.com/generate/images/870663/2025-12-29/c13887d5-3d12-4eb4-94a2-77db1684e958.png',
    production_time_days: 4,
    price_tiers: [
      { from: 10, to: 49, price: 7000 },
      { from: 50, to: 99, price: 6500 },
      { from: 100, to: 199, price: 6000 },
      { from: 200, to: 499, price: 5500 },
      { from: 500, to: null, price: 5000 }
    ],
    specifications: {
      'Материал': 'UV пленка с защитным слоем',
      'Печать': 'UV принтер высокого разрешения',
      'Поверхности': 'Стекло, металл, пластик, дерево, керамика',
      'Эффект': 'Глянцевый 3D',
      'Нанесение': 'Без термопресса (самоклеящиеся)',
      'Стойкость': 'Высокая (3-5 лет)',
      'УФ защита': 'Встроенная',
      'Водостойкость': 'Полная',
      'Применение': 'Тумблеры, бутылки, телефоны, ноутбуки'
    }
  },
  {
    id: 'uv-002',
    technology_id: 'uv_dtf',
    name: 'UV DTF Gang Sheet',
    description: 'Набор UV DTF стикеров на одном листе. Экономичный вариант для создания коллекций стикеров.',
    base_price: 25000,
    min_quantity: 1,
    unit: 'лист',
    available_sizes: ['A4', 'A3'],
    colors: ['CMYK+White Full Color'],
    image_url: 'https://mgx-backend-cdn.metadl.com/generate/images/870663/2025-12-29/c13887d5-3d12-4eb4-94a2-77db1684e958.png',
    production_time_days: 3,
    price_tiers: [
      { from: 1, to: 4, price: 25000 },
      { from: 5, to: 9, price: 23000 },
      { from: 10, to: null, price: 20000 }
    ],
    specifications: {
      'Размер листа': 'A4 (21x29.7см) или A3 (29.7x42см)',
      'Материал': 'UV пленка',
      'Нанесение': 'Самоклеящиеся',
      'Макс. стикеров': 'До 30 шт на листе A4',
      'Применение': 'Универсальное'
    }
  },
  {
    id: '3d-001',
    technology_id: '3d_vinyl',
    name: '3D Винил Объемный 1мм',
    description: 'Объемные виниловые наклейки толщиной 1мм. Премиум внешний вид с тактильным эффектом. Идеально для логотипов, эмблем, брендинга.',
    base_price: 8000,
    min_quantity: 10,
    unit: 'шт',
    available_sizes: ['5x5', '10x10', '15x15', '20x20'],
    colors: ['Прозрачный', 'Белый', 'Черный', 'Серебряный', 'Золотой'],
    image_url: 'https://mgx-backend-cdn.metadl.com/generate/images/870663/2025-12-29/5a4e811f-1ee2-415f-8794-30e0829e69d5.png',
    production_time_days: 5,
    price_tiers: [
      { from: 10, to: 49, price: 8000 },
      { from: 50, to: 99, price: 7500 },
      { from: 100, to: 199, price: 7000 },
      { from: 200, to: null, price: 6500 }
    ],
    specifications: {
      'Материал': 'Полиуретан премиум качества',
      'Толщина': '1мм (объемный эффект)',
      'Эффект': '3D рельефный',
      'Клей': 'Акриловый сверхпрочный',
      'Температура': '150-160°C',
      'Время': '15-20 секунд',
      'Применение': 'Логотипы, эмблемы, шевроны',
      'Стойкость': 'Очень высокая',
      'Тактильность': 'Ощутимый объем'
    }
  },
  {
    id: 'dtf-003',
    technology_id: 'dtf',
    name: 'DTF Pocket Transfer (Карманный)',
    description: 'Компактные DTF трансферы для карманов футболок, рубашек. Размер 7x9см. Тренд 2024-2025.',
    base_price: 3500,
    min_quantity: 20,
    unit: 'шт',
    available_sizes: ['7x9'],
    colors: ['CMYK Full Color'],
    image_url: 'https://mgx-backend-cdn.metadl.com/generate/images/870663/2025-12-29/d86a54e5-1f98-4236-82f6-201f77c2717b.png',
    production_time_days: 3,
    price_tiers: [
      { from: 20, to: 49, price: 3500 },
      { from: 50, to: 99, price: 3200 },
      { from: 100, to: 199, price: 2900 },
      { from: 200, to: null, price: 2600 }
    ],
    specifications: {
      'Размер': '7x9 см (стандарт кармана)',
      'Материал': 'PET пленка',
      'Применение': 'Карманы футболок, рубашек',
      'Температура': '160-180°C',
      'Время': '10 секунд',
      'Тренд': '2024-2025'
    }
  }
];