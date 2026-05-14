import json
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.models import User, auth
from django.contrib import messages
from django.db.models import Q
from .models import Book
from django.views.decorators.csrf import csrf_exempt

# --- 1. عرض الصفحات (Templates) ---

def index(request):
    return render(request, 'index.html')

def view_books(request):
    """صفحة عرض كل الكتب"""
    return render(request, "books/view_book.html")

def add_book_page(request):
    """صفحة فورم إضافة كتاب"""
    return render(request, "books/add_book.html")

def book_details_page(request, book_id):
    """صفحة تفاصيل كتاب معين"""
    return render(request, "books/book_details.html")


# --- 2. نظام تسجيل الدخول والاشتراك (Authentication) ---

def login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['Pass']
        user = auth.authenticate(username=username, password=password)

        if user is not None:
            auth.login(request, user)
            return redirect('index')
        else:
            messages.info(request, 'Invalid username or password')
            return redirect('login')
    return render(request, 'login.html')

def signup(request): 
    if request.method == 'POST':
        firstName = request.POST['Fname']
        lastName = request.POST['Lname']
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['Pass']
        cPassword = request.POST['confirm']
        role = request.POST.get('role', 'user')

        if len(password) < 6:
            messages.info(request, "Password must be at least 6 characters")
            return redirect('SignUp')

        if password == cPassword:
            if User.objects.filter(email=email).exists():
                messages.info(request, 'Email Already Used')
                return redirect('SignUp')
            elif User.objects.filter(username=username).exists():
                messages.info(request, 'Username Already Exists')
                return redirect('SignUp')
            else:
                user = User.objects.create_user(username=username, email=email, password=password)
                user.first_name = firstName
                user.last_name = lastName
                if role == 'admin':
                    user.is_staff = True
                user.save()
                return redirect('login')
        else:
            messages.info(request, 'Passwords does not match')
            return redirect('SignUp')
    return render(request, 'SignUp.html')


def get_books(request):
    query = request.GET.get('q', '').strip()  
    if query:
        books_queryset = Book.objects.filter(
            Q(name__icontains=query) | Q(author__icontains=query)
        ).values('id', 'name', 'author', 'category', 'description', 'image')
    else:
        # لو مفيش بحث هات الكل
        books_queryset = Book.objects.all().order_by('-id').values(
            'id', 'name', 'author', 'category', 'description', 'image'
        )
    
    response = JsonResponse(list(books_queryset), safe=False)
    response["Cache-Control"] = "no-cache, no-store, must-revalidate"
    return response

def get_book(request, book_id):
    book = get_object_or_404(Book, id=book_id)
    return JsonResponse({
        "id": book.id,
        "name": book.name,
        "author": book.author,
        "category": book.category,
        "description": book.description,
        "image": book.image,
    })

@csrf_exempt
def add_book(request):
    """إضافة كتاب جديد"""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            if data.get("id") and Book.objects.filter(id=data.get("id")).exists():
                return JsonResponse({"error": "Book ID already exists!"}, status=400)
            
            book = Book.objects.create(
                id=data.get("id"),
                name=data.get("name"),
                author=data.get("author"),
                category=data.get("category"),
                description=data.get("description"),
                image=data.get("image") or "https://via.placeholder.com/120"
            )
            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=400)