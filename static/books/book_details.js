window.addEventListener('load', () => {
    const pathArray = window.location.pathname.split('/').filter(Boolean);
    const bookId = pathArray[pathArray.length - 1];

    if (!bookId || isNaN(bookId)) {
        document.querySelector('.details-content').innerHTML = '<p style="color: red;">Invalid Book ID!</p>';
        return;
    }

    fetch(`/api/books/${bookId}/`)
        .then(response => {
            if (!response.ok) throw new Error('Book not found');
            return response.json();
        })
        .then(book => {
            document.getElementById('bookTitle').textContent = book.name;
            document.getElementById('bookAuthor').textContent = book.author;
            document.getElementById('bookCategory').textContent = book.category;
            document.getElementById('bookDescription').textContent = book.description;
            
            const img = document.getElementById('bookImage');
            img.src = book.image || 'https://via.placeholder.com/120?text=No+Image';
            img.alt = book.name;
        })
        .catch(error => {
            console.error('Error:', error);
            document.querySelector('.details-content').innerHTML = '<p style="color: red;">Book details not found.</p>';
        });
});