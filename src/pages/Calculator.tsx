import { useState } from 'react';
import { products } from '@/data/products';
import { technologies } from '@/data/technologies';
import { calculatePrice, formatPrice, formatNumber } from '@/lib/priceCalculator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator as CalcIcon, ShoppingCart, Info } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

export default function Calculator() {
  const [selectedTechnology, setSelectedTechnology] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(10);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [hasWhiteLayer, setHasWhiteLayer] = useState(false);
  const { addItem } = useCart();

  const filteredProducts = selectedTechnology
    ? products.filter((p) => p.technology_id === selectedTechnology)
    : [];

  const currentProduct = products.find((p) => p.id === selectedProduct);

  const calculation = currentProduct
    ? calculatePrice({
        product: currentProduct,
        quantity,
        has_white_layer: hasWhiteLayer
      })
    : null;

  const handleAddToCart = () => {
    if (!currentProduct || !calculation) return;

    addItem({
      product: currentProduct,
      quantity,
      color_mode: hasWhiteLayer ? 'CMYK+White' : 'CMYK',
      has_white_layer: hasWhiteLayer,
      unit_price: calculation.unit_price,
      total: calculation.subtotal
    });

    toast.success('Товар добавлен в корзину', {
      description: `${currentProduct.name} - ${quantity} шт`
    });
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Калькулятор стоимости</h1>
          <p className="text-xl text-muted-foreground">
            Рассчитайте стоимость вашего заказа онлайн
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calculator Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalcIcon className="h-5 w-5 mr-2" />
                  Параметры заказа
                </CardTitle>
                <CardDescription>Заполните все поля для расчета стоимости</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Technology */}
                <div className="space-y-2">
                  <Label>Технология печати *</Label>
                  <Select value={selectedTechnology} onValueChange={(value) => {
                    setSelectedTechnology(value);
                    setSelectedProduct('');
                    setSelectedSize('');
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите технологию" />
                    </SelectTrigger>
                    <SelectContent>
                      {technologies.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Product */}
                {selectedTechnology && (
                  <div className="space-y-2">
                    <Label>Продукт *</Label>
                    <Select value={selectedProduct} onValueChange={(value) => {
                      setSelectedProduct(value);
                      const product = products.find(p => p.id === value);
                      if (product) {
                        setQuantity(product.min_quantity);
                        setSelectedSize(product.available_sizes[0]);
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите продукт" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Size */}
                {currentProduct && (
                  <div className="space-y-2">
                    <Label>Размер (см) *</Label>
                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите размер" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentProduct.available_sizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size} см
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Quantity */}
                {currentProduct && (
                  <div className="space-y-2">
                    <Label>Количество *</Label>
                    <Input
                      type="number"
                      min={currentProduct.min_quantity}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || currentProduct.min_quantity)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Минимальный заказ: {currentProduct.min_quantity} {currentProduct.unit}
                    </p>
                  </div>
                )}

                {/* White Layer */}
                {currentProduct && currentProduct.colors.includes('CMYK+White') && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="white-layer"
                      checked={hasWhiteLayer}
                      onCheckedChange={(checked) => setHasWhiteLayer(checked as boolean)}
                    />
                    <Label htmlFor="white-layer" className="cursor-pointer">
                      Добавить белый подслой (+20% к стоимости)
                    </Label>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Итого</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {calculation && currentProduct ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Цена за единицу:</span>
                        <span className="font-medium">{formatPrice(calculation.unit_price)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Количество:</span>
                        <span className="font-medium">{formatNumber(quantity)} шт</span>
                      </div>
                      {calculation.discount_percent > 0 && (
                        <Badge variant="secondary" className="w-full justify-center">
                          Скидка {calculation.discount_percent}%
                        </Badge>
                      )}
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Подытог:</span>
                        <span className="font-medium">{formatPrice(calculation.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Доставка:</span>
                        <span className="font-medium">
                          {calculation.delivery_cost === 0 ? (
                            <Badge variant="secondary">Бесплатно</Badge>
                          ) : (
                            formatPrice(calculation.delivery_cost)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">НДС (15%):</span>
                        <span className="font-medium">{formatPrice(calculation.vat)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Итого:</span>
                        <span className="text-primary">{formatPrice(calculation.total)}</span>
                      </div>
                    </div>

                    <div className="pt-4 space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Info className="h-4 w-4" />
                        <span>Срок изготовления: {calculation.production_time_days} дня</span>
                      </div>
                      <Button className="w-full" onClick={handleAddToCart}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Добавить в корзину
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalcIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Выберите параметры для расчета стоимости</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}