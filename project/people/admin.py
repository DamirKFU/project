from django.contrib.admin import ModelAdmin, register, TabularInline


from people.models import (
    Document,
    DocumentType,
    Human,
    Invalidity,
    Job,
    Military,
    Registration,
    Relationship,
)


class InvalidityTabularInline(TabularInline):
    model = Invalidity


class MilitaryTabularInline(TabularInline):
    model = Military


class ProfilePhotoInline(TabularInline):
    model = Relationship
    extra = 1
    fk_name = "from_person"

    autocomplete_fields = ("to_person",)


@register(Human)
class HumanAdmin(ModelAdmin):
    list_display = (
        Human.name.field.name,
        Human.surname.field.name,
        Human.patronymic.field.name,
    )
    autocomplete_fields = (
        "job",
        "document",
    )
    search_fields = (
        "name",
        "surname",
        "patronymic",
    )
    inlines = (
        InvalidityTabularInline,
        MilitaryTabularInline,
        ProfilePhotoInline,
    )


@register(Relationship)
class RelationshipAdmin(ModelAdmin):
    pass


@register(Job)
class JobAdmin(ModelAdmin):
    search_fields = ("place", "sphere", "profession", "date")


@register(Registration)
class RegistrationAdmin(ModelAdmin):
    pass


@register(Document)
class DocumentAdmin(ModelAdmin):
    search_fields = (
        "series",
        "nomer",
    )


@register(DocumentType)
class DocumentTypeAdmin(ModelAdmin):
    pass
