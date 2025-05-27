import { prisma } from '../../../../lib/prisma'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'POST') {
    try {
      const reservaId = parseInt(id)
      
      // Buscar a reserva primeiro
      const reservaExistente = await prisma.reserva.findUnique({
        where: { id: reservaId },
        include: {
          cliente: true,
          quarto: true
        }
      })

      if (!reservaExistente) {
        return res.status(404).json({ error: 'Reserva não encontrada' })
      }

      const hoje = new Date()
      const dataFim = new Date(reservaExistente.dataFim)
      
      // Verificar se o check-out não é antes da data de início
      const dataInicio = new Date(reservaExistente.dataInicio)
      if (hoje < dataInicio) {
        return res.status(400).json({ 
          error: 'Check-out não pode ser realizado antes do check-in' 
        })
      }

      // Calcular valor total baseado nos dias de hospedagem
      const diasHospedagem = Math.ceil((hoje - dataInicio) / (1000 * 60 * 60 * 24))
      const valorTotal = diasHospedagem * reservaExistente.quarto.preco

      // Atualizar a reserva marcando o check-out
      const reservaAtualizada = await prisma.reserva.update({
        where: { id: reservaId },
        data: {
          dataFim: hoje
        },
        include: {
          cliente: true,
          quarto: true
        }
      })

      res.status(200).json({
        message: 'Check-out realizado com sucesso',
        reserva: reservaAtualizada,
        checkoutRealizado: hoje,
        diasHospedagem: diasHospedagem,
        valorTotal: valorTotal,
        resumo: {
          cliente: reservaAtualizada.cliente.nome,
          quarto: `${reservaAtualizada.quarto.numero} - ${reservaAtualizada.quarto.tipo}`,
          checkin: reservaAtualizada.dataInicio,
          checkout: hoje,
          dias: diasHospedagem,
          precoDiaria: reservaAtualizada.quarto.preco,
          total: valorTotal
        }
      })
      
    } catch (error) {
      console.error('Erro ao realizar check-out:', error)
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Reserva não encontrada' })
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' })
      }
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}