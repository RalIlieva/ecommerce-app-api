# Generated by Django 5.0.9 on 2024-09-27 17:56

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_populate_uuid_to_customerprofile'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customerprofile',
            name='uuid',
            field=models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, unique=True),
        ),
    ]
