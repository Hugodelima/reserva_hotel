import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'PUT') {
    try {
      const { clienteId, quartoId, dataInicio, dataFim } = req.body

      if (!clienteId || !quartoId || !dataInicio || !dataFim) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
      }

      const reserva = await prisma.reserva.update({
        where: { id: parseInt(id) },
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

      res.status(200).json(reserva)
    } catch (error) {
      console.error('Erro ao atualizar reserva:', error)
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Reserva não encontrada' })
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' })
      }
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.reserva.delete({
        where: { id: parseInt(id) }
      })

      res.status(204).end()
    } catch (error) {
      console.error('Erro ao excluir reserva:', error)
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Reserva não encontrada' })
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' })
      }
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}