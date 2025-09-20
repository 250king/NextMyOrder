FROM node:alpine AS base

# Install dependencies only when needed
FROM base AS turbo
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN npm install turbo
COPY . .
RUN npx turbo prune user --docker

FROM base AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=turbo /app/out/json/ .
RUN npm install
COPY --from=turbo /app/out/full/ .
RUN npx turbo run build --filter=user

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/apps/user/.next/standalone/node_modules ./node_modules
COPY --from=builder /app/apps/user/.next/standalone/apps/user ./user
COPY --from=builder /app/apps/user/.next/static ./user/.next/static
COPY --from=builder /app/apps/user/public ./user/public
COPY --from=builder /app/apps/admin/.next/standalone/node_modules ./node_modules
COPY --from=builder /app/apps/admin/.next/standalone/apps/admin ./admin
COPY --from=builder /app/apps/admin/.next/static ./admin/.next/static
COPY --from=builder /app/apps/admin/public ./user/admin
COPY --chmod=755 docker-entrypoint.sh /

EXPOSE 3000
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

ENTRYPOINT ["/docker-entrypoint.sh"]
