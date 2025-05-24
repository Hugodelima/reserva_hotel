import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  const { dataInicio, dataFim } = req.query
  
  const quartosOcupados = await prisma.reserva.findMany({
    where: {
      OR: [
        { dataInicio: { lte: new Date(dataFim) }, dataFim: { gte: new Date(dataInicio) } }
      ]
    },
    select: { quartoId: true }
  })

  const quartosDisponiveis = await prisma.quarto.findMany({
    where: {
      id: { notIn: quartosOcupados.map(q => q.quartoId) }
    }
  })

  res.status(200).json(quartosDisponiveis)
}