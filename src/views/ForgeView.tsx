import Forge from "@/components/Forge";

export default function ForgeView() {
    // Forge component currently behaves like a Modal in strict sense but we want it embedded.
    // However, existing Forge has isOpen/onClose props.
    // We'll wrap it to always be 'open' or refactor Forge to be static.
    // For now, let's just render the Forge component. 
    // Wait, the current Forge component is a Modal (Dialog).
    // We should probably refactor Forge to NOT be a modal if we want it in a tab.
    // OR just open it automatically. Let's look at Forge content first.

    // Actually, user asked for 'Tabbed Navigation'. A Tab usually implies inline content.
    // Opening a modal from a tab is weird.
    // Let's wrapping it in a div and forcing it visible if possible, 
    // OR acting as a trigger.
    // Better: Refactor Forge to be a standard component, or create a 'ForgeScreen'.

    return (
        <div className="w-full min-h-screen flex flex-col items-center pt-8">
            <Forge />
        </div>
    );
}
