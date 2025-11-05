FROM node:20-alpine AS build
WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/tsconfig.json ./
COPY backend/src ./src
COPY shared ./shared

RUN npx tsc

FROM public.ecr.aws/lambda/nodejs:20 AS lambda
WORKDIR /var/task

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

CMD ["dist/src/handler.handler"]
