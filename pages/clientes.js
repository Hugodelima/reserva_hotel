import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import styles from '../src/styles/Crud.module.css'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Verificar se está logado
    if (typeof window !== 'undefined') {
      const isLoggedIn = sessionStorage.getItem('isLoggedIn')
      if (!isLoggedIn) {
        router.push('/')
        return
      }
    }
    
    fetchClientes()
  }, [router])

  const fetchClientes = async () => {
    try {
      const response = await fetch('/api/clientes')
      const data = await response.json()
      setClientes(data)
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/clientes/${editingId}` : '/api/clientes'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email }),
      })

      if (response.ok) {
        setNome('')
        setEmail('')
        setEditingId(null)
        fetchClientes()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao salvar cliente')
      }
    } catch (error) {
      setError('Erro ao salvar cliente')
    }
  }

  const handleEdit = (cliente) => {
    setNome(cliente.nome)
    setEmail(cliente.email)
    setEditingId(cliente.id)
  }

  const handleDelete = async (id) => {
    if (confirm('Deseja realmente excluir este cliente?')) {
      try {
        await fetch(`/api/clientes/${id}`, {
          method: 'DELETE',
        })
        fetchClientes()
      } catch (error) {
        console.error('Erro ao excluir cliente:', error)
      }
    }
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('isLoggedIn')
    }
    router.push('/')
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navBrand}>
          <h2>Hotel Management</h2>
        </div>
        <div className={styles.navLinks}>
          <Link href="/dashboard" className={styles.navLink}>
            Dashboard
          </Link>
          <Link href="/clientes" className={`${styles.navLink} ${styles.active}`}>
            Clientes
          </Link>
          <Link href="/quartos" className={styles.navLink}>
            Quartos
          </Link>
          <Link href="/reservas" className={styles.navLink}>
            Reservas
          </Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Sair
          </button>
        </div>
      </nav>

      <main className={styles.main}>
        <h1>Gerenciamento de Clientes</h1>

        <div className={styles.formSection}>
          <h2>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="nome">Nome:</label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.submitBtn}>
                {editingId ? 'Atualizar' : 'Criar'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setNome('')
                    setEmail('')
                    setError('')
                  }}
                  className={styles.cancelBtn}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className={styles.tableSection}>
          <h2>Lista de Clientes</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.id}</td>
                  <td>{cliente.nome}</td>
                  <td>{cliente.email}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(cliente)}
                      className={styles.editBtn}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(cliente.id)}
                      className={styles.deleteBtn}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}