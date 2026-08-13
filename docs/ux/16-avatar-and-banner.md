# Flow 16 — Avatar and Banner

Status: proposed

## Entry

- Routes: `/account` (Character tab) or the "edit" action on the member's own public profile (`/member/<username>`)
- Reachable from: avatar menu and own public profile
- Actors: member, per character (each character has its own avatar and banner)

## Steps

1. Choose a source for each image:
   - **Upload** a file from the device (stored in R2 through the API),
   - or **paste an external image URL** (`ImageRef` value object).
2. Preview the image in place (cropping/aspect hints for avatar and banner slots).
3. Apply → the image becomes the character's avatar or banner; the previous image is replaced.
4. Remove → the image is cleared and a placeholder shows.

## States

- Per image (avatar, banner): unset → pending preview → set
- The two images are independent

## Errors

| Error | Surface |
| --- | --- |
| Invalid file type or size | inline error before upload |
| Broken external URL | preview fails with a fallback placeholder and a retry option |
| Not the character owner | the edit control is not rendered |

## Result

The public character profile (`/member/<username>`), post profiles, and navbar reflect the new images immediately.

## Navigation

`/` → `/member/<username>` → edit → same profile; also from `/account` (Character tab).
