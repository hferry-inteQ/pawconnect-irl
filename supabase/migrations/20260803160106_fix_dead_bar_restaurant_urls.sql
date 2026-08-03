/*
# Fix Dead Bar & Restaurant Website URLs

## Summary
Many dog-friendly bar/restaurant listings had website URLs that were either
pointing to dead domains or returning 404 errors. This migration updates
those URLs to their correct, working equivalents.

## Changes
Updates the `website` column on the `dog_parks` table for the following venues:

### Austin
- Cosmic Coffee + Beer Garden: cosmiccoffee.com → facebook.com/cosmiccoffeeatx (domain dead, FB is active)

### Chicago
- Archie's Iowa Rockwell Tavern: archiesrockwell.com → instagram.com/archies.chicago (no official site)
- Barrio: barriotavern.com → barriochicago.com (wrong domain)
- Farm Bar: farmbarchi.com → farm-bar.com (wrong domain)
- Handlebar Chicago: handlebar-chicago.com → handlebarchicago.com (hyphenated, wrong)
- Lou's Backyard: lousbackyard.com → sunnygunchicago.com (venue rebranded to SUNNYGUN)
- Ludlow Liquors: ludlowliquors.com → ludlow-liquors.com (missing hyphen)
- Mott St: mottstchicago.com → mottstreetchicago.com (missing "reet")
- The Patio at Cafe Brauer: cafebrauer.com → facebook.com/cafebrauer (domain dead)
- The Promontory: thepromontorychicago.com → facebook.com/thepromontorychicago (domain dead)

### Dallas
- Ferris Wheelers Backyard and BBQ: ferriswheelersdallas.com → ferriswheelers.com
- Goodfriend Beer Garden & Burger House: goodfriendbar.com → goodfrienddallas.com
- Joe Leo Fine Tex Mex: joeleodallas.com → joeleo.com
- Lake House Bar and Grill: lakehousebarandgrilldallas.com → lakehousebarandgrill.com
- Mercat Bistro: mercatbistro.com → www.mercatbistro.com (needs www)
- State & Allen Kitchen + Bar: stateandallen.com → www.stateandallen.com (needs www)
- Tequila Social: tequilasocialdallas.com → (dead, no replacement found)
- The Ranch at Las Colinas: theranchatlasc.com → facebook.com/TheRanchatLasColinas (domain dead)
- The Shacks at Austin Ranch: theshacksaustin.com → theshacks.com
- Victory Social: victorysocialdallas.com → victorysocial.com

### Fort Worth
- MELT Ice Cream: meltcreamery.com → facebook.com/meltcreamery (domain dead)
- The Rustic Fort Worth: therustic.com/fort-worth → therustic.com (404 on /fort-worth path)

### New Orleans
- Harry's Corner: harryscornerbar.com → facebook.com/harryscornerbar (domain dead)
- Markey's Bar: markeysnola.com → facebook.com/MarkeysBarNOLA (domain dead)
- Treme Coffeehouse (Patio): tremecoffeehouse.com → tremecoffee.com
- Urban South Brewery: urbansouthbrewery.com → www.urbansouthbrewery.com (needs www)

## Security
No RLS or policy changes. Only data updates to the `website` column.

## Notes
1. Venues whose domains are dead and have no known replacement website
   are pointed to their active Facebook or Instagram page as a fallback.
2. Tequila Social (Dallas) domain is dead with no social media fallback found;
   the URL is left as-is since we cannot confirm a replacement.
*/

-- Austin
UPDATE dog_parks SET website = 'https://www.facebook.com/cosmiccoffeeatx' WHERE name = 'Cosmic Coffee + Beer Garden' AND city = 'Dallas';

-- Chicago
UPDATE dog_parks SET website = 'https://www.instagram.com/archies.chicago' WHERE name = 'Archie''s Iowa Rockwell Tavern' AND city = 'Chicago';
UPDATE dog_parks SET website = 'https://www.barriochicago.com' WHERE name = 'Barrio' AND city = 'Chicago';
UPDATE dog_parks SET website = 'https://www.farm-bar.com' WHERE name = 'Farm Bar' AND city = 'Chicago';
UPDATE dog_parks SET website = 'https://www.handlebarchicago.com' WHERE name = 'Handlebar Chicago' AND city = 'Chicago';
UPDATE dog_parks SET website = 'https://www.sunnygunchicago.com' WHERE name = 'Lou''s Backyard' AND city = 'Chicago';
UPDATE dog_parks SET website = 'https://www.ludlow-liquors.com' WHERE name = 'Ludlow Liquors' AND city = 'Chicago';
UPDATE dog_parks SET website = 'https://www.mottstreetchicago.com' WHERE name = 'Mott St' AND city = 'Chicago';
UPDATE dog_parks SET website = 'https://www.facebook.com/cafebrauer' WHERE name = 'The Patio at Cafe Brauer' AND city = 'Chicago';
UPDATE dog_parks SET website = 'https://www.facebook.com/thepromontorychicago' WHERE name = 'The Promontory' AND city = 'Chicago';

-- Dallas
UPDATE dog_parks SET website = 'https://www.ferriswheelers.com' WHERE name = 'Ferris Wheelers Backyard and BBQ' AND city = 'Dallas';
UPDATE dog_parks SET website = 'https://www.goodfrienddallas.com' WHERE name = 'Goodfriend Beer Garden & Burger House' AND city = 'Dallas';
UPDATE dog_parks SET website = 'https://www.joeleo.com' WHERE name = 'Joe Leo Fine Tex Mex' AND city = 'Dallas';
UPDATE dog_parks SET website = 'https://www.lakehousebarandgrill.com' WHERE name = 'Lake House Bar and Grill' AND city = 'Dallas';
UPDATE dog_parks SET website = 'https://www.mercatbistro.com' WHERE name = 'Mercat Bistro' AND city = 'Dallas';
UPDATE dog_parks SET website = 'https://www.stateandallen.com' WHERE name = 'State & Allen Kitchen + Bar' AND city = 'Dallas';
UPDATE dog_parks SET website = 'https://www.facebook.com/TheRanchatLasColinas' WHERE name = 'The Ranch at Las Colinas' AND city = 'Dallas';
UPDATE dog_parks SET website = 'https://theshacks.com' WHERE name = 'The Shacks at Austin Ranch' AND city = 'Dallas';
UPDATE dog_parks SET website = 'https://victorysocial.com' WHERE name = 'Victory Social' AND city = 'Dallas';

-- Fort Worth
UPDATE dog_parks SET website = 'https://www.facebook.com/meltcreamery' WHERE name = 'MELT Ice Cream' AND city = 'Fort Worth';
UPDATE dog_parks SET website = 'https://www.therustic.com' WHERE name = 'The Rustic Fort Worth' AND city = 'Fort Worth';

-- New Orleans
UPDATE dog_parks SET website = 'https://www.facebook.com/harryscornerbar' WHERE name = 'Harry''s Corner' AND city = 'New Orleans';
UPDATE dog_parks SET website = 'https://www.facebook.com/MarkeysBarNOLA' WHERE name = 'Markey''s Bar' AND city = 'New Orleans';
UPDATE dog_parks SET website = 'https://tremecoffee.com' WHERE name = 'Treme Coffeehouse (Patio)' AND city = 'New Orleans';
UPDATE dog_parks SET website = 'https://www.urbansouthbrewery.com' WHERE name = 'Urban South Brewery' AND city = 'New Orleans';
