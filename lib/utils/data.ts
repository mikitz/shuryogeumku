// Utility functions for loading and filtering game data

import spellsXphb from '@/lib/data/spells/spells-xphb.json';
import itemsData from '@/lib/data/items/items.json';
import monstersXphb from '@/lib/data/bestiary/bestiary-xphb.json';
import monstersXmm from '@/lib/data/bestiary/bestiary-xmm.json';
import monstersXdmg from '@/lib/data/bestiary/bestiary-xdmg.json';
import sourcesData from '@/lib/data/spells/sources.json';

export { sourcesData };

// Spell school mapping
export const SPELL_SCHOOLS: Record<string, string> = {
  A: 'Abjuration',
  C: 'Conjuration',
  D: 'Divination',
  E: 'Enchantment',
  I: 'Illusion',
  N: 'Necromancy',
  T: 'Transmutation',
  V: 'Evocation',
};

// Get all spells from XPHB, XDMG, XMM
export function getAllSpells() {
  const spells = spellsXphb.spell.filter(
    (s: any) => s.source === 'XPHB' || s.source === 'XDMG' || s.source === 'XMM'
  );
  return spells;
}

// Get spells by class (using sources.json)
export function getSpellsByClass(className: string) {
  try {
    const allSpells = getAllSpells();
    const classSpells: any[] = [];
    
    // Validate className is a string
    if (!className || typeof className !== 'string') {
      return classSpells;
    }
    
    const classNameLower = String(className).toLowerCase();
    
    // Check XPHB source in sources.json
    const xphbSources = sourcesData.XPHB || {};
    
    allSpells.forEach((spell) => {
      try {
        const spellData = (xphbSources as any)[spell.name];
        if (spellData) {
          const classes = Array.isArray(spellData.class) ? spellData.class : [];
          const classVariants = Array.isArray(spellData.classVariant) ? spellData.classVariant : [];
          
          const hasClass = classes.some((c: any) => {
            try {
              if (!c) return false;
              // Handle both object format {name: "...", source: "..."} and string format
              let classNameValue: string | null = null;
              if (typeof c === 'string') {
                classNameValue = c;
              } else if (c && typeof c === 'object' && c.name && typeof c.name === 'string') {
                classNameValue = c.name;
              }
              if (!classNameValue || typeof classNameValue !== 'string') return false;
              return String(classNameValue).toLowerCase() === classNameLower && 
                     (typeof c === 'string' || (c && typeof c === 'object' && (c.source === 'XPHB' || c.source === 'PHB')));
            } catch {
              return false;
            }
          }) || classVariants.some((c: any) => {
            try {
              if (!c) return false;
              // Handle both object format {name: "...", source: "..."} and string format
              let classNameValue: string | null = null;
              if (typeof c === 'string') {
                classNameValue = c;
              } else if (c && typeof c === 'object' && c.name && typeof c.name === 'string') {
                classNameValue = c.name;
              }
              if (!classNameValue || typeof classNameValue !== 'string') return false;
              return String(classNameValue).toLowerCase() === classNameLower && 
                     (typeof c === 'string' || (c && typeof c === 'object' && (c.source === 'XPHB' || c.source === 'PHB')));
            } catch {
              return false;
            }
          });
          
          if (hasClass) {
            classSpells.push(spell);
          }
        }
      } catch {
        // Skip spells with malformed data
      }
    });
    
    return classSpells;
  } catch {
    return [];
  }
}

// Get spells by school
export function getSpellsBySchool(schoolCode: string) {
  const allSpells = getAllSpells();
  return allSpells.filter((s: any) => s.school === schoolCode);
}

// Get spell by name (URL slug)
export function getSpellBySlug(slug: string) {
  const allSpells = getAllSpells();
  const name = slug.split('-').map(w => 
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ');
  
  return allSpells.find((s: any) => 
    s.name.toLowerCase() === name.toLowerCase()
  );
}

// Convert spell name to slug
export function spellNameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w+\-]/g, '');
}

// Get all items from XPHB, XDMG, XMM
export function getAllItems() {
  return itemsData.item.filter(
    (i: any) => i.source === 'XPHB' || i.source === 'XDMG' || i.source === 'XMM'
  );
}

// Get items by type
export function getItemsByType(type: string) {
  const allItems = getAllItems();
  
  switch (type) {
    case 'weapon':
      return allItems.filter((i: any) => 
        i.type === 'M' || i.type === 'R' || i.weapon || i.weaponCategory
      );
    case 'melee':
      return allItems.filter((i: any) => {
        if (!i.type) return false;
        const typeStr = String(i.type);
        return typeStr.includes('M') || (i.weapon === true && !i.type?.includes('R'));
      });
    case 'ranged':
      return allItems.filter((i: any) => {
        if (!i.type) return false;
        const typeStr = String(i.type);
        return typeStr.includes('R') || (i.weapon === true && typeStr.includes('R'));
      });
    case 'armor':
      return allItems.filter((i: any) => {
        if (!i.type) return false;
        const typeStr = String(i.type);
        return typeStr.includes('LA') || typeStr.includes('MA') || typeStr.includes('HA') || i.armor === true;
      });
    case 'light':
      return allItems.filter((i: any) => {
        if (!i.type) return false;
        const typeStr = String(i.type);
        return typeStr.includes('LA') || (i.armor === true && typeStr.toLowerCase().includes('light'));
      });
    case 'medium':
      return allItems.filter((i: any) => {
        if (!i.type) return false;
        const typeStr = String(i.type);
        return typeStr.includes('MA') || (i.armor === true && typeStr.toLowerCase().includes('medium'));
      });
    case 'heavy':
      return allItems.filter((i: any) => {
        if (!i.type) return false;
        const typeStr = String(i.type);
        return typeStr.includes('HA') || (i.armor === true && typeStr.toLowerCase().includes('heavy'));
      });
    case 'poisons':
      return allItems.filter((i: any) => 
        i.type === 'G' || i.poison === true
      );
    case 'potions':
      return allItems.filter((i: any) => {
        if (!i.type) return false;
        const typeStr = String(i.type);
        return typeStr.includes('P') || i.potion === true;
      });
    case 'rings':
      return allItems.filter((i: any) => 
        i.type === 'RG' || i.type?.includes('RG') || i.name?.toLowerCase().includes('ring')
      );
    case 'rods':
      return allItems.filter((i: any) => 
        i.type === 'RD' || i.type?.includes('RD') || i.name?.toLowerCase().includes('rod')
      );
    case 'wands':
      return allItems.filter((i: any) => 
        i.type === 'WD' || i.type?.includes('WD') || i.name?.toLowerCase().includes('wand')
      );
    default:
      return [];
  }
}

// Get item by name (URL slug)
export function getItemBySlug(slug: string) {
  const allItems = getAllItems();
  
  // Normalize the slug - handle both + and %2B, and handle URL decoding
  // Next.js might pass the slug with + already decoded or as %2B
  let normalizedSlug = slug;
  try {
    // Try decoding in case it's URL encoded
    normalizedSlug = decodeURIComponent(slug);
  } catch (e) {
    // If decoding fails, use the original slug
    normalizedSlug = slug;
  }
  
  // Also try with + replaced by %2B (URL encoded)
  const encodedSlug = slug.replace(/\+/g, '%2B');
  let normalizedEncoded = encodedSlug;
  try {
    normalizedEncoded = decodeURIComponent(encodedSlug);
  } catch (e) {
    normalizedEncoded = encodedSlug;
  }
  
  // Try to match by comparing slugified versions
  // Also handle case where slug might have spaces instead of + (Next.js might decode + as space)
  const slugWithSpace = slug.replace(/\+/g, ' ');
  const slugWithPlus = slug.replace(/\s/g, '+');
  
  return allItems.find((i: any) => {
    const itemSlug = itemNameToSlug(i.name);
    // Compare against multiple variations to handle URL encoding quirks
    return itemSlug === slug || 
           itemSlug === normalizedSlug ||
           itemSlug === slugWithSpace ||
           itemSlug === slugWithPlus;
  });
}

// Convert item name to slug
export function itemNameToSlug(name: string): string {
  // Convert to lowercase, replace spaces with hyphens
  // Keep + signs as-is (they'll be handled by URL encoding in links)
  let slug = name.toLowerCase().replace(/\s+/g, '-');
  // Remove any characters that aren't word characters, +, or -
  slug = slug.replace(/[^\w+\-]/g, '');
  return slug;
}

// Get all monsters from XPHB, XMM, XDMG
export function getAllMonsters() {
  const xphb = monstersXphb.monster || [];
  const xmm = monstersXmm.monster || [];
  const xdmg = monstersXdmg.monster || [];
  
  return [
    ...xphb.filter((m: any) => m.source === 'XPHB'),
    ...xmm.filter((m: any) => m.source === 'XMM'),
    ...xdmg.filter((m: any) => m.source === 'XDMG'),
  ];
}

// Get monsters by type
export function getMonstersByType(type: string) {
  const allMonsters = getAllMonsters();
  if (!type || typeof type !== 'string') return [];
  const typeLower = String(type).toLowerCase();
  return allMonsters.filter((m: any) => {
    if (!m.type) return false;
    const monsterType = typeof m.type === 'string' ? m.type : (m.type && typeof m.type === 'object' ? m.type.type : null);
    if (!monsterType || typeof monsterType !== 'string') return false;
    return String(monsterType).toLowerCase() === typeLower;
  });
}

// Get monsters by CR
export function getMonstersByCR(cr: string) {
  const allMonsters = getAllMonsters();
  if (!cr || typeof cr !== 'string') return [];
  // Handle CR slugs - they might have underscores or hyphens for fractions
  // Convert common URL-safe formats back to fractions
  const crNormalized = cr.toLowerCase()
    .replace(/1-8/g, '1/8')
    .replace(/1-4/g, '1/4')
    .replace(/1-2/g, '1/2')
    .replace(/3-4/g, '3/4');
  
  return allMonsters.filter((m: any) => {
    if (!m.cr) return false;
    const crValue = getCRValue(m.cr);
    if (!crValue || crValue === '-') return false;
    const crValueLower = String(crValue).toLowerCase();
    // Compare both normalized formats and direct match
    return crValueLower === crNormalized || 
           crValueLower === cr.toLowerCase() ||
           crValueLower.replace(/\//g, '-') === cr.toLowerCase();
  });
}

// Get monster by name (URL slug)
export function getMonsterBySlug(slug: string) {
  const allMonsters = getAllMonsters();
  const name = slug.split('-').map(w => 
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ');
  
  return allMonsters.find((m: any) => 
    m.name.toLowerCase() === name.toLowerCase()
  );
}

// Convert monster name to slug
export function monsterNameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w+\-]/g, '');
}

// Helper to extract CR value from either string or object format
export function getCRValue(cr: any): string {
  if (!cr) return '-';
  if (typeof cr === 'string') return cr;
  if (typeof cr === 'object' && cr.cr) return cr.cr;
  return '-';
}

// Helper to extract type value from either string or object format
export function getTypeValue(type: any): string {
  if (!type) return '-';
  if (typeof type === 'string') return type;
  if (typeof type === 'object') {
    // Handle nested type.type structure
    if (type.type) {
      // If type.type is a string, return it
      if (typeof type.type === 'string') return type.type;
      // If type.type is an object with choose, return the choose array joined
      if (type.type.choose && Array.isArray(type.type.choose)) {
        return type.type.choose.join(' or ');
      }
      // If type.type is an object, try to get the type property
      if (typeof type.type === 'object') return '-';
    }
    return '-';
  }
  return '-';
}

// Helper to extract size value, handling arrays and objects
export function getSizeValue(size: any): string {
  if (!size) return '-';
  if (Array.isArray(size)) return size.join(', ');
  if (typeof size === 'string') return size;
  if (typeof size === 'object') {
    // Handle choose object
    if (size.choose && Array.isArray(size.choose)) {
      return size.choose.join(' or ');
    }
    // Try to get string representation
    return '-';
  }
  return '-';
}

