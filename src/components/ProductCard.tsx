import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Info } from 'lucide-react';
import { Product } from '@/data/products';
import { formatPrice } from '@/lib/priceCalculator';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative overflow-hidden bg-muted">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Badge className="absolute top-2 right-2">
          {product.production_time_days} дня
        </Badge>
      </div>
      <CardHeader>
        <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
        <CardDescription className="line-clamp-2">{product.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-primary">{formatPrice(product.base_price)}</span>
          <span className="text-sm text-muted-foreground">/ {product.unit}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            Мин. {product.min_quantity} {product.unit}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {product.available_sizes.length} размеров
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="flex space-x-2">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link to={`/product/${product.id}`}>
            <Info className="h-4 w-4 mr-2" />
            Подробнее
          </Link>
        </Button>
        <Button size="sm" className="flex-1" asChild>
          <Link to={`/order-builder?product=${product.id}`}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Заказать
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}