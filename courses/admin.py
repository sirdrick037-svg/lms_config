from django.contrib import admin
from django.contrib import admin
from .models import Course

# Register your models here.
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title", "instructor", "is_published", "created_at")
    list_filter = ("is_published", "created_at")
    search_fields = ("title", "description", "instructor__username")
