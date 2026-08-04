"use client";

import { deleteMerchantAction } from "@/lib/actions/admin-merchants";

export function DeleteMerchantButton({
  merchantId,
  businessName,
}: {
  merchantId: string;
  businessName: string;
}) {
  return (
    <form
      action={deleteMerchantAction}
      onSubmit={(e) => {
        const confirmed = window.confirm(
          `Supprimer définitivement "${businessName}" ? Son compte, sa page publique et toutes ses statistiques seront irrémédiablement effacés.`
        );
        if (!confirmed) e.preventDefault();
      }}
    >
      <input type="hidden" name="merchantId" value={merchantId} />
      <button
        type="submit"
        className="text-xs text-red-600 hover:underline"
      >
        Supprimer
      </button>
    </form>
  );
}
