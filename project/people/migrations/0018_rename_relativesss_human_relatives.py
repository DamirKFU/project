# Generated by Django 4.2.16 on 2025-04-03 14:03

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("people", "0017_rename_relatives_human_relativesss"),
    ]

    operations = [
        migrations.RenameField(
            model_name="human",
            old_name="relativesss",
            new_name="relatives",
        ),
    ]
