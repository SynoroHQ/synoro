FROM oven/bun:1.2.21-alpine AS base

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app
# Install turbo globally
RUN bun install -g turbo@2.5.6
COPY . .

# Generate a partial monorepo with a pruned lockfile for a target workspace.
# Using @synoro/tg-bot as the target workspace
RUN bunx turbo prune @synoro/tg-bot --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/bun.lock .
RUN bun install

# Build the project
COPY --from=builder /app/out/full/ .
ENV CI=true
RUN bunx turbo run build --filter=@synoro/tg-bot

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 bungroup
RUN adduser --system --uid 1001 botuser
USER botuser

# Copy built application
COPY --from=installer --chown=botuser:bungroup /app/apps/tg-bot/dist ./apps/tg-bot/dist
COPY --from=installer --chown=botuser:bungroup /app/apps/tg-bot/package.json ./apps/tg-bot/package.json
COPY --from=installer --chown=botuser:bungroup /app/node_modules ./node_modules

# Use bun to run the bot
CMD ["bun", "run", "apps/tg-bot/dist/index.js"]
