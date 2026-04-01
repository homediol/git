FROM php:8.2-cli

WORKDIR /var/www/html

ENV COMPOSER_ALLOW_SUPERUSER=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libicu-dev \
        libonig-dev \
        libxml2-dev \
        libpq-dev \
        libzip-dev \
        zip \
    && docker-php-ext-install \
        intl \
        mbstring \
        dom \
        xml \
        xmlwriter \
        pgsql \
        pdo_pgsql \
        pdo_mysql \
        zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY . .

RUN mkdir -p \
        bootstrap/cache \
        storage/framework/cache \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
    && chmod -R ug+rwx storage bootstrap/cache \
    && composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-progress \
    && rm -f public/hot \
    && ln -sfn /var/www/html/storage/app/public /var/www/html/public/storage

EXPOSE 10000

CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-10000} -t public"]
