import { Button } from '@/components/ui/button';
import { ArrowRight, Calculator, Package, Zap, CheckCircle, Truck, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import TechnologyCard from '@/components/TechnologyCard';
import { technologies } from '@/data/technologies';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const features = [
    {
      icon: Zap,
      title: 'Быстрое производство',
      description: 'Изготовление от 2 до 5 дней в зависимости от технологии'
    },
    {
      icon: Package,
      title: 'Оптовые цены',
      description: 'Скидки до 40% при заказе от 100 штук'
    },
    {
      icon: Calculator,
      title: 'Онлайн калькулятор',
      description: 'Мгновенный расчет стоимости вашего заказа'
    },
    {
      icon: CheckCircle,
      title: 'Гарантия качества',
      description: 'Профессиональное оборудование и материалы премиум класса'
    },
    {
      icon: Truck,
      title: 'Быстрая доставка',
      description: 'Бесплатная доставка при заказе от 500,000 UZS'
    },
    {
      icon: Shield,
      title: 'Надежность',
      description: 'Стойкость до 50+ стирок, гарантия на все продукты'
    }
  ];

  const stats = [
    { value: '5000+', label: 'Выполненных заказов' },
    { value: '500+', label: 'Довольных клиентов' },
    { value: '4', label: 'Технологии печати' },
    { value: '24/7', label: 'Поддержка клиентов' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block">
                <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                  🔥 Профессиональная печать в Узбекистане
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Термостикеры для вашего бизнеса
              </h1>
              <p className="text-xl text-muted-foreground">
                DTF, Vinyl, UV DTF и 3D печать высокого качества. Быстрое производство, оптовые цены и бесплатная доставка по Ташкенту.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild className="shadow-lg hover:shadow-xl transition-shadow">
                  <Link to="/catalog">
                    Смотреть каталог
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/calculator">
                    <Calculator className="mr-2 h-5 w-5" />
                    Рассчитать цену
                  </Link>
                </Button>
              </div>
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 border-2 border-background flex items-center justify-center text-white font-semibold text-sm">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-semibold">500+ довольных клиентов</p>
                  <p className="text-muted-foreground">Присоединяйтесь к нам!</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-2xl"></div>
              <img
                src="https://mgx-backend-cdn.metadl.com/generate/images/870663/2025-12-29/4e3d2593-d0d0-40a1-b568-c4950c72e491.png"
                alt="Профессиональное оборудование для DTF печати"
                className="rounded-2xl shadow-2xl relative z-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-sm md:text-base text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Почему выбирают нас</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Профессиональное оборудование, качественные материалы и опытная команда
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Наши технологии печати</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Выберите подходящую технологию для вашего проекта
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {technologies.map((tech) => (
              <TechnologyCard key={tech.id} technology={tech} />
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Примеры работ</h2>
            <p className="text-xl text-muted-foreground">Качество, которое говорит само за себя</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative group overflow-hidden rounded-2xl">
              <img
                src="https://mgx-backend-cdn.metadl.com/generate/images/870663/2025-12-29/532dbd00-0774-49a7-a23b-35843aebfaaa.png"
                alt="Кастомные футболки с DTF трансферами"
                className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2">DTF Transfers</h3>
                  <p className="text-sm opacity-90">Яркие дизайны на любом текстиле</p>
                </div>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-2xl">
              <img
                src="https://mgx-backend-cdn.metadl.com/generate/images/870663/2025-12-29/c13887d5-3d12-4eb4-94a2-77db1684e958.png"
                alt="UV DTF стикеры на различных поверхностях"
                className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2">UV DTF Stickers</h3>
                  <p className="text-sm opacity-90">Премиум стикеры для любых поверхностей</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Как это работает</h2>
            <p className="text-xl text-muted-foreground">Простой процесс заказа в 4 шага</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Выберите технологию', desc: 'DTF, Vinyl, UV или 3D', icon: '🎨' },
              { step: '2', title: 'Загрузите файл', desc: 'PNG, PDF, SVG или AI', icon: '📁' },
              { step: '3', title: 'Рассчитайте цену', desc: 'Мгновенный расчет', icon: '💰' },
              { step: '4', title: 'Оформите заказ', desc: 'Оплата и доставка', icon: '🚀' }
            ].map((item, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold mx-auto shadow-lg">
                    {item.step}
                  </div>
                  <div className="absolute -top-2 -right-2 text-4xl">{item.icon}</div>
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground overflow-hidden relative">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <CardContent className="p-12 text-center space-y-6 relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold">Готовы начать?</h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Создайте свой первый заказ прямо сейчас и получите скидку 10% на первую покупку
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" variant="secondary" asChild className="shadow-lg">
                  <Link to="/catalog">
                    Начать заказ
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" asChild>
                  <Link to="/technologies">
                    Узнать больше
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}