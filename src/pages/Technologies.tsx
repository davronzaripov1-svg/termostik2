import { technologies } from '@/data/technologies';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, DollarSign, ArrowRight, Sparkles } from 'lucide-react';
import { formatPrice } from '@/lib/priceCalculator';
import { Link } from 'react-router-dom';

export default function Technologies() {
  const techImages = {
    dtf: 'https://mgx-backend-cdn.metadl.com/generate/images/870663/2025-12-29/d86a54e5-1f98-4236-82f6-201f77c2717b.png',
    vinyl: 'https://mgx-backend-cdn.metadl.com/generate/images/870663/2025-12-29/3ee92153-ff29-4ba7-a770-f97b87c601fc.png',
    uv_dtf: 'https://mgx-backend-cdn.metadl.com/generate/images/870663/2025-12-29/c13887d5-3d12-4eb4-94a2-77db1684e958.png',
    '3d_vinyl': 'https://mgx-backend-cdn.metadl.com/generate/images/870663/2025-12-29/5a4e811f-1ee2-415f-8794-30e0829e69d5.png'
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Профессиональные технологии печати
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Наши технологии</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Мы используем современное оборудование и материалы премиум класса для создания качественной продукции
          </p>
        </div>

        {/* Technologies */}
        <div className="space-y-16">
          {technologies.map((tech, index) => (
            <Card key={tech.id} className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className={`grid md:grid-cols-2 gap-0 ${index % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                {/* Image */}
                <div className={`relative min-h-[400px] ${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{ backgroundColor: tech.color }}
                  />
                  <img
                    src={techImages[tech.id as keyof typeof techImages]}
                    alt={tech.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="text-lg px-4 py-2" style={{ backgroundColor: tech.color }}>
                      {tech.id.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className={`p-8 md:p-12 flex flex-col justify-center ${index % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}`}>
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold mb-3">{tech.name}</h2>
                      <p className="text-lg text-muted-foreground leading-relaxed">{tech.description}</p>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg mb-3">Преимущества:</h3>
                      {tech.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start space-x-3">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: `${tech.color}20` }}
                          >
                            <Check className="h-4 w-4" style={{ color: tech.color }} />
                          </div>
                          <span className="text-base">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <Card className="bg-muted/50">
                        <CardContent className="p-4 text-center">
                          <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
                          <p className="text-sm text-muted-foreground mb-1">Цена от</p>
                          <p className="font-bold text-lg">{formatPrice(tech.min_price)}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/50">
                        <CardContent className="p-4 text-center">
                          <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                          <p className="text-sm text-muted-foreground mb-1">Изготовление</p>
                          <p className="font-bold text-lg">{tech.production_time_days} дня</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-wrap gap-3 pt-4">
                      <Button size="lg" asChild style={{ backgroundColor: tech.color }}>
                        <Link to={`/catalog?technology=${tech.id}`}>
                          Смотреть продукцию
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                      <Button size="lg" variant="outline" asChild>
                        <Link to={`/calculator?technology=${tech.id}`}>
                          Рассчитать цену
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Сравнение технологий</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-4 text-left font-semibold">Характеристика</th>
                      <th className="p-4 text-center font-semibold">DTF</th>
                      <th className="p-4 text-center font-semibold">Vinyl</th>
                      <th className="p-4 text-center font-semibold">UV DTF</th>
                      <th className="p-4 text-center font-semibold">3D Vinyl</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-4 font-medium">Цветность</td>
                      <td className="p-4 text-center">Full Color</td>
                      <td className="p-4 text-center">1 цвет</td>
                      <td className="p-4 text-center">Full Color</td>
                      <td className="p-4 text-center">1 цвет</td>
                    </tr>
                    <tr className="bg-muted/30">
                      <td className="p-4 font-medium">Поверхности</td>
                      <td className="p-4 text-center">Текстиль</td>
                      <td className="p-4 text-center">Текстиль</td>
                      <td className="p-4 text-center">Твердые</td>
                      <td className="p-4 text-center">Текстиль</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Стойкость</td>
                      <td className="p-4 text-center">50+ стирок</td>
                      <td className="p-4 text-center">5 лет</td>
                      <td className="p-4 text-center">3-5 лет</td>
                      <td className="p-4 text-center">Очень высокая</td>
                    </tr>
                    <tr className="bg-muted/30">
                      <td className="p-4 font-medium">Срок изготовления</td>
                      <td className="p-4 text-center">3 дня</td>
                      <td className="p-4 text-center">2 дня</td>
                      <td className="p-4 text-center">4 дня</td>
                      <td className="p-4 text-center">5 дней</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Цена от</td>
                      <td className="p-4 text-center">{formatPrice(5000)}</td>
                      <td className="p-4 text-center">{formatPrice(3000)}</td>
                      <td className="p-4 text-center">{formatPrice(7000)}</td>
                      <td className="p-4 text-center">{formatPrice(8000)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Application Examples */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Примеры применения</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="overflow-hidden group">
              <div className="relative h-64">
                <img
                  src="https://mgx-backend-cdn.metadl.com/generate/images/870663/2025-12-29/532dbd00-0774-49a7-a23b-35843aebfaaa.png"
                  alt="DTF на футболках"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">DTF на текстиле</h3>
                <p className="text-muted-foreground">
                  Идеально для футболок, худи, сумок. Яркие цвета, высокая детализация, подходит для любых тканей.
                </p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden group">
              <div className="relative h-64">
                <img
                  src="https://mgx-backend-cdn.metadl.com/generate/images/870663/2025-12-29/58e9d690-d3b2-4c60-b471-eabbccd54be3.png"
                  alt="Процесс нанесения"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Процесс нанесения</h3>
                <p className="text-muted-foreground">
                  Профессиональное оборудование и опытные специалисты гарантируют качественный результат.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <Card className="mt-16 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-3xl font-bold">Не уверены, какая технология подходит?</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Свяжитесь с нами, и наши специалисты помогут выбрать оптимальное решение для вашего проекта
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary">
                Связаться с нами
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                Задать вопрос
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}