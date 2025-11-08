# Logger Usage Guide

**Простой структурированный логгер на основе Pino API**

Рекомендован Next.js: [Production Checklist - Logging](https://nextjs.org/docs/13/pages/building-your-application/deploying/production-checklist#logging)

---

## 🎯 Основные возможности

✅ **Pino-совместимый API** - знакомый интерфейс  
✅ **Автоматическое отключение в production** - безопасность и производительность  
✅ **Child логгеры** - контекстное логирование  
✅ **Структурированные логи** - JSON на сервере, pretty в браузере  
✅ **TypeScript** - полная типизация  
✅ **Zero dependencies** - нет внешних пакетов

---

## 📚 Базовое использование

### Импорт

```typescript
import { logger, createLogger } from '@/shared/lib';
```

### Простое логирование

```typescript
// Разные уровни
logger.trace('detailed trace info');
logger.debug('debug message');
logger.info('informational message');
logger.warn('warning message');
logger.error('error occurred');
logger.fatal('critical error');

// С данными
logger.info('User logged in', { userId: 123, email: 'user@example.com' });
logger.error('API failed', { endpoint: '/api/users', status: 500 });
```

### Pino-стиль (объект + сообщение)

```typescript
// Объект идет первым, сообщение вторым
logger.info({ userId: 123, role: 'admin' }, 'user authenticated');
logger.error({ code: 'E001', retry: 3 }, 'operation failed');
```

### Логирование ошибок

```typescript
try {
  await fetchData();
} catch (error) {
  // Автоматическая обработка Error объектов
  logger.error(error, 'Failed to fetch data');
  // Output: ❌ [timestamp] Failed to fetch data { err: { message: '...', stack: '...' } }
}
```

---

## 👶 Child логгеры (контекст)

**Child логгеры наследуют контекст родителя:**

```typescript
// Создаем базовый логгер для фичи
const audioLogger = logger.child({ module: 'AudioDirector' });

// Все логи будут содержать { module: 'AudioDirector' }
audioLogger.info('Initializing audio system');
audioLogger.error('Failed to load track', { trackId: '123' });

// Вложенные child
const trackLogger = audioLogger.child({ trackId: 'track-456' });
trackLogger.info('Loading track');
// Output содержит: { module: 'AudioDirector', trackId: 'track-456' }
```

**Динамическое обновление контекста:**

```typescript
const requestLogger = logger.child({ requestId: 'req-123' });

// Добавляем данные в процессе
requestLogger.setBindings({ userId: 456, duration: '120ms' });
requestLogger.info('Request completed');
// Output: { requestId: 'req-123', userId: 456, duration: '120ms' }

// Получить текущие bindings
console.log(requestLogger.bindings());
// { requestId: 'req-123', userId: 456, duration: '120ms' }
```

---

## 🎨 Кастомная конфигурация

```typescript
// С базовым контекстом
const apiLogger = createLogger({
  base: { service: 'api', version: '1.0.0' },
});
apiLogger.info('API started'); // Включает service и version

// Минимальный уровень
const prodLogger = createLogger({
  level: 'warn', // Логирует только warn, error, fatal
});

// Принудительное включение
const debugLogger = createLogger({
  enabled: true,
  level: 'trace',
});
```

---

## ⏱️ Измерение производительности

```typescript
logger.time('data-loading');
await loadData();
logger.timeEnd('data-loading');
// Output: data-loading: 1234.567ms
```

---

## 🔄 Миграция с console.log

### До (console.log)

```typescript
console.log('Track loaded:', id, url);
console.error('Failed to load track:', error);
console.warn('Track quality low');
```

### После (logger)

```typescript
logger.info({ trackId: id, url }, 'Track loaded');
logger.error(error, 'Failed to load track');
logger.warn('Track quality low');
```

---

## 🏗️ Реальные примеры из проекта

### AudioDirector

```typescript
// features/audio/model/AudioDirector.ts
import { createLogger } from '@/shared/lib';

const logger = createLogger().child({ module: 'AudioDirector' });

class AudioDirector {
  async loadTrack(id: string, url: string) {
    logger.time(`load-track-${id}`);

    try {
      logger.debug({ trackId: id, url }, 'Loading track');

      const track = await this.fetchTrack(url);

      logger.info({ trackId: id, duration: track.duration }, 'Track loaded successfully');
      return track;
    } catch (error) {
      logger.error(error, 'Failed to load track', { trackId: id, url });
      throw error;
    } finally {
      logger.timeEnd(`load-track-${id}`);
    }
  }

  private handleTrackError(id: string, url: string, error: unknown): void {
    logger.error(
      error instanceof Error ? error : new Error(String(error)),
      'Track preparation failed',
      { trackId: id, url }
    );
  }
}
```

### React Hook

```typescript
// features/effects/model/hooks/useWildyriftianAnimation.ts
import { createLogger } from '@/shared/lib';

const logger = createLogger().child({ hook: 'useWildyriftianAnimation' });

export const useWildyriftianAnimation = () => {
  useEffect(() => {
    logger.debug('Initializing animation');

    try {
      const timeline = gsap.timeline();
      logger.info('Animation created');

      return () => {
        logger.debug('Cleaning up animation');
        timeline.kill();
      };
    } catch (error) {
      logger.error(error, 'Animation setup failed');
    }
  }, []);
};
```

### API Route (Next.js)

```typescript
// app/api/catalogs/route.ts
import { createLogger } from '@/shared/lib';

export async function GET(request: Request) {
  const requestLogger = logger.child({
    path: request.url,
    method: 'GET',
  });

  requestLogger.info('Fetching catalogs');

  try {
    const data = await fetchCatalogs();
    requestLogger.info({ count: data.length }, 'Catalogs fetched');

    return Response.json(data);
  } catch (error) {
    requestLogger.error(error, 'Failed to fetch catalogs');
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

---

## 🌍 Output формат

### Browser (Development)

```
ℹ️ [12:34:56.789] Track loaded { trackId: '123', url: 'https://...' }
❌ [12:34:57.123] Failed to load track { err: { message: '...', stack: '...' } }
⚠️ [12:34:58.456] Track quality low
```

### Server (JSON)

```json
{"level":30,"time":1234567890,"module":"AudioDirector","msg":"Track loaded","trackId":"123"}
{"level":50,"time":1234567891,"module":"AudioDirector","msg":"Failed to load track","err":{"message":"...","stack":"..."}}
{"level":40,"time":1234567892,"msg":"Track quality low"}
```

---

## 🎚️ Log Levels

| Level   | Value | Когда использовать                |
| ------- | ----- | --------------------------------- |
| `trace` | 10    | Детальная отладка (очень verbose) |
| `debug` | 20    | Информация для разработки         |
| `info`  | 30    | Обычные события (по умолчанию)    |
| `warn`  | 40    | Предупреждения                    |
| `error` | 50    | Ошибки                            |
| `fatal` | 60    | Критические ошибки                |

---

## ⚙️ Environment переменные

```bash
# .env.local
NODE_ENV=production  # Автоматически отключает логи
```

---

## 🎯 Best Practices

✅ **DO:**

- Используйте child логгеры для контекста
- Логируйте структурированные данные (объекты)
- Используйте правильные уровни
- Добавляйте полезные метаданные

❌ **DON'T:**

- Не логируйте чувствительные данные (пароли, токены)
- Не спамьте в циклах без debounce
- Не используйте `console.log` напрямую
- Не логируйте огромные объекты

---

## 🔗 Полезные ссылки

- [Pino Documentation](https://github.com/pinojs/pino)
- [Next.js Logging Guide](https://nextjs.org/docs/13/pages/building-your-application/deploying/production-checklist#logging)
- [Vercel Logging Integrations](https://vercel.com/integrations#logging)

---

_Создано на основе Pino API | Zero dependencies | TypeScript ready_
