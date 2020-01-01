import { calendar, authenticate } from './google'
import {
  MzEvent,
  getLocationName,
  MzLocation,
  getEventsForWeek
} from './megazone'
import stringify from './stringify'
import { listCalendarEvents, insertEvent } from './calendar'
import config from './config'
import { DateTime } from 'luxon'
import pMapSeries from 'p-map-series'
import { calendar_v3 } from 'googleapis'
import { getSunday } from './date'

const formatEventSummary = (event: MzEvent) =>
  `${getLocationName(event.location)} ${event.players}/${event.maxPlayers}`

const upsertEvent = async (
  calendarId: string,
  calendarEvents: calendar_v3.Schema$Event[],
  mzEvent: MzEvent
) => {
  const summary = formatEventSummary(mzEvent)
  const existingCalEvent = calendarEvents.find((event) =>
    DateTime.fromISO(event.start?.dateTime || '').equals(
      DateTime.fromISO(mzEvent.start)
    )
  )

  if (!existingCalEvent) {
    return insertEvent(calendarId, summary, mzEvent.start, mzEvent.end)
  } else if (existingCalEvent && existingCalEvent.summary !== summary) {
    console.log(
      'calendar event exists for mz event, but summary has updated',
      stringify({ newSummary: summary, oldSummary: existingCalEvent.summary })
    )
    await calendar.events.patch({
      calendarId,
      eventId: existingCalEvent.id!,
      requestBody: { summary },
      ...(await authenticate())
    })
    console.log('patched event')
  }
}

export const updateMzLocationCalendar = async (location: MzLocation) => {
  const calendarId = config.mzLocationCalendarIds[location]
  const calendarEvents = await listCalendarEvents(calendarId)
  const mzEvents = (
    await pMapSeries([0, 1], (n) => getEventsForWeek(location, getSunday(n)))
  ).flat()
  await pMapSeries(mzEvents, (event) =>
    upsertEvent(calendarId, calendarEvents, event)
  )
  // TODO: check future calendar event dates that don't exist in mzEvents and delete them
  console.log('finished updating mz calendar', stringify({ location }))
}
