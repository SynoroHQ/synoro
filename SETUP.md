# Настройка окружения для Synoro Platform

## Проблема

При сборке приложения возникала ошибка: `Error: POSTGRES_URL is required`

**Исправлено:** Теперь переменная `POSTGRES_URL` не требуется во время Docker сборки, но необходима для запуска приложения.

## Решение

### 1. Создайте файл .env в корне проекта

Создайте файл `.env` в корне проекта со следующим содержимым:

```bash
# Database Configuration
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/synoro
DATABASE_TYPE=postgres

# Environment
NODE_ENV=development

# MinIO Configuration (S3-compatible storage)
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_ENDPOINT=http://localhost:9000

# Email Configuration (Inbucket for development)
SMTP_HOST=localhost
SMTP_PORT=2500
SMTP_USER=test
SMTP_PASS=test

# App Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### 2. Запустите PostgreSQL через Docker

```bash
# Запуск всех сервисов
bun run docker:up

# Или только PostgreSQL
docker-compose up postgres -d
```

### 3. Альтернативное решение - использование Neon (облачная база данных)

Если вы хотите использовать Neon вместо локального PostgreSQL:

1. Зарегистрируйтесь на [neon.tech](https://neon.tech)
2. Создайте новый проект
3. Получите строку подключения
4. Обновите `.env` файл:

```bash
POSTGRES_URL=postgresql://username:password@host/database
DATABASE_TYPE=neon
```

### 4. Проверка подключения

После настройки переменных окружения попробуйте собрать приложение снова:

```bash
bun run build
```

## Структура переменных окружения

- `POSTGRES_URL` - строка подключения к PostgreSQL (обязательная)
- `DATABASE_TYPE` - тип базы данных: "neon" или "postgres" (по умолчанию: "neon")
- `NODE_ENV` - окружение: "development", "production", "test"
- `MINIO_*` - настройки для S3-совместимого хранилища
- `SMTP_*` - настройки для отправки email
- `NEXTAUTH_*` - настройки аутентификации

## Примечания

- Файл `.env` добавлен в `.gitignore` и не будет закоммичен в репозиторий
- Для продакшена используйте безопасные пароли и секретные ключи
- В CI/CD используйте переменные окружения, а не файл `.env`

## Как работает сборка

- **Во время Docker сборки:** Переменная `POSTGRES_URL` не требуется, используется placeholder значение
- **Во время запуска приложения:** Переменная `POSTGRES_URL` обязательна для подключения к базе данных
- **В CI/CD:** Переменная `CI=true` автоматически пропускает валидацию переменных окружения
