# Generated by Django 4.2.16 on 2025-04-03 09:43

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("people", "0005_alter_documenttype_name"),
    ]

    operations = [
        migrations.AlterField(
            model_name="human",
            name="document",
            field=models.OneToOneField(
                help_text="документ человека",
                on_delete=django.db.models.deletion.PROTECT,
                to="people.document",
                verbose_name="документ",
            ),
        ),
    ]
