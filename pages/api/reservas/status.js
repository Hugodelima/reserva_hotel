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

      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)

      // Categorizar reservas por status
      const reservasComStatus = reservas.map(reserva => {
        const dataInicio = new Date(reserva.dataInicio)
        const dataFim = new Date(reserva.dataFim)
        
        dataInicio.setHours(0, 0, 0, 0)
        dataFim.setHours(0, 0, 0, 0)

        let status = ''
        let podeCheckin = false
        let podeCheckout = false

        if (hoje < dataInicio) {
          status = 'AGENDADA'
          podeCheckin = false
          podeCheckout = false
        } else if (hoje >= dataInicio && hoje <= dataFim) {
          // Verificar se o check-in já foi feito comparando as horas
          const horaInicioOriginal = new Date(reserva.dataInicio)
          if (horaInicioOriginal.getHours() === 0 && horaInicioOriginal.getMinutes() === 0) {
            status = 'PENDENTE_CHECKIN'
            podeCheckin = true
            podeCheckout = false
          } else {
            status = 'HOSPEDADO'
            podeCheckin = false
            podeCheckout = true
          }
        } else {
          status = 'FINALIZADA'
          podeCheckin = false
          podeCheckout = false
        }

        return {
          ...reserva,
          status,
          podeCheckin,
          podeCheckout,
          dias: Math.ceil((dataFim - dataInicio) / (1000 * 60 * 60 * 24)) + 1
        }
      })

      // Separar por categorias
      const agendadas = reservasComStatus.filter(r => r.status === 'AGENDADA')
      const pendenteCheckin = reservasComStatus.filter(r => r.status === 'PENDENTE_CHECKIN')
      const hospedados = reservasComStatus.filter(r => r.status === 'HOSPEDADO')
      const finalizadas = reservasComStatus.filter(r => r.status === 'FINALIZADA')

      res.status(200).json({
        total: reservas.length,
        resumo: {
          agendadas: agendadas.length,
          pendenteCheckin: pendenteCheckin.length,
          hospedados: hospedados.length,
          finalizadas: finalizadas.length
        },
        reservas: {
          agendadas,
          pendenteCheckin,
          hospedados,
          finalizadas
        },
        todas: reservasComStatus
      })
      
    } catch (error) {
      console.error('Erro ao buscar status das reservas:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}