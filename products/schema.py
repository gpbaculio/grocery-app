import graphene
from graphene_django.types import DjangoObjectType
from graphene import relay
from graphene_django.filter import DjangoFilterConnectionField
from .models import Product, User, Order, OrderItem
import decimal
import uuid 

class ProductNode(DjangoObjectType):
    class Meta:
        model = Product
        filter_fields = ['title', 'price', 'stock']
        interfaces = (relay.Node,)

class UserNode(DjangoObjectType):
    class Meta:
        model = User
        filter_fields = ['full_name', 'address']
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

    def resolve_all_products(self, info, **kwargs):
        return Product.objects.all()

    def resolve_all_users(self, info, **kwargs):
        return User.objects.all()

    def resolve_all_orders(self, info, **kwargs):
        return Order.objects.all()

class CreateProduct(relay.ClientIDMutation):
    class Input:
        title = graphene.String(required=True)
        image = graphene.String(required=True)
        price = graphene.String(required=True)  # Accept as string
        stock = graphene.Int(required=True)

    product = graphene.Field(ProductNode)

    def mutate_and_get_payload(self, info, title, image, price, stock):
        price_decimal = decimal.Decimal(price)
        product = Product(title=title, image=image, price=price_decimal, stock=stock)
        product.save()
        return CreateProduct(product=product)

class CreateUser(relay.ClientIDMutation):
    class Input:
        full_name = graphene.String(required=True)
        image = graphene.String(required=True)
        address = graphene.String(required=True)

    user = graphene.Field(UserNode)

    def mutate_and_get_payload(self, info, full_name, image, address):
        user = User(full_name=full_name, image=image, address=address)
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
    create_user = CreateUser.Field()
    create_order = CreateOrder.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)
