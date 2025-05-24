import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import styles from '../src/styles/Crud.module.css'

export default function Reservas() {
  const [reservas, setReservas] = useState([])
  const [clientes, setClientes] = useState([])
  const [quartos, setQuartos] = useState([])
  const [clienteId, setClienteId] = useState('')
  const [quartoId, setQuartoId] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
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
    
    fetchReservas()
    fetchClientes()
    fetchQuartos()
  }, [router])

  const fetchReservas = async () => {
    try {
      const response = await fetch('/api/reservas')
      const data = await response.json()
      setReservas(data)
    } catch (error) {
      console.error('Erro ao buscar reservas:', error)
    }
  }

  const fetchClientes = async () => {
    try {
      const response = await fetch('/api/clientes')
      const data = await response.json()
      setClientes(data)
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
    }
  }

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
      const url = editingId ? `/api/reservas/${editingId}` : '/api/reservas'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          clienteId: parseInt(clienteId),
          quartoId: parseInt(quartoId),
          dataInicio: new Date(dataInicio).toISOString(),
          dataFim: new Date(dataFim).toISOString()
        }),
      })

      if (response.ok) {
        setClienteId('')
        setQuartoId('')
        setDataInicio('')
        setDataFim('')
        setEditingId(null)
        fetchReservas()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao salvar reserva')
      }
    } catch (error) {
      setError('Erro ao salvar reserva')
    }
  }

  const handleEdit = (reserva) => {
    setClienteId(reserva.clienteId.toString())
    setQuartoId(reserva.quartoId.toString())
    setDataInicio(new Date(reserva.dataInicio).toISOString().split('T')[0])
    setDataFim(new Date(reserva.dataFim).toISOString().split('T')[0])
    setEditingId(reserva.id)
  }

  const handleDelete = async (id) => {
    if (confirm('Deseja realmente excluir esta reserva?')) {
      try {
        await fetch(`/api/reservas/${id}`, {
          method: 'DELETE',
        })
        fetchReservas()
      } catch (error) {
        console.error('Erro ao excluir reserva:', error)
      }
    }
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('isLoggedIn')
    }
    router.push('/')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
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
          <Link href="/quartos" className={styles.navLink}>
            Quartos
          </Link>
          <Link href="/reservas" className={`${styles.navLink} ${styles.active}`}>
            Reservas
          </Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Sair
          </button>
        </div>
      </nav>

      <main className={styles.main}>
        <h1>Gerenciamento de Reservas</h1>

        <div className={styles.formSection}>
          <h2>{editingId ? 'Editar Reserva' : 'Nova Reserva'}</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="clienteId">Cliente:</label>
              <select
                id="clienteId"
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                required
                className={styles.input}
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="quartoId">Quarto:</label>
              <select
                id="quartoId"
                value={quartoId}
                onChange={(e) => setQuartoId(e.target.value)}
                required
                className={styles.input}
              >
                <option value="">Selecione um quarto</option>
                {quartos.map((quarto) => (
                  <option key={quarto.id} value={quarto.id}>
                    Quarto {quarto.numero} - {quarto.tipo} (R$ {quarto.preco})
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="dataInicio">Data de Início:</label>
              <input
                type="date"
                id="dataInicio"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="dataFim">Data de Fim:</label>
              <input
                type="date"
                id="dataFim"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
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
                    setClienteId('')
                    setQuartoId('')
                    setDataInicio('')
                    setDataFim('')
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
          <h2>Lista de Reservas</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Quarto</th>
                <th>Data Início</th>
                <th>Data Fim</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva) => (
                <tr key={reserva.id}>
                  <td>{reserva.id}</td>
                  <td>{reserva.cliente?.nome}</td>
                  <td>Quarto {reserva.quarto?.numero}</td>
                  <td>{formatDate(reserva.dataInicio)}</td>
                  <td>{formatDate(reserva.dataFim)}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(reserva)}
                      className={styles.editBtn}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(reserva.id)}
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