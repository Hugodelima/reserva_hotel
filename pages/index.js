import Link from 'next/link'

export default function Home() {
  return (
    <div className="container">
      <h1>Sistema de Reservas</h1>
      <nav>
        <ul>
          <li><Link href="/clientes">Clientes</Link></li>
          <li><Link href="/quartos">Quartos</Link></li>
          <li><Link href="/reservas">Reservas</Link></li>
        </ul>
      </nav>
    </div>
  )
}