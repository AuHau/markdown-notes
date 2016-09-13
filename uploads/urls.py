from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^image/$', views.upload_image, name='upload_image'),
]