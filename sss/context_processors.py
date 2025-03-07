"""Context processors for the Django project."""


# Third-Party
from django import conf
from django import http
from sss.models import MapServer

# Typing
from typing import Any


def variables(request):
    kmi_server = MapServer.objects.get(name='kmi').url
    base_url = f"{request.scheme}://{request.get_host()}"
    # Construct and return context  
    return {
#        "app_build_url": conf.settings.DEV_APP_BUILD_URL,
        "GIT_COMMIT_HASH": conf.settings.GIT_COMMIT_HASH,
        "DJANGO_SETTINGS": conf.settings,
        "settings": conf.settings,
        "kmi_url": base_url + kmi_server

    }