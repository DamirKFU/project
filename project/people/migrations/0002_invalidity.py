# Generated by Django 4.2.16 on 2025-04-02 18:54

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("people", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Invalidity",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "has_invalidity",
                    models.BooleanField(
                        default=False,
                        help_text="Есть Инвалидность",
                        verbose_name="Инвалидность",
                    ),
                ),
                (
                    "group",
                    models.PositiveIntegerField(
                        blank=True,
                        choices=[
                            ("1", "1 группа"),
                            ("2", "2 группа"),
                            ("3", "3 группа"),
                        ],
                        help_text="группа инвалидности",
                        null=True,
                        verbose_name="группа",
                    ),
                ),
                (
                    "reason",
                    models.CharField(
                        blank=True,
                        choices=[
                            ("vov", "Инвалиды, участники ВОВ"),
                            ("combat", "Участники боевых действий"),
                            ("chernobyl", "Чернобыльцы"),
                            ("disease", "По заболеванию"),
                            ("other", "Другое"),
                        ],
                        help_text="причина инвалидности",
                        max_length=64,
                        null=True,
                        verbose_name="причина",
                    ),
                ),
                (
                    "disease_details",
                    models.CharField(
                        blank=True,
                        help_text="заболевание инвалидности",
                        max_length=255,
                        null=True,
                        verbose_name="заболевание",
                    ),
                ),
                (
                    "other_details",
                    models.CharField(
                        blank=True,
                        help_text="прочие инвалидности",
                        max_length=255,
                        null=True,
                        verbose_name="Другое",
                    ),
                ),
                (
                    "human",
                    models.OneToOneField(
                        help_text="человек инволидности",
                        on_delete=django.db.models.deletion.CASCADE,
                        to="people.human",
                        verbose_name="человек",
                    ),
                ),
            ],
        ),
    ]
