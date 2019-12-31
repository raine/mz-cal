import { DateTime } from 'luxon'

export const getSunday = (offset = 0) => {
  const datetime = DateTime.local()
  return datetime.set({ weekday: 7 * (offset + 1) })
}
