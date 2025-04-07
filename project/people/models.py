from django.core.exceptions import ValidationError
from django.db.models import (
    BooleanField,
    CASCADE,
    CharField,
    DateField,
    ForeignKey,
    IntegerChoices,
    ManyToManyField,
    Model,
    OneToOneField,
    PositiveIntegerField,
    PROTECT,
    TextChoices,
)
from django.utils.timezone import datetime


class GenderChoices(TextChoices):
    M = "M", "Мужщина"
    W = "W", "Женщина"


class MaritalStatusChoices(TextChoices):
    S = "S", "Холост/Не замужем"
    M = "M", "В браке"


class PlaceJobChoices(TextChoices):
    IRS = "IRS", "В сельском поселении"
    OTS = "OTS", "за пределами поселения"
    OTA = "OTA", "за пределами района"


class SphereJob(TextChoices):
    E = "E", "Образование"
    SP = "SP", "социальная защита"
    H = "H", "Здравоохранение"
    C = "C", "Культура"
    T = "T", "Торговля"
    IP = "IP", "ИП"
    OT = "O", "Прочее"


class EducationChoices(TextChoices):
    P = "P", "дошкольное"
    H = "H", "начальное общее"
    IG = "IG", "основное общее"
    BG = "BG", "среднее общее"
    AO = "AO", "среднее профессиональное"
    SV = "SV", "высшее"


class Group(IntegerChoices):
    GROUP_1 = 1, "1 группа"
    GROUP_2 = 2, "2 группа"
    GROUP_3 = 3, "3 группа"


class Reason(TextChoices):
    VOV = "vov", "Инвалиды, участники ВОВ"
    COMBAT = "combat", "Участники боевых действий"
    CHERNOBYL = "chernobyl", "Чернобыльцы"
    DISEASE = "disease", "По заболеванию"
    OTHER = "other", "Другое"


class MilitaryPersonnel(TextChoices):
    WARRANT_OFFICER = "warrant", "Прапорщик (мичман)"
    SERGEANT = "sergeant", "Сержант (старшина)"
    SOLDIER = "soldier", "Солдат (матрос)"


class Rank(TextChoices):
    PRIVATE = "private", "Рядовой"
    CORPORAL = "corporal", "Ефрейтор"
    JUNIOR_SERGEANT = "junior_sergeant", "Младший сержант"
    SERGEANT = "sergeant", "Сержант"
    SENIOR_SERGEANT = "senior_sergeant", "Старший сержант"
    CHIEF = "chief", "Старшина"
    WARRANT_OFFICER = "warrant_officer", "Прапорщик"
    SENIOR_WARRANT_OFFICER = "senior_warrant_officer", "Старший прапорщик"


class MilitaryDistrict(TextChoices):
    ARMY = "army", "РА"
    NAVY = "navy", "ВМФ"


class MilitaryAccountType(TextChoices):
    GENERAL = "general", "Общий"
    SPECIAL = "special", "Специальный"


class StockCategory(IntegerChoices):
    GROUP_1 = 1, "1"
    GROUP_2 = 2, "2"


class MilitaryCategory(IntegerChoices):
    GROUP_1 = 1, "1"
    GROUP_2 = 2, "2"
    GROUP_3 = 3, "3"


class UnemploymentReason(TextChoices):
    STUDENT = "student", "Студент"
    MATERNITY_LEAVE = "maternity_leave", "В декретном отпуске"
    CARE_FOR_SICK = "care_for_sick", "По уходу за больным"
    DISABILITY = "disability", "Инвалиды по заболеванию"
    EMPLOYED = "employed", "Трудоустраиваются"
    ARMY = "army", "В рядах РА"
    IMPRISONED = "imprisoned", "В местах заключения"
    SEASONAL_WORK = "seasonal_work", "На сезонных работах"
    UNEMPLOYED = (
        "unemployed",
        "Безработные, стоящие на учёте в центре занятости",
    )
    LONG_TERM_UNEMPLOYED = "long_term_unemployed", "Неработающие более 3 лет"
    OTHER = "other", "Другое"


class RelationshipType(TextChoices):
    HUSBAND = "husband", "Муж"
    WIFE = "wife", "Жена"
    FATHER = "father", "Отец"
    MOTHER = "mother", "Мать"
    SON = "son", "Сын"
    DAUGHTER = "daughter", "Дочь"


class Registration(Model):
    address = CharField(
        "адрес",
        max_length=255,
        help_text="адрес регистрации",
    )
    registered_from = DateField(
        "зарегистрирован с",
        help_text="Дата начала регистрации",
    )
    registered_to = DateField(
        "зарегистрирован по",
        null=True,
        blank=True,
        help_text="Дата окончания регистрации",
    )

    def __str__(self):
        return f"{self.address}"

    class Meta:
        verbose_name = "регистрация"
        verbose_name_plural = "регистрации"


class Job(Model):
    place = CharField(
        "место работы",
        choices=PlaceJobChoices.choices,
        max_length=64,
        help_text="место работы",
    )
    sphere = CharField(
        "место работы",
        choices=SphereJob.choices,
        max_length=64,
        help_text="сфера работы",
    )
    profession = CharField(
        "профессия",
        max_length=64,
        help_text="профессия работы",
    )
    date = DateField(
        verbose_name="дата",
        help_text="дата приема на работу",
    )

    def __str__(self):
        return (
            f"{self.get_place_display()}, "
            f"{self.get_sphere_display()}, "
            f"{self.profession}, {self.date}"
        )

    class Meta:
        verbose_name = "работа"
        verbose_name_plural = "работы"


class DocumentType(Model):
    name = CharField(
        "название",
        unique=True,
        max_length=64,
        help_text="название документа",
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "тип документ"
        verbose_name_plural = "типы документов"


class Document(Model):
    document_type = ForeignKey(
        DocumentType,
        on_delete=CASCADE,
        verbose_name="тип",
        help_text="тип документа",
    )

    series = CharField(
        "серия",
        max_length=64,
        help_text="серия документа",
    )
    nomer = PositiveIntegerField(
        "номер",
        help_text="номер документа",
    )

    issued = CharField(
        "кем выдан",
        max_length=256,
        help_text="кем выдан документ",
    )

    date = DateField(
        "дата выдачи",
        help_text="дата выдачи документа",
    )

    def __str__(self):
        return f"{self.series} {self.nomer}"

    class Meta:
        verbose_name = "документ"
        verbose_name_plural = "документы"


class Human(Model):
    name = CharField(
        "имя",
        max_length=64,
        help_text="имя человека",
    )
    surname = CharField(
        "фамилия",
        max_length=64,
        help_text="фамилия человека",
    )
    patronymic = CharField(
        "отчество",
        max_length=64,
        blank=True,
        null=True,
        help_text="отчество человека",
    )
    gender = CharField(
        "пол",
        choices=GenderChoices.choices,
        default=None,
        help_text="пол человека",
        max_length=1,
    )
    marital_status = CharField(
        "семейное положение",
        choices=MaritalStatusChoices.choices,
        help_text="семейное положение человека",
        max_length=1,
    )

    education = CharField(
        "образование",
        choices=EducationChoices.choices,
        help_text="образование человека",
        max_length=2,
    )

    registration = OneToOneField(
        Registration,
        on_delete=PROTECT,
        verbose_name="регистрация",
        help_text="Информация о регистрации человека",
    )

    job = OneToOneField(
        Job,
        on_delete=PROTECT,
        null=True,
        blank=True,
        verbose_name="работа",
        help_text="работа человека",
    )

    relatives = ManyToManyField(
        "self",
        through="Relationship",
        symmetrical=False,
        related_name="related_to",
    )

    document = OneToOneField(
        Document,
        on_delete=PROTECT,
        verbose_name="документ",
        help_text="документ человека",
    )

    birthday = DateField(
        "день рождения",
        help_text="день рождения человека",
    )

    unemployment_reason = CharField(
        "причина отсутствия работы",
        max_length=30,
        choices=UnemploymentReason.choices,
        blank=True,
        null=True,
        help_text="Причина отсутствия работы, если человек не работает",
    )

    other_reason = CharField(
        "другая причина",
        max_length=255,
        blank=True,
        null=True,
        help_text="Укажите причину, если выбрано 'Другое'",
    )

    def __str__(self):
        return self.name

    def clean(self):
        try:
            self.clean_fields()
        except ValidationError:
            return super().clean()

        today = datetime.today().date()
        age = (
            today.year
            - self.birthday.year
            - (
                (today.month, today.day)
                < (self.birthday.month, self.birthday.day)
            )
        )

        if (self.gender == GenderChoices.M and 16 <= age <= 60) or (
            self.gender == GenderChoices.W and 16 <= age <= 55
        ):
            if not self.job:
                if not self.unemployment_reason:
                    raise ValidationError(
                        {
                            "unemployment_reason": (
                                "Укажите причину отсутствия работы."
                            )
                        }
                    )

                if (
                    self.unemployment_reason == UnemploymentReason.OTHER
                    and not self.other_reason
                ):
                    raise ValidationError(
                        {
                            "other_reason": (
                                'Укажите причину, если выбрано "Другое".'
                            )
                        }
                    )

        return super().clean()

    class Meta:
        verbose_name = "человек"
        verbose_name_plural = "люди"


class Invalidity(Model):
    human = OneToOneField(
        Human,
        on_delete=CASCADE,
        verbose_name="человек",
        help_text="человек инволидности",
        related_name="invalidity",
        related_query_name="invalidity",
    )

    group = PositiveIntegerField(
        verbose_name="группа",
        choices=Group.choices,
        help_text="группа инвалидности",
    )

    reason = CharField(
        "причина",
        max_length=64,
        choices=Reason.choices,
        help_text="причина инвалидности",
    )

    details = CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name="детали",
        help_text="детали инвалидности",
    )

    def __str__(self):
        return "Инвалидность:"

    def clean(self):
        try:
            self.clean_fields()
        except ValidationError:
            return super().clean()

        if self.reason in {Reason.DISEASE, Reason.OTHER} and not self.details:
            raise ValidationError({"details": ("Укажите детали")})

        return super().clean()

    class Meta:
        verbose_name = "инвалидность"
        verbose_name_plural = "инвалидности"


class Military(Model):
    rank = CharField(
        "состав",
        max_length=8,
        choices=MilitaryPersonnel.choices,
        help_text="воинский состав",
    )

    human = OneToOneField(
        Human,
        on_delete=CASCADE,
        verbose_name="человек",
        related_name="military",
        related_query_name="military",
        help_text="человек военнообязаности",
    )

    soldier_rank = CharField(
        "звание",
        max_length=22,
        choices=Rank.choices,
        help_text="военнское звание",
    )
    called = BooleanField(
        "призван",
        default=False,
        help_text="призван к военной службе",
    )

    military_district = CharField(
        "группа учёта",
        max_length=4,
        choices=MilitaryDistrict.choices,
        help_text="группа военского учета",
    )

    military_account_type = CharField(
        "вид учета",
        max_length=7,
        choices=MilitaryAccountType.choices,
        help_text="вид военского учета",
    )

    stock_category = PositiveIntegerField(
        "категория запаса",
        choices=StockCategory.choices,
        help_text="категория военского запаса",
    )
    military_category = PositiveIntegerField(
        "разряд",
        choices=MilitaryCategory.choices,
        help_text="воинский разряд",
    )

    class Meta:
        verbose_name = "военнообязаность"
        verbose_name_plural = "военнообязаности"

    def clean(self):
        try:
            self.clean_fields()
        except ValidationError:
            return super().clean()

        if self.rank == MilitaryPersonnel.SOLDIER:
            if self.soldier_rank not in {Rank.PRIVATE, Rank.CORPORAL}:
                raise ValidationError(
                    {
                        "soldier_rank": (
                            "Для состава 'Солдат' выберите звание:"
                            " Рядовой или Ефрейтор."
                        )
                    }
                )

        elif self.rank == MilitaryPersonnel.SERGEANT:
            if self.soldier_rank not in {
                Rank.JUNIOR_SERGEANT,
                Rank.SERGEANT,
                Rank.SENIOR_SERGEANT,
                Rank.CHIEF,
            }:
                raise ValidationError(
                    {
                        "soldier_rank": (
                            "Для состава 'Сержант' выберите звание:"
                            " Младший сержант, Сержант, Старший сержант"
                            " или Старшина."
                        )
                    }
                )

        elif self.rank == MilitaryPersonnel.WARRANT_OFFICER:
            if self.soldier_rank not in {
                Rank.WARRANT_OFFICER,
                Rank.SENIOR_WARRANT_OFFICER,
            }:
                raise ValidationError(
                    {
                        "soldier_rank": (
                            "Для состава 'Прапорщик' выберите звание:"
                            " Прапорщик или Старший прапорщик."
                        )
                    }
                )

        return super().clean()


class Relationship(Model):
    from_person = ForeignKey(
        Human,
        verbose_name="у кого родство",
        related_name="from_people",
        help_text="у кокого человека родство",
        on_delete=CASCADE,
    )
    to_person = ForeignKey(
        Human,
        verbose_name="с кем родство",
        related_name="to_people",
        help_text="с кем родство у человека",
        on_delete=CASCADE,
    )
    relationship_type = CharField(
        max_length=10,
        choices=RelationshipType.choices,
        verbose_name="тип",
        help_text="тип родства",
    )
    start_date = DateField(
        "начало родства",
        help_text="дата начала родства",
    )
    end_date = DateField(
        "конец родства",
        help_text="дата окончания родства",
        null=True,
        blank=True,
    )

    def clean(self):
        if self.from_person == self.to_person:
            raise ValidationError(
                {
                    "to_person": "не может быть родственен самому себе",
                }
            )

        return super().clean()

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        Relationship.objects.filter(
            from_person=self.to_person,
            to_person=self.from_person,
        ).exclude(
            relationship_type=self.get_reverse_relationship_type()
        ).delete()

        if not Relationship.objects.filter(
            from_person=self.to_person,
            to_person=self.from_person,
            relationship_type=self.get_reverse_relationship_type(),
        ).exists():
            Relationship.objects.create(
                from_person=self.to_person,
                to_person=self.from_person,
                relationship_type=self.get_reverse_relationship_type(),
                start_date=self.start_date,
                end_date=self.end_date,
            )

    def get_reverse_relationship_type(self):
        reverse_map = {
            RelationshipType.HUSBAND: RelationshipType.WIFE,
            RelationshipType.WIFE: RelationshipType.HUSBAND,
            RelationshipType.FATHER: (
                RelationshipType.SON
                if self.to_person.gender == GenderChoices.M
                else RelationshipType.DAUGHTER
            ),
            RelationshipType.MOTHER: (
                RelationshipType.DAUGHTER
                if self.to_person.gender == GenderChoices.W
                else RelationshipType.SON
            ),
            RelationshipType.SON: RelationshipType.FATHER,
            RelationshipType.DAUGHTER: RelationshipType.MOTHER,
        }
        return reverse_map.get(self.relationship_type, self.relationship_type)

    def delete(self, *args, **kwargs):
        r = super().delete(*args, **kwargs)
        Relationship.objects.filter(
            from_person=self.to_person,
            to_person=self.from_person,
        ).delete()
        return r  # noqa: 503

    class Meta:
        verbose_name = "родственная связь"
        verbose_name_plural = "родственные связи"
        unique_together = (
            "from_person",
            "to_person",
            "relationship_type",
        )
