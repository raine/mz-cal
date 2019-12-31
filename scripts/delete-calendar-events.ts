import { calendar, authenticate } from '../src/google'
import '../src/config'
import pMapSeries from 'p-map-series'
import { listCalendarEvents } from '../src/calendar'

async function main() {
  const calendarId = process.argv[2]
  if (!calendarId) {
    console.error('ERROR: Pass calendar id as argument')
    process.exit(1)
  }

  const auth = await authenticate()
  const events = await listCalendarEvents(calendarId)
  console.log(`got ${events.length} events`)

  await pMapSeries(events, (event) =>
    calendar.events
      .delete({
        calendarId,
        eventId: event.id!,
        ...auth
      })
      .then(() => {
        console.log(`deleted ${event.id}`)
      })
  )
}

main().catch(console.error)
