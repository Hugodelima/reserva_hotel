import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const clientes = await prisma.cliente.findMany({
        orderBy: { id: 'asc' }
      })
      res.status(200).json(clientes)
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else if (req.method === 'POST') {
    try {
      const { nome, email } = req.body

      if (!nome || !email) {
        return res.status(400).json({ error: 'Nome e email são obrigatórios' })
      }

      const cliente = await prisma.cliente.create({
        data: { nome, email }
      })

      res.status(201).json(cliente)
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
      if (error.code === 'P2002') {
        res.status(400).json({ error: 'Email já está em uso' })
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' })
      }
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}