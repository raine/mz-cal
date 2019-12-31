import { getEventsForWeek } from './megazone'
import { DateTime } from 'luxon'

;(async () => {
  const events = await getEventsForWeek('hki', DateTime.fromISO('2020-01-05'))

  events.forEach((e) => {
    console.log(e.start, `${e.players}/${e.maxPlayers}`)
  })
})()
