# ---------- BUILD ----------
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn prisma generate

RUN yarn build


FROM node:22-alpine AS runner

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile 

COPY --from=build /app/dist ./dist

COPY --from=build /app/prisma.config.ts ./prisma.config.ts

COPY --from=build /app/prisma ./prisma



EXPOSE 3001

CMD ["yarn", "start:prod"]
