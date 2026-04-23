"use client";

import type { PluginRow } from "@/data/queries";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PluginReviewList } from "./plugin-review-list";

export function PluginReviewTabs({
  pending,
  declined,
}: {
  pending: PluginRow[];
  declined: PluginRow[];
}) {
  return (
    <Tabs defaultValue="pending">
      <TabsList>
        <TabsTrigger value="pending">
          Pending{" "}
          <span className="ml-1.5 text-xs text-muted-foreground">
            {pending.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="declined">
          Declined{" "}
          <span className="ml-1.5 text-xs text-muted-foreground">
            {declined.length}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending">
        <PluginReviewList plugins={pending} variant="pending" />
      </TabsContent>

      <TabsContent value="declined">
        <PluginReviewList plugins={declined} variant="declined" />
      </TabsContent>
    </Tabs>
  );
}
