from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from people.models import Human
from people.pagination import CustomPagination
from people.seralizers import HumanSerializer


class HumanListView(ListAPIView):
    serializer_class = HumanSerializer
    pagination_class = CustomPagination
    permission_classes = (AllowAny,)

    def get_queryset(self):
        queryset = Human.objects.all()
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        if start_date and end_date:
            queryset = queryset.filter(birthday__range=[start_date, end_date])
            return queryset

        return queryset

    def list(self, request, *args, **kwargs):  # noqa A003
        queryset = self.get_queryset()
        no_pagination = request.query_params.get("no_pagination", False)

        if no_pagination:
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
