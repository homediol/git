FROM php:8.2-cli

WORKDIR /var/www/html

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libicu-dev \
        libonig-dev \
        libxml2-dev \
        libzip-dev \
        zip \
    && docker-php-ext-install \
        intl \
        mbstring \
        pdo \
        pdo_mysql \
        zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY . .

RUN composer install --no-interaction --prefer-dist --optimize-autoloader \
    && rm -f public/hot \
    && php artisan storage:link

EXPOSE 10000

CMD ["php", "-S", "0.0.0.0:10000", "-t", "public"]
