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

// Helper function to extract base type code from type string (handles M|XPHB format)
function getBaseType(item: any): string {
  if (!item.type) return '';
  const typeStr = String(item.type);
  // Extract the part before the pipe, or the whole string if no pipe
  return typeStr.split('|')[0];
}

// Get items by type
export function getItemsByType(type: string) {
  const allItems = getAllItems();
  
  switch (type) {
    case 'weapon':
      return allItems.filter((i: any) => {
        const baseType = getBaseType(i);
        return baseType === 'M' || baseType === 'R' || i.weapon === true || i.weaponCategory;
      });
    case 'melee':
      return allItems.filter((i: any) => {
        const baseType = getBaseType(i);
        return baseType === 'M' || (i.weapon === true && baseType !== 'R');
      });
    case 'ranged':
      return allItems.filter((i: any) => {
        const baseType = getBaseType(i);
        return baseType === 'R';
      });
    case 'armor':
      return allItems.filter((i: any) => {
        const baseType = getBaseType(i);
        return baseType === 'LA' || baseType === 'MA' || baseType === 'HA' || i.armor === true;
      });
    case 'light':
      return allItems.filter((i: any) => {
        const baseType = getBaseType(i);
        return baseType === 'LA';
      });
    case 'medium':
      return allItems.filter((i: any) => {
        const baseType = getBaseType(i);
        return baseType === 'MA';
      });
    case 'heavy':
      return allItems.filter((i: any) => {
        const baseType = getBaseType(i);
        return baseType === 'HA';
      });
    case 'poisons':
      return allItems.filter((i: any) => i.poison === true);
    case 'potions':
      return allItems.filter((i: any) => {
        const baseType = getBaseType(i);
        return baseType === 'P' || i.potion === true;
      });
    case 'rings':
      return allItems.filter((i: any) => {
        const baseType = getBaseType(i);
        return baseType === 'RG';
      });
    case 'rods':
      return allItems.filter((i: any) => {
        const baseType = getBaseType(i);
        return baseType === 'RD';
      });
    case 'wands':
      return allItems.filter((i: any) => {
        const baseType = getBaseType(i);
        return baseType === 'WD';
      });
    case 'wondrous':
      return allItems.filter((i: any) => i.wondrous === true);
    case 'wondrous-none':
      return allItems.filter((i: any) => {
        if (!i.wondrous) return false;
        // Items with tier 'none' or rarity 'common'/'none' or no rarity
        return i.tier === 'none' || 
               (!i.tier && (!i.rarity || i.rarity === 'none' || i.rarity === 'common'));
      });
    case 'wondrous-minor':
      return allItems.filter((i: any) => {
        if (!i.wondrous) return false;
        // Items with tier 'minor' or rarity 'uncommon'/'rare' without explicit tier
        return i.tier === 'minor' || 
               (!i.tier && (i.rarity === 'uncommon' || i.rarity === 'rare'));
      });
    case 'wondrous-major':
      return allItems.filter((i: any) => {
        if (!i.wondrous) return false;
        // Items with tier 'major' or rarity 'very rare'/'legendary'/'artifact' without explicit tier
        return i.tier === 'major' || 
               (!i.tier && (i.rarity === 'very rare' || i.rarity === 'legendary' || i.rarity === 'artifact'));
      });
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

// Class data imports - import all class files
import classArtificer from '@/lib/data/class/class-artificer.json';
import classBarbarian from '@/lib/data/class/class-barbarian.json';
import classBard from '@/lib/data/class/class-bard.json';
import classCleric from '@/lib/data/class/class-cleric.json';
import classDruid from '@/lib/data/class/class-druid.json';
import classFighter from '@/lib/data/class/class-fighter.json';
import classMonk from '@/lib/data/class/class-monk.json';
import classPaladin from '@/lib/data/class/class-paladin.json';
import classRanger from '@/lib/data/class/class-ranger.json';
import classRogue from '@/lib/data/class/class-rogue.json';
import classSorcerer from '@/lib/data/class/class-sorcerer.json';
import classWarlock from '@/lib/data/class/class-warlock.json';
import classWizard from '@/lib/data/class/class-wizard.json';

// Get all classes from XPHB (2024 sources only)
export function getAllClasses() {
  const classes: any[] = [];
  
  // Array of all class modules
  const classModules = [
    classArtificer,
    classBarbarian,
    classBard,
    classCleric,
    classDruid,
    classFighter,
    classMonk,
    classPaladin,
    classRanger,
    classRogue,
    classSorcerer,
    classWarlock,
    classWizard,
  ];
  
  // Loop through all class files and extract XPHB entries
  classModules.forEach((classModule: any) => {
    if (classModule && classModule.class && Array.isArray(classModule.class)) {
      // Filter for only XPHB source (2024)
      const xphbClasses = classModule.class.filter((c: any) => c.source === 'XPHB');
      classes.push(...xphbClasses);
    }
  });
  
  return classes;
}

// Get class by name (URL slug)
export function getClassBySlug(slug: string) {
  const allClasses = getAllClasses();
  const name = slug.split('-').map(w => 
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ');
  
  return allClasses.find((c: any) => 
    c.name.toLowerCase() === name.toLowerCase()
  );
}

// Convert class name to slug
export function classNameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w+\-]/g, '');
}

