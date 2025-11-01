/** @format */

import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    getAllMonsters,
    getMonsterBySlug,
    getMonstersByType,
    getMonstersByCR,
    monsterNameToSlug,
    getCRValue,
    getTypeValue,
    getSizeValue,
} from "@/lib/utils/data";

// Helper function to render monster entries
function renderMonsterEntries(entries: any): React.ReactNode {
    if (!entries) return null;
    if (typeof entries === "string") {
        return <p>{cleanMonsterText(entries)}</p>;
    }
    if (Array.isArray(entries)) {
        return entries.map((entry, idx) => {
            if (typeof entry === "string") {
                return <p key={idx}>{cleanMonsterText(entry)}</p>;
            }
            if (typeof entry === "object" && entry.type === "list") {
                return (
                    <div
                        key={idx}
                        className="ml-4 my-2"
                    >
                        {entry.items &&
                            Array.isArray(entry.items) &&
                            entry.items.map((item: any, itemIdx: number) => (
                                <div
                                    key={itemIdx}
                                    className="mb-2"
                                >
                                    {item.name && (
                                        <strong className="font-semibold">
                                            {item.name}:{" "}
                                        </strong>
                                    )}
                                    {item.entries &&
                                        renderMonsterEntries(item.entries)}
                                </div>
                            ))}
                    </div>
                );
            }
            if (typeof entry === "object" && entry.type === "entries") {
                return (
                    <div
                        key={idx}
                        className="my-2"
                    >
                        {entry.name && (
                            <h4 className="font-semibold mb-1">{entry.name}</h4>
                        )}
                        {entry.entries && renderMonsterEntries(entry.entries)}
                    </div>
                );
            }
            return (
                <p
                    key={idx}
                    className="text-sm text-zinc-600 dark:text-zinc-400"
                >
                    {JSON.stringify(entry)}
                </p>
            );
        });
    }
    return <p>{JSON.stringify(entries)}</p>;
}

// Clean text by removing {@...} tags
function cleanMonsterText(text: string): string {
    if (typeof text !== "string") return String(text);
    return text
        .replace(/\{@damage\s+([^}|]+)(?:\|[^}]+)?\}/gi, "$1 damage")
        .replace(/\{@dice\s+([^}|]+)(?:\|[^}]+)?\}/gi, "$1")
        .replace(/\{@spell\s+([^}|]+)(?:\|[^}]+)?\}/gi, "$1")
        .replace(/\{@item\s+([^}|]+)(?:\|[^}]+)?\}/gi, "$1")
        .replace(/\{@condition\s+([^}|]+)(?:\|[^}]+)?\}/gi, "$1")
        .replace(/\{@skill\s+([^}|]+)(?:\|[^}]+)?\}/gi, "$1")
        .replace(/\{@book\s+([^}|]+)(?:\|[^}]+)?\}/gi, "$1")
        .replace(/\{@dc\s+([^}|]+)(?:\|[^}]+)?\}/gi, "DC $1")
        .replace(/\{@hit\s+([^}|]+)(?:\|[^}]+)?\}/gi, "+$1")
        .replace(/\{@h\}/gi, "")
        .replace(/\{@atkr\s+([^}|]+)(?:\|[^}]+)?\}/gi, "$1 attack")
        .replace(/\{@atkm\s+([^}|]+)(?:\|[^}]+)?\}/gi, "$1 attack")
        .replace(/\{@atkr\s+([^}|]+)(?:\|[^}]+)?\}/gi, "$1 attack")
        .replace(/\{@actSave\s+([^}|]+)(?:\|[^}]+)?\}/gi, "$1 saving throw")
        .replace(
            /\{@actSaveFail\s+([^}|]+)(?:\|[^}]+)?\}/gi,
            "On a failed save, $1"
        );
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const monsters = getAllMonsters();
    const monsterSlugs = monsters.map((monster: any) => ({
        slug: monsterNameToSlug(monster.name),
    }));

    // Get unique monster types
    const types = new Set<string>();
    monsters.forEach((monster: any) => {
        if (monster.type) {
            const monsterType =
                typeof monster.type === "string"
                    ? monster.type
                    : monster.type.type || monster.type;
            if (monsterType) {
                types.add(String(monsterType).toLowerCase());
            }
        }
    });

    const typeSlugs = Array.from(types).map((type) => ({
        slug: type,
    }));

    // Get unique CR values
    const crs = new Set<string>();
    monsters.forEach((monster: any) => {
        if (monster.cr) {
            const crValue = getCRValue(monster.cr);
            if (crValue && crValue !== "-") {
                // Store in URL-safe format (use hyphens for fractions)
                const crSlug = String(crValue)
                    .toLowerCase()
                    .replace(/\//g, "-");
                crs.add(crSlug);
            }
        }
    });

    const crSlugs = Array.from(crs).map((cr) => ({
        slug: `cr-${cr}`,
    }));

    return [...monsterSlugs, ...typeSlugs, ...crSlugs];
}

export default async function MonsterPage({ params }: PageProps) {
    const { slug } = await params;
    const slugLower = slug.toLowerCase();

    // First try to find as a monster (prioritize exact name matches)
    const monster = getMonsterBySlug(slug);

    // If we found a monster, show it
    if (monster) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-6">
                        <Link
                            href="/monsters"
                            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                        >
                            ← Back to Monsters
                        </Link>
                    </div>

                    {/* Header Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-800">
                        <h1 className="text-4xl font-bold mb-2 text-black dark:text-zinc-50">
                            {monster.name}
                        </h1>
                        <div className="flex flex-wrap gap-4 text-sm mt-4">
                            {monster.type && (
                                <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                                    <span className="font-semibold text-blue-800 dark:text-blue-200">
                                        Type:{" "}
                                    </span>
                                    <span className="text-blue-900 dark:text-blue-100 capitalize">
                                        {getTypeValue(monster.type)}
                                    </span>
                                </div>
                            )}
                            {"cr" in monster && monster.cr && (
                                <div className="bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full">
                                    <span className="font-semibold text-red-800 dark:text-red-200">
                                        CR:{" "}
                                    </span>
                                    <span className="text-red-900 dark:text-red-100">
                                        {getCRValue(monster.cr)}
                                    </span>
                                </div>
                            )}
                            {monster.size && (
                                <div className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                                    <span className="font-semibold text-green-800 dark:text-green-200">
                                        Size:{" "}
                                    </span>
                                    <span className="text-green-900 dark:text-green-100">
                                        {getSizeValue(monster.size)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Combat Stats Card */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-xl font-bold mb-4 text-black dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                                Combat Statistics
                            </h2>
                            <div className="space-y-4">
                                {monster.ac && (
                                    <div>
                                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                            Armor Class
                                        </div>
                                        <div className="text-zinc-900 dark:text-zinc-100">
                                            {Array.isArray(monster.ac)
                                                ? monster.ac
                                                      .map((ac: any) => {
                                                          if (
                                                              typeof ac ===
                                                              "number"
                                                          )
                                                              return ac;
                                                          if (
                                                              typeof ac ===
                                                                  "object" &&
                                                              ac.ac
                                                          )
                                                              return ac.ac;
                                                          if (
                                                              typeof ac ===
                                                                  "object" &&
                                                              ac.special
                                                          )
                                                              return ac.special;
                                                          return JSON.stringify(
                                                              ac
                                                          );
                                                      })
                                                      .join(", ")
                                                : typeof monster.ac === "number"
                                                ? monster.ac
                                                : JSON.stringify(monster.ac)}
                                        </div>
                                    </div>
                                )}

                                {monster.hp && (
                                    <div>
                                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                            Hit Points
                                        </div>
                                        <div className="text-zinc-900 dark:text-zinc-100">
                                            {typeof monster.hp === "number"
                                                ? monster.hp
                                                : typeof monster.hp ===
                                                      "object" &&
                                                  monster.hp !== null &&
                                                  "average" in monster.hp
                                                ? `${
                                                      (
                                                          monster.hp as {
                                                              average: number;
                                                              formula?: string;
                                                          }
                                                      ).average
                                                  } (${
                                                      (
                                                          monster.hp as {
                                                              average: number;
                                                              formula?: string;
                                                          }
                                                      ).formula || "N/A"
                                                  })`
                                                : typeof monster.hp ===
                                                      "object" &&
                                                  monster.hp !== null &&
                                                  "special" in monster.hp
                                                ? (
                                                      monster.hp as {
                                                          special: string;
                                                      }
                                                  ).special
                                                : JSON.stringify(monster.hp)}
                                        </div>
                                    </div>
                                )}

                                {monster.speed && (
                                    <div>
                                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                            Speed
                                        </div>
                                        <div className="text-zinc-900 dark:text-zinc-100">
                                            {typeof monster.speed === "string"
                                                ? monster.speed
                                                : typeof monster.speed ===
                                                  "object"
                                                ? Object.entries(monster.speed)
                                                      .filter(
                                                          ([key]) =>
                                                              key !==
                                                                  "canHover" &&
                                                              key !== "canSwim"
                                                      )
                                                      .map(
                                                          ([key, value]: [
                                                              string,
                                                              any
                                                          ]) => {
                                                              if (
                                                                  typeof value ===
                                                                  "number"
                                                              ) {
                                                                  return `${key} ${value} ft.`;
                                                              }
                                                              if (
                                                                  typeof value ===
                                                                      "object" &&
                                                                  value.number
                                                              ) {
                                                                  return `${key} ${
                                                                      value.number
                                                                  } ft.${
                                                                      value.condition
                                                                          ? ` ${value.condition}`
                                                                          : ""
                                                                  }`;
                                                              }
                                                              return `${key}: ${JSON.stringify(
                                                                  value
                                                              )}`;
                                                          }
                                                      )
                                                      .join(", ")
                                                : JSON.stringify(monster.speed)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ability Scores Card */}
                        {(monster.str ||
                            monster.dex ||
                            monster.con ||
                            monster.int ||
                            monster.wis ||
                            monster.cha) && (
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800">
                                <h2 className="text-xl font-bold mb-4 text-black dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                                    Ability Scores
                                </h2>
                                <div className="grid grid-cols-3 gap-4">
                                    {monster.str !== undefined && (
                                        <div className="text-center">
                                            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                                STR
                                            </div>
                                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                                {monster.str}
                                            </div>
                                            <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                                (
                                                {Math.floor(
                                                    (monster.str - 10) / 2
                                                ) >= 0
                                                    ? "+"
                                                    : ""}
                                                {Math.floor(
                                                    (monster.str - 10) / 2
                                                )}
                                                )
                                            </div>
                                        </div>
                                    )}
                                    {monster.dex !== undefined && (
                                        <div className="text-center">
                                            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                                DEX
                                            </div>
                                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                                {monster.dex}
                                            </div>
                                            <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                                (
                                                {Math.floor(
                                                    (monster.dex - 10) / 2
                                                ) >= 0
                                                    ? "+"
                                                    : ""}
                                                {Math.floor(
                                                    (monster.dex - 10) / 2
                                                )}
                                                )
                                            </div>
                                        </div>
                                    )}
                                    {monster.con !== undefined && (
                                        <div className="text-center">
                                            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                                CON
                                            </div>
                                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                                {monster.con}
                                            </div>
                                            <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                                (
                                                {Math.floor(
                                                    (monster.con - 10) / 2
                                                ) >= 0
                                                    ? "+"
                                                    : ""}
                                                {Math.floor(
                                                    (monster.con - 10) / 2
                                                )}
                                                )
                                            </div>
                                        </div>
                                    )}
                                    {monster.int !== undefined && (
                                        <div className="text-center">
                                            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                                INT
                                            </div>
                                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                                {monster.int}
                                            </div>
                                            <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                                (
                                                {Math.floor(
                                                    (monster.int - 10) / 2
                                                ) >= 0
                                                    ? "+"
                                                    : ""}
                                                {Math.floor(
                                                    (monster.int - 10) / 2
                                                )}
                                                )
                                            </div>
                                        </div>
                                    )}
                                    {monster.wis !== undefined && (
                                        <div className="text-center">
                                            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                                WIS
                                            </div>
                                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                                {monster.wis}
                                            </div>
                                            <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                                (
                                                {Math.floor(
                                                    (monster.wis - 10) / 2
                                                ) >= 0
                                                    ? "+"
                                                    : ""}
                                                {Math.floor(
                                                    (monster.wis - 10) / 2
                                                )}
                                                )
                                            </div>
                                        </div>
                                    )}
                                    {monster.cha !== undefined && (
                                        <div className="text-center">
                                            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                                CHA
                                            </div>
                                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                                {monster.cha}
                                            </div>
                                            <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                                (
                                                {Math.floor(
                                                    (monster.cha - 10) / 2
                                                ) >= 0
                                                    ? "+"
                                                    : ""}
                                                {Math.floor(
                                                    (monster.cha - 10) / 2
                                                )}
                                                )
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Additional Info Card */}
                    {(monster.senses ||
                        monster.languages ||
                        monster.resist ||
                        monster.immune ||
                        monster.vulnerable) && (
                        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-xl font-bold mb-4 text-black dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                                Additional Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {monster.senses && (
                                    <div>
                                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                            Senses
                                        </div>
                                        <div className="text-zinc-900 dark:text-zinc-100">
                                            {(() => {
                                                const senses = monster.senses;
                                                if (Array.isArray(senses)) {
                                                    return senses.join(", ");
                                                } else if (
                                                    typeof senses === "string"
                                                ) {
                                                    return senses;
                                                } else {
                                                    return JSON.stringify(
                                                        senses
                                                    );
                                                }
                                            })()}
                                            {monster.passive !== undefined &&
                                                `, Passive Perception ${monster.passive}`}
                                        </div>
                                    </div>
                                )}

                                {monster.languages && (
                                    <div>
                                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                            Languages
                                        </div>
                                        <div className="text-zinc-900 dark:text-zinc-100">
                                            {(() => {
                                                const languages =
                                                    monster.languages;
                                                if (Array.isArray(languages)) {
                                                    return languages.join(", ");
                                                } else if (
                                                    typeof languages ===
                                                    "string"
                                                ) {
                                                    return languages;
                                                } else {
                                                    return "—";
                                                }
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {"resist" in monster && monster.resist && (
                                    <div>
                                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                            Damage Resistances
                                        </div>
                                        <div className="text-zinc-900 dark:text-zinc-100">
                                            {Array.isArray(monster.resist)
                                                ? monster.resist.join(", ")
                                                : String(monster.resist)}
                                        </div>
                                    </div>
                                )}

                                {"immune" in monster && monster.immune && (
                                    <div>
                                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                            Damage Immunities
                                        </div>
                                        <div className="text-zinc-900 dark:text-zinc-100">
                                            {Array.isArray(monster.immune)
                                                ? monster.immune.join(", ")
                                                : String(monster.immune)}
                                        </div>
                                    </div>
                                )}

                                {"vulnerable" in monster &&
                                    monster.vulnerable && (
                                        <div>
                                            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                                Damage Vulnerabilities
                                            </div>
                                            <div className="text-zinc-900 dark:text-zinc-100">
                                                {Array.isArray(
                                                    monster.vulnerable
                                                )
                                                    ? monster.vulnerable.join(
                                                          ", "
                                                      )
                                                    : String(
                                                          monster.vulnerable
                                                      )}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>
                    )}

                    {/* Traits Card */}
                    {"trait" in monster &&
                        monster.trait &&
                        Array.isArray(monster.trait) &&
                        monster.trait.length > 0 && (
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-800">
                                <h2 className="text-xl font-bold mb-4 text-black dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                                    Traits
                                </h2>
                                <div className="space-y-4">
                                    {monster.trait.map(
                                        (trait: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className="pb-4 border-b border-zinc-200 dark:border-zinc-700 last:border-0 last:pb-0"
                                            >
                                                {trait.name && (
                                                    <div className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                                                        {trait.name}
                                                    </div>
                                                )}
                                                {trait.entries && (
                                                    <div className="text-zinc-700 dark:text-zinc-300 text-sm ml-4">
                                                        {renderMonsterEntries(
                                                            trait.entries
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                    {/* Actions Card */}
                    {"action" in monster &&
                        monster.action &&
                        Array.isArray(monster.action) &&
                        monster.action.length > 0 && (
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-800">
                                <h2 className="text-xl font-bold mb-4 text-black dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                                    Actions
                                </h2>
                                <div className="space-y-4">
                                    {monster.action.map(
                                        (action: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className="pb-4 border-b border-zinc-200 dark:border-zinc-700 last:border-0 last:pb-0"
                                            >
                                                {action.name && (
                                                    <div className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                                                        {action.name}
                                                    </div>
                                                )}
                                                {action.entries && (
                                                    <div className="text-zinc-700 dark:text-zinc-300 text-sm ml-4">
                                                        {renderMonsterEntries(
                                                            action.entries
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                    {/* Reactions Card */}
                    {"reaction" in monster &&
                        monster.reaction &&
                        Array.isArray(monster.reaction) &&
                        monster.reaction.length > 0 && (
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-800">
                                <h2 className="text-xl font-bold mb-4 text-black dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                                    Reactions
                                </h2>
                                <div className="space-y-4">
                                    {monster.reaction.map(
                                        (reaction: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className="pb-4 border-b border-zinc-200 dark:border-zinc-700 last:border-0 last:pb-0"
                                            >
                                                {reaction.name && (
                                                    <div className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                                                        {reaction.name}
                                                    </div>
                                                )}
                                                {reaction.entries && (
                                                    <div className="text-zinc-700 dark:text-zinc-300 text-sm ml-4">
                                                        {renderMonsterEntries(
                                                            reaction.entries
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                    {/* Legendary Actions Card */}
                    {"legendary" in monster &&
                        monster.legendary &&
                        Array.isArray(monster.legendary) &&
                        monster.legendary.length > 0 && (
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-800">
                                <h2 className="text-xl font-bold mb-4 text-black dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                                    Legendary Actions
                                </h2>
                                <div className="space-y-4">
                                    {monster.legendary.map(
                                        (legendary: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className="pb-4 border-b border-zinc-200 dark:border-zinc-700 last:border-0 last:pb-0"
                                            >
                                                {legendary.name && (
                                                    <div className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                                                        {legendary.name}
                                                    </div>
                                                )}
                                                {legendary.entries && (
                                                    <div className="text-zinc-700 dark:text-zinc-300 text-sm ml-4">
                                                        {renderMonsterEntries(
                                                            legendary.entries
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                    {/* Spellcasting Card */}
                    {"spellcasting" in monster &&
                        monster.spellcasting &&
                        Array.isArray(monster.spellcasting) &&
                        monster.spellcasting.length > 0 && (
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 mb-6 border border-zinc-200 dark:border-zinc-800">
                                <h2 className="text-xl font-bold mb-4 text-black dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                                    Spellcasting
                                </h2>
                                <div className="space-y-4">
                                    {monster.spellcasting.map(
                                        (casting: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className="border-l-4 border-purple-500 dark:border-purple-400 pl-4 pb-4 last:pb-0"
                                            >
                                                {casting.name && (
                                                    <div className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                                                        {casting.name}
                                                    </div>
                                                )}
                                                {casting.headerEntries && (
                                                    <div className="text-zinc-700 dark:text-zinc-300 text-sm mb-2">
                                                        {renderMonsterEntries(
                                                            casting.headerEntries
                                                        )}
                                                    </div>
                                                )}
                                                {casting.spells && (
                                                    <div className="text-sm space-y-1">
                                                        {Object.entries(
                                                            casting.spells
                                                        ).map(
                                                            ([
                                                                level,
                                                                spellData,
                                                            ]: [
                                                                string,
                                                                any
                                                            ]) => (
                                                                <div
                                                                    key={level}
                                                                    className="ml-2"
                                                                >
                                                                    <span className="font-semibold">
                                                                        Level{" "}
                                                                        {level ===
                                                                        "0"
                                                                            ? "Cantrip"
                                                                            : level}
                                                                        :
                                                                    </span>{" "}
                                                                    {spellData.slots && (
                                                                        <span className="text-zinc-600 dark:text-zinc-400">
                                                                            (
                                                                            {
                                                                                spellData.slots
                                                                            }{" "}
                                                                            slot
                                                                            {spellData.slots >
                                                                            1
                                                                                ? "s"
                                                                                : ""}
                                                                            ){" "}
                                                                        </span>
                                                                    )}
                                                                    {spellData.spells &&
                                                                        Array.isArray(
                                                                            spellData.spells
                                                                        ) && (
                                                                            <span>
                                                                                {spellData.spells
                                                                                    .map(
                                                                                        (
                                                                                            s: any
                                                                                        ) =>
                                                                                            cleanMonsterText(
                                                                                                String(
                                                                                                    s
                                                                                                )
                                                                                            )
                                                                                    )
                                                                                    .join(
                                                                                        ", "
                                                                                    )}
                                                                            </span>
                                                                        )}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                                {casting.will &&
                                                    Array.isArray(
                                                        casting.will
                                                    ) && (
                                                        <div className="text-sm mt-2">
                                                            <span className="font-semibold">
                                                                At will:
                                                            </span>{" "}
                                                            <span>
                                                                {casting.will
                                                                    .map(
                                                                        (
                                                                            s: any
                                                                        ) =>
                                                                            cleanMonsterText(
                                                                                String(
                                                                                    s
                                                                                )
                                                                            )
                                                                    )
                                                                    .join(", ")}
                                                            </span>
                                                        </div>
                                                    )}
                                                {casting.daily &&
                                                    casting.daily["1e"] &&
                                                    Array.isArray(
                                                        casting.daily["1e"]
                                                    ) && (
                                                        <div className="text-sm mt-2">
                                                            <span className="font-semibold">
                                                                1/day each:
                                                            </span>{" "}
                                                            <span>
                                                                {casting.daily[
                                                                    "1e"
                                                                ]
                                                                    .map(
                                                                        (
                                                                            s: any
                                                                        ) =>
                                                                            cleanMonsterText(
                                                                                String(
                                                                                    s
                                                                                )
                                                                            )
                                                                    )
                                                                    .join(", ")}
                                                            </span>
                                                        </div>
                                                    )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                </div>
            </div>
        );
    }

    // Check if it's a CR filter (format: cr-1, cr-2, etc.)
    if (slugLower.startsWith("cr-")) {
        const crValue = slugLower.replace("cr-", "");
        const crMonsters = getMonstersByCR(crValue);

        if (crMonsters.length > 0) {
            const sortedMonsters = [...crMonsters].sort((a: any, b: any) =>
                a.name.localeCompare(b.name)
            );

            return (
                <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-6">
                            <Link
                                href="/monsters"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                ← Back to Monsters
                            </Link>
                        </div>
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold mb-2 text-black dark:text-zinc-50">
                                CR {crValue.replace(/-/g, "/").toUpperCase()}{" "}
                                Monsters
                            </h1>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Total: {crMonsters.length}{" "}
                                {crMonsters.length === 1
                                    ? "monster"
                                    : "monsters"}
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
                                                CR
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                                                Source
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                                        {sortedMonsters.map((monster: any) => (
                                            <tr
                                                key={monster.name}
                                                className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Link
                                                        href={`/monsters/${monsterNameToSlug(
                                                            monster.name
                                                        )}`}
                                                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                                    >
                                                        {monster.name}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100 capitalize">
                                                    {getTypeValue(monster.type)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                                                    {getCRValue(monster.cr)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                                                    {monster.source}
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
    }

    // Check if it's a type filter
    const typeMonsters = getMonstersByType(slugLower);

    if (typeMonsters.length > 0) {
        const sortedMonsters = [...typeMonsters].sort((a: any, b: any) =>
            a.name.localeCompare(b.name)
        );

        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <Link
                            href="/monsters"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            ← Back to Monsters
                        </Link>
                    </div>
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2 text-black dark:text-zinc-50 capitalize">
                            {slugLower} Monsters
                        </h1>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Total: {typeMonsters.length}{" "}
                            {typeMonsters.length === 1 ? "monster" : "monsters"}
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
                                            CR
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                                            Source
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {sortedMonsters.map((monster: any) => (
                                        <tr
                                            key={monster.name}
                                            className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link
                                                    href={`/monsters/${monsterNameToSlug(
                                                        monster.name
                                                    )}`}
                                                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                                >
                                                    {monster.name}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100 capitalize">
                                                {getTypeValue(monster.type)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                                                {getCRValue(monster.cr)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                                                {monster.source}
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

    // Not a monster and not a type filter
    notFound();
}
