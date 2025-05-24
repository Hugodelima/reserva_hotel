import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'PUT') {
    try {
      const { nome, email } = req.body

      if (!nome || !email) {
        return res.status(400).json({ error: 'Nome e email são obrigatórios' })
      }

      const cliente = await prisma.cliente.update({
        where: { id: parseInt(id) },
        data: { nome, email }
      })

      res.status(200).json(cliente)
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      if (error.code === 'P2002') {
        res.status(400).json({ error: 'Email já está em uso' })
      } else if (error.code === 'P2025') {
        res.status(404).json({ error: 'Cliente não encontrado' })
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' })
      }
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.cliente.delete({
        where: { id: parseInt(id) }
      })

      res.status(204).end()
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Cliente não encontrado' })
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' })
      }
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}