import { google } from 'googleapis'
import '../src/config'

async function main() {
  const calendarId = process.argv[2]
  if (!calendarId) {
    console.error('ERROR: Pass calendar id as argument')
    process.exit(1)
  }

  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/calendar']
  })

  const authClient = await auth.getClient()
  const calendar = google.calendar({ version: 'v3' })
  await calendar.calendars.delete({
    auth: authClient,
    calendarId
  })

  console.log(`Deleted calendar ${calendarId}`)
}

main().catch(console.error)
