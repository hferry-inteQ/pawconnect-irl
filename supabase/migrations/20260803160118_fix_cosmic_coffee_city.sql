/*
# Fix Cosmic Coffee city filter

The previous migration accidentally matched Cosmic Coffee with city = 'Dallas'
instead of 'Austin'. This corrects the URL for the Austin location.
*/

UPDATE dog_parks SET website = 'https://www.facebook.com/cosmiccoffeeatx' WHERE name = 'Cosmic Coffee + Beer Garden' AND city = 'Austin';
