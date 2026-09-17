from rest_framework import viewsets
from .models import Expense
from .serializers import ExpenseSerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    API viewset providing full CRUD operations for Expense entries:
    - GET /api/expenses/ : List all expenses
    - POST /api/expenses/ : Create a new expense
    - GET /api/expenses/{id}/ : Retrieve a specific expense
    - PUT/PATCH /api/expenses/{id}/ : Update a specific expense
    - DELETE /api/expenses/{id}/ : Delete a specific expense
    """
    queryset = Expense.objects.all().order_by('-date', '-created_at')
    serializer_class = ExpenseSerializer
