# Generated by Django 2.2.13 on 2020-07-16 00:30

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('crtool', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='curriculumreviewsession',
            name='last_updated',
            field=models.DateTimeField(default=django.utils.timezone.now, verbose_name='Updated'),
        ),
    ]
