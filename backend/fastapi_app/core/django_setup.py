import os
import django

def init_django(settings_module: str):
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", settings_module)
    django.setup()