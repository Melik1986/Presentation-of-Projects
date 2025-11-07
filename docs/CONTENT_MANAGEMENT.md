# Content Management Guide

## 📸 Управление изображениями и контентом

Этот шаблон разработан для **легкой кастомизации** под ваши проекты. Весь контент редактируется через простые JSON-файлы и изображения.

---

## 🎨 Структура изображений

### Расположение файлов

```
public/
└── img/
    ├── catalog-1/          # Первый каталог (Next.js Projects)
    │   ├── preview-1.jpg   # Wildyriftian эффект (папка #1)
    │   ├── preview-2.jpg   # Wildyriftian эффект (папка #2)
    │   ├── preview-3.jpg   # Wildyriftian эффект (папка #3)
    │   ├── card-1.jpg      # Sticky карточка #1
    │   ├── card-2.jpg      # Sticky карточка #2
    │   ├── card-3.jpg      # Sticky карточка #3
    │   └── card-4.jpg      # Sticky карточка #4
    │
    ├── catalog-2/          # Второй каталог (Three.js)
    │   └── ...             # Та же структура
    │
    ├── catalog-3/          # Третий каталог (GSAP)
    │   └── ...
    │
    └── catalog-4/          # Четвертый каталог (Business)
        └── ...
```

### Требования к изображениям

**Preview изображения** (для Wildyriftian эффекта на главной):
- Формат: JPG, PNG, WebP
- Рекомендуемый размер: **800x1200px** (портретная ориентация)
- Соотношение сторон: **2:3**
- Оптимальный размер файла: **< 500KB**

**Card изображения** (для страницы каталога):
- Формат: JPG, PNG, WebP
- Рекомендуемый размер: **1200x800px** (альбомная ориентация)
- Соотношение сторон: **3:2**
- Оптимальный размер файла: **< 700KB**

---

## 📝 Редактирование контента

### Основной файл: `content/catalogs.json`

#### Структура каталога

```json
{
  "id": "nextjs",                    // Уникальный ID (используется в URL)
  "name": "Next.js Projects",        // Название каталога
  "track": "https://youtube.com/...", // YouTube/SoundCloud трек (опционально)
  
  "folder": {
    "displayName": "figures",        // Название папки на главной
    "variant": "variant-1",          // Цвет папки (variant-1/2/3)
    "previewImages": [               // Изображения для Wildyriftian эффекта
      "/img/catalog-1/preview-1.jpg",
      "/img/catalog-1/preview-2.jpg",
      "/img/catalog-1/preview-3.jpg"
    ]
  },
  
  "theme": {                         // Цветовая схема страницы каталога
    "backgroundColor": "#0a0a0a",
    "cardBackground": "#1a1a1a",
    "textColor": "#ffffff",
    "accentColor": "#3b82f6"
  },
  
  "content": {
    "introTitle": "Next.js Excellence",      // SEO заголовок (скрыт визуально)
    "cards": [                               // Sticky карточки
      {
        "index": "01",                       // Номер карточки
        "title": "Server Components",        // Заголовок
        "image": "/img/catalog-1/card-1.jpg",// Изображение
        "description": "Building performant..."  // Описание
      }
      // ... 3 остальные карточки
    ]
  },
  
  "seo": {                           // SEO метаданные
    "title": "Next.js Projects | ...",
    "description": "Showcasing...",
    "keywords": "nextjs, react, ..."
  }
}
```

---

## 🚀 Как заменить контент

### Шаг 1: Подготовьте изображения

1. Оптимизируйте изображения (используйте [TinyPNG](https://tinypng.com/) или [Squoosh](https://squoosh.app/))
2. Переименуйте файлы:
   - `preview-1.jpg`, `preview-2.jpg`, `preview-3.jpg` (для главной)
   - `card-1.jpg`, `card-2.jpg`, `card-3.jpg`, `card-4.jpg` (для каталога)

### Шаг 2: Замените файлы

1. Откройте папку `public/img/catalog-X/` (где X — номер каталога)
2. Замените старые файлы на новые с **теми же именами**
3. Перезапустите dev сервер (`bun dev`)

### Шаг 3: Обновите текст в `catalogs.json`

1. Откройте `content/catalogs.json`
2. Найдите нужный каталог по `"id"`
3. Измените:
   - `name` — название каталога
   - `folder.displayName` — название папки на главной
   - `content.cards[].title` — заголовки карточек
   - `content.cards[].description` — описания
   - `seo` — SEO метаданные

### Шаг 4: Настройте тему (опционально)

Измените цвета в секции `theme`:

```json
"theme": {
  "backgroundColor": "#вашЦвет",  // Фон страницы каталога (весь background)
  "cardBackground": "#вашЦвет",   // Фон sticky карточек
  "textColor": "#вашЦвет",        // Цвет текста (заголовки, описания)
  "accentColor": "#вашЦвет"       // Акцентный цвет (заголовки карточек)
}
```

**Готовые палитры:**
- Темная: `#0a0a0a`, `#1a1a1a`, `#ffffff`, `#3b82f6`
- Фиолетовая: `#0d0d1a`, `#1a1a2e`, `#e0e0ff`, `#6366f1`
- Розовая: `#1a0a14`, `#2a1a24`, `#ffebf0`, `#ec4899`
- Зеленая: `#0f1419`, `#1f2937`, `#f3f4f6`, `#10b981`

**Иерархия фонов:**
- ✅ `backgroundColor` → Фон ВСЕЙ страницы каталога (включая intro/outro секции)
- ✅ `cardBackground` → Фон каждой sticky карточки
- ❌ Секции intro/outro → transparent (наследуют backgroundColor)
- ❌ Body → без фона (управляется страницами)

---

## 🎵 Аудио треки (опционально)

### Поддерживаемые платформы:
- YouTube: `https://youtube.com/watch?v=VIDEO_ID`
- SoundCloud: `https://soundcloud.com/artist/track-name`

Измените `"track"` в каждом каталоге или оставьте `null` для отключения аудио.

---

## 📁 Добавление нового каталога

1. Создайте папку `public/img/catalog-5/`
2. Добавьте 7 изображений (3 preview + 4 card)
3. Добавьте новый объект в массив `catalogs` в `catalogs.json`:

```json
{
  "id": "your-catalog",
  "name": "Your Catalog Name",
  "track": null,
  "folder": {
    "displayName": "your folder",
    "variant": "variant-1",
    "previewImages": [
      "/img/catalog-5/preview-1.jpg",
      "/img/catalog-5/preview-2.jpg",
      "/img/catalog-5/preview-3.jpg"
    ]
  },
  "theme": { /* ... */ },
  "content": {
    "introTitle": "Your SEO Title",
    "cards": [
      /* 4 карточки */
    ]
  },
  "seo": { /* ... */ }
}
```

4. Перезапустите проект

---

## 🎨 Цвета папок (Wildyriftian)

Варианты цветов для `folder.variant`:

- `"variant-1"` → Желтый (`#ffc640`)
- `"variant-2"` → Светло-серый (`#d5d9d2`)
- `"variant-3"` → Темно-серый (`#b0b3ad`)

Кастомные цвета редактируются в `src/features/effects/ui/Wildyriftian.module.css`:

```css
.wildyriftian {
  --variant-1: #yourColor;
  --variant-2: #yourColor;
  --variant-3: #yourColor;
}
```

---

## ✅ Чеклист перед запуском

- [ ] Все изображения оптимизированы (< 500-700KB)
- [ ] Имена файлов соответствуют шаблону (`preview-X.jpg`, `card-X.jpg`)
- [ ] Тексты в `catalogs.json` обновлены
- [ ] SEO метаданные заполнены
- [ ] Цветовая схема настроена
- [ ] Аудио треки работают (или отключены)
- [ ] Проект запускается без ошибок (`bun dev`)

---

## 🆘 Решение проблем

### Изображения не отображаются
- Проверьте пути в `catalogs.json` (должны начинаться с `/img/`)
- Убедитесь, что файлы находятся в `public/img/catalog-X/`
- Перезапустите dev сервер

### Изображения слишком большие
- Используйте WebP формат для лучшего сжатия
- Оптимизируйте через [Squoosh](https://squoosh.app/)
- Уменьшите разрешение до рекомендуемых размеров

### Текст не обновляется
- Очистите кэш браузера (`Ctrl+Shift+R`)
- Проверьте синтаксис JSON (используйте [JSONLint](https://jsonlint.com/))
- Перезапустите dev сервер

---

## 📞 Поддержка

Если у вас возникли вопросы:
1. Проверьте [документацию Next.js](https://nextjs.org/docs)
2. Изучите примеры в `content/catalogs.json`
3. Посмотрите структуру в `public/img/`

---

**Готово!** Ваш шаблон готов к кастомизации 🎉

*Последнее обновление: Ноябрь 2024*

