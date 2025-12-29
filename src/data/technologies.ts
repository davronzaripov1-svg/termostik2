export interface Technology {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  features: string[];
  min_price: number;
  production_time_days: number;
  color: string;
}

export const technologies: Technology[] = [
  {
    id: 'dtf',
    name: 'DTF Термостикеры',
    description: 'Direct to Film печать высокого качества с яркими цветами и отличной детализацией',
    icon_url: 'https://mgx-backend-cdn.metadl.com/generate/images/870663/2025-12-29/fb55b184-9e8a-4329-bfa4-6aa70002acc8.png',
    features: [
      'Яркие насыщенные цвета',
      'Высокая детализация изображения',
      'Подходит для любых тканей',
      'Выдерживает 50+ стирок',
      'Быстрое производство'
    ],
    min_price: 5000,
    production_time_days: 3,
    color: '#3B82F6'
  },
  {
    id: 'vinyl',
    name: 'Виниловые наклейки',
    description: 'Плоттерная резка винила для долговечных и водостойких наклеек',
    icon_url: 'https://mgx-backend-cdn.metadl.com/generate/images/870663/2025-12-29/23c76692-80f1-4209-8d0a-5999f21722b8.png',
    features: [
      'Долговечность до 5 лет',
      'Водостойкость',
      'Разнообразие цветов',
      'Матовая или глянцевая поверхность',
      'Быстрое изготовление'
    ],
    min_price: 3000,
    production_time_days: 2,
    color: '#10B981'
  },
  {
    id: 'uv_dtf',
    name: 'UV DTF',
    description: 'UV печать на пленке для нанесения на твердые поверхности',
    icon_url: 'https://mgx-backend-cdn.metadl.com/generate/images/870663/2025-12-29/3bef246d-41de-4170-889c-2e6234227258.png',
    features: [
      'Нанесение на любые поверхности',
      'Высокая стойкость к УФ',
      'Глянцевый эффект',
      'Водостойкость',
      'Премиум качество'
    ],
    min_price: 7000,
    production_time_days: 4,
    color: '#8B5CF6'
  },
  {
    id: '3d_vinyl',
    name: '3D Винил 1мм',
    description: 'Объемные виниловые наклейки толщиной 1мм для премиум эффекта',
    icon_url: 'https://mgx-backend-cdn.metadl.com/generate/images/870663/2025-12-29/3bef246d-41de-4170-889c-2e6234227258.png',
    features: [
      'Объемный 3D эффект',
      'Толщина 1мм',
      'Премиум внешний вид',
      'Долговечность',
      'Тактильные ощущения'
    ],
    min_price: 8000,
    production_time_days: 5,
    color: '#F59E0B'
  }
];