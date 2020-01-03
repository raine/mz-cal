import qs from 'qs'
import got from 'got'
import cheerio from 'cheerio'
import { DateTime } from 'luxon'
import { Nominal } from './types/Nominal'
import R from 'ramda'

export type MzAvailableDateTime = Nominal<DateTime, 'MzAvailableDateTime'>
export type MzLocation = 'hki' | 'vnt' | 'tre' | 'jkl'
export type MzEvent = {
  start: string
  end: string
  players: number
  maxPlayers: number
  location: MzLocation
}

enum MzGameType {
  OpenGame = 2
}

enum MzGamePackage {
  OpenGameOneRound = 5,
  OpenGameTwoGames = 6
}

export const getMaxPlayerCount = (loc: MzLocation) => {
  switch (loc) {
    case 'hki':
      return 36
    case 'vnt':
      return 33
    case 'tre':
      return 36
    case 'jkl':
      return 27
  }
}

export const getLocationName = (loc: MzLocation) => {
  switch (loc) {
    case 'hki':
      return 'Helsinki'
    case 'vnt':
      return 'Vantaa'
    case 'vnt':
      return 'Tampere'
    case 'jkl':
      return 'Jyväskylä'
  }
}

export const formatCalendarBaseUrl = (loc: MzLocation): string =>
  `https://mz${loc}.slsystems.fi/booking/calendar`

export const formatCalendarUrl = (
  loc: MzLocation,
  datetime: DateTime,
  playerCount: number
): string =>
  formatCalendarBaseUrl(loc) +
  '?' +
  qs.stringify({
    BookingCalForm: {
      p_laji: MzGameType.OpenGame,
      p_pvm: datetime.toFormat('yyyy-MM-dd'),
      p_id_paketti: MzGamePackage.OpenGameOneRound,
      p_id_hlomaara: playerCount
    }
  })

// sundayDate controls which week's calendar is retrieved
export const getRawCalendarHtml = (
  loc: MzLocation,
  sundayDate: DateTime,
  playerCount: number
): Promise<string> => {
  const url = formatCalendarUrl(loc, sundayDate, playerCount)
  return got(url).then((res) => res.body)
}

export const getAvailableRoundsFromWeeklyCalendar = (
  loc: MzLocation,
  sundayDate: DateTime,
  playerCount: number
): Promise<MzAvailableDateTime[]> => {
  if (playerCount < 1 || playerCount > getMaxPlayerCount(loc)) {
    throw new Error(`Invalid player count: ${playerCount}`)
  }
  return getRawCalendarHtml(loc, sundayDate, playerCount).then(
    parseCalendarHtml
  )
}

export const getEventsForWeek = async (
  loc: MzLocation,
  sundayDate: DateTime
): Promise<MzEvent[]> => {
  const recur = async (
    acc: any,
    minimum: MzAvailableDateTime[],
    playerCount: number
  ): Promise<{ [playerCount: string]: MzAvailableDateTime[] }> => {
    const dates = await getAvailableRoundsFromWeeklyCalendar(
      loc,
      sundayDate,
      playerCount
    )

    // Can save some unneessary requests by early-exiting if dates with one
    // player match the dates of current iteration
    return playerCount > 1 && !R.equals(dates, minimum)
      ? recur({ ...acc, [playerCount]: dates }, minimum, playerCount - 1)
      : { ...acc, [playerCount]: dates }
  }

  const maxPlayerCount = getMaxPlayerCount(loc)
  const minimum = await getAvailableRoundsFromWeeklyCalendar(loc, sundayDate, 1)
  const playerCountDatesObj = await recur({}, minimum, maxPlayerCount)
  const playerCountDates = Object.entries(playerCountDatesObj).map(
    ([k, v]) => [parseInt(k, 10), v] as [number, MzAvailableDateTime[]]
  )
  const playerCountDatesSorted = R.sortWith(
    [R.ascend(([k]) => k)],
    playerCountDates
  )
  const isoDateToPlayerCount: {
    [iso: string]: number
  } = playerCountDatesSorted.reduce(
    (acc, [reservedPlayerCount, availableRounds]) =>
      availableRounds.reduce(
        (acc, datetime) => ({
          ...acc,
          [datetime.toISO()]: maxPlayerCount - reservedPlayerCount
        }),
        acc
      ),
    {}
  )

  return Object.entries(isoDateToPlayerCount).map(([iso, playerCount]) => {
    return {
      start: iso,
      end: DateTime.fromISO(iso)
        .plus({ minutes: 30 })
        .toISO(),
      players: playerCount,
      maxPlayers: maxPlayerCount,
      location: loc
    } as MzEvent
  })
}

export const parseCreateBookingHref = (href: string): DateTime => {
  const { pvm: date, klo: time } = qs.parse(href.replace(/^.+\?/, ''))
  const datetime = DateTime.fromFormat(
    `${date} ${time}`,
    'yyyy-MM-dd HH:mm:ss',
    { zone: 'Europe/Helsinki' }
  )
  if (!datetime.isValid) throw new Error(datetime.invalidExplanation!)
  return datetime
}

export const parseCalendarHtml = (html: string): MzAvailableDateTime[] => {
  const $ = cheerio.load(html)
  return $('.s-avail')
    .map((_, elem) => {
      const href = $('a', elem).attr('href')!
      return parseCreateBookingHref(href)
    })
    .get() as MzAvailableDateTime[]
}
