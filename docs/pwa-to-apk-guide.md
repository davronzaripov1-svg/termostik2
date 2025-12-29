# 📱 Руководство по конвертации TermoStick PWA в Android APK

## 🎯 Обзор

Это подробное руководство покажет, как преобразовать веб-приложение TermoStick в полноценное Android приложение (APK), которое можно опубликовать в Google Play Store.

### Что вы получите:
- ✅ Нативное Android приложение (.apk файл)
- ✅ Работа офлайн
- ✅ Push-уведомления
- ✅ Доступ к нативным функциям Android
- ✅ Публикация в Google Play Store
- ✅ Автоматические обновления

---

## 📋 Содержание

1. [Требования](#требования)
2. [Метод 1: Capacitor (Рекомендуется)](#метод-1-capacitor-рекомендуется)
3. [Метод 2: PWABuilder (Быстрый способ)](#метод-2-pwabuilder-быстрый-способ)
4. [Метод 3: Trusted Web Activity](#метод-3-trusted-web-activity)
5. [Подготовка к публикации в Google Play](#подготовка-к-публикации-в-google-play)
6. [Часто задаваемые вопросы](#часто-задаваемые-вопросы)

---

## 🔧 Требования

### Общие требования:
- ✅ PWA приложение развернуто на HTTPS домене (например, https://termostick.uz)
- ✅ Действующий SSL сертификат
- ✅ Файлы manifest.json и service-worker.js настроены
- ✅ Все иконки приложения созданы

### Для Capacitor (Метод 1):
- Node.js 16+ и npm/pnpm
- Android Studio (последняя версия)
- Java Development Kit (JDK) 11+
- Android SDK (API Level 33+)
- Минимум 8 GB RAM
- 10+ GB свободного места на диске

### Для PWABuilder (Метод 2):
- Только браузер и интернет
- Развернутое PWA приложение на HTTPS

### Для TWA (Метод 3):
- Android Studio
- Верифицированный домен
- Digital Asset Links настроены

---

## 🚀 Метод 1: Capacitor (Рекомендуется)

Capacitor - это официальный инструмент от Ionic для создания нативных приложений из веб-кода.

### Преимущества:
- ✅ Полный контроль над приложением
- ✅ Доступ ко всем нативным API Android
- ✅ Легкая интеграция плагинов
- ✅ Отличная документация
- ✅ Активное сообщество

### Шаг 1: Установка Capacitor

```bash
# Перейдите в директорию проекта
cd /workspace/shadcn-ui

# Установите Capacitor CLI
pnpm add @capacitor/core @capacitor/cli

# Инициализируйте Capacitor
npx cap init "TermoStick" "uz.termostick.app" --web-dir=dist
```

**Параметры:**
- `"TermoStick"` - название приложения
- `"uz.termostick.app"` - уникальный package ID (измените на свой)
- `--web-dir=dist` - директория с собранным приложением

### Шаг 2: Добавление Android платформы

```bash
# Установите Android платформу
pnpm add @capacitor/android

# Добавьте Android в проект
npx cap add android
```

Это создаст папку `android/` с нативным Android проектом.

### Шаг 3: Настройка capacitor.config.ts

Создайте файл `capacitor.config.ts` в корне проекта:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uz.termostick.app',
  appName: 'TermoStick',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'termostick.uz',
    // Для разработки можете использовать локальный сервер:
    // url: 'http://192.168.1.100:5173',
    // cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: '/path/to/your/keystore.jks',
      keystoreAlias: 'termostick',
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0A0A0A',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      spinnerColor: '#FF6B35'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0A0A0A'
    }
  }
};

export default config;
```

### Шаг 4: Сборка веб-приложения

```bash
# Соберите production версию
pnpm run build

# Синхронизируйте с Android проектом
npx cap sync android
```

### Шаг 5: Настройка иконок и splash screen

#### Автоматическая генерация (рекомендуется):

```bash
# Установите плагин для генерации ресурсов
pnpm add -D @capacitor/assets

# Создайте папку для исходных изображений
mkdir -p resources

# Скопируйте ваши иконки:
# - resources/icon.png (1024x1024, PNG с прозрачностью)
# - resources/splash.png (2732x2732, PNG)

# Сгенерируйте все размеры
npx capacitor-assets generate --android
```

#### Ручная настройка:

Скопируйте иконки в `android/app/src/main/res/`:
- `mipmap-mdpi/` - 48x48
- `mipmap-hdpi/` - 72x72
- `mipmap-xhdpi/` - 96x96
- `mipmap-xxhdpi/` - 144x144
- `mipmap-xxxhdpi/` - 192x192

### Шаг 6: Настройка Android Manifest

Отредактируйте `android/app/src/main/AndroidManifest.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="TermoStick"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:windowSoftInputMode="adjustResize">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Deep Links -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="termostick.uz" />
            </intent-filter>

        </activity>
    </application>

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

</manifest>
```

### Шаг 7: Открытие проекта в Android Studio

```bash
# Откройте Android Studio
npx cap open android
```

Или вручную: File → Open → выберите папку `android/`

### Шаг 8: Создание Keystore для подписи

```bash
# Создайте keystore файл
keytool -genkey -v -keystore termostick-release.jks \
  -alias termostick \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Введите данные:
# - Пароль keystore (запомните!)
# - Имя, организация, город, страна
# - Пароль ключа (может быть таким же)
```

**⚠️ ВАЖНО:** Сохраните файл `termostick-release.jks` и пароли в безопасном месте! Без них вы не сможете обновлять приложение в Google Play.

### Шаг 9: Настройка подписи в build.gradle

Отредактируйте `android/app/build.gradle`:

```gradle
android {
    ...
    
    signingConfigs {
        release {
            storeFile file('/path/to/termostick-release.jks')
            storePassword 'ваш_пароль_keystore'
            keyAlias 'termostick'
            keyPassword 'ваш_пароль_ключа'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Шаг 10: Сборка APK

#### Через Android Studio:
1. Build → Generate Signed Bundle / APK
2. Выберите "APK"
3. Выберите keystore файл
4. Введите пароли
5. Выберите "release" build variant
6. Нажмите "Finish"

APK будет в `android/app/build/outputs/apk/release/app-release.apk`

#### Через командную строку:

```bash
# Перейдите в папку android
cd android

# Соберите release APK
./gradlew assembleRelease

# APK будет в: app/build/outputs/apk/release/app-release.apk
```

### Шаг 11: Тестирование APK

```bash
# Установите на подключенное устройство
adb install app/build/outputs/apk/release/app-release.apk

# Или перетащите APK на эмулятор Android Studio
```

### Шаг 12: Создание AAB для Google Play

Google Play требует формат Android App Bundle (.aab):

```bash
# Соберите AAB
cd android
./gradlew bundleRelease

# AAB будет в: app/build/outputs/bundle/release/app-release.aab
```

---

## ⚡ Метод 2: PWABuilder (Быстрый способ)

PWABuilder - это онлайн-сервис от Microsoft для быстрой конвертации PWA в APK.

### Преимущества:
- ✅ Не требует программирования
- ✅ Быстрая генерация APK (5-10 минут)
- ✅ Автоматическая настройка
- ✅ Бесплатный

### Недостатки:
- ❌ Меньше контроля
- ❌ Ограниченная кастомизация
- ❌ Зависимость от внешнего сервиса

### Шаг 1: Подготовка PWA

Убедитесь, что ваше приложение:
- ✅ Развернуто на HTTPS (https://termostick.uz)
- ✅ Имеет валидный manifest.json
- ✅ Имеет работающий service worker
- ✅ Все иконки загружены (192x192, 512x512)

### Шаг 2: Использование PWABuilder

1. Откройте https://www.pwabuilder.com/
2. Введите URL вашего PWA: `https://termostick.uz`
3. Нажмите "Start"
4. PWABuilder проверит ваше приложение

### Шаг 3: Генерация Android пакета

1. Нажмите "Package For Stores"
2. Выберите "Android"
3. Настройте параметры:
   - **Package ID**: uz.termostick.app
   - **App name**: TermoStick
   - **Launcher name**: TermoStick
   - **Theme color**: #FF6B35
   - **Background color**: #0A0A0A
   - **Start URL**: /
   - **Display mode**: standalone
   - **Orientation**: portrait

### Шаг 4: Дополнительные настройки

```json
{
  "packageId": "uz.termostick.app",
  "name": "TermoStick",
  "launcherName": "TermoStick",
  "appVersion": "1.0.0",
  "appVersionCode": 1,
  "host": "termostick.uz",
  "startUrl": "/",
  "themeColor": "#FF6B35",
  "backgroundColor": "#0A0A0A",
  "navigationColor": "#0A0A0A",
  "display": "standalone",
  "orientation": "portrait",
  "iconUrl": "https://termostick.uz/icons/icon-512.png",
  "maskableIconUrl": "https://termostick.uz/icons/icon-512.png",
  "splashScreenFadeOutDuration": 300,
  "enableNotifications": true,
  "enableSiteSettingsShortcut": true,
  "shortcuts": [
    {
      "name": "Каталог",
      "short_name": "Каталог",
      "url": "/catalog",
      "icons": [{"src": "/icons/icon-192.png", "sizes": "192x192"}]
    }
  ],
  "signingMode": "new",
  "signing": {
    "file": null,
    "alias": "termostick",
    "fullName": "TermoStick",
    "organization": "TermoStick",
    "organizationalUnit": "Development",
    "countryCode": "UZ"
  }
}
```

### Шаг 5: Генерация и скачивание

1. Нажмите "Generate"
2. Дождитесь завершения (2-5 минут)
3. Скачайте ZIP архив с APK и исходниками
4. Распакуйте архив

Внутри вы найдете:
- `app-release-signed.apk` - готовый APK для установки
- `app-release.aab` - для загрузки в Google Play
- `signing-key.keystore` - ключ подписи (СОХРАНИТЕ!)
- `signing-key-info.txt` - информация о ключе
- `assetlinks.json` - для верификации домена

### Шаг 6: Настройка Digital Asset Links

Скопируйте `assetlinks.json` на ваш сервер:

```bash
# Создайте директорию
mkdir -p /var/www/termostick/.well-known

# Скопируйте файл
cp assetlinks.json /var/www/termostick/.well-known/

# Настройте права
chmod 644 /var/www/termostick/.well-known/assetlinks.json
```

Файл должен быть доступен по адресу:
`https://termostick.uz/.well-known/assetlinks.json`

### Шаг 7: Тестирование

```bash
# Установите APK на устройство
adb install app-release-signed.apk
```

---

## 🔐 Метод 3: Trusted Web Activity (TWA)

TWA - официальный способ Google для упаковки PWA в Android приложение.

### Преимущества:
- ✅ Официальная поддержка Google
- ✅ Полная интеграция с Chrome
- ✅ Автоматические обновления контента
- ✅ Нет дублирования кода

### Недостатки:
- ❌ Требует верификации домена
- ❌ Зависимость от Chrome на устройстве
- ❌ Сложнее настройка

### Шаг 1: Создание Android проекта

```bash
# Клонируйте шаблон TWA
git clone https://github.com/GoogleChromeLabs/svgomg-twa.git termostick-twa
cd termostick-twa
```

### Шаг 2: Настройка build.gradle

Отредактируйте `app/build.gradle`:

```gradle
android {
    defaultConfig {
        applicationId "uz.termostick.app"
        minSdkVersion 19
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
        
        // TWA настройки
        manifestPlaceholders = [
            hostName: "termostick.uz",
            defaultUrl: "https://termostick.uz",
            launcherName: "TermoStick",
            appName: "TermoStick",
            themeColor: "#FF6B35",
            navigationColor: "#0A0A0A",
            backgroundColor: "#0A0A0A",
            enableNotifications: "true"
        ]
    }
}

dependencies {
    implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'
}
```

### Шаг 3: Генерация Digital Asset Links

```bash
# Получите SHA256 отпечаток вашего ключа
keytool -list -v -keystore termostick-release.jks -alias termostick

# Скопируйте SHA256 fingerprint
```

Создайте `assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "uz.termostick.app",
    "sha256_cert_fingerprints": [
      "ВАШ_SHA256_FINGERPRINT"
    ]
  }
}]
```

Загрузите на сервер:
`https://termostick.uz/.well-known/assetlinks.json`

### Шаг 4: Сборка APK

```bash
./gradlew assembleRelease
```

---

## 📤 Подготовка к публикации в Google Play

### Шаг 1: Создание аккаунта разработчика

1. Перейдите на https://play.google.com/console
2. Создайте аккаунт разработчика ($25 единоразово)
3. Заполните профиль и согласитесь с условиями

### Шаг 2: Создание приложения

1. Нажмите "Create app"
2. Заполните информацию:
   - **App name**: TermoStick
   - **Default language**: Русский
   - **App or game**: App
   - **Free or paid**: Free (или Paid)
   - **Declarations**: Отметьте все чекбоксы

### Шаг 3: Настройка Store Listing

#### Описание приложения:

**Краткое описание (80 символов):**
```
Профессиональные термотрансферы и виниловые наклейки для бизнеса
```

**Полное описание (4000 символов):**
```
TermoStick - ваш надежный партнер в мире термопечати и виниловых наклеек!

🎨 ЧТО МЫ ПРЕДЛАГАЕМ:

• DTF Термотрансферы - яркие, долговечные принты для текстиля
• Виниловые наклейки - для любых поверхностей и целей
• UV DTF стикеры - водостойкие и устойчивые к выцветанию
• 3D Виниловые наклейки - объемные эффекты для премиум-дизайна

💼 ДЛЯ БИЗНЕСА:

• Оптовые цены от 100 штук
• Быстрое производство 24-48 часов
• Профессиональное оборудование Epson, Roland
• Качественные материалы от ведущих производителей
• Доставка по всему Узбекистану

📱 ВОЗМОЖНОСТИ ПРИЛОЖЕНИЯ:

• Удобный каталог продукции
• Калькулятор стоимости заказа
• Корзина покупок
• История заказов
• Отслеживание статуса
• Техподдержка 24/7

🎯 ИДЕАЛЬНО ДЛЯ:

• Производителей одежды
• Рекламных агентств
• Сувенирных магазинов
• Дизайнеров
• Предпринимателей

🚀 ПОЧЕМУ TERMOSTICK:

✓ 5+ лет опыта в индустрии
✓ 10,000+ довольных клиентов
✓ Гарантия качества на всю продукцию
✓ Бесплатные образцы для оптовых заказов
✓ Техническая поддержка и консультации

Скачайте приложение и начните создавать уникальные дизайны уже сегодня!

📞 Контакты:
Телефон: +998 XX XXX XX XX
Email: info@termostick.uz
Сайт: https://termostick.uz

#термотрансферы #DTF #виниловыенаклейки #печатьнаткани #бизнес
```

#### Скриншоты:

Требуется минимум 2 скриншота для каждого типа устройства:

**Телефон (1080x1920 или 1080x2340):**
- Главная страница
- Каталог продукции
- Карточка товара
- Корзина
- Калькулятор цены

**Планшет (7" и 10"):**
- Аналогично телефону, но в альбомной ориентации

**Создание скриншотов:**

```bash
# Используйте Chrome DevTools
# 1. Откройте https://termostick.uz
# 2. F12 → Toggle device toolbar
# 3. Выберите разрешение 1080x1920
# 4. Сделайте скриншоты каждой страницы
# 5. Ctrl+Shift+P → "Capture screenshot"
```

#### Иконка приложения:

- **Размер**: 512x512 пикселей
- **Формат**: PNG с прозрачностью
- **Файл**: используйте `/public/icons/icon-512.png`

#### Feature Graphic:

- **Размер**: 1024x500 пикселей
- **Формат**: PNG или JPG
- **Содержание**: Логотип + слоган + ключевые преимущества

### Шаг 4: Контент приложения

1. **App category**: Business / Shopping
2. **Tags**: термотрансферы, печать, бизнес
3. **Contact details**:
   - Email: support@termostick.uz
   - Phone: +998 XX XXX XX XX
   - Website: https://termostick.uz
4. **Privacy Policy**: https://termostick.uz/privacy

### Шаг 5: Загрузка APK/AAB

1. Перейдите в "Release" → "Production"
2. Нажмите "Create new release"
3. Загрузите `app-release.aab` файл
4. Заполните "Release notes":

```
Версия 1.0.0 - Первый релиз

Что нового:
• Каталог термотрансферов и виниловых наклеек
• Калькулятор стоимости заказа
• Корзина покупок
• Профиль пользователя
• Темная и светлая темы
• Офлайн режим работы

Спасибо за использование TermoStick!
```

### Шаг 6: Настройка ценообразования

1. **Countries**: Выберите страны (Узбекистан, Россия, Казахстан и т.д.)
2. **Price**: Free или установите цену
3. **In-app purchases**: Если планируете (опционально)

### Шаг 7: Контент рейтинга

1. Заполните анкету IARC:
   - Насилие: Нет
   - Сексуальный контент: Нет
   - Нецензурная лексика: Нет
   - Наркотики: Нет
   - и т.д.
2. Получите рейтинг (обычно "Everyone" или "3+")

### Шаг 8: Целевая аудитория

1. **Target age**: 18+ (для бизнес-приложений)
2. **App designed for children**: No
3. **Target audience**: Professionals, Business owners

### Шаг 9: Data safety

Заполните информацию о сборе данных:

```
Собираемые данные:
• Email адрес (для регистрации)
• Имя пользователя (для профиля)
• История заказов (для удобства)
• Адрес доставки (для выполнения заказов)

Цель сбора:
• Обработка заказов
• Улучшение сервиса
• Коммуникация с клиентами

Безопасность:
• Данные шифруются при передаче (HTTPS)
• Данные шифруются на устройстве
• Пользователь может запросить удаление данных
```

### Шаг 10: Отправка на проверку

1. Проверьте все разделы (должны быть зеленые галочки)
2. Нажмите "Send for review"
3. Дождитесь одобрения (обычно 1-7 дней)

### Шаг 11: После публикации

После одобрения:
- ✅ Приложение появится в Google Play
- ✅ Пользователи смогут его скачать
- ✅ Вы получите ссылку: `https://play.google.com/store/apps/details?id=uz.termostick.app`

---

## 📊 Требования Google Play Store

### Технические требования:

- ✅ **Target SDK**: Минимум API 33 (Android 13)
- ✅ **Min SDK**: Рекомендуется API 21+ (Android 5.0)
- ✅ **64-bit**: Поддержка ARM64 и x86_64
- ✅ **App Bundle**: Формат AAB (не APK)
- ✅ **Размер**: До 150 MB (AAB), до 100 MB (APK)

### Контент требования:

- ✅ Уникальное название (не копирует известные бренды)
- ✅ Качественные скриншоты (минимум 2)
- ✅ Иконка 512x512
- ✅ Feature graphic 1024x500
- ✅ Описание на языке целевой аудитории
- ✅ Privacy Policy (обязательно!)
- ✅ Контактная информация

### Функциональные требования:

- ✅ Приложение стабильно работает
- ✅ Нет критических багов
- ✅ Соответствует описанию
- ✅ Не содержит вредоносного кода
- ✅ Не нарушает авторские права
- ✅ Соответствует политике Google Play

### Юридические требования:

- ✅ Аккаунт разработчика ($25)
- ✅ Согласие с Developer Program Policies
- ✅ Согласие с Developer Distribution Agreement
- ✅ Заполнена налоговая информация (если платное)

---

## ❓ Часто задаваемые вопросы

### Q: Сколько стоит публикация в Google Play?
**A:** Единоразовый платеж $25 за аккаунт разработчика. Дальнейшие публикации бесплатны.

### Q: Сколько времени занимает проверка?
**A:** Обычно 1-7 дней. Первая публикация может занять до 14 дней.

### Q: Могу ли я обновить приложение?
**A:** Да! Просто увеличьте versionCode и загрузите новый AAB. Обновления проходят проверку быстрее (1-3 дня).

### Q: Что делать, если приложение отклонили?
**A:** Прочитайте причину отклонения, исправьте проблему и отправьте заново. Обычно это связано с:
- Нарушением политики контента
- Техническими проблемами
- Неполной информацией в Store Listing

### Q: Нужен ли мне HTTPS для PWA?
**A:** Да, обязательно! PWA и TWA работают только на HTTPS.

### Q: Могу ли я использовать бесплатный SSL?
**A:** Да, Let's Encrypt отлично подходит для PWA и TWA.

### Q: Работает ли приложение офлайн?
**A:** Да, если правильно настроен Service Worker. Кэшированные страницы будут доступны без интернета.

### Q: Могу ли я отправлять Push-уведомления?
**A:** Да, через Web Push API. Требуется настройка Firebase Cloud Messaging.

### Q: Какой метод лучше: Capacitor, PWABuilder или TWA?
**A:** 
- **Capacitor** - если нужен полный контроль и нативные функции
- **PWABuilder** - для быстрого старта без программирования
- **TWA** - для максимальной интеграции с веб-версией

### Q: Могу ли я монетизировать приложение?
**A:** Да! Можете:
- Продавать приложение (платная загрузка)
- Добавить in-app purchases
- Показывать рекламу (AdMob)
- Использовать подписки

### Q: Нужно ли мне знать Java/Kotlin?
**A:** Для PWABuilder и базового TWA - нет. Для Capacitor с кастомными плагинами - желательно.

### Q: Как обновить иконки приложения?
**A:** 
- Capacitor: замените файлы в `android/app/src/main/res/mipmap-*/`
- PWABuilder: обновите на сайте и перегенерируйте
- TWA: обновите в `app/src/main/res/mipmap-*/`

### Q: Что такое versionCode и versionName?
**A:** 
- **versionCode** - целое число, увеличивается с каждым обновлением (1, 2, 3...)
- **versionName** - строка для пользователей ("1.0.0", "1.1.0", "2.0.0")

### Q: Как протестировать перед публикацией?
**A:** 
1. Internal testing - закрытое тестирование для команды
2. Closed testing - для выбранных пользователей (до 100)
3. Open testing - открытое бета-тестирование
4. Production - полная публикация

### Q: Могу ли я удалить приложение из Google Play?
**A:** Да, но пользователи, которые уже установили, смогут продолжать использовать.

### Q: Как получить больше загрузок?
**A:** 
- Оптимизируйте Store Listing (ASO)
- Используйте качественные скриншоты
- Добавьте видео-превью
- Собирайте положительные отзывы
- Продвигайте через социальные сети
- Используйте Google Ads

---

## 🎓 Дополнительные ресурсы

### Документация:
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [PWABuilder Guide](https://docs.pwabuilder.com/)
- [TWA Documentation](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)

### Инструменты:
- [Android Studio](https://developer.android.com/studio)
- [PWABuilder](https://www.pwabuilder.com/)
- [Lighthouse PWA Audit](https://web.dev/measure/)
- [App Icon Generator](https://www.appicon.co/)

### Сообщества:
- [Capacitor Community](https://github.com/capacitor-community)
- [PWA Slack](https://bit.ly/join-pwa-slack)
- [Android Developers Reddit](https://www.reddit.com/r/androiddev/)

---

## 📞 Поддержка

Если у вас возникли вопросы:

1. Проверьте [FAQ](#часто-задаваемые-вопросы)
2. Изучите официальную документацию
3. Задайте вопрос в сообществе
4. Обратитесь в техподдержку Google Play

---

**Удачи с публикацией вашего приложения! 🚀**

*Последнее обновление: 29 декабря 2025*