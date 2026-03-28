import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Pencil, Trash2, Eye, BookOpen } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import {
  getBooks, searchBooks, createBook,
  updateBook, deleteBook, getCategories
} from '../../api/books'
import Modal from '../../components/Modal/Modal'
import styles from './Books.module.css'

const emptyForm = {
  title: '', author: '', isbn: '',
  category_id: '', total_copies: 1,
  available_copies: 1, published_at: ''
}

export default function Books() {
  const { token, isStaff } = useAuth()

  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [modalAdd, setModalAdd] = useState(false)
  const [modalEdit, setModalEdit] = useState(false)
  const [modalDelete, setModalDelete] = useState(false)
  const [modalDetail, setModalDetail] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const fetchBooks = useCallback(async () => {
    try {
      const data = search
        ? await searchBooks(token, { title: search })
        : await getBooks(token)
      setBooks(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [token, search])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  useEffect(() => {
    if (!isStaff()) return
    getCategories(token).then(setCategories).catch(console.error)
  }, [isStaff, token])

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await createBook(token, {
        ...form,
        total_copies: parseInt(form.total_copies),
        available_copies: parseInt(form.available_copies),
        category_id: form.category_id ? parseInt(form.category_id) : null,
        published_at: form.published_at || null
      })
      setModalAdd(false)
      setForm(emptyForm)
      fetchBooks()
    } catch (err) {
      setError(err.response?.data?.detail || 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditOpen = (book) => {
    setSelectedBook(book)
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category_id: book.category_id || '',
      total_copies: book.total_copies,
      available_copies: book.available_copies,
      published_at: book.published_at || ''
    })
    setModalEdit(true)
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await updateBook(token, selectedBook.id, {
        ...form,
        total_copies: parseInt(form.total_copies),
        available_copies: parseInt(form.available_copies),
        category_id: form.category_id ? parseInt(form.category_id) : null,
        published_at: form.published_at || null
      })
      setModalEdit(false)
      fetchBooks()
    } catch (err) {
      setError(err.response?.data?.detail || 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteOpen = (book) => {
    setSelectedBook(book)
    setModalDelete(true)
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await deleteBook(token, selectedBook.id)
      setModalDelete(false)
      fetchBooks()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className={styles.loading}>Chargement...</div>

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.title}>Catalogue des livres</h1>
        {isStaff() && (
          <button className={styles.btnPrimary} onClick={() => {
            setForm(emptyForm)
            setError(null)
            setModalAdd(true)
          }}>
            <Plus size={16} />
            Ajouter un livre
          </button>
        )}
      </div>

      <div className={styles.searchBar}>
        <Search size={16} className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          placeholder="Rechercher par titre..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Auteur</th>
              <th>ISBN</th>
              <th>Catégorie</th>
              <th>Disponibles</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  Aucun livre trouvé.
                </td>
              </tr>
            ) : books.map(book => (
              <tr key={book.id}>
                <td className={styles.bookTitle}>{book.title}</td>
                <td className={styles.muted}>{book.author}</td>
                <td className={styles.muted}>{book.isbn}</td>
                <td className={styles.muted}>
                  {book.category?.name || '—'}
                </td>
                <td>
                  <span className={
                    book.available_copies === 0
                      ? styles.copiesDanger
                      : styles.copiesOk
                  }>
                    {book.available_copies} / {book.total_copies}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => { setSelectedBook(book); setModalDetail(true) }}
                      title="Voir le détail"
                    >
                      <Eye size={14} />
                    </button>
                    {isStaff() && (
                      <>
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleEditOpen(book)}
                          title="Modifier"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.danger}`}
                          onClick={() => handleDeleteOpen(book)}
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Ajout */}
      <Modal
        isOpen={modalAdd}
        onClose={() => setModalAdd(false)}
        title="Ajouter un livre"
      >
        <BookForm
          form={form}
          categories={categories}
          onChange={handleFormChange}
          onSubmit={handleAdd}
          onCancel={() => setModalAdd(false)}
          submitting={submitting}
          error={error}
          submitLabel="Ajouter"
        />
      </Modal>

      {/* Modal Modification */}
      <Modal
        isOpen={modalEdit}
        onClose={() => setModalEdit(false)}
        title="Modifier le livre"
      >
        <BookForm
          form={form}
          categories={categories}
          onChange={handleFormChange}
          onSubmit={handleEdit}
          onCancel={() => setModalEdit(false)}
          submitting={submitting}
          error={error}
          submitLabel="Enregistrer"
        />
      </Modal>

      {/* Modal Suppression */}
      <Modal
        isOpen={modalDelete}
        onClose={() => setModalDelete(false)}
        title="Supprimer le livre"
        size="sm"
      >
        <p className={styles.deleteText}>
          Voulez-vous vraiment supprimer <strong>{selectedBook?.title}</strong> ?
          Cette action est irréversible.
        </p>
        <div className={styles.deleteActions}>
          <button
            className={styles.btnOutline}
            onClick={() => setModalDelete(false)}
          >
            Annuler
          </button>
          <button
            className={styles.btnDanger}
            onClick={handleDelete}
            disabled={submitting}
          >
            {submitting ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </Modal>
      {/* Modal detail */}
      <Modal
        isOpen={modalDetail}
        onClose={() => setModalDetail(false)}
        title="Détail du livre"
        size="lg"
      >
        {selectedBook && (
          <div className={styles.detailGrid}>
            <div className={styles.detailCover}>
              <BookOpen size={80} color="var(--color-primary)" strokeWidth={1} />
              <span className={styles.detailIsbn}>ISBN — {selectedBook.isbn}</span>
            </div>
            <div className={styles.detailInfo}>
              <h2 className={styles.detailTitle}>{selectedBook.title}</h2>
              <p className={styles.detailAuthor}>{selectedBook.author}</p>
              <div className={styles.detailDivider} />
              <div className={styles.detailRows}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Catégorie</span>
                  <span className={styles.detailValue}>{selectedBook.category?.name || '—'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Publication</span>
                  <span className={styles.detailValue}>{selectedBook.published_at || '—'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Total exemplaires</span>
                  <span className={styles.detailValue}>{selectedBook.total_copies}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Disponibles</span>
                  <span className={selectedBook.available_copies === 0 ? styles.copiesDanger : styles.copiesOk}>
                    {selectedBook.available_copies}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function BookForm({ form, categories, onChange, onSubmit, onCancel, submitting, error, submitLabel }) {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label className={styles.label}>Titre *</label>
          <input name="title" className={styles.input} value={form.title} onChange={onChange} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Auteur *</label>
          <input name="author" className={styles.input} value={form.author} onChange={onChange} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>ISBN *</label>
          <input name="isbn" className={styles.input} value={form.isbn} onChange={onChange} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Catégorie</label>
          <select name="category_id" className={styles.input} value={form.category_id} onChange={onChange}>
            <option value="">— Aucune —</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Total exemplaires *</label>
          <input name="total_copies" type="number" min="1" className={styles.input} value={form.total_copies} onChange={onChange} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Exemplaires disponibles *</label>
          <input name="available_copies" type="number" min="0" className={styles.input} value={form.available_copies} onChange={onChange} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Date de publication</label>
          <input name="published_at" type="date" className={styles.input} value={form.published_at} onChange={onChange} />
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formActions}>
        <button type="button" className={styles.btnOutline} onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" className={styles.btnPrimary} disabled={submitting}>
          {submitting ? 'Enregistrement...' : submitLabel}
        </button>
      </div>
    </form>
  )
}