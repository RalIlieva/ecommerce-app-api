import os

# e.g., 'development' or 'production'
ENVIRONMENT = os.getenv('DJANGO_ENV')

if ENVIRONMENT == 'production':
    from .production import *
else:
    from .development import *
