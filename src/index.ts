import { updateMzLocationCalendar } from './megazoneCalendar'
import pMapSeries from 'p-map-series'
import config from './config'
import stringify from './stringify'

async function main() {
  console.log(stringify({ locations: config.mzLocations }))
  await pMapSeries(config.mzLocations, (loc) => updateMzLocationCalendar(loc))
}

main().catch(console.error)
