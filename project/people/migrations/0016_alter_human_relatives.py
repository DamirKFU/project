# Generated by Django 4.2.16 on 2025-04-03 13:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("people", "0015_alter_registration_address_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="human",
            name="relatives",
            field=models.ManyToManyField(
                through="people.Relationship", to="people.human"
            ),
        ),
    ]
