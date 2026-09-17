from django.contrib import admin
from .models import Expense


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'amount', 'category', 'date', 'created_at')
    search_fields = ('title', 'category', 'description')
    list_filter = ('category', 'date')
