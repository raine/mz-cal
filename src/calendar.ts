import { google, calendar_v3 } from 'googleapis'
import { authenticate } from './google'
import stringify from './stringify'

const calendar = google.calendar({ version: 'v3' })

export const listCalendars = async () => {
  const { data } = await calendar.calendarList.list({
    ...(await authenticate())
  })

  return data
}

export const listCalendarEvents = async (calendarId: string) => {
  async function recur(
    acc: calendar_v3.Schema$Event[],
    pageToken?: string
  ): Promise<calendar_v3.Schema$Event[]> {
    const { data } = await calendar.events.list({
      calendarId,
      maxResults: 100,
      pageToken,
      ...(await authenticate())
    })

    const items = data.items || []
    const newItems = acc.concat(items)
    console.log(
      'listing calendar events',
      stringify({ calendarId, pageToken, items: newItems.length })
    )

    return data.nextPageToken ? recur(newItems, data.nextPageToken) : newItems
  }

  return recur([])
}

export const insertEvent = async (
  calendarId: string,
  summary: string,
  start: string,
  end: string
) => {
  const requestBody = {
    summary,
    start: {
      dateTime: start,
      timeZone: 'Europe/Helsinki'
    },
    end: {
      dateTime: end,
      timeZone: 'Europe/Helsinki'
    }
  }
  console.log('creating event', stringify(requestBody))
  await calendar.events.insert({
    calendarId,
    requestBody,
    ...(await authenticate())
  })
}
