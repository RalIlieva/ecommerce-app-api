# app/celery.py

import os
from celery import Celery
# from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')

app = Celery('app')

# Load task modules from all registered Django app configs.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Celery will automatically discover tasks in Django apps.
app.autodiscover_tasks()

# # Optional: Celery beat configuration (periodic tasks)
# app.conf.beat_schedule = {
#     'send-notifications': {
#         'task': 'app.tasks.send_notification',
#         'schedule': crontab(minute=0, hour=0),  # Example: Run daily at midnight
#     },
# }
