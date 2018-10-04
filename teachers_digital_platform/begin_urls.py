from django.conf.urls import url
from django.views.generic import TemplateView


urlpatterns = [
    url(
        r'^$',
        TemplateView.as_view(template_name='teachers_digital_platform/crt-start.html')  # noqa: E501
    ),
]
