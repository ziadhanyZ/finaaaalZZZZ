let allBooks = [];

window.addEventListener('load', () => fetchBooks());

function fetchBooks() {
    const container = document.getElementById('categoryContainer');
    container.innerHTML = '<p style="text-align:center; color:#888;">Loading books...</p>';

    fetch('/api/books/')
        .then(res => res.json())
        .then(data => {
            allBooks = data;
            displayBooks(allBooks);
        })
        .catch(err => {
            console.error("Fetch error:", err);
            container.innerHTML = '<p style="color:red; text-align:center;">Error loading books. Check console (F12).</p>';
        });
}

function generateBookCard(book) {
    // تأمين القيمة عشان لو isAdmin مش متعرفة في الـ HTML
    const isUserAdmin = (typeof isAdmin !== 'undefined') ? isAdmin : false;

    let borrowButtonHTML = '';
    if (!isUserAdmin) {
        // تأمين حقل isBorrowed عشان لو جاي من الداتابيز بـ null
        const borrowed = book.isBorrowed || false;
        borrowButtonHTML = borrowed
            ? `<button disabled style="opacity:0.5; background: #ccc;">Not Available</button>`
            : `<button class="borrow_btn_script" data-id="${book.id}">Borrow</button>`;
    }

    return `
        <div class="book-card">
            <img src="${book.image || 'https://via.placeholder.com/120'}" alt="Cover" onerror="this.src='https://via.placeholder.com/120'">
            <h3>${book.name || 'No Title'}</h3>
            <p style="font-size: 0.9em; color: #e9d5ff;">Author: ${book.author || 'Unknown'}</p>
            <div class="card-buttons">
                <button class="view-btn" onclick="viewBook(${book.id})">View</button>
                ${borrowButtonHTML}
            </div>
        </div>
    `;
}

function displayBooks(booksToDisplay) {
    const container = document.getElementById('categoryContainer');
    container.innerHTML = '';

    if (!booksToDisplay || booksToDisplay.length === 0) {
        container.innerHTML = '<h3 style="color:gray; text-align:center; margin-top:50px;">No books found.</h3>';
        return;
    }

    const categories = {};
    booksToDisplay.forEach(book => {
        let cat = (book.category && typeof book.category === 'string') ? book.category.trim().toLowerCase() : 'uncategorized';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(book);
    });

    Object.keys(categories).forEach(category => {
        let displayName = category.charAt(0).toUpperCase() + category.slice(1);
        container.innerHTML += `<h2>${displayName}</h2><div class="books-container">`;
        categories[category].forEach(book => {
            container.innerHTML += generateBookCard(book);
        });
        container.innerHTML += `</div><hr>`;
    });
}

function viewBook(bookId) { window.location.href = `/books/${bookId}/`; }

document.addEventListener('click', function (e) {
    if (e.target.classList.contains('borrow_btn_script')) {
        borrowBook(e.target.getAttribute('data-id'));
    }
});

function borrowBook(bookId) {
    fetch(`/books/${bookId}/borrow/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
    .then(res => {
        if(res.ok) { alert("Borrowed!"); location.reload(); }
        else alert("Action failed.");
    });
}

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