"""
Django command to automate duplicate UUID resolution.
"""


from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db.models import Count
import uuid


class Command(BaseCommand):
    help = 'Identifies and resolves duplicate UUIDs in the User model.'

    def handle(self, *args, **options):
        User = get_user_model()
        duplicate_uuids = User.objects.values('uuid').\
            annotate(uuid_count=Count('uuid')).filter(uuid_count__gt=1)

        if not duplicate_uuids.exists():
            self.stdout.write(
                self.style.SUCCESS("No duplicate UUIDs found in User model.")
            )
            return

        self.stdout.write("Duplicate UUIDs in User model:")
        for entry in duplicate_uuids:
            duplicated_uuid = entry['uuid']
            count = entry['uuid_count']
            self.stdout.write(f"UUID: {duplicated_uuid} - Count: {count}")

            users_with_duplicate_uuid = User.objects.filter(
                uuid=duplicated_uuid
            )
            # Retain the first user, assign new UUIDs to the rest
            for user in users_with_duplicate_uuid[1:]:
                new_uuid = uuid.uuid4()
                user.uuid = new_uuid
                user.save()
                self.stdout.write(
                    f"Assigned new UUID {new_uuid} to user {user.email}"
                )

        self.stdout.write(
            self.style.SUCCESS("All duplicate UUIDs have been resolved.")
        )
