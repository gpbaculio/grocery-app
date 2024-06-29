from django.shortcuts import render
from django.middleware.csrf import get_token
from django.http import JsonResponse

# Create your views here.

def csrf_token_view(request):
    if request.method == 'GET':
        csrf_token = get_token(request)
        return JsonResponse({'csrfToken': csrf_token})
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)