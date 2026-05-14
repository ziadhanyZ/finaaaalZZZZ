from django.urls import path
from . import views

urlpatterns = [
    # --- Static Pages أولاً ---
    path('books/',                          views.view_books,        name='view_books'),
    path('books/add/',                      views.add_book_page,     name='add_book_page'),
    path('books/manage/',                   views.manage_book,       name='manage_book'),  # ← اتنقل لفوق
    path('my-books/',                       views.my_borrows,        name='my_borrows'),

    # --- Dynamic Pages تانياً ---
    path('books/<int:book_id>/',            views.book_details_page, name='book_details'),
    path('books/<int:book_id>/borrow/',     views.borrow_book,       name='borrow_book'),
    path('books/<int:book_id>/return/',     views.return_book,       name='return_book'),

    # --- API Endpoints ---
    path('api/books/',                      views.get_books,         name='get_books'),
    path('api/books/add/',                  views.add_book,          name='add_book'),
    path('api/books/<int:book_id>/',        views.get_book,          name='get_book'),
    path('api/books/<int:book_id>/edit/',   views.edit_book,         name='edit_book'),
    path('api/books/<int:book_id>/delete/', views.delete_book,       name='delete_book'),
]