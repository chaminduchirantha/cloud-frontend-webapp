'use client';

import Link from 'next/link';
import { useState, useEffect, FormEvent, ChangeEvent, SyntheticEvent } from 'react';

// --- Type Definitions ---
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

interface BookFormData {
  title: string;
  name: string;
  author: string;
  category: string;
  totalQty: number | string;
  availableQty: number | string;
}

interface BorrowRecord {
  id: number | string;
  userId: string;
  userName: string;
  bookName: string;
  borrowDate: string;
  returnDate: string;
  status: string;
}

interface BorrowFormData {
  userId: string;
  userName: string;
  bookName: string;
  borrowDate: string;
  returnDate: string;
  status: string;
}

const ITEMS_PER_PAGE = 8; 

export default function LibrarianDashboard() {
  const BOOK_API = '/api/v1/book';
  const BORROW_API = '/api/v1/borrowing';

  const [activeTab, setActiveTab] = useState<'books' | 'borrowings'>('books');

  const [books, setBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState<boolean>(false);
  const [bookSearch, setBookSearch] = useState<string>('');
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bookPage, setBookPage] = useState<number>(1);

  const [bookFormData, setBookFormData] = useState<BookFormData>({
    title: '',
    name: '',
    author: '',
    category: '',
    totalQty: '',
    availableQty: '',
  });

  const [borrowings, setBorrowings] = useState<BorrowRecord[]>([]);
  const [loadingBorrowings, setLoadingBorrowings] = useState<boolean>(false);
  const [borrowSearch, setBorrowSearch] = useState<string>('');
  const [borrowPage, setBorrowPage] = useState<number>(1);

  const [borrowFormData, setBorrowFormData] = useState<BorrowFormData>({
    userId: '',
    userName: '',
    bookName: '',
    borrowDate: new Date().toISOString().split('T')[0],
    returnDate: '',
    status: 'BORROWED',
  });

  const fetchBooks = async (): Promise<void> => {
    setLoadingBooks(true);
    try {
      const res = await fetch(`${BOOK_API}/all`);
      if (res.ok) {
        const data: Book[] = await res.json();
        setBooks(data);
      }
    } catch (err) {
      console.error('Failed to fetch books:', err);
    } finally {
      setLoadingBooks(false);
    }
  };

  const fetchBorrowings = async (): Promise<void> => {
    setLoadingBorrowings(true);
    try {
      const res = await fetch(`${BORROW_API}/all`);
      if (res.ok) {
        const data: BorrowRecord[] = await res.json();
        setBorrowings(data);
      }
    } catch (err) {
      console.error('Failed to fetch borrowings:', err);
    } finally {
      setLoadingBorrowings(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchBorrowings();
  }, []);

  // Reset page when search term changes
  useEffect(() => { setBookPage(1); }, [bookSearch]);
  useEffect(() => { setBorrowPage(1); }, [borrowSearch]);

  const handleBookSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', bookFormData.title);
    formData.append('name', bookFormData.name || bookFormData.title);
    formData.append('author', bookFormData.author);
    formData.append('category', bookFormData.category);
    formData.append('totalQty', String(bookFormData.totalQty));
    formData.append('availableQty', String(bookFormData.availableQty));

    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      const url = editingBookId ? `${BOOK_API}/${editingBookId}` : `${BOOK_API}/create`;
      const method = editingBookId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        body: formData, 
      });

      if (res.ok) {
        alert(editingBookId ? 'Book updated successfully!' : 'Book added successfully!');
        resetBookForm();
        fetchBooks();
      } else {
        alert('Failed to save book record.');
      }
    } catch (err) {
      console.error('Error saving book:', err);
      alert('Network error while saving book.');
    }
  };

  const handleEditBook = (book: Book): void => {
    setEditingBookId(book.id);
    setBookFormData({
      title: book.title || book.name || '',
      name: book.name || book.title || '',
      author: book.author || '',
      category: book.category || '',
      totalQty: book.totalQty ?? '',
      availableQty: book.availableQty ?? '',
    });
    setSelectedFile(null);
  };

  const handleDeleteBook = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
      const res = await fetch(`${BOOK_API}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Book deleted successfully!');
        fetchBooks();
      }
    } catch (err) {
      console.error('Error deleting book:', err);
    }
  };

  const resetBookForm = (): void => {
    setEditingBookId(null);
    setSelectedFile(null);
    setBookFormData({
      title: '',
      name: '',
      author: '',
      category: '',
      totalQty: '',
      availableQty: '',
    });
  };

  const handleBorrowSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const res = await fetch(`${BORROW_API}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(borrowFormData),
      });

      if (res.ok) {
        alert('Borrow record created!');
        setBorrowFormData({
          userId: '',
          userName: '',
          bookName: '',
          borrowDate: new Date().toISOString().split('T')[0],
          returnDate: '',
          status: 'BORROWED',
        });
        fetchBorrowings();
      } else {
        alert('Failed to create record.');
      }
    } catch (err) {
      console.error('Error creating borrow record:', err);
    }
  };

  const handleDeleteBorrow = async (id: number | string): Promise<void> => {
    if (!confirm('Delete this borrowing record?')) return;
    try {
      const res = await fetch(`${BORROW_API}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Record deleted!');
        fetchBorrowings();
      }
    } catch (err) {
      console.error('Error deleting borrow record:', err);
    }
  };

  // Filter Books
  const filteredBooks = books.filter(
    (b) =>
      b.title?.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author?.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.category?.toLowerCase().includes(bookSearch.toLowerCase())
  );
  const totalBookPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE) || 1;
  const paginatedBooks = filteredBooks.slice((bookPage - 1) * ITEMS_PER_PAGE, bookPage * ITEMS_PER_PAGE);

  // Filter Borrowings
  const filteredBorrowings = borrowings.filter(
    (item) =>
      item.userId?.toLowerCase().includes(borrowSearch.toLowerCase()) ||
      item.userName?.toLowerCase().includes(borrowSearch.toLowerCase()) ||
      item.bookName?.toLowerCase().includes(borrowSearch.toLowerCase())
  );
  const totalBorrowPages = Math.ceil(filteredBorrowings.length / ITEMS_PER_PAGE) || 1;
  const paginatedBorrowings = filteredBorrowings.slice(
    (borrowPage - 1) * ITEMS_PER_PAGE,
    borrowPage * ITEMS_PER_PAGE
  );

  const getStatusBadge = (status: string): string => {
    switch (status?.toUpperCase()) {
      case 'RETURNED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'OVERDUE':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Librarian Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Manage catalog books, inventory, and user borrowing operations</p>
          </div>

          <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl">
            <button
              onClick={() => setActiveTab('books')}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition ${
                activeTab === 'books'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📚 Books Inventory
            </button>
            <button
              onClick={() => setActiveTab('borrowings')}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition ${
                activeTab === 'borrowings'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Borrowing Records
            </button>
          </div>
        </div>

        {activeTab === 'books' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Book Form Side */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                  {editingBookId ? 'Edit Book Record' : 'Add New Book'}
                </h2>
                {editingBookId && (
                  <button
                    onClick={resetBookForm}
                    className="text-xs text-red-500 hover:underline font-semibold"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleBookSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Book Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Java Spring Boot Guide"
                    value={bookFormData.title}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setBookFormData({ ...bookFormData, title: e.target.value, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Author</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Joshua Bloch"
                    value={bookFormData.author}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setBookFormData({ ...bookFormData, author: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Programming / Technology"
                    value={bookFormData.category}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setBookFormData({ ...bookFormData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Total Qty</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="10"
                      value={bookFormData.totalQty}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setBookFormData({ ...bookFormData, totalQty: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Available Qty</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="8"
                      value={bookFormData.availableQty}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setBookFormData({ ...bookFormData, availableQty: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Book Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-sm"
                >
                  {editingBookId ? 'Update Book Details' : 'Save Book to Catalog'}
                </button>
              </form>
            </div>

            {/* Book Table Side */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex gap-2 bg-white p-3 rounded-2xl shadow-sm border border-gray-200">
                <input
                  type="text"
                  placeholder="Filter books by title, author, or category..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={fetchBooks}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  Refresh
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {loadingBooks ? (
                  <div className="p-12 text-center text-gray-500">Loading books...</div>
                ) : filteredBooks.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">No books found in catalog.</div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                            <th className="py-3 px-4">Cover</th>
                            <th className="py-3 px-4">Title & Author</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4">Available</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                          {paginatedBooks.map((b) => (
                            <tr key={b.id} className="hover:bg-gray-50/50 transition">
                              <td className="py-2.5 px-4">
                                <img
                                  src={b.imageUrl || 'https://via.placeholder.com/80x100?text=No+Cover'}
                                  alt={b.title}
                                  className="w-10 h-12 object-cover rounded-md border border-gray-200"
                                  onError={(e: SyntheticEvent<HTMLImageElement>) => {
                                    e.currentTarget.src = 'https://via.placeholder.com/80x100?text=No+Cover';
                                  }}
                                />
                              </td>
                              <td className="py-2.5 px-4">
                                <div className="font-bold text-gray-900">{b.title || b.name}</div>
                                <div className="text-xs text-gray-500">By {b.author}</div>
                              </td>
                              <td className="py-2.5 px-4">
                                <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">
                                  {b.category}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 font-semibold text-gray-800">
                                {b.availableQty} / <span className="text-gray-400 font-normal">{b.totalQty}</span>
                              </td>
                              <td className="py-2.5 px-4 text-right space-x-2">
                                <button
                                  onClick={() => handleEditBook(b)}
                                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteBook(b.id)}
                                  className="text-red-500 hover:text-red-700 text-xs font-semibold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls for Books */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-600">
                      <span>
                        Page <strong>{bookPage}</strong> of <strong>{totalBookPages}</strong> (Total {filteredBooks.length} items)
                      </span>
                      <div className="flex gap-2">
                        <button
                          disabled={bookPage === 1}
                          onClick={() => setBookPage((prev) => prev - 1)}
                          className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg disabled:opacity-50 font-semibold"
                        >
                          Previous
                        </button>
                        <button
                          disabled={bookPage === totalBookPages}
                          onClick={() => setBookPage((prev) => prev + 1)}
                          className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg disabled:opacity-50 font-semibold"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: BORROWINGS MANAGEMENT */}
        {activeTab === 'borrowings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Borrow Form Side */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Issue New Borrow Record</h2>
              <form onSubmit={handleBorrowSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">User ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. U001"
                      value={borrowFormData.userId}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setBorrowFormData({ ...borrowFormData, userId: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">User Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nimal Perera"
                      value={borrowFormData.userName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setBorrowFormData({ ...borrowFormData, userName: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Book Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Madol Doova"
                    value={borrowFormData.bookName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setBorrowFormData({ ...borrowFormData, bookName: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Borrow Date</label>
                    <input
                      type="date"
                      required
                      value={borrowFormData.borrowDate}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setBorrowFormData({ ...borrowFormData, borrowDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Return Date</label>
                    <input
                      type="date"
                      required
                      value={borrowFormData.returnDate}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setBorrowFormData({ ...borrowFormData, returnDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Status</label>
                  <select
                    value={borrowFormData.status}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setBorrowFormData({ ...borrowFormData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="BORROWED">BORROWED</option>
                    <option value="RETURNED">RETURNED</option>
                    <option value="OVERDUE">OVERDUE</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-sm"
                >
                  Confirm Borrow Issue
                </button>
              </form>
            </div>

            {/* Borrow Table Side */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex gap-2 bg-white p-3 rounded-2xl shadow-sm border border-gray-200">
                <input
                  type="text"
                  placeholder="Search by User ID, User Name, or Book Name..."
                  value={borrowSearch}
                  onChange={(e) => setBorrowSearch(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={fetchBorrowings}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  Refresh
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {loadingBorrowings ? (
                  <div className="p-12 text-center text-gray-500">Loading borrow records...</div>
                ) : filteredBorrowings.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">No borrowing records found.</div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                            <th className="py-3 px-4">User</th>
                            <th className="py-3 px-4">Book Name</th>
                            <th className="py-3 px-4">Borrow Date</th>
                            <th className="py-3 px-4">Return Date</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                          {paginatedBorrowings.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50 transition">
                              <td className="py-3 px-4">
                                <div className="font-bold text-gray-900">{item.userName || '—'}</div>
                                <div className="text-xs text-gray-400">ID: {item.userId}</div>
                              </td>
                              <td className="py-3 px-4 font-semibold text-blue-600">{item.bookName}</td>
                              <td className="py-3 px-4">{item.borrowDate || '—'}</td>
                              <td className="py-3 px-4">{item.returnDate || '—'}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(item.status)}`}>
                                  {item.status || 'BORROWED'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => handleDeleteBorrow(item.id)}
                                  className="text-red-500 hover:text-red-700 text-xs font-semibold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls for Borrowings */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-600">
                      <span>
                        Page <strong>{borrowPage}</strong> of <strong>{totalBorrowPages}</strong> (Total {filteredBorrowings.length} items)
                      </span>
                      <div className="flex gap-2">
                        <button
                          disabled={borrowPage === 1}
                          onClick={() => setBorrowPage((prev) => prev - 1)}
                          className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg disabled:opacity-50 font-semibold"
                        >
                          Previous
                        </button>
                        <button
                          disabled={borrowPage === totalBorrowPages}
                          onClick={() => setBorrowPage((prev) => prev + 1)}
                          className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg disabled:opacity-50 font-semibold"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}