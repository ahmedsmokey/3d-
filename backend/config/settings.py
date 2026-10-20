import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url

# Load environment variables from .env file if it exists
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# Check environment: 'production' vs 'development'
ENVIRONMENT = os.getenv('ENVIRONMENT', 'development').lower()
DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 't') if ENVIRONMENT != 'production' else False

# SECRET_KEY validation: Disallow insecure fallback in production
SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY:
    if ENVIRONMENT == 'production':
        raise RuntimeError("CRITICAL SECURITY ERROR: SECRET_KEY environment variable MUST be set in production!")
    SECRET_KEY = 'django-insecure-dev-only-b3@$xto^_t7^4be3z-&^*!h_315zvuzn+@p22)=a%o=ts9$fhy'

ALLOWED_HOSTS = [h.strip() for h in os.getenv('ALLOWED_HOSTS', '*').split(',') if h.strip()]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'corsheaders',

    # Local apps
    'products',
    'orders',
    'accounts',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # CORS at top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# ==============================================================================
# DATABASE CONFIGURATION & ENCRYPTED CONNECTION
# ==============================================================================
USE_POSTGRES = os.getenv('USE_POSTGRES', 'false').lower() in ('true', '1', 't') or ENVIRONMENT == 'production'
DATABASE_URL = os.getenv('DATABASE_URL')
DB_SSL_REQUIRE = os.getenv('DB_SSL_REQUIRE', 'false').lower() in ('true', '1') or (ENVIRONMENT == 'production')

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            ssl_require=DB_SSL_REQUIRE
        )
    }
elif USE_POSTGRES:
    db_options = {}
    if DB_SSL_REQUIRE:
        db_options['sslmode'] = 'require'

    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'printpart_db'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
            'OPTIONS': db_options,
        }
    }
else:
    # Development fallback: SQLite
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# ==============================================================================
# PASSWORD VALIDATION (Strong Password Enforcement)
# ==============================================================================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8}
    },
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==============================================================================
# REST FRAMEWORK: AUTHENTICATION, PERMISSIONS & RATE LIMITING (THROTTLING)
# ==============================================================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'accounts.permissions.CsrfExemptSessionAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'accounts.permissions.IsAdminOrReadOnly',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
        'rest_framework.throttling.ScopedRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': os.getenv('THROTTLE_ANON', '120/minute'),
        'user': os.getenv('THROTTLE_USER', '300/minute'),
        'auth': os.getenv('THROTTLE_AUTH', '15/minute'),
    },
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# ==============================================================================
# CORS SETTINGS (Restricted to Authorized Domains)
# ==============================================================================
CORS_ALLOW_CREDENTIALS = True

cors_env = os.getenv('CORS_ALLOWED_ORIGINS')
if cors_env:
    CORS_ALLOWED_ORIGINS = [o.strip() for o in cors_env.split(',') if o.strip()]
    CORS_ALLOW_ALL_ORIGINS = False
elif ENVIRONMENT == 'production':
    CORS_ALLOW_ALL_ORIGINS = False
    CORS_ALLOWED_ORIGINS = []
else:
    # Development allowed origins
    CORS_ALLOW_ALL_ORIGINS = False
    CORS_ALLOWED_ORIGINS = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ]

csrf_env = os.getenv('CSRF_TRUSTED_ORIGINS')
if csrf_env:
    CSRF_TRUSTED_ORIGINS = [o.strip() for o in csrf_env.split(',') if o.strip()]
elif cors_env:
    CSRF_TRUSTED_ORIGINS = [o.strip() for o in cors_env.split(',') if o.strip()]
else:
    CSRF_TRUSTED_ORIGINS = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ]

# ==============================================================================
# HTTPS, SSL/TLS & SECURITY HEADERS
# ==============================================================================
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'false').lower() in ('true', '1') or (ENVIRONMENT == 'production')
SESSION_COOKIE_SECURE = (ENVIRONMENT == 'production') or os.getenv('SESSION_COOKIE_SECURE', 'false').lower() in ('true', '1')
CSRF_COOKIE_SECURE = (ENVIRONMENT == 'production') or os.getenv('CSRF_COOKIE_SECURE', 'false').lower() in ('true', '1')

# Prevent XSS access to sensitive session cookie
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'

# Defense against clickjacking, sniffing, and cross-site scripting
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

if ENVIRONMENT == 'production':
    SECURE_HSTS_SECONDS = int(os.getenv('SECURE_HSTS_SECONDS', '31536000'))  # 1 year HSTS
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
else:
    SECURE_HSTS_SECONDS = 0
