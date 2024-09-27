

import uuid
from django.db import migrations


def populate_uuid(apps, schema_editor):
    CustomerProfile = apps.get_model('users', 'CustomerProfile')
    for profile in CustomerProfile.objects.filter(uuid__isnull=True):
        profile.uuid = uuid.uuid4()
        profile.save()


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_customerprofile_uuid'),
    ]

    operations = [
        migrations.RunPython(populate_uuid, reverse_code=migrations.RunPython.noop),
    ]
