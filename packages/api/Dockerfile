FROM oven/bun:1-alpine AS base

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app
# Install turbo globally
RUN bun install -g turbo@2.5.6
COPY . .

# Generate a partial monorepo with a pruned lockfile for a target workspace.
# Using @synoro/api as the target workspace
RUN turbo prune @synoro/api --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/bun.lock .
RUN bun install --frozen-lockfile --production

# Build the project
COPY --from=builder /app/out/full/ .
ENV CI=true
ENV npm_lifecycle_event=build
RUN bun turbo run build --filter=@synoro/api

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 bunjs
USER bunjs

# Copy built application
COPY --from=installer --chown=bunjs:nodejs /app/packages/api/dist ./dist
COPY --from=installer --chown=bunjs:nodejs /app/packages/api/package.json ./package.json
COPY --from=installer --chown=bunjs:nodejs /app/node_modules ./node_modules

# Expose port
EXPOSE 8080

# Use bun to run the server
CMD ["bun", "run", "dist/index.js"]
