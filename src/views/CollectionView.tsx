import { Database } from "lucide-react";
import CollectionGrid from "@/components/CollectionGrid";

export default function CollectionView() {
    return (
        <div className="w-full px-4 flex flex-col items-center">
            {/* Header */}
            <div className="flex items-center gap-4 py-8">
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                    <Database className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">Database</h1> {/* Or "Archived Knowledge"? User asked for wording similar to crucible */}
                    <p className="text-slate-400">Catalog of discovered artifacts.</p>
                </div>
            </div>

            <CollectionGrid />
        </div>
    );
}

