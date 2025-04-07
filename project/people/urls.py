from django.urls import path

from people.views import HumanListView

app_name = "people"

urlpatterns = [
    path(
        "humans/",
        HumanListView.as_view(),
        name="humans",
    ),
]
