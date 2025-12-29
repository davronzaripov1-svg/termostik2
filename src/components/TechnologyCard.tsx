import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, DollarSign } from 'lucide-react';
import { Technology } from '@/data/technologies';
import { formatPrice } from '@/lib/priceCalculator';
import { Link } from 'react-router-dom';

interface TechnologyCardProps {
  technology: Technology;
}

export default function TechnologyCard({ technology }: TechnologyCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${technology.color}15` }}
          >
            <img
              src={technology.icon_url}
              alt={technology.name}
              className="w-10 h-10 object-contain"
            />
          </div>
          <Badge variant="secondary" className="text-xs">
            от {formatPrice(technology.min_price)}
          </Badge>
        </div>
        <CardTitle className="text-xl">{technology.name}</CardTitle>
        <CardDescription className="line-clamp-2">{technology.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {technology.features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-start space-x-2">
              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{technology.production_time_days} дня</span>
          </div>
          <Button asChild size="sm">
            <Link to={`/catalog?technology=${technology.id}`}>Выбрать</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}