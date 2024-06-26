# models.py

from django.db import models

class Product(models.Model):
    title = models.CharField(max_length=255)
    image = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock = models.IntegerField()

class User(models.Model):
    full_name = models.CharField(max_length=255)
    image = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    is_superuser = models.BooleanField(default=False)

class Order(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)  # Optional now
    shipping_address = models.TextField()
    billing_address = models.TextField()
    payment_method = models.CharField(max_length=20)
    payment_status = models.CharField(max_length=20, default='unpaid')
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()

    def __str__(self):
        return f"OrderItem {self.id} - Order {self.order_id} - Product {self.product_id}"
