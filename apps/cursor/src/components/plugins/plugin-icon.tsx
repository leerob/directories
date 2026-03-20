import { cn } from "@/lib/utils";

export function PluginIconFallback({
  size = 36,
  bordered = true,
  transparent = false,
}: {
  size?: number;
  bordered?: boolean;
  transparent?: boolean;
}) {
  const iconSize = Math.round(size * 0.44);
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-[4px]",
        !transparent && "bg-muted/50",
        bordered && "border border-border",
      )}
      style={{ width: size, height: size }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="80 60 350 395"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="m415.035 156.35-151.503-87.4695c-4.865-2.8094-10.868-2.8094-15.733 0l-151.4969 87.4695c-4.0897 2.362-6.6146 6.729-6.6146 11.459v176.383c0 4.73 2.5249 9.097 6.6146 11.458l151.5039 87.47c4.865 2.809 10.868 2.809 15.733 0l151.504-87.47c4.089-2.361 6.614-6.728 6.614-11.458v-176.383c0-4.73-2.525-9.097-6.614-11.459zm-9.516 18.528-146.255 253.32c-.988 1.707-3.599 1.01-3.599-.967v-165.872c0-3.314-1.771-6.379-4.644-8.044l-143.645-82.932c-1.707-.988-1.01-3.599.968-3.599h292.509c4.154 0 6.75 4.503 4.673 8.101h-.007z"
          className="fill-muted-foreground/40"
        />
      </svg>
    </div>
  );
}
