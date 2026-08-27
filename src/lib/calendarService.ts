import { google, type calendar_v3 } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export function calendarConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY &&
    process.env.GOOGLE_CALENDAR_ID
  );
}

function getCalendarClient(): calendar_v3.Calendar | null {
  if (!calendarConfigured()) return null;

  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: SCOPES,
  });

  return google.calendar({ version: 'v3', auth });
}

export interface CalendarEventResult {
  created: boolean;
  eventId?: string | null;
  url?: string | null;
}

export async function createCalendarEvent(params: {
  title: string;
  description?: string;
  startsAt: Date;
  endsAt: Date;
}): Promise<CalendarEventResult> {
  const calendar = getCalendarClient();
  if (!calendar) return { created: false };

  try {
    const res = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      requestBody: {
        summary: params.title,
        description: params.description || '',
        start: { dateTime: params.startsAt.toISOString() },
        end: { dateTime: params.endsAt.toISOString() },
      },
    });
    return {
      created: true,
      eventId: res.data.id || null,
      url: res.data.htmlLink || null,
    };
  } catch (error) {
    console.error('Calendar event creation failed:', error);
    return { created: false };
  }
}