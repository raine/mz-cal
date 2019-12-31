import { google } from 'googleapis'
import '../src/config'

async function main() {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/calendar']
  })

  const authClient = await auth.getClient()
  const calendar = google.calendar({ version: 'v3' })
  const { data } = await calendar.calendarList.list({
    auth: authClient
  })

  console.log(data.items!.map((x) => x.id).join('\n'))
}

main().catch(console.error)
