from django.db import models

class Book(models.Model):
    name = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    description = models.TextField()
    image = models.URLField(max_length=500, null=True, blank=True)
    isBorrowed = models.BooleanField(default=False)

    def __str__(self):
        return self.name