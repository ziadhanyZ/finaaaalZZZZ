from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

BORROW_DURATION_DAYS = 7

class Book(models.Model):
    CATEGORY_CHOICES = [
        ('Fantasy', 'Fantasy'),
        ('Historical', 'Historical'),
        ('Programming', 'Programming'),
        ('Romantic', 'Romantic'),
        ('Science Fiction', 'Science Fiction'),
    ]
    
    name        = models.CharField(max_length=200)
    author      = models.CharField(max_length=200)
    category    = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField()
    image       = models.URLField(blank=True, default='https://via.placeholder.com/120?text=No+Image')
    isBorrowed  = models.BooleanField(default=False)  # ← added back

    def __str__(self):
        return self.name


class BorrowRecord(models.Model):
    user        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='borrows')
    book        = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='borrow_records')
    borrowed_at = models.DateTimeField(auto_now_add=True)
    due_date    = models.DateTimeField(blank=True, null=True)
    returned_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'book'],
                condition=models.Q(returned_at=None),
                name='one_active_borrow_per_user_per_book'
            )
        ]

    def save(self, *args, **kwargs):
        if not self.pk:
            self.due_date = timezone.now() + timedelta(days=BORROW_DURATION_DAYS)
        super().save(*args, **kwargs)

    @property
    def is_active(self):
        return self.returned_at is None

    @property
    def is_overdue(self):
        return self.is_active and timezone.now() > self.due_date

    def __str__(self):
        return f"{self.user.username} — {self.book.name}"  # ← fixed