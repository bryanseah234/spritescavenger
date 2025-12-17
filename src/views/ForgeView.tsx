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

    // For this step, I will re-use the existing Forge modal logic by auto-opening it
    // effectively making the 'Forge View' just a placeholder that triggers the modal?
    // No, that's bad UX.

    // Let's assume for this MVP step we render a button to Open Forge, 
    // OR we should ideally Refactor Forge.tsx to separate Content from Modal wrapper.
    // Given the constraints, I will create a view that mounts the Forge component
    // forcing isOpen={true} and removing the onClose capability (hide close button via CSS or prop).

    return (
        <div className="w-full h-[calc(100vh-8rem)] flex items-center justify-center p-4">
            <Forge isOpen={true} onClose={() => { }} />
        </div>
    );
}
