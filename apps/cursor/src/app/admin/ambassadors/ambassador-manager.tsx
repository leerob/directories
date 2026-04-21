"use client";

import {
  addAmbassadorAction,
  removeAmbassadorAction,
  removePendingAmbassadorAction,
} from "@/actions/ambassadors";
import { AmbassadorBadge } from "@/components/ambassador-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  AmbassadorProfile,
  PendingAmbassadorEmail,
} from "@/data/ambassadors";
import { Clock, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

type Props = {
  ambassadors: AmbassadorProfile[];
  pending: PendingAmbassadorEmail[];
};

export function AmbassadorManager({ ambassadors, pending }: Props) {
  const [email, setEmail] = useState("");

  const { execute: add, isExecuting: isAdding } = useAction(
    addAmbassadorAction,
    {
      onSuccess: ({ data }) => {
        if (!data) return;
        if (data.status === "pending") {
          toast.success(
            `Saved ${data.email} as pending. They'll be promoted when they sign up.`,
          );
        } else if (data.status === "already") {
          toast.info(`${data.email} is already an ambassador.`);
        } else {
          toast.success(
            `${data.user.name || data.email} is now an ambassador.`,
          );
        }
        setEmail("");
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Failed to add ambassador.");
      },
    },
  );

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    add({ email: trimmed });
  };

  return (
    <div className="space-y-10">
      <form
        onSubmit={onSubmit}
        className="rounded-lg border border-border bg-card p-5 shadow-cursor"
      >
        <label
          htmlFor="ambassador-email"
          className="mb-3 block text-sm font-medium"
        >
          Add ambassador by email
        </label>
        <div className="flex gap-2">
          <Input
            id="ambassador-email"
            type="email"
            required
            placeholder="person@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isAdding}
            autoComplete="off"
          />
          <Button type="submit" disabled={isAdding || !email.trim()}>
            {isAdding ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Plus className="size-3.5" />
            )}
            <span className="ml-1.5">Add</span>
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          If the user exists, they&apos;ll be marked as an ambassador immediately.
          Otherwise, the email is queued and promoted on sign-up.
        </p>
      </form>

      <section>
        <h2 className="mb-3 text-sm font-medium">
          Ambassadors ({ambassadors.length})
        </h2>
        {ambassadors.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-10 text-center shadow-cursor">
            <p className="text-sm text-muted-foreground">
              No ambassadors yet.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {ambassadors.map((a) => (
              <AmbassadorRow key={a.id} ambassador={a} />
            ))}
          </ul>
        )}
      </section>

      {pending.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Clock className="size-3.5 text-muted-foreground" />
            Pending ({pending.length})
          </h2>
          <ul className="space-y-2">
            {pending.map((p) => (
              <PendingRow key={p.email} pending={p} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function AmbassadorRow({ ambassador }: { ambassador: AmbassadorProfile }) {
  const [dismissed, setDismissed] = useState(false);

  const { execute, isExecuting } = useAction(removeAmbassadorAction, {
    onSuccess: () => {
      toast.success(
        `Revoked ambassador status from ${ambassador.name || ambassador.email}.`,
      );
      setDismissed(true);
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Failed to revoke.");
    },
  });

  if (dismissed) return null;

  return (
    <li className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 shadow-cursor">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-8 shrink-0 rounded-full border border-border bg-muted">
          {ambassador.image ? (
            <AvatarImage
              src={ambassador.image}
              alt={ambassador.name || ambassador.email}
              className="rounded-full object-cover"
            />
          ) : null}
          <AvatarFallback className="rounded-full bg-muted text-xs">
            {(ambassador.name || ambassador.email).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 truncate text-sm font-medium">
            {ambassador.slug ? (
              <Link
                href={`/${ambassador.slug}`}
                target="_blank"
                className="truncate hover:underline"
              >
                {ambassador.name || ambassador.email}
              </Link>
            ) : (
              <span className="truncate">
                {ambassador.name || ambassador.email}
              </span>
            )}
            <AmbassadorBadge className="size-3.5" />
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {ambassador.email}
          </div>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={isExecuting}
        onClick={() => execute({ userId: ambassador.id })}
      >
        {isExecuting ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Trash2 className="size-3.5" />
        )}
        <span className="ml-1.5">Revoke</span>
      </Button>
    </li>
  );
}

function PendingRow({ pending }: { pending: PendingAmbassadorEmail }) {
  const [dismissed, setDismissed] = useState(false);

  const { execute, isExecuting } = useAction(removePendingAmbassadorAction, {
    onSuccess: () => {
      toast.success(`Removed pending email ${pending.email}.`);
      setDismissed(true);
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Failed to remove.");
    },
  });

  if (dismissed) return null;

  return (
    <li className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 shadow-cursor">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{pending.email}</div>
        <div className="text-xs text-muted-foreground">
          Queued {new Date(pending.created_at).toLocaleDateString()}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={isExecuting}
        onClick={() => execute({ email: pending.email })}
      >
        {isExecuting ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Trash2 className="size-3.5" />
        )}
        <span className="ml-1.5">Remove</span>
      </Button>
    </li>
  );
}
