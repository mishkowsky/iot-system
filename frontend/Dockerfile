FROM node:18-alpine as react-build

RUN mkdir /app
WORKDIR /app

COPY ["package-lock.json", "package.json", "tsconfig.json", "/app/"]

COPY ./ /app/
RUN cd /app && npm install

RUN npm -s run build

FROM nginx:stable-alpine as production
COPY --from=react-build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 3000
CMD [ "nginx", "-g", "daemon off;" ]