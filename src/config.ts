import { MzLocation } from './megazone'

function getFromEnv(prop: string): string {
  const val = process.env[prop]
  if (val) {
    return val
  } else {
    throw new Error(`Expected ${prop} to exist in env`)
  }
}

type Config = {
  GOOGLE_APPLICATION_CREDENTIALS: string
  mzLocationCalendarIds: { [key in MzLocation]?: string }
  mzLocations: MzLocation[]
}

const mzLocationCalendarIds = Object.entries(process.env).reduce<
  Config['mzLocationCalendarIds']
>((acc, [key, val]) => {
  const m = key.match(/MZ_CALENDAR_ID_(.+)/)
  return m ? { ...acc, [m[1].toLowerCase()]: val } : acc
}, {})

const config: Config = {
  GOOGLE_APPLICATION_CREDENTIALS: getFromEnv('GOOGLE_APPLICATION_CREDENTIALS'),
  mzLocationCalendarIds,
  mzLocations: Object.keys(mzLocationCalendarIds) as MzLocation[]
}

export default config
