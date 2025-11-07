# Source Directory Structure

This project follows **Feature-Sliced Design (FSD)** architecture.

## 📁 Layer Structure

```
src/
├── app/          # 🔷 Next.js App Router (routing, layouts, pages)
├── widgets/      # 🟦 Complex UI compositions from features
├── features/     # 🟩 Business features (user scenarios)
├── entities/     # 🟨 Business entities
└── shared/       # 🟥 Reusable code (ui, lib, api, config)
```

## 🎯 Dependency Rules

Dependencies flow **downwards only**:

```
app → widgets → features → entities → shared
```

**✅ Allowed:**
- `features/preloader` can import from `shared/ui`
- `app/layout.tsx` can import from `features/preloader`

**❌ Forbidden:**
- `shared` cannot import from `features`
- `entities` cannot import from `features`
- Circular dependencies between same-level modules

## 📦 Layer Descriptions

### `app/` - Application Layer
- Next.js routing (`page.tsx`, `layout.tsx`)
- Global providers and wrappers
- Route-specific logic

### `widgets/` - Widget Layer
- Complex compositions from multiple features
- Page sections
- Interconnected feature groups

### `features/` - Feature Layer
- Self-contained business features
- User interaction scenarios
- Each feature has: `ui/`, `model/`, `index.ts`

### `entities/` - Entity Layer
- Business domain models
- Core business logic
- Data structures

### `shared/` - Shared Layer
- Reusable utilities (`lib/`)
- UI components (`ui/`)
- API clients (`api/`)
- Configurations (`config/`)
- Type definitions (`types/`)

## 🔗 Public API Pattern

Each feature exports through `index.ts`:

```typescript
// features/preloader/index.ts
export { GlobalPreloader } from './ui/GlobalPreloader';
export { useLoaderAnimation } from './model/useLoaderAnimation';
export type { PreloaderProps } from './model/types';
```

Import usage:

```typescript
// ✅ Good
import { GlobalPreloader } from '@/features/preloader';

// ❌ Bad
import { GlobalPreloader } from '@/features/preloader/ui/GlobalPreloader';
```

## 📖 Learn More

- [Feature-Sliced Design](https://feature-sliced.design/)
- [Next.js App Router](https://nextjs.org/docs/app)

