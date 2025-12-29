import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Package, Settings, LogOut, Clock, CheckCircle } from 'lucide-react';
import { formatPrice } from '@/lib/priceCalculator';

export default function Profile() {
  // Mock data - в реальном приложении будет из API
  const user = {
    name: 'Иван Иванов',
    email: 'ivan@example.com',
    phone: '+998 90 123 45 67',
    company: 'ООО "Принт Сервис"',
    type: 'business'
  };

  const orders = [
    {
      id: 'TS-2025-001234',
      date: '2025-12-25',
      status: 'processing',
      total: 450000,
      items: 2
    },
    {
      id: 'TS-2025-001189',
      date: '2025-12-20',
      status: 'completed',
      total: 320000,
      items: 1
    },
    {
      id: 'TS-2025-001145',
      date: '2025-12-15',
      status: 'completed',
      total: 580000,
      items: 3
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />В обработке</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Завершен</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Личный кабинет</h1>
          <p className="text-xl text-muted-foreground">
            Управление профилем и заказами
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Package className="h-4 w-4 mr-2" />
              Заказы
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Настройки
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Информация о профиле</CardTitle>
                <CardDescription>Ваши личные данные</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Имя</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Телефон</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Компания</p>
                    <p className="font-medium">{user.company}</p>
                  </div>
                </div>
                <div className="pt-4">
                  <Badge variant="secondary" className="text-sm">
                    {user.type === 'business' ? 'Бизнес аккаунт' : 'Личный аккаунт'}
                  </Badge>
                </div>
                <div className="pt-4">
                  <Button>Редактировать профиль</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Статистика</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-primary">{orders.length}</p>
                    <p className="text-sm text-muted-foreground mt-1">Всего заказов</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-primary">
                      {formatPrice(orders.reduce((sum, o) => sum + o.total, 0))}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Общая сумма</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-primary">
                      {orders.filter(o => o.status === 'completed').length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Завершено</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>История заказов</CardTitle>
                <CardDescription>Все ваши заказы</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-semibold text-lg">{order.id}</h3>
                              {getStatusBadge(order.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Дата: {new Date(order.date).toLocaleDateString('ru-RU')} • {order.items} {order.items === 1 ? 'товар' : 'товаров'}
                            </p>
                          </div>
                          <div className="text-right space-y-2">
                            <p className="text-2xl font-bold text-primary">
                              {formatPrice(order.total)}
                            </p>
                            <Button variant="outline" size="sm">
                              Подробнее
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Настройки аккаунта</CardTitle>
                <CardDescription>Управление вашим аккаунтом</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  Изменить пароль
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Настройки уведомлений
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Адреса доставки
                </Button>
                <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Выйти из аккаунта
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}