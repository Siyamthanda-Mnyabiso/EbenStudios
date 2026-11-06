-- Product categories for the shop filter, and real copy for the launch products
-- that were seeded as placeholders.

alter table public.products
    add column category text
    check (category in ('Hoodies', 'T-shirts', 'Bottoms', 'Outerwear', 'Accessories'));

update public.products
set category = 'T-shirts',
    tag = 'New',
    description = 'An oversized white tee in a boxy fit with dropped shoulders, finished with a small embroidered Eben Studios logo on the chest. Also available in black.'
where name = 'White tee' and tag = 'Placeholder';

update public.products
set category = 'Bottoms',
    tag = null,
    description = 'Lightweight red shorts with an elastic waist and the Eben Supply script logo on the leg. Made for warm Cape Town days and easy layering with a white tee.'
where name = 'Red shorts' and tag = 'Placeholder';

update public.products
set category = 'Accessories',
    tag = null,
    description = 'A red cap with a soft crown and a short curved brim. The finishing touch on any Eben Studios fit.'
where name = 'Cap' and tag = 'Placeholder';

-- Products not covered above (none expected) keep a null category and still show under All.
