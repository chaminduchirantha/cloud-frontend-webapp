'use client';

import { useState, useEffect, FormEvent, SyntheticEvent } from 'react';

// Data Models
interface Book {
  id: string;
  name?: string;
  title?: string;
  author?: string;
  category?: string;
  totalQty?: number;
  availableQty?: number;
  imageUrl?: string;
}

interface BorrowForm {
  userId: string;
  userName: string;
  borrowDate: string;
  returnDate: string;
}

interface BorrowPayload extends BorrowForm {
  bookName: string;
  status: string;
}

export default function UserDashboard() {
  // Backend Service Endpoints
  const BOOK_API = '/api/v1/book';
  const BORROW_API = '/api/v1/borrowing';

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for Borrowing
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Borrow Form State
  const [borrowForm, setBorrowForm] = useState<BorrowForm>({
    userId: '',
    userName: '',
    borrowDate: new Date().toISOString().split('T')[0],
    returnDate: '',
  });

  // Fetch All Books from Backend
  const fetchBooks = async (): Promise<void> => {
    setLoading(true);
    try {
      // GET request සදහා headers අවශ්‍ය නොවේ (CORS Preflight Issue වැලැක්වීමට)
      const res = await fetch(`${BOOK_API}/all`, {
        method: 'GET',
      });

      if (!res.ok) {
        throw new Error(`Server status: ${res.status}`);
      }

      const data: Book[] = await res.json();
      setBooks(data);
    } catch (err) {
      console.error('Failed to load books from backend:', err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Open Borrow Modal
  const handleOpenBorrowModal = (book: Book): void => {
    setSelectedBook(book);
    setBorrowForm({
      userId: '',
      userName: '',
      borrowDate: new Date().toISOString().split('T')[0],
      returnDate: '',
    });
    setIsModalOpen(true);
  };

  // Submit Borrowing Request
  const handleBorrowSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!selectedBook) return;

    setSubmitting(true);

    const payload: BorrowPayload = {
      userId: borrowForm.userId,
      userName: borrowForm.userName,
      bookName: selectedBook.title || selectedBook.name || 'Untitled Book',
      borrowDate: borrowForm.borrowDate,
      returnDate: borrowForm.returnDate,
      status: 'BORROWED',
    };

    try {
      const res = await fetch(`${BORROW_API}/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(`Successfully borrowed "${payload.bookName}"!`);
        setIsModalOpen(false);
        fetchBooks();
      } else {
        alert('Failed to place borrowing request.');
      }
    } catch (err) {
      console.error('Error submitting borrow request:', err);
      alert('Network error while placing borrow request.');
    } finally {
      setSubmitting(false);
    }
  };

  // Image Fallback Handler
  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>): void => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'https://via.placeholder.com/300x400?text=No+Cover';
  };

  // Search Filter Logic
  const filteredBooks = books.filter(
    (b) =>
      b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Search Bar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Library Book Store</h1>
            <p className="text-sm text-gray-500">Explore books and issue borrowing requests instantly</p>
          </div>

          <div className="w-full md:w-96 flex gap-2">
            <input
              type="text"
              placeholder="Search by title, author, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={fetchBooks}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Books Cards Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-medium">Loading available books...</div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 text-gray-400">
            No books found or backend service is offline.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBooks.map((book) => {
              const isAvailable = (book.availableQty ?? 0) > 0;

              return (
                <div
                  key={book.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition duration-200 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Book Image */}
                    <div className="h-56 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                      {book.imageUrl ? (
                        <img
                          src={book.imageUrl}
                          alt={book.title || book.name || 'Book Cover'}
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="text-gray-400 text-xs font-medium">No Image Available</div>
                      )}
                      <span className="absolute top-3 right-3 bg-black/70 text-white text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full backdrop-blur-sm">
                        {book.category || 'General'}
                      </span>
                    </div>

                    {/* Book Details */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-gray-800 text-lg line-clamp-1">
                        {book.title || book.name || 'Untitled Book'}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">
                        By {book.author || 'Unknown Author'}
                      </p>

                      <div className="pt-2 flex justify-between items-center text-xs text-gray-600">
                        <span>Available: <strong className="text-gray-800">{book.availableQty ?? 0}</strong></span>
                        <span>Total: <strong className="text-gray-800">{book.totalQty ?? 0}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Borrow Action Button */}
                  <div className="p-4 pt-0">
                    <button
                      disabled={!isAvailable}
                      onClick={() => handleOpenBorrowModal(book)}
                      className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${
                        isAvailable
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isAvailable ? 'Borrow Book' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Borrowing Modal */}
      {isModalOpen && selectedBook && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            
            <div className="bg-gray-50 p-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800">Borrow Book</h3>
                <p className="text-xs text-blue-600 font-medium">{selectedBook.title || selectedBook.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBorrowSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. U001"
                  value={borrowForm.userId}
                  onChange={(e) => setBorrowForm({ ...borrowForm, userId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  User Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Perera"
                  value={borrowForm.userName}
                  onChange={(e) => setBorrowForm({ ...borrowForm, userName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Borrow Date
                  </label>
                  <input
                    type="date"
                    required
                    value={borrowForm.borrowDate}
                    onChange={(e) => setBorrowForm({ ...borrowForm, borrowDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Return Date
                  </label>
                  <input
                    type="date"
                    required
                    value={borrowForm.returnDate}
                    onChange={(e) => setBorrowForm({ ...borrowForm, returnDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition shadow-sm"
                >
                  {submitting ? 'Confirming...' : 'Confirm Borrow'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}