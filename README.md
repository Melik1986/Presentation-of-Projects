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

## 🎯 Quick Start for Your Portfolio

This template is ready to showcase your work! Follow these steps:

### 1. Choose Your Category

The template includes 6 pre-configured categories:

- **Web Development** - E-commerce, SaaS, Websites, Landing Pages
- **UI/UX Design** - Mobile Apps, Redesigns, Design Systems, Branding
- **Photography** - Portraits, Products, Landscapes, Events
- **3D Art & Animation** - Characters, Products, Environments, Motion Graphics
- **Mobile Apps** - iOS, Android, Cross-Platform, Prototypes
- **Video Production** - Commercials, Music Videos, Documentaries, YouTube

### 2. Replace Images

Navigate to `public/img/catalog-X/` and replace placeholder images with your work:

- `preview-1.png`, `preview-2.png`, `preview-3.png` (800x1200px) - for main page folders
- `card-1.png`, `card-2.png`, `card-3.png`, `card-4.png` (1200x800px) - for catalog pages

### 3. Update Content

Edit `content/catalogs.json`:

- Replace `"Your Name Here"` with your name in homepage section
- Update project titles and descriptions for each card
- Customize colors in `theme` section (optional)
- Add your own audio tracks (optional, or set to `null`)

### 4. Deploy

```bash
# Build for production
bun run build

# Deploy to Vercel (recommended)
vercel deploy
```

**That's it!** Your portfolio is ready to impress! 🎉

**Full Guide:** [docs/CONTENT_MANAGEMENT.md](docs/CONTENT_MANAGEMENT.md)

---

## 🎯 Perfect For

- 📸 **Photographers** - showcase your portfolio
- 🎨 **UI/UX Designers** - present your design work
- 💻 **Web Developers** - highlight your projects
- 🎭 **3D Artists** - display your 3D work and animations
- 📱 **Mobile Developers** - showcase your apps
- 🎬 **Video Producers** - present your video projects
- 🏢 **Agencies** - demonstrate case studies
- 🎓 **Students** - build impressive portfolio

---

## 📝 License

Private Project
