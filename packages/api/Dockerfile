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
RUN bun install

# Build the project
COPY --from=builder /app/out/full/ .
ENV CI=true
ENV npm_lifecycle_event=build
RUN bun turbo run build --filter=@synoro/api --filter=@synoro/db --filter=@synoro/auth --filter=@synoro/validators --filter=@synoro/lib --filter=@synoro/prompts --filter=@synoro/emails

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 bunjs
USER bunjs

# Copy built application and dependencies
COPY --from=installer --chown=bunjs:nodejs /app/packages/api/dist ./dist
COPY --from=installer --chown=bunjs:nodejs /app/packages/api/package.json ./package.json
COPY --from=installer --chown=bunjs:nodejs /app/node_modules ./node_modules

# Copy built workspace packages
COPY --from=installer --chown=bunjs:nodejs /app/packages/db/dist ./node_modules/@synoro/db/dist
COPY --from=installer --chown=bunjs:nodejs /app/packages/auth/dist ./node_modules/@synoro/auth/dist
COPY --from=installer --chown=bunjs:nodejs /app/packages/validators/dist ./node_modules/@synoro/validators/dist
COPY --from=installer --chown=bunjs:nodejs /app/packages/lib/dist ./node_modules/@synoro/lib/dist
COPY --from=installer --chown=bunjs:nodejs /app/packages/prompts/dist ./node_modules/@synoro/prompts/dist
COPY --from=installer --chown=bunjs:nodejs /app/packages/emails/dist ./node_modules/@synoro/emails/dist

# Copy package.json files for workspace packages
COPY --from=installer --chown=bunjs:nodejs /app/packages/db/package.json ./node_modules/@synoro/db/package.json
COPY --from=installer --chown=bunjs:nodejs /app/packages/auth/package.json ./node_modules/@synoro/auth/package.json
COPY --from=installer --chown=bunjs:nodejs /app/packages/validators/package.json ./node_modules/@synoro/validators/package.json
COPY --from=installer --chown=bunjs:nodejs /app/packages/lib/package.json ./node_modules/@synoro/lib/package.json
COPY --from=installer --chown=bunjs:nodejs /app/packages/prompts/package.json ./node_modules/@synoro/prompts/package.json
COPY --from=installer --chown=bunjs:nodejs /app/packages/emails/package.json ./node_modules/@synoro/emails/package.json

# Expose port
EXPOSE 8080

# Use bun to run the server
CMD ["bun", "run", "dist/index.js"]
