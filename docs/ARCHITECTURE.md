<!--
  Architecture & API Documentation for HabitTracker
  Documents Firestore collections, security rules, and TypeScript data models.
-->
# Architecture & API Documentation

This document describes the Firebase Firestore schema, security rules, and TypeScript data models
used by the HabitTracker application.

## Firestore Collections

### groups
- **Path**: `/groups/{groupId}`
- **Description**: User-defined categories to organize routines.
- **Fields**:
  - `userId` (`string`): UID of the owning user.
  - `name` (`string`): Name of the group.
  - `icon?` (`string`): Optional icon name.
  - `timeRange?` (`string`): Optional time window for group reminders (e.g. "09:00 - 17:00").
  - `createdAt?` (`string`): ISO timestamp when the group was created.

### routines
- **Path**: `/routines/{routineId}`
- **Description**: Individual daily habits or routines.
- **Fields**:
  - `userId` (`string`): UID of the owning user.
  - `name` (`string`): Name of the routine.
  - `priority` (`'high' | 'medium' | 'low'`): Priority level.
  - `expectedTime` (`string`): Time of day for reminders (e.g. "08:30").
  - `groupId?` (`string | null`): ID of the group this routine belongs to.
  - `icon?` (`string`): Optional icon name.
  - `archived` (`boolean`): Whether the routine is archived.
  - `archivedAt?` (`string`): ISO timestamp when archived.
  - `createdAt?` (`string`): ISO timestamp when created.

### weekdaySchedules
- **Path**: `/weekdaySchedules/{scheduleId}`
- **Description**: Weekly recurrence map for each routine.
- **Fields**:
  - `id` (`string`): Document identifier.
  - `routineId` (`string`): Associated routine ID.
  - `monday` … `sunday` (`boolean`): Flags for each weekday.

### completions
- **Path**: `/completions/{completionId}`
- **Description**: Records when a routine is completed.
- **Fields**:
  - `userId` (`string`): UID of the completing user.
  - `routineId` (`string`): ID of the completed routine.
  - `completedAt` (`Timestamp`): Firestore timestamp of completion.

## TypeScript Data Models

The corresponding TypeScript interfaces are defined in `src/lib/types.ts`:
```ts
// src/lib/types.ts
export interface Routine {
  id: string;
  name: string;
  expectedTime: string;
  priority: 'high' | 'medium' | 'low';
  icon?: string;
  userId: string;
  groupId?: string;
  archived: boolean;
  archivedAt?: string;
  createdAt?: string;
  completed?: boolean;
}
export interface Group {
  id: string;
  name: string;
  icon?: string;
  timeRange?: string;
  userId: string;
  createdAt?: string;
}
export interface WeekdaySchedule {
  id: string;
  routineId: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}
export interface Completion {
  id: string;
  routineId: string;
  completedAt: string;
  userId: string;
}
```

## Firestore Security Rules

The following rules ensure that users can only access their own documents:
```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isOwner(field) {
      return request.auth != null && request.auth.uid == field;
    }

    match /groups/{groupId} {
      allow create: if isOwner(request.resource.data.userId);
      allow read, update, delete: if isOwner(resource.data.userId);
    }

    match /routines/{routineId} {
      allow create: if isOwner(request.resource.data.userId);
      allow read, update, delete: if isOwner(resource.data.userId);
    }

    match /weekdaySchedules/{scheduleId} {
      allow create: if isOwner(request.resource.data.userId);
      allow read, update, delete: if isOwner(resource.data.userId);
    }

    match /completions/{completionId} {
      allow create: if isOwner(request.resource.data.userId);
      allow read, delete: if isOwner(resource.data.userId);
    }
  }
}
```

> **Note**: Deploy these rules by saving them to a `firestore.rules` file and running `firebase deploy --only firestore:rules`.