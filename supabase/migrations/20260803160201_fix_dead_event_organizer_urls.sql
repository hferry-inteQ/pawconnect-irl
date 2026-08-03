/*
# Fix Dead Event Organizer URLs

## Summary
Three event listings had dead organizer URLs that returned 404 or failed to resolve.
This migration updates them to working alternatives.

## Changes
Updates the `organizer_url` column on the `events` table:

1. "Foster a Dog This Summer — Dallas Animal Services"
   - https://www.dallasanimalservices.org/foster → https://www.dallasanimalservices.org
   - The /foster subpage returns 404; the main domain works.

2. "Golden Retriever Dallas Meetup"
   - https://www.grcofdallas.org/ → https://www.facebook.com/grcofdallas
   - Domain is dead; Facebook page is active.

3. "White Rock Lake Dog Run Morning Meetup"
   - https://www.dallasdogowners.com/ → https://www.whiterocklake.org
   - Domain is dead; White Rock Lake community site works.

## Security
No RLS or policy changes. Only data updates.
*/

UPDATE events SET organizer_url = 'https://www.dallasanimalservices.org' WHERE title = 'Foster a Dog This Summer — Dallas Animal Services';
UPDATE events SET organizer_url = 'https://www.facebook.com/grcofdallas' WHERE title = 'Golden Retriever Dallas Meetup';
UPDATE events SET organizer_url = 'https://www.whiterocklake.org' WHERE title = 'White Rock Lake Dog Run Morning Meetup';
