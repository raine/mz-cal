import { google } from 'googleapis'

const auth = new google.auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/calendar']
})

let authClientP: ReturnType<typeof auth.getClient>

export function getAuthClient() {
  if (authClientP) return authClientP
  else {
    authClientP = auth.getClient()
    return authClientP
  }
}

export const authenticate = async () => ({
  auth: await getAuthClient()
})

export const calendar = google.calendar({ version: 'v3' })
