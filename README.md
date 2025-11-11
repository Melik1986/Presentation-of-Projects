# Starlight Portfolio

Modern portfolio website built with Next.js 15, React 19, and TypeScript.

---

## ⚠️ ВАЖНО: Branch Strategy

**Этот репозиторий использует две ветки:**

- 🟢 **`main`** - Чистый шаблон для покупателей (НЕ ТРОГАТЬ после релиза)
- 🟣 **`portfolio`** - Твоя кастомная версия с реальными проектами

**🚫 НИКОГДА не делай `git merge portfolio` в ветке `main`!**

📖 Подробнее: [BRANCH_STRATEGY.md](./BRANCH_STRATEGY.md)

---

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript (Strict Mode)
- **Styling:** CSS Modules
- **Animations:** GSAP, Lenis
- **Architecture:** Feature-Sliced Design

## 📁 Project Structure

starlight/
├── src/
│ ├── app/ # Next.js App Router
│ │ ├── layout.tsx
│ │ ├── page.tsx
│ │ ├── globals.css
│ │ └── sticky/
│ │ └── page.tsx
│ │
│ ├── shared/ # Shared слой
│ │ ├── ui/ # UI компоненты
│ │ ├── lib/ # Утилиты
│ │ ├── config/ # Конфигурации
│ │ └── types/ # Общие типы
│ │
│ ├── entities/ # Бизнес-сущности
│ │ └── audio/ # (пока пусто)
│ │
│ ├── features/ # Фичи
│ │ ├── preloader/
│ │ │ ├── ui/
│ │ │ ├── model/
│ │ │ └── index.ts
│ │ ├── effects/
│ │ │ ├── ui/
│ │ │ └── index.ts
│ │ ├── sticky-cards/
│ │ │ ├── ui/
│ │ │ ├── model/
│ │ │ └── index.ts
│ │ └── audio/ # (последним)
│ │ ├── ui/
│ │ ├── model/
│ │ ├── services/
│ │ └── index.ts
│ │
│ └── widgets/ # Виджеты (композиция features)
│ └── (пока пусто)

## 🛠️ Development

```bash
# Install dependencies (using Bun)
bun install

# Run development server (with Turbopack)
bun dev

# Build for production
bun run build

# Start production server
bun start

# Lint code
bun run lint

# Format code
bun run format

# Type check
bun run type-check
```

### Why Bun?

- ⚡ **~10x faster** package installation
- 🚀 **Native TypeScript** support
- 📦 **Built-in bundler** and test runner
- 🔒 **Better security** with lockfile
- 💾 **Smaller disk usage**

## 📦 Features

- ✨ Sticky Cards Animation
- 🎨 Wildyriftian Effects
- ⏳ Global Preloader
- 🎵 Audio Player with Visualizer
- 🎯 Feature-Sliced Design Architecture
- 📱 Fully Responsive
- ⚡ Performance Optimized
- 📝 Easy Content Management via JSON
- 🖼️ Simple Image Replacement System

## 🏗️ Architecture

This project follows Feature-Sliced Design principles:

- **app/** - Next.js routing and layouts
- **shared/** - Reusable utilities and components
- **entities/** - Business logic entities
- **features/** - Self-contained feature modules
- **widgets/** - Complex UI compositions

## 🎨 Content Management

This template is designed for **easy customization**:

### Quick Content Update

1. **Replace images** in `public/img/catalog-X/`
   - 3 preview images (800x1200px) for Wildyriftian effect
   - 4 card images (1200x800px) for catalog pages

2. **Edit text** in `content/catalogs.json`
   - Change titles, descriptions, colors
   - Update SEO metadata
   - Customize audio tracks

3. **Restart** dev server → Done! 🎉

**Full Guide:** [docs/QUICK_START.md](docs/QUICK_START.md)
**Detailed Docs:** [docs/CONTENT_MANAGEMENT.md](docs/CONTENT_MANAGEMENT.md)

---

## 🎯 Perfect For

- 📸 **Photographers** - showcase your portfolio
- 🎨 **Artists & Designers** - present your work
- 💻 **Developers** - highlight your projects
- 🏢 **Agencies** - demonstrate case studies
- 🎓 **Students** - build impressive portfolio

---

## 📝 License

Private Project
