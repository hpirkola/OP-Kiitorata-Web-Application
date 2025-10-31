FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

FROM public.ecr.aws/lambda/nodejs:20 AS lambda
WORKDIR /var/task
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
CMD ["dist/handler.handler"]