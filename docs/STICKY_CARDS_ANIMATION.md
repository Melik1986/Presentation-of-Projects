# GSAP Sticky Cards Animation - Экспертный Анализ

## 🎯 Обзор

Sticky Cards — продвинутая scroll-driven анимация на основе GSAP ScrollTrigger, создающая эффект "прилипания" карточек с плавными трансформациями scale и rotation.

---

## 📊 Архитектура Анимации

### Основные компоненты

```
useStickyCardsAnimation (Hook)
    ↓
useGSAP (React wrapper)
    ↓
ScrollTrigger.create() × N (по 2 на каждую карточку, кроме последней)
    ↓
    ├── ScrollTrigger #1: PIN (фиксация карточки)
    │   └── pin: true, pinSpacing: false
    │
    └── ScrollTrigger #2: TRANSFORM (анимация scale + rotation)
        └── onUpdate: gsap.set(scale, rotation, opacity)
```

---

## 🔬 Детальный Разбор Кода

### 1. Hook: `useStickyCardsAnimation`

```13:53:src/features/sticky-cards/model/hooks/useStickyCardsAnimation.ts
export function useStickyCardsAnimation(containerRef: RefObject<HTMLDivElement | null>) {
  useGSAP(
    () => {
      const stickyCards = gsap.utils.toArray<HTMLElement>('.sticky-card');

      stickyCards.forEach((card, index) => {
        const isLastCard = index === stickyCards.length - 1;

        if (!isLastCard) {
          ScrollTrigger.create({
            trigger: card,
            start: 'top top',
            endTrigger: stickyCards[stickyCards.length - 1],
            end: 'top top',
            pin: true,
            pinSpacing: false,
          });

          ScrollTrigger.create({
            trigger: stickyCards[index + 1],
            start: 'top bottom',
            end: 'top top',
            onUpdate: (self) => {
              const progress = self.progress;
              const scale = 1 - progress * 0.25;
              const rotation = (index % 2 === 0 ? 5 : -5) * progress;
              const afterOpacity = progress;

              gsap.set(card, {
                scale,
                rotation,
                '--after-opacity': afterOpacity,
              });
            },
          });
        }
      });
    },
    { scope: containerRef }
  );
}
```

---

## 🎨 Механика Анимации

### Фаза 1: PIN (Фиксация)

**Первый ScrollTrigger для каждой карточки (кроме последней):**

```typescript
ScrollTrigger.create({
  trigger: card, // Элемент, который активирует триггер
  start: 'top top', // Когда верх карточки достигает верха viewport
  endTrigger: stickyCards[stickyCards.length - 1], // Последняя карточка
  end: 'top top', // Когда верх последней карточки достигает верха
  pin: true, // ФИКСИРОВАТЬ карточку
  pinSpacing: false, // НЕ добавлять padding
});
```

**Что происходит:**

- Карточка **"прилипает"** к верху экрана
- Остальной контент прокручивается **под ней**
- `pinSpacing: false` отключает добавление padding/margin (критично для эффекта наложения)
- Карточка остаётся зафиксированной до момента, пока **последняя** карточка не достигнет верха

### Фаза 2: TRANSFORM (Анимация)

**Второй ScrollTrigger для каждой карточки:**

```typescript
ScrollTrigger.create({
  trigger: stickyCards[index + 1], // СЛЕДУЮЩАЯ карточка
  start: 'top bottom', // Когда следующая появляется снизу
  end: 'top top', // Когда следующая достигает верха
  onUpdate: (self) => {
    const progress = self.progress; // 0 → 1

    // 1. SCALE: Уменьшение от 1.0 до 0.75
    const scale = 1 - progress * 0.25;

    // 2. ROTATION: Чередование ±5°
    const rotation = (index % 2 === 0 ? 5 : -5) * progress;

    // 3. OVERLAY: Затемнение от 0 до 1
    const afterOpacity = progress;

    gsap.set(card, {
      scale,
      rotation,
      '--after-opacity': afterOpacity,
    });
  },
});
```

**Математика анимации:**

| Progress | Scale | Rotation (четная) | Rotation (нечетная) | Overlay Opacity |
| -------- | ----- | ----------------- | ------------------- | --------------- |
| 0.0      | 1.00  | 0°                | 0°                  | 0.0             |
| 0.25     | 0.94  | 1.25°             | -1.25°              | 0.25            |
| 0.5      | 0.875 | 2.5°              | -2.5°               | 0.5             |
| 0.75     | 0.81  | 3.75°             | -3.75°              | 0.75            |
| 1.0      | 0.75  | 5°                | -5°                 | 1.0             |

---

## 🧩 Ключевые Концепции GSAP

### 1. `gsap.utils.toArray()`

```typescript
const stickyCards = gsap.utils.toArray<HTMLElement>('.sticky-card');
```

**Зачем:**

- Превращает NodeList в массив
- Кроссбраузерная совместимость
- TypeScript типизация

### 2. `pin: true`

**Официальная документация GSAP:**

> An element (or selector text for the element) that should be pinned during the time that the ScrollTrigger is active, meaning it will appear to "stick" in its starting position while the rest of the content continues scrolling underneath it.

**В нашем случае:**

- Карточка фиксируется методом `position: fixed` (для body) или `transform` (для вложенных скроллов)
- Остальной контент прокручивается **под** закрепленным элементом

### 3. `pinSpacing: false`

**Официальная документация GSAP:**

> By default, padding will be added to the bottom (or right for horizontal: true) to push other elements down so that when the pinned element gets unpinned, the following content catches up perfectly. Setting pinSpacing: false tells ScrollTrigger NOT to add any padding.

**Почему false в sticky cards:**

- Нам нужно, чтобы следующая карточка **накладывалась** на предыдущую
- Padding создал бы зазор между карточками
- `false` даёт эффект **стэка карточек**

### 4. `start` и `end` синтаксис

**Формат:** `"[trigger-position] [scroller-position]"`

```typescript
start: 'top top'; // Когда верх trigger достигает верха scroller
end: 'top bottom'; // Когда верх trigger достигает низа scroller
```

**Возможные значения:**

- Keywords: `"top"`, `"center"`, `"bottom"` (вертикаль), `"left"`, `"right"` (горизонталь)
- Проценты: `"80%"` (от высоты элемента)
- Пиксели: `"100px"` (от верха/лева)
- Относительные: `"+=300"` (300px после start)

### 5. `onUpdate` callback

**Официальная документация:**

> A callback that gets called every time the progress of the ScrollTrigger changes (meaning the scroll position changed).

**Параметр `self`:**

```typescript
onUpdate: (self) => {
  self.progress; // 0 → 1 (прогресс между start и end)
  self.direction; // 1 (вниз) или -1 (вверх)
  self.isActive; // true если между start и end
  self.getVelocity(); // Скорость скролла (px/s)
};
```

### 6. `endTrigger`

```typescript
endTrigger: stickyCards[stickyCards.length - 1],
```

**Зачем:**

- Позволяет использовать **другой элемент** для определения `end` позиции
- В нашем случае: pin держится до момента, когда **последняя карточка** достигает верха
- Без этого карточка распинилась бы сразу после своего `end`

---

## 🎭 CSS Integration

### Overlay эффект через CSS переменную

```css
.stickyCard::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: var(--after-opacity, 0); /* ← Управляется через GSAP */
  transition: opacity 0.1s ease;
  pointer-events: none;
  z-index: 2;
}
```

**Почему так:**

- GSAP устанавливает CSS custom property: `'--after-opacity': afterOpacity`
- CSS реагирует на изменение переменной
- `transition` сглаживает микро-прыжки между фреймами
- Overlay создаёт эффект "погружения" карточки под следующую

### Transform optimizations

```css
.stickyCard {
  will-change: transform; /* ← GPU acceleration */
}
```

**Best practices:**

- `will-change: transform` активирует GPU acceleration
- GSAP автоматически использует `transform3d` для лучшей производительности
- Никогда не анимировать `top`/`left` — только `transform`

---

## 🔄 Lifecycle & Cleanup

### useGSAP Context API

```typescript
useGSAP(
  () => {
    // Создание ScrollTriggers
  },
  { scope: containerRef } // ← КРИТИЧНО для React
);
```

**Что делает `scope`:**

1. **Автоматический cleanup:** ScrollTriggers убиваются при unmount
2. **Изоляция:** GSAP видит только элементы внутри `containerRef`
3. **Реакт-безопасность:** Предотвращает memory leaks

**Без scope:**

```typescript
// ❌ BAD - Memory leak!
useEffect(() => {
  const st = ScrollTrigger.create({...});
  return () => st.kill(); // Нужно вручную убивать
}, []);
```

**Со scope:**

```typescript
// ✅ GOOD - Auto cleanup
useGSAP(() => {
  ScrollTrigger.create({...});
}, { scope: containerRef });
```

---

## ⚡ Performance Optimization

### 1. `gsap.set()` vs `gsap.to()`

```typescript
// ✅ Наш код
gsap.set(card, { scale, rotation });

// ❌ Альтернатива (медленнее)
gsap.to(card, { scale, rotation, duration: 0 });
```

**Почему `set`:**

- Моментальное применение без tweening engine
- Меньше overhead на каждый scroll tick
- 60+ FPS даже на слабых устройствах

### 2. CSS переменные для overlay

```typescript
'--after-opacity': afterOpacity,  // ← Быстрее, чем прямая манипуляция DOM
```

**Почему:**

- Браузер оптимизирует custom properties
- Не триггерит reflow (только repaint)
- Меньше JS → CSS bridge overhead

### 3. `will-change: transform`

```css
.stickyCard {
  will-change: transform;
}
```

**Эффект:**

- Создаёт новый **compositor layer**
- GPU ускорение для `transform` и `opacity`
- Smooth 60 FPS анимация

---

## 🎯 Trigger Timeline

**Визуализация для 4 карточек:**

```
Scroll Position    Card 1       Card 2       Card 3       Card 4
-----------------------------------------------------------------
0vh                [visible]    [below]      [below]      [below]

↓ Scroll...

100vh              [PINNED]     [visible]    [below]      [below]
                   ↑ scale: 1.0

↓ Scroll...

150vh              [PINNED]     [rising]     [below]      [below]
                   ↑ scale: 0.875, rotation: 2.5°, overlay: 0.5

↓ Scroll...

200vh              [PINNED]     [PINNED]     [visible]    [below]
                   ↑ scale: 0.75 ↑ scale: 1.0
                   rotation: 5°
                   overlay: 1.0

↓ Scroll...

300vh              [PINNED]     [PINNED]     [rising]     [below]
                   ↑ small      ↑ shrinking

↓ Scroll...

400vh              [PINNED]     [PINNED]     [PINNED]     [rising]
                   ↑ smallest   ↑ small      ↑ scale: 1.0

↓ Scroll...

500vh              [UNPINNED]   [UNPINNED]   [UNPINNED]   [VISIBLE]
                   (все открепляются, когда Card 4 достигает верха)
```

---

## 🧪 Debugging Tips

### 1. Visualize ScrollTrigger markers

```typescript
ScrollTrigger.create({
  // ... config
  markers: true, // ← Показать debug markers
});
```

**Результат:**

- Зелёная линия: `start` позиция
- Красная линия: `end` позиция
- Фиолетовая область: `trigger` элемент
- Синяя область: `scroller` viewport

### 2. Log progress

```typescript
onUpdate: (self) => {
  console.log('Progress:', self.progress.toFixed(2));
  console.log('Direction:', self.direction === 1 ? '↓' : '↑');
};
```

### 3. Disable pin temporarily

```typescript
pin: false,  // ← Отключить для теста scroll flow
```

---

## 🔧 Customization Guide

### Изменить интенсивность scale

```typescript
// Оригинал: 1.0 → 0.75 (уменьшение на 25%)
const scale = 1 - progress * 0.25;

// Сильнее: 1.0 → 0.5 (уменьшение на 50%)
const scale = 1 - progress * 0.5;

// Слабее: 1.0 → 0.9 (уменьшение на 10%)
const scale = 1 - progress * 0.1;
```

### Изменить rotation angle

```typescript
// Оригинал: ±5°
const rotation = (index % 2 === 0 ? 5 : -5) * progress;

// Сильнее: ±10°
const rotation = (index % 2 === 0 ? 10 : -10) * progress;

// Без rotation
const rotation = 0;
```

### Изменить overlay интенсивность

```typescript
// Оригинал: 0 → 1.0 (полное затемнение)
const afterOpacity = progress;

// Слабее: 0 → 0.5 (половинное)
const afterOpacity = progress * 0.5;

// Без overlay
const afterOpacity = 0;
```

### Добавить blur эффект

```typescript
const blur = progress * 10; // 0px → 10px

gsap.set(card, {
  scale,
  rotation,
  filter: `blur(${blur}px)`,
  '--after-opacity': afterOpacity,
});
```

### Изменить направление rotation (все в одну сторону)

```typescript
// Оригинал: чередование
const rotation = (index % 2 === 0 ? 5 : -5) * progress;

// Все вправо
const rotation = 5 * progress;

// Все влево
const rotation = -5 * progress;
```

---

## 🚨 Common Pitfalls

### ❌ Анимировать pinned элемент

```typescript
// BAD - сломает measurements
gsap.to(card, {
  x: 100,
  scrollTrigger: {
    /* ... */
  },
});
```

**Fix:** Анимировать **вложенные** элементы:

```typescript
// ✅ GOOD
gsap.to(card.querySelector('.inner'), {
  x: 100,
});
```

### ❌ Забыть про cleanup

```typescript
// BAD - memory leak в React
useEffect(() => {
  ScrollTrigger.create({...});
}, []);
```

**Fix:** Использовать `useGSAP` с `scope`:

```typescript
// ✅ GOOD
useGSAP(() => {
  ScrollTrigger.create({...});
}, { scope: containerRef });
```

### ❌ Смешивать CSS transforms с GSAP

```css
/* BAD - конфликт с GSAP */
.stickyCard {
  transform: translateY(20px);
}
```

**Fix:** Применять transforms только через GSAP.

---

## 📚 Resources

- [GSAP ScrollTrigger Docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [GSAP React Guide](https://gsap.com/resources/React/)
- [useGSAP Hook](https://gsap.com/docs/v3/React/tools/useGSAP/)
- [ScrollTrigger Tutorial](https://www.creativecodingclub.com/courses/scrolltrigger-express)

---

**Автор:** Starlight Development Team  
**Последнее обновление:** Ноябрь 2024  
**Версия GSAP:** 3.12+  
**React:** 19.x
