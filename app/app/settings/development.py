from .base import *

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'app', 'frontend']

# # Additional development-specific settings
# INSTALLED_APPS += [
#     'debug_toolbar',
#     # ... other development apps
# ]
#
# MIDDLEWARE = [
#     'debug_toolbar.middleware.DebugToolbarMiddleware',
#     *MIDDLEWARE,
# ]

INTERNAL_IPS = [
    '127.0.0.1',
]

# # Override email backend for development
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
