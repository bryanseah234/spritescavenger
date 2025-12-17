import masterCollection from "@/data/master-collection.json";

// Create a reverse map: slug -> category
const ITEM_TO_CATEGORY: Record<string, string> = {};

Object.entries(masterCollection).forEach(([category, items]) => {
    (items as string[]).forEach((slug) => {
        ITEM_TO_CATEGORY[slug] = category;
    });
});

export function getCategory(slug: string): string {
    return ITEM_TO_CATEGORY[slug] || "Unknown";
}
