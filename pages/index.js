import { useState } from 'react'
import { useRouter } from 'next/router'
import styles from '../src/styles/Login.module.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (email === 'administrador@gmail.com' && password === '123456') {
      // Salvar no sessionStorage que está logado
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('isLoggedIn', 'true')
      }
      router.push('/dashboard')
    } else {
      setError('Email ou senha incorretos')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Sistema de Gerenciamento de Hotel</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
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
          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.button}>
            Entrar
          </button>
        </form>
        <div className={styles.credentials}>
          <p><strong>Credenciais de acesso:</strong></p>
          <p>Email: administrador@gmail.com</p>
          <p>Senha: 123456</p>
        </div>
      </div>
    </div>
  )
}