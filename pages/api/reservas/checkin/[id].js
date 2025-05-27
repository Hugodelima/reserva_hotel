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
      const dataInicio = new Date(reservaExistente.dataInicio)
      
      // Verificar se a data de check-in é válida (não pode ser antes da data de início da reserva)
      if (hoje < dataInicio.setHours(0, 0, 0, 0)) {
        return res.status(400).json({ 
          error: 'Check-in não pode ser realizado antes da data de início da reserva' 
        })
      }

      // Verificar se já foi feito check-in (usando um campo personalizado ou verificando se já existe um registro)
      // Vamos usar a estratégia de criar um registro separado para controlar check-in/check-out
      
      // Aqui vamos simular o check-in atualizando um campo de observação ou usando a própria data
      // Como não podemos alterar o schema, vamos registrar o check-in atualizando a reserva com uma marca
      
      const reservaAtualizada = await prisma.reserva.update({
        where: { id: reservaId },
        data: {
          // Estratégia: usar o campo dataInicio para marcar quando foi feito o check-in real
          dataInicio: hoje
        },
        include: {
          cliente: true,
          quarto: true
        }
      })

      res.status(200).json({
        message: 'Check-in realizado com sucesso',
        reserva: reservaAtualizada,
        checkinRealizado: hoje
      })
      
    } catch (error) {
      console.error('Erro ao realizar check-in:', error)
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