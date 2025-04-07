from rest_framework.serializers import ModelSerializer

from people.models import (
    Document,
    DocumentType,
    Human,
    Invalidity,
    Job,
    Military,
    Registration,
)


class InvaliditySerializer(ModelSerializer):
    class Meta:
        model = Invalidity
        fields = "__all__"


class MilitarySerializer(ModelSerializer):
    class Meta:
        model = Military
        fields = "__all__"


class RegistrationSerializer(ModelSerializer):
    class Meta:
        model = Registration
        fields = "__all__"


class DocumentTypeSerializer(ModelSerializer):
    class Meta:
        model = DocumentType
        fields = "__all__"


class DocumentSerializer(ModelSerializer):
    document_type = DocumentTypeSerializer()

    class Meta:
        model = Document
        fields = "__all__"


class JobSerializer(ModelSerializer):
    class Meta:
        model = Job
        fields = "__all__"


class HumanSerializer(ModelSerializer):
    job = JobSerializer()
    document = DocumentSerializer()
    registration = RegistrationSerializer()
    invalidity = InvaliditySerializer()
    military = MilitarySerializer()

    class Meta:
        model = Human
        exclude = ("relatives",)
