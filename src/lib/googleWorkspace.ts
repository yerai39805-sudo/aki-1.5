import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

const provider = new GoogleAuthProvider();

// Add all requested Workspace scopes
const scopes = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/documents.readonly',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/contacts',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/user.emails.read',
  'https://www.googleapis.com/auth/user.phonenumbers.read'
];

scopes.forEach(scope => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No access token returned from Google Sign In');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const tokenResult = await currentUser.getIdTokenResult();
      // Note: Firebase ID token is different from Google OAuth access token. 
      // If cachedAccessToken is null, trigger popup or prompt re-auth.
    } catch (e) {}
  }
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// --- GMAIL API ---
export async function fetchGmailMessages(token: string, maxResults = 15) {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch messages');
  const data = await res.json();
  const messages = data.messages || [];
  
  // Fetch details for each message
  const detailedMessages = await Promise.all(
    messages.slice(0, 10).map(async (msg: { id: string }) => {
      const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!detailRes.ok) return null;
      const detail = await detailRes.json();
      const headers = detail.payload?.headers || [];
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'Sin Asunto';
      const from = headers.find((h: any) => h.name === 'From')?.value || 'Desconocido';
      const date = headers.find((h: any) => h.name === 'Date')?.value || '';
      return {
        id: msg.id,
        snippet: detail.snippet,
        subject,
        from,
        date
      };
    })
  );
  return detailedMessages.filter(Boolean);
}

export async function sendGmailMessage(token: string, recipient: string, subject: string, body: string) {
  const emailLines = [
    `To: ${recipient}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    '',
    body
  ];
  const email = emailLines.join('\r\n');
  const encodedEmail = btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: encodedEmail })
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error?.message || 'Failed to send email');
  }
  return await res.json();
}

// --- GOOGLE DOCS & DRIVE API ---
export async function fetchGoogleDocs(token: string) {
  const res = await fetch("https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.document'&pageSize=20", {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch Google Docs');
  const data = await res.json();
  return data.files || [];
}

export async function getDocContent(token: string, fileId: string) {
  const res = await fetch(`https://docs.googleapis.com/v1/documents/${fileId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch document content');
  return await res.json();
}

export async function createGoogleDoc(token: string, title: string, contentText: string) {
  // 1. Create doc
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });
  if (!createRes.ok) throw new Error('Failed to create Google Doc');
  const doc = await createRes.json();
  const documentId = doc.documentId;

  // 2. Insert content
  if (contentText && documentId) {
    const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              text: contentText,
              location: { index: 1 }
            }
          }
        ]
      })
    });
    if (!updateRes.ok) throw new Error('Failed to insert text into document');
  }
  return doc;
}

// --- GOOGLE CALENDAR API ---
export async function fetchCalendarEvents(token: string) {
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=25&orderBy=startTime&singleEvents=true', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch calendar events');
  const data = await res.json();
  return data.items || [];
}

export async function createCalendarEvent(token: string, summary: string, description: string, startDateTime: string, endDateTime: string) {
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      summary,
      description,
      start: { dateTime: startDateTime },
      end: { dateTime: endDateTime }
    })
  });
  if (!res.ok) throw new Error('Failed to create calendar event');
  return await res.json();
}

// --- CONTACTS / PEOPLE API ---
export async function fetchGoogleContacts(token: string) {
  const res = await fetch('https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,photos', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch contacts');
  const data = await res.json();
  return data.connections || [];
}
