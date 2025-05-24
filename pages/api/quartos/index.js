import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      const quartos = await prisma.quarto.findMany()
      res.status(200).json(quartos)
      break

    case 'POST':
      try {
        const novoQuarto = await prisma.quarto.create({ data: req.body })
        res.status(201).json(novoQuarto)
      } catch (error) {
        res.status(400).json({ error: 'Número do quarto já existe' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}