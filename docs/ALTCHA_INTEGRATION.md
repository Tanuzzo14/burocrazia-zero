# ALTCHA Integration Guide

## Overview

This application uses ALTCHA for anti-robot protection on the booking form. ALTCHA provides a privacy-friendly alternative to traditional CAPTCHAs using proof-of-work challenges.

## Current Implementation

The ALTCHA widget is integrated in the booking form (`frontend/src/app/app.component.html`) with the following configuration:

```html
<altcha-widget 
  test="true"
  language="it"
  hidefooter="false"
  hidelogo="false"
  (verified)="onAltchaVerified($event)"
  (statechange)="onAltchaStateChange($event)"
></altcha-widget>
```

### Development Mode

Currently, the widget is configured in **test mode** (`test="true"`), which generates mock challenges locally without requiring a backend server. This is perfect for development and testing.

## Production Configuration

For production deployment, you have two options:

### Option 1: Self-Hosted Challenge Generation (Recommended)

1. **Remove test mode** from the widget configuration
2. **Add a backend endpoint** to generate challenges
3. **Configure the widget** to use your endpoint

#### Step 1: Update the widget configuration

```html
<altcha-widget 
  challengeurl="https://your-backend.workers.dev/api/altcha/challenge"
  language="it"
  hidefooter="false"
  hidelogo="false"
  (verified)="onAltchaVerified($event)"
  (statechange)="onAltchaStateChange($event)"
></altcha-widget>
```

#### Step 2: Implement the challenge endpoint

Add a new endpoint in your Cloudflare Workers backend (`backend/src/index.ts`):

```typescript
// Add this to your backend routes
async function handleAltchaChallenge(request: Request, env: Env): Promise<Response> {
  // Generate a random challenge
  const salt = crypto.randomUUID();
  const secret = crypto.randomUUID();
  const algorithm = 'SHA-256';
  
  // Calculate the challenge
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + secret);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const challenge = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Store the challenge in D1 with expiration
  const expiration = Date.now() + 300000; // 5 minutes
  await env.DB.prepare(
    'INSERT INTO altcha_challenges (challenge, salt, secret, algorithm, expires_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(challenge, salt, secret, algorithm, expiration).run();
  
  return new Response(JSON.stringify({
    algorithm,
    challenge,
    salt,
    signature: '' // Optional: sign the challenge
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
```

#### Step 3: Update the database schema

Add a table for storing challenges:

```sql
CREATE TABLE IF NOT EXISTS altcha_challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  challenge TEXT NOT NULL,
  salt TEXT NOT NULL,
  secret TEXT NOT NULL,
  algorithm TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_challenge ON altcha_challenges(challenge);
```

#### Step 4: Verify the payload on the backend

When the user submits the form, verify the ALTCHA payload before creating the booking:

```typescript
async function verifyAltchaPayload(payload: string, env: Env): Promise<boolean> {
  try {
    const decoded = JSON.parse(atob(payload));
    const { algorithm, challenge, number, salt, signature } = decoded;
    
    // Verify the challenge exists and hasn't expired
    const result = await env.DB.prepare(
      'SELECT secret FROM altcha_challenges WHERE challenge = ? AND expires_at > ? LIMIT 1'
    ).bind(challenge, Date.now()).first();
    
    if (!result) {
      return false;
    }
    
    // Verify the solution
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + number);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const computedChallenge = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return computedChallenge === challenge;
  } catch (error) {
    console.error('ALTCHA verification error:', error);
    return false;
  }
}
```

### Option 2: ALTCHA Sentinel (Cloud Service)

For a managed solution, you can use ALTCHA Sentinel:

1. **Sign up** at [ALTCHA Sentinel](https://altcha.org/)
2. **Get your API key** from the dashboard
3. **Update the widget** configuration:

```html
<altcha-widget 
  challengeurl="https://sentinel.example.com/v1/challenge?apiKey=key_..."
  language="it"
  (verified)="onAltchaVerified($event)"
  (statechange)="onAltchaStateChange($event)"
></altcha-widget>
```

## Features

- ✅ **Privacy-friendly**: No tracking or data collection
- ✅ **Lightweight**: ~30 kB gzipped (90% smaller than reCAPTCHA)
- ✅ **Accessible**: WCAG compliant
- ✅ **Multi-language**: Supports 50+ languages (configured for Italian)
- ✅ **No external dependencies**: Works entirely in the browser
- ✅ **Secure**: Uses cryptographic proof-of-work challenges

## Security Considerations

1. **HTTPS Required**: ALTCHA uses the browser's `subtle.crypto` API, which requires a secure context (HTTPS)
2. **Challenge Expiration**: Challenges should expire after a reasonable time (5-10 minutes)
3. **One-time Use**: Each challenge should only be valid for one submission
4. **Server-side Verification**: Always verify the payload on the server before processing the form

## Troubleshooting

### Widget doesn't appear
- Check browser console for errors
- Ensure HTTPS is being used (required for crypto API)
- Verify ALTCHA package is installed: `npm list altcha`

### Verification fails
- Check that the challenge hasn't expired
- Verify server-side validation logic
- Check CORS headers if using custom challenge URL

### Build errors
- Ensure `CUSTOM_ELEMENTS_SCHEMA` is added to the component
- Verify imports in `main.ts`: `import 'altcha'` and `import 'altcha/i18n/it'`

## Resources

- [ALTCHA Documentation](https://altcha.org/docs/)
- [GitHub Repository](https://github.com/altcha-org/altcha)
- [Widget Customization Guide](https://altcha.org/docs/widget-customization/)
- [WCAG Compliance](https://altcha.org/docs/wcag-compliance/)

## License

ALTCHA is MIT licensed. See [ALTCHA License](https://github.com/altcha-org/altcha/blob/main/LICENSE) for details.
