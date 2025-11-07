# Starlight Portfolio

Modern portfolio website built with Next.js 15, React 19, and TypeScript.

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

## 🏗️ Architecture

This project follows Feature-Sliced Design principles:

- **app/** - Next.js routing and layouts
- **shared/** - Reusable utilities and components
- **entities/** - Business logic entities
- **features/** - Self-contained feature modules
- **widgets/** - Complex UI compositions

## 📝 License

Private Project
