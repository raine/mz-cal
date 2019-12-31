import { updateMzLocationCalendar } from './megazoneCalendar'
import pMapSeries from 'p-map-series'
import { MzLocation } from './megazone'

async function main() {
  await pMapSeries(['hki', 'vnt'] as MzLocation[], (loc) =>
    updateMzLocationCalendar(loc)
  )
}

main().catch(console.error)
