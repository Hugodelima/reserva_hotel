import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const quartos = await prisma.quarto.findMany({
        orderBy: { numero: 'asc' }
      })
      res.status(200).json(quartos)
    } catch (error) {
      console.error('Erro ao buscar quartos:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else if (req.method === 'POST') {
    try {
      const { numero, tipo, preco } = req.body

      if (!numero || !tipo || !preco) {
        return res.status(400).json({ error: 'Número, tipo e preço são obrigatórios' })
      }

      const quarto = await prisma.quarto.create({
        data: { numero, tipo, preco }
      })

      res.status(201).json(quarto)
    } catch (error) {
      console.error('Erro ao criar quarto:', error)
      if (error.code === 'P2002') {
        res.status(400).json({ error: 'Número do quarto já existe' })
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' })
      }
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}