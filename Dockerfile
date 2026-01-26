# 1. Aşama: Build
FROM node:18-alpine as build
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
ENV CI=false
RUN npm run build

# 2. Aşama: Sunucu
FROM nginx:alpine

# 🚨 ÖNEMLİ: Eğer Vite kullanıyorsan '/app/dist' yazmalısın. 
# Create React App (CRA) kullanıyorsan '/app/build' olarak kalsın.
COPY --from=build /app/build /usr/share/nginx/html

# 🛠️ YENİ EKLEDİĞİMİZ SATIR:
# Kendi nginx.conf dosyamızı Nginx'in yapılandırma klasörüne kopyalıyoruz.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]