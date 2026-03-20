"use client";

import { Button } from "@/components/ui/button";
import { getCollectionShareText } from "@/lib/collection-share";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function CollectionShareActions({
  path,
  title,
  itemCount,
}: {
  path: string;
  title: string;
  itemCount: number;
}) {
  const [copied, setCopied] = useState(false);

  const shareText = useMemo(
    () =>
      getCollectionShareText({
        title,
        itemCount,
      }),
    [itemCount, title],
  );

  const getUrl = () => `${window.location.origin}${path}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getUrl());
    setCopied(true);
    toast.success("Collection link copied");
    window.setTimeout(() => setCopied(false), 1500);
  };

  const handleShareOnX = () => {
    const intentUrl = new URL("https://twitter.com/intent/tweet");
    intentUrl.searchParams.set("text", shareText);
    intentUrl.searchParams.set("url", getUrl());
    window.open(intentUrl.toString(), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button size="lg" onClick={handleShareOnX}>
        <ExternalLink className="mr-2 size-4" />
        Share on X
      </Button>

      <Button size="lg" variant="outline" onClick={handleCopy}>
        {copied ? (
          <Check className="mr-2 size-4" />
        ) : (
          <Copy className="mr-2 size-4" />
        )}
        {copied ? "Copied" : "Copy link"}
      </Button>

    </div>
  );
}
