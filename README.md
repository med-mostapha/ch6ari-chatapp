# Ch6ari — Real-Time Chat Application

A full-stack mobile chat application built with React Native (Expo) and Supabase, supporting real-time messaging, push notifications, emoji reactions, and group management.

---

## Screenshots

| Login | Chats | Chat Room | Group Details |
|-------|-------|-----------|---------------|
| ![Login](./screenshots/login.png) | ![Chats](./screenshots/chats.png) | ![Chat](./screenshots/chat.png) | ![Details](./screenshots/details.png) |

| Reaction Picker | Onboarding | New Chat | Edit Profile |
|----------------|------------|----------|--------------|
| ![Reactions](./screenshots/reactions.png) | ![Onboarding](./screenshots/onboarding.png) | ![New Chat](./screenshots/new-chat.png) | ![Profile](./screenshots/profile.png) |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo SDK 55 |
| Router | Expo Router (file-based) |
| Backend | Supabase (PostgreSQL + Auth + Realtime + Edge Functions) |
| ORM | Supabase JS Client v2 |
| Push Notifications | Expo Notifications + Firebase FCM (Android) + APNs (iOS) |
| Animations | Lottie React Native |
| Build System | EAS Build |
| Language | TypeScript |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Native App                  │
│  ┌─────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │  Expo   │  │  Expo    │  │   Expo             │ │
│  │ Router  │  │  Auth    │  │   Notifications    │ │
│  └─────────┘  └──────────┘  └────────────────────┘ │
└─────────────────────┬───────────────────────────────┘
                      │ Supabase JS Client
┌─────────────────────▼───────────────────────────────┐
│                    Supabase                         │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐│
│  │ PostgreSQL│  │ Realtime │  │  Edge Functions    ││
│  │    DB    │  │ Websocket│  │  (Deno/TypeScript) ││
│  └──────────┘  └──────────┘  └────────────────────┘│
└─────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              Push Notification Flow                 │
│  Firebase FCM (Android) ←→ Expo Push API ←→ APNs   │
└─────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
profiles
  id            uuid PK (references auth.users)
  username      text
  avatar_url    text
  expo_push_token text  -- legacy, replaced by push_tokens
  created_at    timestamptz

push_tokens
  id            uuid PK
  user_id       uuid FK → profiles.id (CASCADE)
  token         text
  platform      text  -- 'ios' | 'android'
  updated_at    timestamptz
  UNIQUE(user_id, token)

rooms
  id            uuid PK
  name          text
  is_group      boolean
  created_by    uuid FK → profiles.id
  last_message_at timestamptz
  created_at    timestamptz

room_members
  id            uuid PK
  room_id       uuid FK → rooms.id (CASCADE)
  user_id       uuid FK → profiles.id (CASCADE)

messages
  id            uuid PK
  room_id       uuid FK → rooms.id (CASCADE)
  user_id       uuid FK → profiles.id (nullable for system messages)
  content       text
  type          text  -- 'text' | 'system'
  is_read       boolean
  created_at    timestamptz

reactions
  id            uuid PK
  message_id    uuid FK → messages.id (CASCADE)
  user_id       uuid FK → profiles.id (CASCADE)
  emoji         text
  UNIQUE(message_id, user_id, emoji)
```

---

## Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   ├── (tabs)/
│   │   └── chats.tsx
│   ├── (onboarding)/
│   ├── chat/
│   │   └── [id].tsx          # Chat room screen
│   ├── new-chat.tsx           # Search users + create group
│   ├── edit-profile.tsx
│   └── _layout.tsx            # Root layout + push token registration
├── components/
│   ├── chat/
│   │   ├── ChatHeader.tsx
│   │   ├── ChatInput.tsx
│   │   └── ReactionPicker.tsx
│   ├── MessageBubble.tsx
│   └── RoomDetailsModal.tsx
├── context/
│   └── AuthContext.tsx
├── services/
│   ├── auth.ts
│   ├── chat.ts                # All Supabase DB operations
│   ├── profileService.ts      # Push token management
│   └── supabaseClient.ts
├── supabase/
│   └── functions/
│       └── send-notification/
│           └── index.ts       # Edge Function (Deno)
├── assets/
├── google-services.json       # NOT committed (in .gitignore)
├── app.config.js              # Dynamic config for EAS secrets
├── app.json
└── eas.json
```

---

## Features

### Messaging
- Real-time messages via Supabase Realtime (WebSocket)
- Optimistic UI — messages appear instantly before server confirmation
- Message deletion (own messages only)
- Read receipts
- Date separators between days
- System messages (join/leave/kick events)

### Push Notifications
- Multi-device support via `push_tokens` table
- Android: Firebase FCM V1
- iOS: Expo Push API + APNs
- Triggered via Supabase Database Webhook → Edge Function → Expo API
- Token auto-update on login, auto-remove on logout

### Reactions
- 6 emoji reactions: 👍 ❤️ 😂 😮 😢 👏
- Real-time reaction updates via Supabase Realtime
- Toggle (add/remove) own reactions
- Reaction count display per emoji

### Groups
- Create group rooms with custom names
- Invite users by username search
- Owner can kick members
- Leave room (non-owners)
- Delete group (owner only)
- Member list with owner badge

### Auth
- Email/password authentication via Supabase Auth
- Email verification flow
- Password reset via deep link
- Profile auto-creation via DB trigger on signup

---

## Push Notification Flow

```
1. User sends message
         ↓
2. INSERT into messages table
         ↓
3. Database Webhook fires → sends POST to Edge Function
         ↓
4. Edge Function (Deno):
   - Fetches room members (except sender) from room_members
   - Fetches their push tokens from push_tokens table
   - Filters valid ExponentPushToken[...] tokens
   - Sends batch notification to https://exp.host/--/api/v2/push/send
         ↓
5. Expo Push Service → Firebase FCM (Android) / APNs (iOS)
         ↓
6. Device receives notification
```

---

## Environment Variables

Variables managed via EAS Secrets (not in `.env`):

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_KEY` | Supabase anon key |
| `GOOGLE_SERVICES_JSON` | Firebase config file (EAS Secret, type: file) |

Supabase Edge Function secrets (set via Supabase Dashboard):

| Secret | Description |
|--------|-------------|
| `SUPABASE_URL` | Auto-injected |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injected |

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npx expo start --dev-client

# Deploy Edge Function
supabase functions deploy send-notification --no-verify-jwt
```

### EAS Build Profiles

```bash
# Development build (with dev client)
eas build --platform android --profile development

# Internal distribution APK
eas build --platform android --profile preview

# Production AAB (Play Store)
eas build --platform android --profile production
```

---

## Git Branches

| Branch | Description |
|--------|-------------|
| `main` | Stable production code |
| `feature/multi-device-push` | Multi-device push token support |
| `feature/reactions` | Emoji reactions feature |

---

## Known Constraints

- Push notifications on Android require a physical device (not Expo Go from SDK 53+)
- `google-services.json` must be provided via EAS Secret — never commit to Git
- Supabase Free tier has Edge Function cold start (~200-400ms delay)
- Realtime requires tables to be added to `supabase_realtime` publication

---

## Supabase Realtime Tables

```sql
-- Tables subscribed to Realtime
SELECT tablename FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
-- rooms, room_members, messages, reactions
```
