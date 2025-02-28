from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from django.conf import settings
from celery.schedules import crontab

# Set the default Django settings module for Celery.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')

# Create a new Celery application instance named 'app'.
app = Celery('app')

# Load Celery configuration from Django settings.
# CELERY_ prefixed variables in settings.py will be used for configuration.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Celery automatically discovers tasks from all registered Django app configs.
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)


@app.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))


# Define periodic tasks
app.conf.beat_schedule = {
    'cancel-expired-orders-every-night': {
        'task': 'order.tasks.cancel_expired_orders_task',
        'schedule': crontab(hour=0, minute=0),  # Runs every night at midnight
    },
}

app.conf.timezone = 'UTC'

# # Optional: Celery Beat schedule if needed for periodic tasks
# app.conf.beat_schedule = {
#     'send-notifications': {
#         'task': 'notifications.tasks.send_email_notification',
#         'schedule': crontab(minute=0, hour=0),
#     },
# }
