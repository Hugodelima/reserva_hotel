import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      const clientes = await prisma.cliente.findMany()
      res.status(200).json(clientes)
      break

    case 'POST':
      try {
        const novoCliente = await prisma.cliente.create({ data: req.body })
        res.status(201).json(novoCliente)
      } catch (error) {
        res.status(400).json({ error: 'Email já cadastrado' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}