# Generated by Django 4.2.16 on 2025-04-03 09:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("people", "0006_alter_human_document"),
    ]

    operations = [
        migrations.AlterField(
            model_name="military",
            name="soldier_rank",
            field=models.CharField(
                choices=[
                    ("private", "Рядовой"),
                    ("corporal", "Ефрейтор"),
                    ("junior_sergeant", "Младший сержант"),
                    ("sergeant", "Сержант"),
                    ("senior_sergeant", "Старший сержант"),
                    ("chief", "Старшина"),
                    ("warrant_officer", "Прапорщик"),
                    ("senior_warrant_officer", "Старший прапорщик"),
                ],
                help_text="военнское звание",
                max_length=30,
                verbose_name="звание",
            ),
        ),
    ]
