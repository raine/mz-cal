import { google } from 'googleapis'
import '../src/config'

async function main() {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/calendar']
  })

  const authClient = await auth.getClient()
  const calendar = google.calendar({ version: 'v3' })
  const summary = process.argv[2]
  if (!summary) {
    console.error('ERROR: Pass calendar summary as argument')
    process.exit(1)
  }
  const { data } = await calendar.calendars.insert({
    auth: authClient,
    requestBody: {
      summary,
      timeZone: 'Europe/Helsinki'
    }
  })

  await calendar.acl.insert({
    auth: authClient,
    calendarId: data.id!,
    requestBody: {
      role: 'reader',
      scope: {
        type: 'default'
      }
    }
  })

  console.log(`Created a public calendar "${summary}" (${data.id!})`)
}

main().catch(console.error)
