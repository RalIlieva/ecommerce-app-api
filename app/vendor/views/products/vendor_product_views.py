"""
Views for the products API of the vendor.
"""
from drf_spectacular.utils import (
    extend_schema_view,
    extend_schema,
    OpenApiParameter,
    OpenApiTypes
)
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
# from rest_framework.views import APIView
# from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from rest_framework import (
    generics,
    permissions,
    # status
)
from products.models import Product
from products.serializers import (
    ProductDetailSerializer,
    ProductMiniSerializer,
)
from core.permissions import IsVendor
from products.selectors import get_active_products
from products.filters import ProductFilter
from products.pagination import CustomPagination


# Product Views
@extend_schema_view(
    list=extend_schema(
        parameters=[
            OpenApiParameter(
                'name',
                OpenApiTypes.STR,
                description='Filter products by name. '
                            'Search is case insensitive.'
            ),
            OpenApiParameter(
                'tags',
                OpenApiTypes.STR,
                description='Comma separated list of tag IDs '
                            'to filter products by tags.'
            ),
            OpenApiParameter(
                'category',
                OpenApiTypes.STR,
                description='Filter products by category slug.'
            ),
            OpenApiParameter(
                'min_price',
                OpenApiTypes.FLOAT,
                description='Filter products by minimum price.'
            ),
            OpenApiParameter(
                'max_price',
                OpenApiTypes.FLOAT,
                description='Filter products by maximum price.'
            ),
            OpenApiParameter(
                'min_avg_rating',
                OpenApiTypes.FLOAT,
                description='Filter products by minimum average rating.'
            ),
            OpenApiParameter(
                'max_avg_rating',
                OpenApiTypes.FLOAT,
                description='Filter products by maximum average rating.'
            ),
        ],
        description="Retrieve a list of products. "
                    "Filter by name, tags, category, price range, avg rating."
    )
)
class VendorProductListView(generics.ListAPIView):
    """
    GET: List products created by the vendor.
    """
    queryset = get_active_products().prefetch_related('tags', 'category').\
        order_by('id')
    serializer_class = ProductMiniSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description']  # Fields to search by
    pagination_class = CustomPagination
    permission_classes = [permissions.IsAuthenticated, IsVendor]


class VendorProductDetailView(generics.RetrieveAPIView):
    """
    GET: View to retrieve a single product.
    """
    permission_classes = [permissions.IsAuthenticated, IsVendor]
    queryset = get_active_products().select_related(
        'category'
    ).prefetch_related(
        'tags', 'images', 'reviews__user')
    serializer_class = ProductDetailSerializer

    def get_object(self):
        uuid = self.kwargs.get('uuid')
        slug = self.kwargs.get('slug')
        product = get_object_or_404(
            Product,
            uuid=uuid,
            slug=slug,
            is_active=True
        )
        return product


class VendorProductCreateView(generics.CreateAPIView):
    """
    POST: View to create a product.
    Only the vendor can access this view.
    """
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendor]


class VendorProductUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """
    PUT/PATCH: View to update, or
    DELETE: delete a product.
    Only vendors can access this view.
    """
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendor]

    def get_object(self):
        uuid = self.kwargs.get('uuid')
        product = get_object_or_404(Product, uuid=uuid)
        return product


# class VendorProductListCreateView(APIView):
#     """
#     GET: List products created by the vendor.
#     POST: Create a new product by the vendor.
#     """
#     permission_classes = [permissions.IsAuthenticated, IsVendor]
#
#     def get(self, request):
#         # Vendors should only get a list of their own products
#         products = Product.objects.filter(
#         vendor=request.user,
#         is_active=True
#         )
#         serializer = ProductMiniSerializer(products, many=True)
#         return Response(serializer.data)
#
#     def post(self, request):
#         # Vendors can create products
#         serializer = ProductDetailSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save(vendor=request.user)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(
#         serializer.errors,
#         status=status.HTTP_400_BAD_REQUEST
#         )
#
#
# class VendorProductDetailUpdateDeleteView(APIView):
#     """
#     GET: Retrieve a specific product created by the vendor.
#     PATCH: Update a product.
#     DELETE: Delete a product.
#     """
#     permission_classes = [permissions.IsAuthenticated, IsVendor]
#
#     def get(self, request, uuid, slug):
#         # Vendors can view their product details
#         product = get_object_or_404(
#         Product, uuid=uuid,
#         slug=slug,
#         vendor=request.user
#         )
#         serializer = ProductDetailSerializer(product)
#         return Response(serializer.data)
#
#     def patch(self, request, uuid, slug):
#         # Vendors can update their own products
#         product = get_object_or_404(
#         Product,
#         uuid=uuid,
#         slug=slug,
#         vendor=request.user
#         )
#         serializer = ProductDetailSerializer(
#         product,
#         data=request.data,
#         partial=True
#         )
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(
#         serializer.errors,
#         status=status.HTTP_400_BAD_REQUEST
#         )
#
#     def delete(self, request, uuid, slug):
#         # Vendors can delete their own products
#         product = get_object_or_404(
#         Product, uuid=uuid,
#         slug=slug,
#         vendor=request.user
#         )
#         product.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)
#
