import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    fetch('/api/clientes')
      .then(res => res.json())
      .then(data => setClientes(data))
  }, [])

  const onSubmit = async (data) => {
    const response = await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (response.ok) {
      const novoCliente = await response.json()
      setClientes([...clientes, novoCliente])
      reset()
    }
  }

  return (
    <div className="container">
      <h1>Clientes</h1>
      <Link href="/">Voltar</Link>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register('nome', { required: true })} placeholder="Nome" />
        <input {...register('email', { required: true })} placeholder="Email" type="email" />
        <button type="submit">Adicionar</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(cliente => (
            <tr key={cliente.id}>
              <td>{cliente.nome}</td>
              <td>{cliente.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}