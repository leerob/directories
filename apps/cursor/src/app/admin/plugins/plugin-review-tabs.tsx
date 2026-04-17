"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PluginRow } from "@/data/queries";
import { PluginReviewList } from "./plugin-review-list";

type Props = {
  pending: PluginRow[];
  flagged: PluginRow[];
  scanning: PluginRow[];
};

export function PluginReviewTabs({ pending, flagged, scanning }: Props) {
  return (
    <Tabs defaultValue={flagged.length > 0 ? "flagged" : "pending"}>
      <TabsList className="w-full">
        <TabsTrigger value="pending" className="flex-1">
          Pending ({pending.length})
        </TabsTrigger>
        <TabsTrigger value="flagged" className="flex-1">
          Flagged ({flagged.length})
        </TabsTrigger>
        <TabsTrigger value="scanning" className="flex-1">
          Scanning ({scanning.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="pending" className="mt-6">
        <PluginReviewList plugins={pending} variant="pending" />
      </TabsContent>
      <TabsContent value="flagged" className="mt-6">
        <PluginReviewList plugins={flagged} variant="flagged" />
      </TabsContent>
      <TabsContent value="scanning" className="mt-6">
        <PluginReviewList plugins={scanning} variant="scanning" />
      </TabsContent>
    </Tabs>
  );
}
