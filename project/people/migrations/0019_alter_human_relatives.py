# Generated by Django 4.2.16 on 2025-04-03 14:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("people", "0018_rename_relativesss_human_relatives"),
    ]

    operations = [
        migrations.AlterField(
            model_name="human",
            name="relatives",
            field=models.ManyToManyField(
                related_name="related_to",
                through="people.Relationship",
                to="people.human",
            ),
        ),
    ]
