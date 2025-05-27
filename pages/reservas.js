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
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusView, setStatusView] = useState(false) // Toggle para visualização por status
  const [reservasComStatus, setReservasComStatus] = useState([])
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
    fetchReservasComStatus()
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

  const fetchReservasComStatus = async () => {
    try {
      const response = await fetch('/api/reservas/status')
      const data = await response.json()
      setReservasComStatus(data)
    } catch (error) {
      console.error('Erro ao buscar status das reservas:', error)
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
    setSuccess('')

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
        setSuccess(editingId ? 'Reserva atualizada com sucesso!' : 'Reserva criada com sucesso!')
        fetchReservas()
        fetchReservasComStatus()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao salvar reserva')
      }
    } catch (error) {
      setError('Erro ao salvar reserva')
    }
  }

  const handleCheckin = async (reservaId) => {
    if (!confirm('Confirma o check-in desta reserva?')) return
    
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/reservas/checkin/${reservaId}`, {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Check-in realizado com sucesso! Cliente: ${data.reserva.cliente.nome}`)
        fetchReservas()
        fetchReservasComStatus()
      } else {
        setError(data.error || 'Erro ao realizar check-in')
      }
    } catch (error) {
      setError('Erro ao realizar check-in')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async (reservaId) => {
    if (!confirm('Confirma o check-out desta reserva?')) return
    
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/reservas/checkout/${reservaId}`, {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(
          `Check-out realizado com sucesso! 
          Cliente: ${data.resumo.cliente} 
          Total: R$ ${data.resumo.total.toFixed(2)} 
          (${data.resumo.dias} diárias)`
        )
        fetchReservas()
        fetchReservasComStatus()
      } else {
        setError(data.error || 'Erro ao realizar check-out')
      }
    } catch (error) {
      setError('Erro ao realizar check-out')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (reserva) => {
    setClienteId(reserva.clienteId.toString())
    setQuartoId(reserva.quartoId.toString())
    setDataInicio(new Date(reserva.dataInicio).toISOString().split('T')[0])
    setDataFim(new Date(reserva.dataFim).toISOString().split('T')[0])
    setEditingId(reserva.id)
    setError('')
    setSuccess('')
  }

  const handleDelete = async (id) => {
    if (confirm('Deseja realmente excluir esta reserva?')) {
      try {
        await fetch(`/api/reservas/${id}`, {
          method: 'DELETE',
        })
        setSuccess('Reserva excluída com sucesso!')
        fetchReservas()
        fetchReservasComStatus()
      } catch (error) {
        setError('Erro ao excluir reserva')
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'AGENDADA': return '#ffc107'
      case 'PENDENTE_CHECKIN': return '#28a745'
      case 'HOSPEDADO': return '#007bff'
      case 'FINALIZADA': return '#6c757d'
      default: return '#6c757d'
    }
  }

  const clearMessages = () => {
    setError('')
    setSuccess('')
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Gerenciamento de Reservas</h1>
          <button 
            onClick={() => setStatusView(!statusView)}
            className={styles.submitBtn}
            style={{ marginBottom: '20px' }}
          >
            {statusView ? 'Visualização Normal' : 'Visualização por Status'}
          </button>
        </div>

        {/* Mensagens de sucesso e erro */}
        {success && (
          <div className={styles.success} style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb', borderRadius: '4px' }}>
            {success}
            <button onClick={clearMessages} style={{ float: 'right', background: 'none', border: 'none', fontSize: '18px' }}>×</button>
          </div>
        )}
        {error && (
          <div className={styles.error} style={{ marginBottom: '20px' }}>
            {error}
            <button onClick={clearMessages} style={{ float: 'right', background: 'none', border: 'none', fontSize: '18px' }}>×</button>
          </div>
        )}

        {/* Resumo por Status */}
        {statusView && reservasComStatus.resumo && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
            <div style={{ padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', textAlign: 'center' }}>
              <h3>Agendadas</h3>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{reservasComStatus.resumo.agendadas}</span>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '8px', textAlign: 'center' }}>
              <h3>Pendente Check-in</h3>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{reservasComStatus.resumo.pendenteCheckin}</span>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#cce5ff', borderRadius: '8px', textAlign: 'center' }}>
              <h3>Hospedados</h3>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{reservasComStatus.resumo.hospedados}</span>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#e2e3e5', borderRadius: '8px', textAlign: 'center' }}>
              <h3>Finalizadas</h3>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{reservasComStatus.resumo.finalizadas}</span>
            </div>
          </div>
        )}

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
                    clearMessages()
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
                {statusView && <th>Status</th>}
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {(statusView ? reservasComStatus.todas || [] : reservas).map((reserva) => (
                <tr key={reserva.id}>
                  <td>{reserva.id}</td>
                  <td>{reserva.cliente?.nome}</td>
                  <td>Quarto {reserva.quarto?.numero}</td>
                  <td>{formatDateTime(reserva.dataInicio)}</td>
                  <td>{formatDateTime(reserva.dataFim)}</td>
                  {statusView && (
                    <td>
                      <span 
                        style={{ 
                          backgroundColor: getStatusColor(reserva.status),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        {reserva.status}
                      </span>
                    </td>
                  )}
                  <td>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {/* Botões de Check-in/Check-out (apenas na visualização por status) */}
                      {statusView && reserva.podeCheckin && (
                        <button
                          onClick={() => handleCheckin(reserva.id)}
                          disabled={loading}
                          style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Check-in
                        </button>
                      )}
                      {statusView && reserva.podeCheckout && (
                        <button
                          onClick={() => handleCheckout(reserva.id)}
                          disabled={loading}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Check-out
                        </button>
                      )}
                      
                      {/* Botões tradicionais */}
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {loading && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>Processando...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}