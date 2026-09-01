"use client";

import * as React from "react";

import { useCommerce } from "@/components/commerce/commerce-provider";
import {
  completeStorefrontVisit,
  reserveStorefrontVisit,
} from "@/lib/sazito/visit";

let fallbackVisitRequested = false;

export function StoreVisitTracker() {
  const { client } = useCommerce();

  React.useEffect(() => {
    let storage: Storage | null = null;
    try {
      storage = window.sessionStorage;
    } catch {
      // Some privacy modes block access to sessionStorage entirely.
    }

    const reservation = storage
      ? reserveStorefrontVisit(storage, navigator.doNotTrack)
      : "unavailable";

    if (reservation === "skip") return;
    if (reservation === "unavailable") {
      if (fallbackVisitRequested) return;
      fallbackVisitRequested = true;
    }

    void client.visits
      .track({ cache: false })
      .then((response) => {
        if (storage) {
          completeStorefrontVisit(storage, !response.error);
        }
      })
      .catch(() => {
        if (storage) {
          completeStorefrontVisit(storage, false);
        }
      });
  }, [client]);

  return null;
}
