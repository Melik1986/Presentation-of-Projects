# Production Deployment Checklist

## Перед деплоем на Vercel

### 1. Оптимизация видео ✅

**Выполнено:**

- [x] Реализована ленивая загрузка через `OptimizedVideo` компонент
- [x] Убрано дублирование видео (8 вместо 16)
- [x] Автоматический play/pause при видимости

**TODO (через браузерные сервисы):**

- [ ] Сжать видео через онлайн-сервисы:
  - [CloudConvert](https://cloudconvert.com/mp4-converter) - пакетная обработка
  - [Compressor.io](https://compressor.io/) - простой интерфейс
  - [HandBrake](https://handbrake.fr/) - бесплатное приложение с UI
- [ ] Целевой размер: 1-2 MB на видео
- [ ] Проверить качество
- [ ] Заменить файлы в `public/img/catalog-2/`

---

### 2. Vercel Blob Storage (рекомендуется)

**Зачем:**

- Глобальный CDN для быстрой доставки контента
- Автоматическое кэширование
- Экономия места в репозитории
- Бесплатный tier: 500 GB трафика/месяц

**Шаги:**

#### 2.1. Установка зависимостей

```bash
bun add @vercel/blob
```

#### 2.2. Настройка переменных окружения

```env
# .env.local
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

Получить токен:

1. Vercel Dashboard → Project → Storage → Create Database (Blob)
2. Скопировать `BLOB_READ_WRITE_TOKEN`

#### 2.3. Создание скрипта загрузки

**Создать:** `scripts/upload-videos-to-vercel.ts`

```typescript
import { put, list } from '@vercel/blob';
import { readFile } from 'fs/promises';
import { join } from 'path';

async function uploadVideos() {
  const videoDir = 'public/img/catalog-2';
  const videos = [
    'video-1.mp4',
    'video-2.MP4',
    'video-3.mp4',
    'video-4.mp4',
    'video-5.MP4',
    'video-6.MP4',
    'video-7.MP4',
    'video-8.MP4',
  ];

  console.log('🚀 Starting video upload to Vercel Blob...\n');

  const uploadedUrls: Record<string, string> = {};

  for (const video of videos) {
    const filePath = join(videoDir, video);

    try {
      const file = await readFile(filePath);

      console.log(`📤 Uploading: ${video}...`);

      const blob = await put(`catalog-2/${video}`, file, {
        access: 'public',
        contentType: 'video/mp4',
      });

      uploadedUrls[video] = blob.url;
      console.log(`✅ Uploaded: ${blob.url}\n`);
    } catch (error) {
      console.error(`❌ Failed to upload ${video}:`, error);
    }
  }

  console.log('\n📋 URLs for StickyCards.tsx:\n');
  console.log('const videoUrls = [');
  videos.forEach((video) => {
    if (uploadedUrls[video]) {
      console.log(`  '${uploadedUrls[video]}',`);
    }
  });
  console.log('];\n');

  console.log('✅ Upload complete!');
}

uploadVideos().catch(console.error);
```

**Запуск:**

```bash
bun run scripts/upload-videos-to-vercel.ts
```

#### 2.4. Обновление компонентов

**После загрузки обновить URLs в `StickyCards.tsx`:**

```typescript
// Было:
items={[
  '/img/catalog-2/video-1.mp4',
  '/img/catalog-2/video-2.MP4',
  // ...
]}

// Стало:
items={[
  'https://[project].vercel-storage.com/catalog-2/video-1.mp4',
  'https://[project].vercel-storage.com/catalog-2/video-2.MP4',
  // ... CDN URLs
]}
```

#### 2.5. Опционально: Переменные окружения

**Создать config:**

```typescript
// src/shared/config/media.ts
export const MEDIA_CDN_URL = process.env.NEXT_PUBLIC_MEDIA_CDN_URL || '/img';

export const getCatalogVideoUrl = (catalog: string, video: string) => {
  return `${MEDIA_CDN_URL}/catalog-${catalog}/${video}`;
};
```

**Использование:**

```typescript
import { getCatalogVideoUrl } from '@/shared/config/media';

items={[
  getCatalogVideoUrl('2', 'video-1.mp4'),
  // ...
]}
```

---

### 3. Кэширование и Performance

#### 3.1. Next.js Headers для видео

**Обновить `next.config.mjs`:**

```javascript
async headers() {
  return [
    {
      source: '/img/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ];
}
```

#### 3.2. Vercel Edge Config

**Создать `vercel.json`:**

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

---

### 4. Мониторинг после деплоя

#### Проверить:

- [ ] Все видео загружаются корректно
- [ ] Ленивая загрузка работает
- [ ] Видео воспроизводятся при скролле
- [ ] Нет ошибок в консоли браузера
- [ ] Время загрузки страницы < 3 секунд
- [ ] Core Web Vitals в зеленой зоне

#### Инструменты для проверки:

- Chrome DevTools → Network (проверить размер загруженных видео)
- Lighthouse (проверить производительность)
- WebPageTest.org (проверить загрузку на разных скоростях)
- Vercel Analytics (проверить метрики)

---

## Альтернативные CDN решения

### Cloudflare Stream

**Если нужен профессиональный видео хостинг:**

- Автоматическая адаптивная загрузка
- Разные разрешения для разных устройств
- Бесплатный tier: 1000 минут видео
- Цена: $5/1000 минут хранения + $1/1000 минут просмотра

**Документация:** https://developers.cloudflare.com/stream/

### Bunny CDN (самый дешевый)

**Если нужен бюджетный вариант:**

- Стоимость: $0.01/GB трафика
- Глобальное покрытие
- Pull Zone для автоматической синхронизации

**Документация:** https://bunny.net/

---

## Итоговая рекомендация

### Development (сейчас):

1. ✅ Используем `OptimizedVideo` компонент
2. ✅ Убрали дублирование
3. 🔄 Сжимаем видео локально через скрипт

### Production (перед деплоем):

1. 📝 Загружаем видео на Vercel Blob Storage
2. 📝 Обновляем URLs в компонентах
3. 📝 Настраиваем кэширование

### Метрики успеха:

- Время загрузки страницы < 3 сек
- Первое видео отображается < 1 сек
- Lighthouse Performance > 90
- Core Web Vitals: все в зеленой зоне

---

_Обновлено: Ноябрь 2024_
