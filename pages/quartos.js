import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import styles from '../src/styles/Crud.module.css'

export default function Quartos() {
  const [quartos, setQuartos] = useState([])
  const [numero, setNumero] = useState('')
  const [tipo, setTipo] = useState('')
  const [preco, setPreco] = useState('')
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
    
    fetchQuartos()
  }, [router])

  const fetchQuartos = async () => {
    try {
      const response = await fetch('/api/quartos')
      const data = await response.json()
      setQuartos(data)
    } catch (error) {
      console.error('Erro ao buscar quartos:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/quartos/${editingId}` : '/api/quartos'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          numero: parseInt(numero), 
          tipo, 
          preco: parseFloat(preco) 
        }),
      })

      if (response.ok) {
        setNumero('')
        setTipo('')
        setPreco('')
        setEditingId(null)
        fetchQuartos()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao salvar quarto')
      }
    } catch (error) {
      setError('Erro ao salvar quarto')
    }
  }

  const handleEdit = (quarto) => {
    setNumero(quarto.numero.toString())
    setTipo(quarto.tipo)
    setPreco(quarto.preco.toString())
    setEditingId(quarto.id)
  }

  const handleDelete = async (id) => {
    if (confirm('Deseja realmente excluir este quarto?')) {
      try {
        await fetch(`/api/quartos/${id}`, {
          method: 'DELETE',
        })
        fetchQuartos()
      } catch (error) {
        console.error('Erro ao excluir quarto:', error)
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
          <Link href="/clientes" className={styles.navLink}>
            Clientes
          </Link>
          <Link href="/quartos" className={`${styles.navLink} ${styles.active}`}>
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
        <h1>Gerenciamento de Quartos</h1>

        <div className={styles.formSection}>
          <h2>{editingId ? 'Editar Quarto' : 'Novo Quarto'}</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="numero">Número:</label>
              <input
                type="number"
                id="numero"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="tipo">Tipo:</label>
              <select
                id="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                required
                className={styles.input}
              >
                <option value="">Selecione o tipo</option>
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
                <option value="Presidencial">Presidencial</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="preco">Preço:</label>
              <input
                type="number"
                step="0.01"
                id="preco"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
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
                    setNumero('')
                    setTipo('')
                    setPreco('')
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
          <h2>Lista de Quartos</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Número</th>
                <th>Tipo</th>
                <th>Preço</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {quartos.map((quarto) => (
                <tr key={quarto.id}>
                  <td>{quarto.id}</td>
                  <td>{quarto.numero}</td>
                  <td>{quarto.tipo}</td>
                  <td>R$ {quarto.preco.toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(quarto)}
                      className={styles.editBtn}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(quarto.id)}
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