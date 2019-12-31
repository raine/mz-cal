import { back as nockBack } from 'nock'
import { DateTime } from 'luxon'
import { sortBy } from 'ramda'
import fs from 'fs'
import {
  parseCalendarHtml,
  parseCreateBookingHref,
  getEventsForWeek
} from '../src/megazone'

nockBack.setMode('lockdown')
nockBack.fixtures = __dirname + '/fixtures'

describe('getEventsForWeek', () => {
  it('returns events with player counts', async () => {
    const { nockDone } = await nockBack('calendar-nock.json')
    const sunday = DateTime.fromISO('2020-01-05')
    const events = await getEventsForWeek('hki', sunday)
    expect(events).toMatchSnapshot()
    nockDone()
  })
})

describe('parseCalendarHtml', () => {
  it('test', async () => {
    const html = fs.readFileSync(__dirname + '/fixtures/calendar.html', 'utf8')
    const datetimes = parseCalendarHtml(html)
    expect(
      sortBy((dt) => dt.toMillis(), datetimes).map((dt) => dt.toISO())
    ).toMatchSnapshot()
  })
})

describe('parseCreateBookingHref', () => {
  it('parses create booking link to datetime', async () => {
    const href =
      '/booking/create-booking?id_paketti=5&hlo=33&pvm=2020-01-05&klo=18%3A30%3A00'
    const datetime = parseCreateBookingHref(href)
    expect(datetime.isValid).toBe(true)
    expect(datetime.toISO()).toBe('2020-01-05T18:30:00.000+02:00')
  })
})
