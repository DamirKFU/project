from django.contrib.auth import authenticate
from rest_framework.serializers import CharField, Serializer, ValidationError


class LoginSerializer(Serializer):
    username = CharField(
        required=True,
    )
    password = CharField(
        required=True,
        write_only=True,
    )

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")

        user = authenticate(username=username, password=password)
        if user is None:
            raise ValidationError(
                {"non_field_errors": ["Invalid credentials"]}
            )

        return {"user": user}
