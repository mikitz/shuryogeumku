/** @format */

import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen dark:bg-gray-950">
            <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-blue-400" />
            <p className="mt-4 text-lg text-muted-foreground dark:text-gray-400">
                Loading Monsters...
            </p>
        </div>
    );
}
