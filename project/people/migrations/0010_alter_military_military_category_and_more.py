# Generated by Django 4.2.16 on 2025-04-03 09:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        (
            "people",
            "0009_military_military_category_military_stock_category_and_more",
        ),
    ]

    operations = [
        migrations.AlterField(
            model_name="military",
            name="military_category",
            field=models.PositiveIntegerField(
                choices=[(1, "1"), (2, "2"), (3, "3")],
                help_text="воинский разряд",
                verbose_name="разряд",
            ),
        ),
        migrations.AlterField(
            model_name="military",
            name="stock_category",
            field=models.PositiveIntegerField(
                choices=[(1, "1"), (2, "2")],
                help_text="категория военского запаса",
                verbose_name="категория запаса",
            ),
        ),
    ]
