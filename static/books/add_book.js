document.querySelector('form').addEventListener('submit', function(a) {
    a.preventDefault();
    
    const bookId    = document.getElementById('bookId').value.trim();
    const bookName  = document.getElementById('bookName').value.trim();
    const author    = document.getElementById('author').value.trim();
    const category  = document.getElementById('category').value;
    const desc      = document.getElementById('description').value.trim();
    const imageVal  = document.getElementById('book_image').value.trim();

    // --- Validation ---
    if (!bookName) {
        alert('Book name is required.');
        return;
    }
    if (!author) {
        alert('Author name is required.');
        return;
    }
    const categorySelect = document.getElementById('category');
    if (!category || categorySelect.selectedIndex === 0) {
        alert('Please select a category.');
        return;
    }

    // --- Build book object ---
    // تأمين الـ ID وإضافة حقل isBorrowed: false عشان يظهر في الـ View فوراً
    const bookData = {
        id: bookId ? parseInt(bookId) : Date.now(), // لو مفيش ID بيعمل رقم فريد
        name: bookName,
        author: author,
        category: category,
        description: desc,
        image: imageVal || 'https://via.placeholder.com/120?text=No+Image',
        isBorrowed: false 
    };

    // --- Send to Django API ---
    // ملحوظة: اتأكد إن المسار ده هو نفس مسار الإضافة عندك في urls.py
    fetch('/books/add/', { 
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            // بنبعت التوكن عشان لو الـ Backend محتاجه (زيادة أمان)
            'X-CSRFToken': getCookie('csrftoken') 
        },
        body: JSON.stringify(bookData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Book added successfully!');
            this.reset();
            // التوجيه المباشر لصفحة عرض الكتب
            setTimeout(() => {
                window.location.href = '/books/';
            }, 300);
        } else {
            alert('Error: ' + (data.error || 'Failed to add book.'));
        }
    })
    .catch(err => {
        alert('Server connection error. Check your console.');
        console.error("Add Book Error:", err);
    });
});

// دالة مساعدة لجلب التوكن (عشان الـ POST Request يتقبل)
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}