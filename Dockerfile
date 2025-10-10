# Aşama 1: Uygulamayı oluşturma (build)
# React uygulaması Node.js ortamında derlendiği için bir Node imajı kullanıyoruz.
FROM node:20 as build

# Çalışma dizinini belirle
WORKDIR /app

# package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
# Bu adım, bir sonraki aşamaya geçmeden önce önbelleğe almayı (caching) sağlar.
RUN npm install

# Kalan tüm frontend kodunu kopyala
COPY . .

# Uygulamayı derle ve üretim için hazır hale getir
RUN npm run build

# Aşama 2: Web sunucusunu ayarlama (run)
# Oluşturulan statik dosyaları sunmak için hafif bir Nginx imajı kullan.
FROM nginx:alpine

# Nginx'in varsayılan konfigürasyonunu kaldır ve yerine
# React uygulamasının yönlendirmelerini (routing) desteklemesi için
# bir default.conf dosyası ekle.
# Eğer uygulamanızda yönlendirme (routing) yoksa bu satırı atlayabilirsiniz.
# COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Birinci aşamada oluşturulan dosyaları Nginx'in sunucu dizinine kopyala.
COPY --from=build /app/build /usr/share/nginx/html

# İmajın 80 numaralı portu dinleyeceğini belirt.
EXPOSE 80

# Nginx sunucusunu başlat.
CMD ["nginx", "-g", "daemon off;"]