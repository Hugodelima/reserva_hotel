import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import styles from '../src/styles/Dashboard.module.css'

export default function Dashboard() {
  const router = useRouter()

  useEffect(() => {
    // Verificar se está logado
    if (typeof window !== 'undefined') {
      const isLoggedIn = sessionStorage.getItem('isLoggedIn')
      if (!isLoggedIn) {
        router.push('/')
      }
    }
  }, [router])

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
          <Link href="/clientes" className={styles.navLink}>
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
        <div className={styles.hero}>
          <h1>Bem-vindo ao Sistema de Gerenciamento de Hotel</h1>
          <p>Gerencie clientes, quartos e reservas de forma eficiente</p>
        </div>

        <div className={styles.cards}>
          <Link href="/clientes" className={styles.card}>
            <h3>Clientes</h3>
            <p>Gerencie informações dos clientes</p>
          </Link>

          <Link href="/quartos" className={styles.card}>
            <h3>Quartos</h3>
            <p>Controle quartos e disponibilidade</p>
          </Link>

          <Link href="/reservas" className={styles.card}>
            <h3>Reservas</h3>
            <p>Administre reservas e estadias</p>
          </Link>
        </div>
      </main>
    </div>
  )
}