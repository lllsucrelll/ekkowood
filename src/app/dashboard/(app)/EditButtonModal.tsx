"use client";

import { createElement, useEffect } from "react";
import { useActionState } from "react";
import {
  getButtonIcon,
  isInternalButtonType,
  isPredefinedButtonType,
  PREDEFINED_BUTTON_TYPES,
} from "@/lib/button-types";
import {
  updateButtonAction,
  deleteButtonAction,
  moveButtonAction,
} from "@/lib/actions/merchant-page";
import type { PageButton } from "@/lib/page-config";
import { Modal } from "./Modal";

export function EditButtonModal({
  button,
  canMoveUp,
  canMoveDown,
  onClose,
}: {
  button: PageButton;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState(updateButtonAction, {});
  const Icon = getButtonIcon(button.type);
  const internal = isInternalButtonType(button.type);
  const typeLabel = isPredefinedButtonType(button.type)
    ? PREDEFINED_BUTTON_TYPES[button.type].label
    : "Personnalisé";

  useEffect(() => {
    if (state.success) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Modal onClose={onClose} title="Modifier le bouton">
      <div className="mb-4 flex items-center gap-2 text-sm text-brand-text/60">
        {createElement(Icon, { className: "h-4 w-4 text-brand-primary" })}
        {typeLabel}
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="buttonId" value={button.id} />

        <div className="flex flex-col gap-1">
          <label htmlFor="edit-label" className="text-xs font-medium text-brand-text/70">
            Libellé
          </label>
          <input
            id="edit-label"
            name="label"
            defaultValue={button.label}
            required
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="edit-url" className="text-xs font-medium text-brand-text/70">
            Lien
          </label>
          <input
            id="edit-url"
            name="url"
            defaultValue={button.url}
            disabled={internal}
            placeholder={internal ? "Non nécessaire pour ce type" : undefined}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm disabled:bg-black/5 disabled:text-brand-text/40"
          />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-fit rounded-full bg-brand-primary px-5 py-2 text-sm font-medium text-white hover:bg-brand-primary-dark disabled:opacity-60"
        >
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4">
        <div className="flex gap-2">
          <form action={moveButtonAction.bind(null, button.id, "up")}>
            <button
              type="submit"
              disabled={!canMoveUp}
              className="rounded-full border border-black/10 px-3 py-1.5 text-xs disabled:opacity-30"
            >
              ↑ Monter
            </button>
          </form>
          <form action={moveButtonAction.bind(null, button.id, "down")}>
            <button
              type="submit"
              disabled={!canMoveDown}
              className="rounded-full border border-black/10 px-3 py-1.5 text-xs disabled:opacity-30"
            >
              ↓ Descendre
            </button>
          </form>
        </div>
        <form action={deleteButtonAction.bind(null, button.id)} onSubmit={onClose}>
          <button
            type="submit"
            className="rounded-full border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
          >
            Supprimer
          </button>
        </form>
      </div>
    </Modal>
  );
}
