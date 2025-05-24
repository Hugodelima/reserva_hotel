import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const reservas = await prisma.reserva.findMany({
        include: {
          cliente: true,
          quarto: true
        },
        orderBy: { id: 'asc' }
      })
      res.status(200).json(reservas)
    } catch (error) {
      console.error('Erro ao buscar reservas:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else if (req.method === 'POST') {
    try {
      const { clienteId, quartoId, dataInicio, dataFim } = req.body

      if (!clienteId || !quartoId || !dataInicio || !dataFim) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
      }

      const reserva = await prisma.reserva.create({
        data: { 
          clienteId, 
          quartoId, 
          dataInicio: new Date(dataInicio), 
          dataFim: new Date(dataFim) 
        },
        include: {
          cliente: true,
          quarto: true
        }
      })

      res.status(201).json(reserva)
    } catch (error) {
      console.error('Erro ao criar reserva:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}