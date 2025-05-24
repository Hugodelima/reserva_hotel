import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const reserva = await prisma.reserva.create({
        data: {
          ...req.body,
          dataInicio: new Date(req.body.dataInicio),
          dataFim: new Date(req.body.dataFim)
        }
      })
      res.status(201).json(reserva)
    } catch (error) {
      res.status(400).json({ error: 'Erro ao criar reserva' })
    }
  }
}