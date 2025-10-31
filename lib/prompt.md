<!-- @format -->

You are going to make a SSG site using generateStaticParams in this project. You will use data from @/lib/data to create a static page for every spell, item, and monster in the game.

The homepage is an index file that routes to a table of /spells, /items, and /monsters. Also have index files that are tables of, e.g. /spells/wizard, /spells/evocation, /items/weapon, /items/armor, /items/poisons, /items/potions, /monsters/aberration, /monsters/beast, etc.

The data will only be taken from xphb, xdmg, and xmm.

URLs should use the full name and replace spaces with hyphens.

For items, filter on the type field: M = melee weapon, G = poison, P = potion, etc. and also use various booleans, like poison, potion, etc. to filter the items.

For spell schools, map them yourself.

For armor, make /items/armor have all armor, but also have /items/armor/light, /items/armor/medium, /items/armor/heavy, etc.cc

any questions before you begin?
