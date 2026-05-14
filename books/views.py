import json
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render, redirect
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.db.models import Q  # تمت إضافة الاستدعاء ده عشان البحث يشتغل
from .models import Book, BorrowRecord
from django.shortcuts import get_object_or_404, render, redirect
# ── existing views (unchanged) ──────────────────────────────────────────

def view_books(request):
    return render(request, "books/view_book.html")

def add_book_page(request):
    return render(request, "books/add_book.html")

def book_details_page(request, book_id):
    book = get_object_or_404(Book, id=book_id)
    return render(request, "books/book_details.html", {'book': book})

def get_books(request):
    query = request.GET.get('q', '').strip()  
    if query:
        books_queryset = Book.objects.filter(
            Q(name__icontains=query) | Q(author__icontains=query)
        ).values('id', 'name', 'author', 'category', 'description', 'image', 'isBorrowed')
    else:
        books_queryset = Book.objects.all().order_by('-id').values(
            'id', 'name', 'author', 'category', 'description', 'image', 'isBorrowed'
        )
    
    response = JsonResponse(list(books_queryset), safe=False)
    response["Cache-Control"] = "no-cache, no-store, must-revalidate"
    return response

def get_book(request, book_id):
    book = get_object_or_404(Book, id=book_id)
    return JsonResponse({
        "id": book.id, "name": book.name, "author": book.author,
        "category": book.category, "description": book.description,
        "image": book.image, "isBorrowed": book.isBorrowed
    })

@csrf_exempt
def add_book(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            if Book.objects.filter(id=data.get("id")).exists():
                return JsonResponse({"error": "Book ID already exists!"}, status=400)
            book = Book.objects.create(
                id=data.get("id"),
                name=data.get("name"),
                author=data.get("author"),
                category=data.get("category"),
                description=data.get("description"),
                image=data.get("image") or "https://via.placeholder.com/120",
                isBorrowed=False  # التعديل ده بيضمن ظهوره في صفحة الـ View مباشرة
            )
            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=400)


# ── new borrow views ─────────────────────────────────────────────────────

@login_required
def borrow_book(request, book_id):
    if request.method == "POST":
        book = get_object_or_404(Book, id=book_id)
        if not book.isBorrowed:
            BorrowRecord.objects.create(user=request.user, book=book)
            book.isBorrowed = True
            book.save()
    return redirect('book_details', book_id=book_id)


@login_required
def return_book(request, book_id):
    if request.method == "POST":
        book = get_object_or_404(Book, id=book_id)
        record = get_object_or_404(BorrowRecord, user=request.user, book=book, returned_at=None)
        record.returned_at = timezone.now()
        record.save()
        book.isBorrowed = False
        book.save()
    return redirect('my_borrows')


@login_required
def my_borrows(request):
    records = BorrowRecord.objects.filter(
        user=request.user
    ).select_related('book').order_by('-borrowed_at')
    return render(request, "books/borrowed_books.html", {'records': records})

def manage_book(request):
    return render(request, 'books/manage_book.html')

@csrf_exempt
def edit_book(request, book_id):
    if request.method != 'PUT':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    book = get_object_or_404(Book, id=book_id)
    if book.isBorrowed:
        return JsonResponse({'error': 'Book is borrowed'}, status=400)
    data = json.loads(request.body)
    book.name        = data.get('name',        book.name)
    book.author      = data.get('author',      book.author)
    book.category    = data.get('category',    book.category)
    book.description = data.get('description', book.description)
    book.image       = data.get('image',       book.image)
    book.save()
    return JsonResponse({'success': True})

@csrf_exempt
def delete_book(request, book_id):
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    book = get_object_or_404(Book, id=book_id)
    if book.isBorrowed:
        return JsonResponse({'error': 'Book is borrowed'}, status=400)
    book.delete()
    return JsonResponse({'success': True})