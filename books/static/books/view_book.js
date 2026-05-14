let allBooks = [];

window.addEventListener('load', () => {
    fetchBooks();
});

function fetchBooks() {
    const container = document.getElementById('categoryContainer');
    container.innerHTML = '<p style="text-align:center; color:#888;">جاري تحميل الكتب...</p>';

    fetch('/api/books/')
        .then(res => res.json())
        .then(data => {
            allBooks = data;
            displayBooks(allBooks);
        })
        .catch(err => {
            console.error("Fetch error:", err);
            container.innerHTML = '<p style="color:red; text-align:center;">Error loading books.</p>';
        });
}

// دالة السيرش اللحظي المضادة للتهنيج
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
        displayBooks(allBooks);
        return;
    }

    const filteredBooks = allBooks.filter(book => {
        const nameMatch = book.name && book.name.toLowerCase().includes(query);
        const authorMatch = book.author && book.author.toLowerCase().includes(query);
        const catMatch = book.category && book.category.toLowerCase().includes(query);
        
        return nameMatch || authorMatch || catMatch;
    });

    displayBooks(filteredBooks);
}

function generateBookCard(book) {
    const isUserAdmin = (typeof isAdmin !== 'undefined') ? isAdmin : false;
    let borrowBtn = '';
    
    if (!isUserAdmin) {
        borrowBtn = book.isBorrowed
            ? `<button disabled style="opacity:0.5; background: #ccc;">Not Available</button>`
            : `<button class="borrow_btn_script" data-id="${book.id}">Borrow</button>`;
    }

    return `
        <div class="book-card" style="width: 200px; flex: 0 0 auto; margin: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 10px; text-align: center;">
            <img src="${book.image || 'https://via.placeholder.com/120'}" alt="Cover" style="width: 100%; height: 180px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://via.placeholder.com/120'">
            <h3 style="font-size: 1.1em; margin: 10px 0;">${book.name || 'No Title'}</h3>
            <p style="font-size: 0.9em; color: #ccc; margin-bottom: 10px;">Author: ${book.author || 'Unknown'}</p>
            <div class="card-buttons">
                <button class="view-btn" onclick="viewBook(${book.id})" style="padding: 5px 10px; cursor: pointer;">View</button>
                ${borrowBtn}
            </div>
        </div>
    `;
}

function displayBooks(booksToDisplay) {
    const container = document.getElementById('categoryContainer');
    container.innerHTML = '';

    if (!booksToDisplay || booksToDisplay.length === 0) {
        container.innerHTML = '<h3 style="color:gray; text-align:center; margin-top:50px;">No books found matching your search.</h3>';
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
        
        // حطيت الـ Flexbox ستايل هنا مباشرة جوه الـ JS عشان نضمن العرض 100% حتى لو الـ CSS زعل
        let sectionHTML = `<h2>${displayName}</h2>`;
        sectionHTML += `<div class="books-container" style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: flex-start; padding: 20px 0;">`;
        
        categories[category].forEach(book => {
            sectionHTML += generateBookCard(book);
        });

        sectionHTML += `</div><hr>`;
        container.innerHTML += sectionHTML;
    });
}

function viewBook(bookId) {
    window.location.href = `/books/${bookId}/`;
}

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
        if(res.ok) { alert("Borrowed successfully!"); location.reload(); }
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