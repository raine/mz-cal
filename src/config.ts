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
  mzLocationCalendarIds: { [key in MzLocation]: string }
}

const config = {
  GOOGLE_APPLICATION_CREDENTIALS: getFromEnv('GOOGLE_APPLICATION_CREDENTIALS'),
  mzLocationCalendarIds: {
    hki: getFromEnv('MZ_HKI_CALENDAR_ID'),
    vnt: getFromEnv('MZ_VNT_CALENDAR_ID')
  }
}

export default config
