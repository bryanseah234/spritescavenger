export interface BiomeDef {
    id: string;
    name: string;
    description: string;
    categories: string[]; // Keys from master-collection.json
    cost: number;
    color: string; // Tailwind class
    icon: string; // Lucide icon name usually, but we'll use placeholder or render elsewhere
}

export const BIOMES: BiomeDef[] = [
    {
        id: 'Depths',
        name: 'The Depths',
        description: 'A junkyard of lost history. Default loot.',
        categories: ['Miscellaneous', 'Objects'],
        cost: 0,
        color: 'slate-500',
        icon: 'Map'
    },
    {
        id: 'Pantry',
        name: 'The Pantry',
        description: 'Ancient food storage. Delicious decay.',
        categories: ['Food'],
        cost: 500,
        color: 'amber-600',
        icon: 'Utensils'
    },
    {
        id: 'Wilds',
        name: 'The Wilds',
        description: 'Nature reclaimed. Creatures and flora.',
        categories: ['Creatures', 'Plants'],
        cost: 1000,
        color: 'emerald-600',
        icon: 'Trees'
    },
    {
        id: 'Workshop',
        name: 'The Workshop',
        description: 'Tools of creation.',
        categories: ['Tools', 'Structures'],
        cost: 2500,
        color: 'orange-500',
        icon: 'Hammer'
    },
    {
        id: 'Mall',
        name: 'The Mall',
        description: 'Fashion and commerce frozen in time.',
        categories: ['Apparel', 'Art'],
        cost: 5000,
        color: 'pink-500',
        icon: 'ShoppingBag'
    }
];
