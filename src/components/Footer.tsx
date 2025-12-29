import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* О компании */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img
                src="https://mgx-backend-cdn.metadl.com/generate/images/870663/2025-12-29/b8745e22-fe62-451a-bd82-34823c597ef5.png"
                alt="TermoStick"
                className="h-8 w-8 object-contain"
              />
              <span className="text-lg font-bold text-primary">TermoStick</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Профессиональные термостикеры и текстильная продукция для бизнеса и творчества
            </p>
          </div>

          {/* Навигация */}
          <div>
            <h3 className="font-semibold mb-4">Навигация</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Главная
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Каталог
                </Link>
              </li>
              <li>
                <Link to="/technologies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Технологии
                </Link>
              </li>
              <li>
                <Link to="/calculator" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Калькулятор цены
                </Link>
              </li>
            </ul>
          </div>

          {/* Технологии */}
          <div>
            <h3 className="font-semibold mb-4">Технологии</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">DTF Термостикеры</li>
              <li className="text-sm text-muted-foreground">Виниловые наклейки</li>
              <li className="text-sm text-muted-foreground">UV DTF</li>
              <li className="text-sm text-muted-foreground">3D Винил 1мм</li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="font-semibold mb-4">Контакты</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>+998 90 123 45 67</span>
              </li>
              <li className="flex items-start space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>info@termostick.uz</span>
              </li>
              <li className="flex items-start space-x-2 text-sm text-muted-foreground">
                <Send className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>@termostick_uz</span>
              </li>
              <li className="flex items-start space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>г. Ташкент, ул. Производственная 45</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © 2025 TermoStick. Все права защищены.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Политика конфиденциальности
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}