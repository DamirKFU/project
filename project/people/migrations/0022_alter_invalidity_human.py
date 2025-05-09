# Generated by Django 4.2.16 on 2025-04-04 16:01

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("people", "0021_rename_type_document_document_document_type"),
    ]

    operations = [
        migrations.AlterField(
            model_name="invalidity",
            name="human",
            field=models.OneToOneField(
                help_text="человек инволидности",
                on_delete=django.db.models.deletion.CASCADE,
                related_name="invalidity",
                related_query_name="invalidity",
                to="people.human",
                verbose_name="человек",
            ),
        ),
    ]
