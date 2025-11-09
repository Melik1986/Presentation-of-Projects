# Анализ оптимизации DOM-манипуляций и управления памятью

## Компонент 1: `useStarlightAudio.tsx` (строки 112-142)

### Текущая реализация

**Файл:** `src/features/audio/model/hooks/useStarlightAudio.tsx`  
**Строки:** 112-142

**Проблема:**
- Три отдельных `addEventListener` на `document` для разных событий
- Ручное удаление каждого слушателя в cleanup
- Нет группового управления слушателями через `AbortController`

**Код:**
```typescript
useEffect(() => {
  if (!isReady) {
    return undefined;
  }

  let isResumed = false;

  const handleUserGesture = async () => {
    if (isResumed) {
      return;
    }

    isResumed = true;
    await AudioDirector.resumeContextOnUserGesture();
    syncSnapshotsRef.current();

    document.removeEventListener('click', handleUserGesture);
    document.removeEventListener('touchstart', handleUserGesture);
    document.removeEventListener('keydown', handleUserGesture);
  };

  document.addEventListener('click', handleUserGesture, { once: true });
  document.addEventListener('touchstart', handleUserGesture, { once: true });
  document.addEventListener('keydown', handleUserGesture, { once: true });

  return () => {
    document.removeEventListener('click', handleUserGesture);
    document.removeEventListener('touchstart', handleUserGesture);
    document.removeEventListener('keydown', handleUserGesture);
  };
}, [isReady]);
```

### Предлагаемое улучшение

**Статус:** ⚠️ Можно улучшить

**Решение:** Использовать `AbortController` для группового управления слушателями событий

**Код после:**
```typescript
useEffect(() => {
  if (!isReady) {
    return undefined;
  }

  let isResumed = false;
  const abortController = new AbortController();
  const { signal } = abortController;

  const handleUserGesture = async () => {
    if (isResumed || signal.aborted) {
      return;
    }

    isResumed = true;
    await AudioDirector.resumeContextOnUserGesture();
    syncSnapshotsRef.current();

    // Автоматически удалятся через AbortController
    abortController.abort();
  };

  // Все слушатели используют один signal для группового управления
  document.addEventListener('click', handleUserGesture, { 
    once: true, 
    signal 
  });
  document.addEventListener('touchstart', handleUserGesture, { 
    once: true, 
    signal 
  });
  document.addEventListener('keydown', handleUserGesture, { 
    once: true, 
    signal 
  });

  return () => {
    // Один вызов abort() удалит все слушатели автоматически
    abortController.abort();
  };
}, [isReady]);
```

### Преимущества

1. **Групповое управление:** Один `abort()` удаляет все слушатели сразу
2. **Меньше кода:** Не нужно вручную удалять каждый слушатель
3. **Безопасность:** `signal.aborted` проверка предотвращает выполнение после размонтирования
4. **Меньше утечек памяти:** Гарантированное удаление всех слушателей при размонтировании
5. **Производительность:** Меньше операций удаления, лучше для GC

### Эффект

- ✅ Снижение утечек памяти
- ✅ Упрощение кода (меньше ручного управления)
- ✅ Лучшая производительность (меньше операций DOM)
- ✅ Более надежное управление жизненным циклом

---

## Компонент 2: `useMobileTouchHandlers.ts` (строки 36-86)

### Текущая реализация

**Файл:** `src/features/effects/model/hooks/useMobileTouchHandlers.ts`  
**Строки:** 36-86

**Проблема:**
- Один слушатель на контейнере, но можно использовать `AbortController` для консистентности
- Используется `passive: false` для `preventDefault` - это правильно

**Код:**
```typescript
useEffect(() => {
  const container = containerRef.current;
  if (!container) {
    return;
  }

  // ... проверки ...

  const handleTouchStart = (e: TouchEvent) => {
    // ... логика ...
    e.preventDefault();
    onActivateRef.current(catalogId);
  };

  container.addEventListener('touchstart', handleTouchStart, { passive: false });

  return () => {
    container.removeEventListener('touchstart', handleTouchStart);
  };
}, [containerRef]);
```

### Предлагаемое улучшение

**Статус:** ⚠️ Можно улучшить (для консистентности и будущей расширяемости)

**Решение:** Использовать `AbortController` даже для одного слушателя (лучшая практика)

**Код после:**
```typescript
useEffect(() => {
  const container = containerRef.current;
  if (!container) {
    return;
  }

  // Proper touch detection (Web standards)
  const hasHoverSupport = supportsHover();
  const isPointerCoarse = window.matchMedia('(pointer: coarse)').matches;

  // Only setup touch handlers on actual touch devices
  if (hasHoverSupport && !isPointerCoarse) {
    return; // Desktop with hover, skip
  }

  const abortController = new AbortController();
  const { signal } = abortController;

  const handleTouchStart = (e: TouchEvent) => {
    if (signal.aborted) return;

    const target = e.target as HTMLElement;
    const folder = target.closest('.folder') as HTMLAnchorElement;

    if (!folder) {
      return;
    }

    const href = folder.getAttribute('href');
    if (!href) {
      return;
    }

    const catalogId = href.split('/').pop();
    if (!catalogId) {
      return;
    }

    // If already active, allow navigation
    if (activeFolderRef.current === catalogId) {
      return;
    }

    // First touch: prevent navigation, activate folder
    e.preventDefault();
    onActivateRef.current(catalogId);
  };

  container.addEventListener('touchstart', handleTouchStart, { 
    passive: false,
    signal 
  });

  return () => {
    abortController.abort();
  };
}, [containerRef]);
```

### Преимущества

1. **Консистентность:** Единый подход к управлению слушателями во всем проекте
2. **Безопасность:** Проверка `signal.aborted` предотвращает выполнение после размонтирования
3. **Расширяемость:** Легко добавить больше слушателей с тем же `signal`
4. **Надежность:** Гарантированное удаление слушателя

### Эффект

- ✅ Консистентный код
- ✅ Защита от утечек памяти
- ✅ Готовность к расширению

---

## Компонент 3: `useOutsideClick.ts` (строки 36-49)

### Текущая реализация

**Файл:** `src/features/effects/model/hooks/useOutsideClick.ts`  
**Строки:** 36-49

**Проблема:**
- Один слушатель, но можно использовать `AbortController` для консистентности

**Код:**
```typescript
useEffect(() => {
  const container = containerRef.current;
  if (!container) {
    return;
  }
  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.folder') && isActiveRef.current) {
      onOutsideClickRef.current();
    }
  };
  container.addEventListener('click', handleClick);
  return () => container.removeEventListener('click', handleClick);
}, [containerRef]);
```

### Предлагаемое улучшение

**Статус:** ⚠️ Можно улучшить

**Решение:** Использовать `AbortController`

**Код после:**
```typescript
useEffect(() => {
  const container = containerRef.current;
  if (!container) {
    return;
  }

  const abortController = new AbortController();
  const { signal } = abortController;

  const handleClick = (e: MouseEvent) => {
    if (signal.aborted) return;

    const target = e.target as HTMLElement;
    if (!target.closest('.folder') && isActiveRef.current) {
      onOutsideClickRef.current();
    }
  };

  container.addEventListener('click', handleClick, { signal });

  return () => {
    abortController.abort();
  };
}, [containerRef]);
```

### Преимущества

1. **Консистентность:** Единый подход
2. **Безопасность:** Проверка `signal.aborted`
3. **Надежность:** Гарантированное удаление

---

## Компонент 4: `AudioDirector.ts` (строки 51, 63, 221-231)

### Текущая реализация

**Файл:** `src/features/audio/model/AudioDirector.ts`  
**Строки:** 51, 63, 221-231

**Проблемы:**
1. `addEventListener` на `document` без `AbortController`
2. `appendChild` создает элементы, но не удаляет их при dispose (потенциальная утечка)
3. Использование `getElementById` + `createElement` + `appendChild` вместо скрытия существующих элементов

**Код:**
```typescript
// В конструкторе
document.addEventListener('visibilitychange', this.handleVisibilityChange, false);

// В dispose
document.removeEventListener('visibilitychange', this.handleVisibilityChange, false);

// createHiddenContainer
private createHiddenContainer(id: string): string {
  const containerId = `audio-player-${id}`;
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.cssText =
      'position:fixed;top:-9999px;left:-9999px;width:0;height:0;opacity:0;pointer-events:none;overflow:hidden;';
    document.body.appendChild(container);
  }

  return containerId;
}
```

### Предлагаемое улучшение

**Статус:** ⚠️ Можно улучшить

**Решение:**
1. Использовать `AbortController` для слушателя `visibilitychange`
2. Сохранять ссылки на созданные контейнеры и удалять их в `dispose`
3. Использовать скрытие вместо создания/удаления (если возможно)

**Код после:**
```typescript
class AudioDirector {
  private visibilityAbortController: AbortController | null = null;
  private createdContainers = new Set<HTMLElement>(); // Отслеживание созданных контейнеров

  constructor() {
    this.isBrowser = typeof window !== 'undefined';

    if (this.isBrowser) {
      this.loadSettings();
      
      // Использование AbortController для управления слушателем
      this.visibilityAbortController = new AbortController();
      document.addEventListener(
        'visibilitychange', 
        this.handleVisibilityChange, 
        { 
          signal: this.visibilityAbortController.signal 
        }
      );
    }
  }

  dispose(): void {
    if (!this.isBrowser) {
      return;
    }

    // Автоматическое удаление слушателя через AbortController
    if (this.visibilityAbortController) {
      this.visibilityAbortController.abort();
      this.visibilityAbortController = null;
    }

    // Удаление всех созданных контейнеров
    this.createdContainers.forEach((container) => {
      try {
        container.remove();
      } catch (error) {
        logger.warn('Failed to remove container:', error);
      }
    });
    this.createdContainers.clear();

    this.tracks.forEach((track) => {
      this.detachTrack(track);
    });
    this.tracks.clear();

    void this.context?.close?.();
    this.context = null;
    this.masterGain = null;
    this.analyser = null;
  }

  private createHiddenContainer(id: string): string {
    const containerId = `audio-player-${id}`;
    let container = document.getElementById(containerId) as HTMLElement | null;

    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.style.cssText =
        'position:fixed;top:-9999px;left:-9999px;width:0;height:0;opacity:0;pointer-events:none;overflow:hidden;';
      document.body.appendChild(container);
      
      // Сохраняем ссылку для последующего удаления
      this.createdContainers.add(container);
    }

    return containerId;
  }
}
```

### Преимущества

1. **Устранение утечек:** Все созданные контейнеры удаляются при dispose
2. **Групповое управление:** AbortController для слушателя
3. **Отслеживание:** Set для хранения ссылок на созданные элементы
4. **Надежность:** Гарантированная очистка ресурсов

### Эффект

- ✅ Устранение утечек памяти (контейнеры удаляются)
- ✅ Лучшее управление жизненным циклом
- ✅ Меньше нагрузки на GC

---

## Компонент 5: `useWildyriftianAnimation.ts` (строки 36, 47, 110-111, 116)

### Текущая реализация

**Файл:** `src/features/effects/model/hooks/useWildyriftianAnimation.ts`  
**Строки:** 36, 47, 110-111, 116

**Проблемы:**
1. `addEventListener` на `document` без `AbortController`
2. Множественные `addEventListener` на каждый folder (mouseenter/mouseleave) - можно использовать делегирование событий
3. Использование `querySelectorAll` внутри цикла (можно оптимизировать)

**Код:**
```typescript
document.addEventListener(PRELOADER_COMPLETE_EVENT, revealFolders, { once: true });

// ...

folders.forEach((folder, index) => {
  // ...
  folder.addEventListener('mouseenter', handleEnter);
  folder.addEventListener('mouseleave', handleLeave);
});

// Cleanup
return () => {
  document.removeEventListener(PRELOADER_COMPLETE_EVENT, revealFolders);
};
```

### Предлагаемое улучшение

**Статус:** ⚠️ Можно улучшить

**Решение:**
1. Использовать `AbortController` для слушателя на document
2. Использовать делегирование событий вместо слушателей на каждом folder
3. Сохранять ссылки на слушатели для cleanup

**Код после:**
```typescript
export function useWildyriftianAnimation(containerRef: RefObject<HTMLDivElement | null>): void {
  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const folders = gsap.utils.toArray<HTMLElement>('.folder');
      const wrappers = gsap.utils.toArray<HTMLElement>('.folder-wrapper');

      const abortController = new AbortController();
      const { signal } = abortController;

      // Initial reveal: folders slide up from bottom
      const revealFolders = () => {
        if (signal.aborted) return;
        gsap.from(folders, {
          y: 100,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.15,
          delay: 1.5,
        });
      };

      document.addEventListener(PRELOADER_COMPLETE_EVENT, revealFolders, { 
        once: true,
        signal 
      });

      const hasHoverSupport = supportsHover();
      const isPointerCoarse = window.matchMedia('(pointer: coarse)').matches;

      if (!hasHoverSupport || isPointerCoarse) {
        return () => {
          abortController.abort();
        };
      }

      gsap.set(wrappers, { y: 25 });

      // Создаем Map для хранения таймлайнов и обработчиков
      const folderTimelines = new WeakMap<HTMLElement, gsap.core.Timeline>();
      const folderHandlers = new WeakMap<HTMLElement, { enter: () => void; leave: () => void }>();

      folders.forEach((folder, index) => {
        const wrapper = wrappers[index];
        const previewImages = gsap.utils.toArray<HTMLElement>(
          folder.querySelectorAll('.folder-preview-img')
        );

        if (!wrapper) return;

        const tl = gsap.timeline({ paused: true });
        tl.to(wrapper, {
          y: -3.75,
          duration: 0.4,
          ease: 'back.out(1.5)',
        }, 0);

        tl.to(previewImages, {
          y: '-125%',
          scale: 1.18,
          rotation: (i) => getPreviewRotation(i),
          duration: 0.55,
          ease: 'back.out(1.7)',
          stagger: {
            amount: -0.2,
            from: 'center',
            ease: 'power2.inOut',
          },
        }, 0.1);

        const handleEnter = () => {
          folders.forEach((f) => {
            if (f !== folder) {
              f.classList.add('disabled');
            }
          });
          tl.play();
        };

        const handleLeave = () => {
          folders.forEach((f) => f.classList.remove('disabled'));
          tl.reverse();
        };

        folderTimelines.set(folder, tl);
        folderHandlers.set(folder, { enter: handleEnter, leave: handleLeave });

        // Добавляем слушатели с signal
        folder.addEventListener('mouseenter', handleEnter, { signal });
        folder.addEventListener('mouseleave', handleLeave, { signal });
      });

      return () => {
        abortController.abort();
      };
    },
    {
      scope: containerRef,
      dependencies: [],
    }
  );
}
```

### Преимущества

1. **Групповое управление:** Один `AbortController` для всех слушателей
2. **WeakMap:** Автоматическая очистка при удалении элементов из DOM
3. **Безопасность:** Проверка `signal.aborted`
4. **Меньше утечек:** Гарантированное удаление всех слушателей

### Эффект

- ✅ Устранение утечек памяти
- ✅ Использование WeakMap для автоматической очистки
- ✅ Лучшая производительность (групповое управление)

---

## Компонент 6: `useMobileGsapAnimation.ts` (строки 44, 48, 103, 106)

### Текущая реализация

**Файл:** `src/features/effects/model/hooks/useMobileGsapAnimation.ts`  
**Строки:** 44, 48, 103, 106

**Проблема:**
- Множественные вызовы `document.querySelector` для поиска одного и того же элемента
- Можно использовать кэширование через `WeakMap`

**Код:**
```typescript
// В animatePreviewShow
let folder = document.querySelector(`[href="/sticky/${folderId}"]`);
if (!folder) {
  folder = document.querySelector(`.folder[data-catalog="${folderId}"]`);
}

// В animatePreviewHide - повторяется та же логика
let folder = document.querySelector(`[href="/sticky/${folderId}"]`);
if (!folder) {
  folder = document.querySelector(`.folder[data-catalog="${folderId}"]`);
}
```

### Предлагаемое улучшение

**Статус:** ⚠️ Можно улучшить

**Решение:** Использовать `WeakMap` для кэширования найденных элементов

**Код после:**
```typescript
export function useMobileGsapAnimation() {
  const currentAnimationRef = useRef<gsap.core.Tween | null>(null);
  const initializedRef = useRef(false);
  
  // WeakMap для кэширования найденных элементов (автоматическая очистка при удалении из DOM)
  const folderCache = new WeakMap<string, HTMLElement>();

  const findFolder = useCallback((folderId: string): HTMLElement | null => {
    // Проверяем кэш
    const cached = folderCache.get(folderId);
    if (cached && document.contains(cached)) {
      return cached;
    }

    // Ищем элемент
    let folder = document.querySelector<HTMLElement>(`[href="/sticky/${folderId}"]`);
    
    if (!folder) {
      folder = document.querySelector<HTMLElement>(`.folder[data-catalog="${folderId}"]`);
    }

    // Сохраняем в кэш если нашли
    if (folder) {
      folderCache.set(folderId, folder);
    }

    return folder;
  }, []);

  const animatePreviewShow = useCallback(
    (folderId: string) => {
      initializePreviewState();

      if (currentAnimationRef.current) {
        currentAnimationRef.current.kill();
      }

      const folder = findFolder(folderId);
      if (!folder) {
        logger.warn('Folder not found', { folderId });
        return;
      }

      // ... остальной код ...
    },
    [initializePreviewState, findFolder]
  );

  const animatePreviewHide = useCallback((folderId: string) => {
    if (currentAnimationRef.current) {
      currentAnimationRef.current.kill();
    }

    const folder = findFolder(folderId);
    if (!folder) {
      logger.warn('Folder not found for hide animation', { folderId });
      return;
    }

    // ... остальной код ...
  }, [findFolder]);
}
```

### Преимущества

1. **Кэширование:** Меньше вызовов `querySelector`
2. **WeakMap:** Автоматическая очистка при удалении элемента из DOM
3. **Производительность:** Быстрее поиск элементов
4. **Проверка:** `document.contains()` для валидации кэша

### Эффект

- ✅ Меньше операций DOM (кэширование)
- ✅ Лучшая производительность
- ✅ Автоматическая очистка через WeakMap

---

## Компонент 7: `GlobalPreloader.tsx` (строки 120-122)

### Текущая реализация

**Файл:** `src/features/preloader/ui/GlobalPreloader.tsx`  
**Строки:** 120-122

**Проблема:**
- `addEventListener` на `document` без `AbortController`

**Код:**
```typescript
document.addEventListener(PRELOADER_COMPLETE_EVENT, handleComplete, {
  once: true,
});

return () => {
  cleanupCompleteListener();
  clearTimeout(fallbackTimer);
};
```

### Предлагаемое улучшение

**Статус:** ⚠️ Можно улучшить

**Решение:** Использовать `AbortController`

**Код после:**
```typescript
useEffect(() => {
  // ... существующий код ...

  const abortController = new AbortController();
  const { signal } = abortController;

  document.addEventListener(PRELOADER_COMPLETE_EVENT, handleComplete, {
    once: true,
    signal,
  });

  const fallbackTimer = setTimeout(handleComplete, FALLBACK_TIMEOUT);

  return () => {
    abortController.abort();
    clearTimeout(fallbackTimer);
  };
}, []);
```

### Преимущества

1. **Групповое управление:** Готовность к добавлению других слушателей
2. **Надежность:** Гарантированное удаление
3. **Консистентность:** Единый подход

---

## Компонент 8: `useLoaderAnimation.ts` (строки 60, 79)

### Текущая реализация

**Файл:** `src/features/preloader/model/hooks/useLoaderAnimation.ts`  
**Строки:** 60, 79

**Проблема:**
- `addEventListener` на элементе без `AbortController`

**Код:**
```typescript
element.addEventListener('animationend', handleAnimationEnd, { once: true });

return () => {
  element.removeEventListener('animationend', handleAnimationEnd);
  if (timerId && typeof window !== 'undefined') {
    window.clearTimeout(timerId);
  }
};
```

### Предлагаемое улучшение

**Статус:** ⚠️ Можно улучшить

**Решение:** Использовать `AbortController`

**Код после:**
```typescript
const setupProgressListeners = (element: Element): (() => void) | undefined => {
  let done = false;
  let timerId: number | null = null;
  const abortController = new AbortController();
  const { signal } = abortController;

  const complete = () => {
    if (done || signal.aborted) {
      return;
    }
    done = true;
    // ... существующий код ...
  };

  const handleAnimationEnd = () => {
    complete();
  };

  element.addEventListener('animationend', handleAnimationEnd, { 
    once: true,
    signal 
  });

  if (typeof window !== 'undefined') {
    const computedStyle = window.getComputedStyle(element);
    // ... существующий код ...
    timerId = window.setTimeout(complete, fallback);
  }

  return () => {
    abortController.abort();
    if (timerId && typeof window !== 'undefined') {
      window.clearTimeout(timerId);
    }
  };
};
```

### Преимущества

1. **Надежность:** Гарантированное удаление
2. **Безопасность:** Проверка `signal.aborted`
3. **Консистентность:** Единый подход

---

## Итоговая таблица

| Компонент | Статус | Приоритет | Эффект |
|-----------|--------|-----------|--------|
| `useStarlightAudio.tsx` | ⚠️ Можно улучшить | Высокий | Групповое управление слушателями |
| `useMobileTouchHandlers.ts` | ⚠️ Можно улучшить | Средний | Консистентность, безопасность |
| `useOutsideClick.ts` | ⚠️ Можно улучшить | Средний | Консистентность |
| `AudioDirector.ts` | ⚠️ Можно улучшить | Высокий | Устранение утечек памяти |
| `useWildyriftianAnimation.ts` | ⚠️ Можно улучшить | Высокий | WeakMap, групповое управление |
| `useMobileGsapAnimation.ts` | ⚠️ Можно улучшить | Средний | Кэширование через WeakMap |
| `GlobalPreloader.tsx` | ⚠️ Можно улучшить | Низкий | Консистентность |
| `useLoaderAnimation.ts` | ⚠️ Можно улучшить | Низкий | Консистентность |

---

## Рекомендации по внедрению

### Приоритет 1 (Критичные)
1. `useStarlightAudio.tsx` - множественные слушатели
2. `AudioDirector.ts` - утечки памяти с контейнерами
3. `useWildyriftianAnimation.ts` - множественные слушатели + WeakMap

### Приоритет 2 (Важные)
4. `useMobileTouchHandlers.ts`
5. `useOutsideClick.ts`
6. `useMobileGsapAnimation.ts`

### Приоритет 3 (Улучшения)
7. `GlobalPreloader.tsx`
8. `useLoaderAnimation.ts`

---

## Общие улучшения

1. **AbortController** - использовать везде для группового управления слушателями
2. **WeakMap** - для кэширования DOM-элементов и связанных данных
3. **Отслеживание созданных элементов** - Set для хранения ссылок на созданные элементы
4. **Проверка signal.aborted** - перед выполнением обработчиков
