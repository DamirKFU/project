from django.conf import settings
from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path(
        "admin/",
        admin.site.urls,
    ),
    path(
        "api/",
        include("api.urls"),
    ),
]


if settings.DEBUG:
    urlpatterns += (
        path(
            "__debug__/",
            include("debug_toolbar.urls"),
        ),
    )
