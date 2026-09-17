from rest_framework import serializers
from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    """
    Serializer for the Expense model.
    Handles serialization, deserialization, and validation of expense data.
    """
    class Meta:
        model = Expense
        fields = ['id', 'title', 'amount', 'category', 'date', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value
