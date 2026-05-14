// ─── Helpers ────────────────────────────────────────────────────────────────

function getCsrfToken() {
    var cookie = document.cookie.split(';');
    for (var i = 0; i < cookie.length; i++) {
        var c = cookie[i].trim();
        if (c.startsWith('csrftoken=')) return c.substring('csrftoken='.length);
    }
    var input = document.querySelector('[name=csrfmiddlewaretoken]');
    return input ? input.value : '';
}

var currentBookId   = null;
var originalBook    = null;
var pendingDeleteId = null;

// ─── Sort ────────────────────────────────────────────────────────────────────

function getSortedBooks(books) {
    var sortVal = document.getElementById('sortSelect').value;
    var sorted  = books.slice();

    if (sortVal === 'newest') {
        sorted.sort(function(a, b) { return b.id - a.id; });
    } else if (sortVal === 'oldest') {
        sorted.sort(function(a, b) { return a.id - b.id; });
    } else if (sortVal === 'az') {
        sorted.sort(function(a, b) { return a.name.toLowerCase().localeCompare(b.name.toLowerCase()); });
    } else if (sortVal === 'za') {
        sorted.sort(function(a, b) { return b.name.toLowerCase().localeCompare(a.name.toLowerCase()); });
    } else if (sortVal === 'categoryAZ') {
        sorted.sort(function(a, b) { return a.category.toLowerCase().localeCompare(b.category.toLowerCase()); });
    } else if (sortVal === 'categoryZA') {
        sorted.sort(function(a, b) { return b.category.toLowerCase().localeCompare(a.category.toLowerCase()); });
    }

    return sorted;
}

// ─── Render Table ────────────────────────────────────────────────────────────

function renderTable() {
    fetch('/api/books/')
        .then(function(res) { return res.json(); })
        .then(function(books) {
            var tbody  = document.getElementById('booksTableBody');
            var noMsg  = document.getElementById('noBooksMessage');
            tbody.innerHTML = '';

            if (!books || books.length === 0) {
                noMsg.style.display = 'block';
                return;
            }
            noMsg.style.display = 'none';

            var sorted = getSortedBooks(books);

            sorted.forEach(function(book) {
                var borrowed = book.isBorrowed;

                var editBtnHtml = '<button class="edit-btn" onclick="handleEdit(' + book.id + ')"';
                if (borrowed) editBtnHtml += ' style="opacity:0.5;cursor:not-allowed;" title="Book is borrowed"';
                editBtnHtml += '>Edit</button>';

                var deleteBtnHtml = '<button class="delete-btn" onclick="handleDelete(' + book.id + ')"';
                if (borrowed) deleteBtnHtml += ' style="opacity:0.5;cursor:not-allowed;" title="Book is borrowed"';
                deleteBtnHtml += '>Delete</button>';

                var tr = document.createElement('tr');
                tr.innerHTML =
                    '<td>' + book.id       + '</td>' +
                    '<td>' + book.name     + '</td>' +
                    '<td>' + book.author   + '</td>' +
                    '<td>' + book.category + '</td>' +
                    '<td>' + editBtnHtml + ' ' + deleteBtnHtml + '</td>';

                tbody.appendChild(tr);
            });
        })
        .catch(function(err) {
            console.error('Error loading books:', err);
        });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

function handleDelete(bookId) {
    fetch('/api/books/' + bookId + '/')
        .then(function(res) { return res.json(); })
        .then(function(book) {
            if (book.isBorrowed) {
                alert('Cannot delete. This book is currently borrowed.');
                return;
            }
            pendingDeleteId = bookId;
            document.getElementById('deleteWarningText').textContent =
                'Are you sure you want to delete "' + book.name + '"?';
            document.getElementById('deleteModal').style.display = 'flex';
        });
}

function confirmDelete() {
    fetch('/api/books/' + pendingDeleteId + '/delete/', {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': getCsrfToken()
        }
    })
    .then(function(res) {
        if (res.ok) {
            closeDeleteModal();
            renderTable();
        } else {
            alert('Failed to delete the book.');
        }
    })
    .catch(function(err) {
        console.error('Delete error:', err);
    });
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    pendingDeleteId = null;
}

// ─── Edit ────────────────────────────────────────────────────────────────────

function handleEdit(bookId) {
    fetch('/api/books/' + bookId + '/')
        .then(function(res) { return res.json(); })
        .then(function(book) {
            if (book.isBorrowed) {
                alert('Cannot edit. This book is currently borrowed.');
                return;
            }

            currentBookId = bookId;
            originalBook  = {
                name:        book.name,
                author:      book.author,
                category:    book.category,
                description: book.description,
                image:       book.image
            };

            document.getElementById('editName').value        = book.name;
            document.getElementById('editAuthor').value      = book.author;
            document.getElementById('editDescription').value = book.description;
            document.getElementById('editImage').value       = book.image;

            var select = document.getElementById('editCategory');
            for (var i = 0; i < select.options.length; i++) {
                if (select.options[i].value.toLowerCase() === book.category.trim().toLowerCase()) {
                    select.selectedIndex = i;
                    break;
                }
            }

            document.getElementById('editMessage').textContent = '';
            document.getElementById('editModal').style.display = 'flex';
        });
}

function applyChanges() {
    var editMessage  = document.getElementById('editMessage');

    var newName        = document.getElementById('editName').value.trim();
    var newAuthor      = document.getElementById('editAuthor').value.trim();
    var newCategory    = document.getElementById('editCategory').value;
    var newDescription = document.getElementById('editDescription').value.trim();
    var newImage       = document.getElementById('editImage').value.trim();

    if (newName        === originalBook.name        &&
        newAuthor      === originalBook.author      &&
        newCategory    === originalBook.category    &&
        newDescription === originalBook.description &&
        newImage       === originalBook.image) {

        editMessage.style.color = 'red';
        editMessage.textContent = 'No changes have been applied.';
        return;
    }

    var payload = {
        name:        newName,
        author:      newAuthor,
        category:    newCategory,
        description: newDescription,
        image:       newImage
    };

    fetch('/api/books/' + currentBookId + '/edit/', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken':  getCsrfToken()
        },
        body: JSON.stringify(payload)
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (data.success) {
            editMessage.style.color = 'green';
            editMessage.textContent = 'Changes applied successfully!';
            renderTable();
        } else {
            editMessage.style.color = 'red';
            editMessage.textContent = data.error || 'Something went wrong.';
        }
    })
    .catch(function(err) {
        console.error('Edit error:', err);
    });
}

function cancelEdit() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('editMessage').textContent = '';
}

// ─── Close modals on outside click ───────────────────────────────────────────

document.getElementById('deleteModal').onclick = function(e) {
    if (e.target === this) closeDeleteModal();
};

document.getElementById('editModal').onclick = function(e) {
    if (e.target === this) cancelEdit();
};

// ─── Init ─────────────────────────────────────────────────────────────────────

renderTable();