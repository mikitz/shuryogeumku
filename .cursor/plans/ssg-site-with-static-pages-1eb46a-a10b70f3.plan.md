<!-- a10b70f3-22dc-43fe-9799-6b218621bd47 6cb58603-48b2-444c-bf3e-6b65dbe682d2 -->
# SSG Site Implementation Plan

## Overview

Build a Next.js static site using `generateStaticParams` to generate pages for spells, items, and monsters from XPHB, XDMG, and XMM sources.

## File Structure

### Route Structure

- `/` - Homepage with links to `/spells`, `/items`, `/monsters`
- `/spells` - All spells table
- `/spells/[name]` - Individual spell page (name with hyphens)
- `/spells/[class]` - Filtered spells by class (e.g., `/spells/wizard`, `/spells/sorcerer`)
- `/spells/[school]` - Filtered spells by school (e.g., `/spells/evocation`, `/spells/abjuration`)
- `/items` - All items table
- `/items/[name]` - Individual item page
- `/items/[category]` - Filtered items (e.g., `/items/weapon`, `/items/armor`, `/items/poisons`, `/items/potions`)
- `/items/armor` - All armor
- `/items/armor/[category]` - Armor by category (e.g., `/items/armor/light`, `/items/armor/medium`, `/items/armor/heavy`)
- `/monsters` - All monsters table
- `/monsters/[name]` - Individual monster page
- `/monsters/[type]` - Filtered monsters by type (e.g., `/monsters/aberration`, `/monsters/beast`)

## Implementation Steps

### 1. Data Loading Utilities (`lib/data-utils.ts`)

- Create functions to load and filter data:
- `loadSpells()` - Load from `spells-xphb.json`, filter by source (XPHB, XDMG, XMM)
- `loadItems()` - Load from `items.json`, filter by source (XPHB, XDMG, XMM)
- `loadMonsters()` - Load from `bestiary-xphb.json`, `bestiary-xdmg.json`, `bestiary-xmm.json`
- `getSpellBySlug()`, `getItemBySlug()`, `getMonsterBySlug()` - Get individual entries
- Create slug generation: `name.toLowerCase().replace(/\s+/g, '-')`
- Spell school mapping: A=Abjuration, V=Evocation, T=Transmutation, E=Enchantment, C=Conjuration, D=Divination, I=Illusion, N=Necromancy
- Cross-reference `sources.json` for spell class filtering
- Item type mapping: M=melee weapon, G=poison, P=potion, LA=light armor, MA=medium armor, HA=heavy armor

### 2. Homepage (`app/page.tsx`)

- Replace current content with navigation cards/links to `/spells`, `/items`, `/monsters`

### 3. Spell Routes

#### `app/spells/page.tsx`

- Index page listing all spells in a table
- Columns: Name (link), Level, School, Classes
- Use `generateStaticParams` not needed (this is the index)

#### `app/spells/[slug]/page.tsx`

- Individual spell page
- Display all spell data: name, level, school, classes, casting time, range, components, duration, description, higher levels, etc.
- Use `generateStaticParams` to generate all spell slugs

#### `app/spells/[filter]/page.tsx` (class/school filters)

- Dynamic route for class or school filters
- Check if filter is a valid class or school
- Display filtered table of spells
- Use `generateStaticParams` to generate class and school slugs

### 4. Item Routes

#### `app/items/page.tsx`

- Index page listing all items in a table
- Columns: Name (link), Type, Rarity

#### `app/items/[slug]/page.tsx`

- Individual item page
- Display all item data: name, type, rarity, attunement, description, etc.
- Use `generateStaticParams` to generate all item slugs

#### `app/items/[category]/page.tsx`

- Filter by item category (weapon, armor, poisons, potions)
- Filter logic:
- `weapon`: type starts with "M" or `weapon: true`
- `armor`: type is "LA", "MA", "HA" or `armor: true`
- `poisons`: type is "G" or `poison: true`
- `potions`: type is "P" or `potion: true`
- Use `generateStaticParams` to generate category slugs

#### `app/items/armor/[category]/page.tsx`

- Filter armor by type: light (LA), medium (MA), heavy (HA)
- Use `generateStaticParams` to generate armor category slugs

### 5. Monster Routes

#### `app/monsters/page.tsx`

- Index page listing all monsters in a table
- Columns: Name (link), Type, Challenge Rating

#### `app/monsters/[slug]/page.tsx`

- Individual monster page
- Display all monster data: stats, abilities, actions, etc.
- Use `generateStaticParams` to generate all monster slugs

#### `app/monsters/[type]/page.tsx`

- Filter monsters by type (aberration, beast, celestial, construct, dragon, elemental, fey, fiend, giant, humanoid, monstrosity, ooze, plant, undead)
- Use `generateStaticParams` to generate monster type slugs

### 6. Shared Components

- Create reusable table components for index pages
- Create layout wrapper for consistent styling
- Format display components for spell/item/monster data rendering

## Data Filtering Rules

### Sources (XPHB, XDMG, XMM only)

- Spells: `source === "XPHB" || source === "XDMG" || source === "XMM"`
- Items: `source === "XPHB" || source === "XDMG" || source === "XMM"`
- Monsters: Load only from `bestiary-xphb.json`, `bestiary-xdmg.json`, `bestiary-xmm.json`

### Spell Schools Mapping

- A → Abjuration
- V → Evocation
- T → Transmutation
- E → Enchantment
- C → Conjuration
- D → Divination
- I → Illusion
- N → Necromancy

### Item Type Categories

- Melee weapons: `type.startsWith("M")`
- Armor: `type === "LA" || type === "MA" || type === "HA"` or `armor === true`
- Poisons: `type === "G"` or `poison === true`
- Potions: `type === "P"` or `potion === true`

## Notes

- All URLs use slug format: full name with spaces replaced by hyphens
- Filter routes need to distinguish between valid filters (classes/schools/types) and actual item/spell/monster names
- Consider using catch-all or middleware to handle route conflicts, or validate slugs against data

### To-dos

- [ ] Create data loading utilities in lib/data-utils.ts to load and filter spells, items, monsters from XPHB/XDMG/XMM sources, with slug generation and mapping functions
- [ ] Update app/page.tsx to show navigation links to /spells, /items, /monsters
- [ ] Create app/spells/page.tsx with table of all spells
- [ ] Create app/spells/[slug]/page.tsx for individual spell pages with generateStaticParams
- [ ] Create app/spells/[filter]/page.tsx for class/school filtered spell lists with generateStaticParams
- [ ] Create app/items/page.tsx with table of all items
- [ ] Create app/items/[slug]/page.tsx for individual item pages with generateStaticParams
- [ ] Create app/items/[category]/page.tsx for filtered item lists (weapon, armor, poisons, potions) with generateStaticParams
- [ ] Create app/items/armor/[category]/page.tsx for light/medium/heavy armor filters with generateStaticParams
- [ ] Create app/monsters/page.tsx with table of all monsters
- [ ] Create app/monsters/[slug]/page.tsx for individual monster pages with generateStaticParams
- [ ] Create app/monsters/[type]/page.tsx for type-filtered monster lists with generateStaticParams