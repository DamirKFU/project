from django.urls import include, path


urlpatterns = [
    path(
        "people/",
        include(("people.urls")),
        name="people",
    ),
    path(
        "users/",
        include(("users.urls")),
        name="users",
    ),
]
