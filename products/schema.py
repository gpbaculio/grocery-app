import graphene
import graphql_jwt
from graphene_django.types import DjangoObjectType
from graphene import relay
from graphene_django.filter import DjangoFilterConnectionField
from .models import Product, User, Order, OrderItem
import decimal
import uuid
from django.core.exceptions import PermissionDenied

class ProductNode(DjangoObjectType):
    class Meta:
        model = Product
        filter_fields = ['title', 'price', 'stock']
        interfaces = (relay.Node,)

class UserNode(DjangoObjectType):
    class Meta:
        model = User
        filter_fields = ['full_name', 'address', 'is_superuser']
        interfaces = (relay.Node,)

class OrderNode(DjangoObjectType):
    class Meta:
        model = Order
        filter_fields = ['status', 'total_amount']
        interfaces = (relay.Node,)

class OrderItemNode(DjangoObjectType):
    class Meta:
        model = OrderItem
        filter_fields = ['quantity']
        interfaces = (relay.Node,)

class Query(graphene.ObjectType):
    product = relay.Node.Field(ProductNode)
    all_products = DjangoFilterConnectionField(ProductNode)
    user = relay.Node.Field(UserNode)
    all_users = DjangoFilterConnectionField(UserNode)
    order = relay.Node.Field(OrderNode)
    all_orders = DjangoFilterConnectionField(OrderNode)
    sales_analysis = graphene.List(OrderNode)

    def resolve_all_products(self, info, **kwargs):
        return Product.objects.all()

    def resolve_all_users(self, info, **kwargs):
        return User.objects.all()

    def resolve_all_orders(self, info, **kwargs):
        return Order.objects.all()

    def resolve_sales_analysis(self, info, **kwargs):
        # Implement logic for sales analysis
        return Order.objects.all()

class CreateProduct(relay.ClientIDMutation):
    class Input:
        title = graphene.String(required=True)
        image = graphene.String(required=True)
        price = graphene.String(required=True)  # Accept as string
        stock = graphene.Int(required=True)

    product = graphene.Field(ProductNode)

    @classmethod
    def mutate_and_get_payload(cls, root, info, title, image, price, stock):
        user = info.context.user
        if not user.is_superuser:
            raise PermissionDenied("You do not have permission to add products.")
        price_decimal = decimal.Decimal(price)
        product = Product(title=title, image=image, price=price_decimal, stock=stock)
        product.save()
        return CreateProduct(product=product)

class RemoveProduct(relay.ClientIDMutation):
    class Input:
        product_id = graphene.ID(required=True)

    success = graphene.Boolean()

    @classmethod
    def mutate_and_get_payload(cls, root, info, product_id):
        user = info.context.user
        if not user.is_superuser:
            raise PermissionDenied("You do not have permission to remove products.")
        try:
            product = Product.objects.get(pk=product_id)
            product.delete()
            return RemoveProduct(success=True)
        except Product.DoesNotExist:
            return RemoveProduct(success=False)

class CreateUser(relay.ClientIDMutation):
    class Input:
        full_name = graphene.String(required=True)
        image = graphene.String(required=True)
        address = graphene.String(required=True)
        is_superuser = graphene.Boolean()  # Add this field

    user = graphene.Field(UserNode)

    def mutate_and_get_payload(self, info, full_name, image, address, is_superuser=False):
        user = User(full_name=full_name, image=image, address=address, is_superuser=is_superuser)
        user.save()
        return CreateUser(user=user)

class CreateOrder(relay.ClientIDMutation):
    class Input:
        customer_id = graphene.Int(required=True)
        shipping_address = graphene.String(required=True)
        billing_address = graphene.String(required=True)
        payment_method = graphene.String(required=True)
        payment_status = graphene.String()  # Optional, defaults to 'unpaid'
        products = graphene.List(graphene.Int)  # List of product IDs
        quantities = graphene.List(graphene.Int)  # List of quantities corresponding to products

    order = graphene.Field(OrderNode)

    def mutate_and_get_payload(self, info, customer_id, shipping_address, billing_address, payment_method, payment_status='unpaid', products=None, quantities=None):
        customer = User.objects.get(pk=customer_id)
        total_amount = decimal.Decimal(0)
        tracking_number = str(uuid.uuid4())

        order = Order(
            customer=customer,
            shipping_address=shipping_address,
            billing_address=billing_address,
            payment_method=payment_method,
            payment_status=payment_status,
            tracking_number=tracking_number
        )
        order.save()

        if products and quantities:
            for product_id, quantity in zip(products, quantities):
                product = Product.objects.get(pk=product_id)
                order_item = OrderItem(order=order, product=product, quantity=quantity)
                order_item.save()
                total_amount += product.price * quantity

        order.total_amount = total_amount
        order.save()

        return CreateOrder(order=order)

class Mutation(graphene.ObjectType):
    create_product = CreateProduct.Field()
    remove_product = RemoveProduct.Field()
    create_user = CreateUser.Field()
    create_order = CreateOrder.Field()
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)
