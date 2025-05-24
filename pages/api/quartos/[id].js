import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'PUT') {
    try {
      const { numero, tipo, preco } = req.body

      if (!numero || !tipo || !preco) {
        return res.status(400).json({ error: 'Número, tipo e preço  são obrigatórios' })
      }

      const quarto = await prisma.quarto.update({
        where: { id: parseInt(id) },
        data: { numero, tipo, preco }
      })

      res.status(200).json(quarto)
    } catch (error) {
      console.error('Erro ao atualizar quarto:', error)
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Quarto não encontrado' })
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' })
      }
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.quarto.delete({
        where: { id: parseInt(id) }
      })

      res.status(204).end()
    } catch (error) {
      console.error('Erro ao excluir quarto:', error)
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Quarto não encontrado' })
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' })
      }
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}