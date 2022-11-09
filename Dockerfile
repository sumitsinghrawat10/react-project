# Build stage
# FROM node:14 AS builder
FROM public.ecr.aws/docker/library/node:14.18.1 AS builder
RUN mkdir /app
WORKDIR /app
COPY package*.json /app/
# RUN npm ci --quiet
# RUN npm install
COPY ./ /app/
RUN npm install
RUN REACT_APP_ENV=dev npm run build

# production environment
FROM public.ecr.aws/nginx/nginx:1.19.5-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY ./docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Runtime stage - test
# FROM nginx:alpine
# COPY --from=builder /app/build /usr/share/nginx/html
# COPY ./docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf


