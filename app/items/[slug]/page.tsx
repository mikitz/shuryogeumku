/** @format */

import React from 'react';
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    getAllItems,
    getItemBySlug,
    getItemsByType,
    itemNameToSlug,
} from "@/lib/utils/data";

// Helper function to render item entries
function renderItemEntries(entries: any): React.ReactNode {
    if (!entries) return null;
    if (typeof entries === 'string') {
        return <p>{cleanText(entries)}</p>;
    }
    if (Array.isArray(entries)) {
        return entries.map((entry, idx) => {
            if (typeof entry === 'string') {
                return <p key={idx}>{cleanText(entry)}</p>;
            }
            if (typeof entry === 'object' && entry.type === 'list') {
                return (
                    <div key={idx} className="ml-4 my-2">
                        {entry.items && Array.isArray(entry.items) && entry.items.map((item: any, itemIdx: number) => (
                            <div key={itemIdx} className="mb-2">
                                {item.name && <strong className="font-semibold">{item.name}: </strong>}
                                {item.entries && renderItemEntries(item.entries)}
                            </div>
                        ))}
                    </div>
                );
            }
            if (typeof entry === 'object' && entry.type === 'entries') {
                return (
                    <div key={idx} className="my-2">
                        {entry.name && <h4 className="font-semibold mb-1">{entry.name}</h4>}
                        {entry.entries && renderItemEntries(entry.entries)}
                    </div>
                );
            }
            return <p key={idx} className="text-sm text-zinc-600 dark:text-zinc-400">{JSON.stringify(entry)}</p>;
        });
    }
    return <p>{JSON.stringify(entries)}</p>;
}

// Clean text by removing {@...} tags
function cleanText(text: string): string {
    if (typeof text !== 'string') return String(text);
    return text
        .replace(/\{@damage\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1 damage')
        .replace(/\{@dice\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1')
        .replace(/\{@spell\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1')
        .replace(/\{@item\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1')
        .replace(/\{@condition\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1')
        .replace(/\{@skill\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1')
        .replace(/\{@book\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1')
        .replace(/\{@dc\s+([^}|]+)(?:\|[^}]+)?\}/gi, 'DC $1')
        .replace(/\{@hit\s+([^}|]+)(?:\|[^}]+)?\}/gi, '+$1');
}

// Get damage type abbreviation
function getDamageType(dmgType: string): string {
    const damageTypes: Record<string, string> = {
        'A': 'Acid',
        'B': 'Bludgeoning',
        'C': 'Cold',
        'F': 'Fire',
        'FO': 'Force',
        'L': 'Lightning',
        'N': 'Necrotic',
        'P': 'Piercing',
        'R': 'Radiant',
        'S': 'Slashing',
        'T': 'Thunder',
        'Y': 'Psychic'
    };
    return damageTypes[dmgType] || dmgType;
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const items = getAllItems();
    const itemSlugs = items.map((item: any) => ({
        slug: itemNameToSlug(item.name),
    }));

    // Add filter routes
    const filterSlugs = [
        "weapons",
        "weapon",
        "melee",
        "ranged",
        "armor",
        "light",
        "medium",
        "heavy",
        "poisons",
        "potions",
        "rings",
        "rods",
        "wands",
        "wondrous",
    ].map((f) => ({ slug: f }));

    return [...itemSlugs, ...filterSlugs];
}

export default async function ItemPage({ params }: PageProps) {
    const { slug } = await params;
    // Normalize slug - handle potential URL encoding issues with +
    // Next.js might pass + as-is or as %2B
    const normalizedSlug = slug.includes("%2B")
        ? decodeURIComponent(slug)
        : slug;
    const slugLower = normalizedSlug.toLowerCase();

    // Check if it's a filter
    const filterMap: Record<string, string> = {
        weapons: "weapon",
        weapon: "weapon",
        melee: "melee",
        ranged: "ranged",
        armor: "armor",
        light: "light",
        medium: "medium",
        heavy: "heavy",
        poisons: "poisons",
        potions: "potions",
        rings: "rings",
        rods: "rods",
        wands: "wands",
        wondrous: "wondrous",
    };

    const filterType = filterMap[slugLower];

    if (filterType) {
        const filteredItems = getItemsByType(filterType);
        const sortedItems = [...filteredItems].sort((a: any, b: any) =>
            a.name.localeCompare(b.name)
        );

        let title = slugLower;
        if (slugLower === "weapons" || slugLower === "weapon") {
            title = "Weapons";
        } else if (slugLower === "melee") {
            title = "Melee Weapons";
        } else if (slugLower === "ranged") {
            title = "Ranged Weapons";
        } else if (slugLower === "armor") {
            title = "Armor";
        } else if (slugLower === "light") {
            title = "Light Armor";
        } else if (slugLower === "medium") {
            title = "Medium Armor";
        } else if (slugLower === "heavy") {
            title = "Heavy Armor";
        } else if (slugLower === "poisons") {
            title = "Poisons";
        } else if (slugLower === "potions") {
            title = "Potions";
        } else if (slugLower === "rings") {
            title = "Rings";
        } else if (slugLower === "rods") {
            title = "Rods";
        } else if (slugLower === "wands") {
            title = "Wands";
        } else if (slugLower === "wondrous") {
            title = "Wondrous Items";
            // Add tier links for wondrous items
            return (
                <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-6">
                            <Link
                                href="/items"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                ← Back to Items
                            </Link>
                        </div>
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold mb-2 text-black dark:text-zinc-50 capitalize">
                                {title}
                            </h1>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Total: {filteredItems.length}{" "}
                                {filteredItems.length === 1 ? "item" : "items"}
                            </p>
                        </div>

                        {/* Tier Filter Links */}
                        <div className="mb-6 flex flex-wrap gap-2">
                            <Link
                                href="/items/wondrous/none"
                                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                            >
                                None Tier
                            </Link>
                            <Link
                                href="/items/wondrous/minor"
                                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                            >
                                Minor Tier
                            </Link>
                            <Link
                                href="/items/wondrous/major"
                                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                            >
                                Major Tier
                            </Link>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                                    <thead className="bg-zinc-100 dark:bg-zinc-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                                                Rarity
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                                                Tier
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                                                Source
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                                        {sortedItems.map((item: any) => (
                                            <tr
                                                key={item.name}
                                                className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Link
                                                        href={`/items/${itemNameToSlug(
                                                            item.name
                                                        )}`}
                                                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                                    >
                                                        {item.name}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                                                    {item.rarity || "none"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                                                    {item.tier || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                                                    {item.source}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <Link
                            href="/items"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            ← Back to Items
                        </Link>
                    </div>
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2 text-black dark:text-zinc-50 capitalize">
                            {title}
                        </h1>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Total: {filteredItems.length}{" "}
                            {filteredItems.length === 1 ? "item" : "items"}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                                <thead className="bg-zinc-100 dark:bg-zinc-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                                            Rarity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                                            Source
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {sortedItems.map((item: any) => (
                                        <tr
                                            key={item.name}
                                            className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link
                                                    href={`/items/${itemNameToSlug(
                                                        item.name
                                                    )}`}
                                                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                                >
                                                    {item.name}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                                                {item.type || "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                                                {item.rarity || "none"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                                                {item.source}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Check for armor sub-routes: /items/armor/light, etc.
    // This would require a different route structure, but let's handle it here
    // Actually, Next.js will handle /items/armor/light differently, so we need separate routes

    // Otherwise, try to find as an item
    // Try with the original slug first (Next.js should preserve + in route params)
    let item = getItemBySlug(slug);

    // If not found, try normalized version
    if (!item && slug !== normalizedSlug) {
        item = getItemBySlug(normalizedSlug);
    }

    if (!item) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <Link
                        href="/items"
                        className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                        ← Back to Items
                    </Link>
                </div>

                {/* Header Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-800">
                    <h1 className="text-4xl font-bold mb-2 text-black dark:text-zinc-50">
                        {item.name}
                    </h1>
                    <div className="flex flex-wrap gap-4 text-sm mt-4">
                        {item.type && (
                            <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                                <span className="font-semibold text-blue-800 dark:text-blue-200">Type: </span>
                                <span className="text-blue-900 dark:text-blue-100">{item.type}</span>
                            </div>
                        )}
                        {item.rarity && (
                            <div className="bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                                <span className="font-semibold text-purple-800 dark:text-purple-200">Rarity: </span>
                                <span className="text-purple-900 dark:text-purple-100 capitalize">{item.rarity}</span>
                            </div>
                        )}
                        {item.weight && (
                            <div className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                                <span className="font-semibold text-green-800 dark:text-green-200">Weight: </span>
                                <span className="text-green-900 dark:text-green-100">
                                    {item.weight} {typeof item.weight === 'number' ? 'lbs' : ''}
                                </span>
                            </div>
                        )}
                        {item.reqAttune && (
                            <div className="bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
                                <span className="font-semibold text-orange-800 dark:text-orange-200">Requires Attunement</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Weapon Properties Card */}
                    {(item.property || item.weaponCategory || item.dmg1) && (
                        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-xl font-bold mb-4 text-black dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                                Weapon Properties
                            </h2>
                            <div className="space-y-4">
                                {item.weaponCategory && (
                                    <div>
                                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                            Category
                                        </div>
                                        <div className="text-zinc-900 dark:text-zinc-100 capitalize">
                                            {item.weaponCategory}
                                        </div>
                                    </div>
                                )}
                                {item.dmg1 && (
                                    <div>
                                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                            Damage
                                        </div>
                                        <div className="text-zinc-900 dark:text-zinc-100">
                                            {item.dmg1}
                                            {item.dmgType && ` ${getDamageType(item.dmgType)}`}
                                        </div>
                                    </div>
                                )}
                                {item.range && (
                                    <div>
                                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                            Range
                                        </div>
                                        <div className="text-zinc-900 dark:text-zinc-100">{item.range}</div>
                                    </div>
                                )}
                                {item.property && Array.isArray(item.property) && (
                                    <div>
                                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                            Properties
                                        </div>
                                        <div className="text-zinc-900 dark:text-zinc-100">
                                            {item.property.map((p: any) => {
                                                const propStr = typeof p === 'string' ? p.split('|')[0] : String(p);
                                                return propStr;
                                            }).join(', ')}
                                        </div>
                                    </div>
                                )}
                                {item.bonusWeapon && (
                                    <div>
                                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                            Bonus
                                        </div>
                                        <div className="text-zinc-900 dark:text-zinc-100">{item.bonusWeapon}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Armor Properties Card */}
                    {(item.ac || item.stealth) && (
                        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-xl font-bold mb-4 text-black dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                                Armor Properties
                            </h2>
                            <div className="space-y-4">
                                {item.ac && (
                                    <div>
                                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                            Armor Class
                                        </div>
                                        <div className="text-zinc-900 dark:text-zinc-100">
                                            {typeof item.ac === 'number' ? item.ac : JSON.stringify(item.ac)}
                                        </div>
                                    </div>
                                )}
                                {item.stealth !== undefined && (
                                    <div>
                                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                            Stealth
                                        </div>
                                        <div className="text-zinc-900 dark:text-zinc-100">
                                            {item.stealth ? 'Disadvantage' : 'Normal'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Spell Bonuses Card */}
                    {(item.bonusSpellAttack || item.bonusSpellSaveDc) && (
                        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-xl font-bold mb-4 text-black dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                                Spell Bonuses
                            </h2>
                            <div className="space-y-4">
                                {item.bonusSpellAttack && (
                                    <div>
                                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                            Spell Attack
                                        </div>
                                        <div className="text-zinc-900 dark:text-zinc-100">{item.bonusSpellAttack}</div>
                                    </div>
                                )}
                                {item.bonusSpellSaveDc && (
                                    <div>
                                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                            Spell Save DC
                                        </div>
                                        <div className="text-zinc-900 dark:text-zinc-100">{item.bonusSpellSaveDc}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Description Card */}
                {item.entries && (
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-xl font-bold mb-4 text-black dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                            Description
                        </h2>
                        <div className="text-zinc-800 dark:text-zinc-200 space-y-3 prose prose-zinc dark:prose-invert max-w-none">
                            {renderItemEntries(item.entries)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
