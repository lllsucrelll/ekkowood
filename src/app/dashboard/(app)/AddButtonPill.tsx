"use client";

export function AddButtonPill({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-brand-primary/30 bg-white/60 px-5 py-3.5 font-medium text-brand-primary transition hover:border-brand-primary hover:bg-white"
    >
      <span className="text-lg leading-none">+</span>
      Ajouter un bouton
    </button>
  );
}
