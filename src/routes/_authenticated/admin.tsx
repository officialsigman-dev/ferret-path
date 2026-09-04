import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAdminStatus, listSignups, type SignupRow } from "@/lib/admin.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Signups admin — ferret" },
      { name: "description", content: "Internal dashboard to review recent ferret waitlist signups." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Signups admin — ferret" },
      { property: "og:description", content: "Internal dashboard to review recent ferret waitlist signups." },
    ],
  }),
  component: AdminPage,
});

const DAY = 24 * 60 * 60 * 1000;

function statusFor(createdAt: string) {
  const age = Date.now() - new Date(createdAt).getTime();
  if (age < DAY) return { label: "New", className: "bg-primary text-primary-foreground" };
  if (age < 7 * DAY) return { label: "This week", className: "bg-secondary text-secondary-foreground" };
  return { label: "Older", className: "bg-muted text-muted-foreground" };
}

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchAdminStatus = useServerFn(getAdminStatus);
  const fetchSignups = useServerFn(listSignups);
  const [search, setSearch] = useState("");

  const adminQuery = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => fetchAdminStatus(),
  });

  const isAdmin = adminQuery.data?.isAdmin ?? false;

  const signupsQuery = useQuery({
    queryKey: ["admin-signups"],
    queryFn: () => fetchSignups(),
    enabled: isAdmin,
  });

  const rows: SignupRow[] = signupsQuery.data?.signups ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.full_name, r.email, r.city, r.message].some((v) => v.toLowerCase().includes(q)),
    );
  }, [rows, search]);

  const newCount = rows.filter((r) => Date.now() - new Date(r.created_at).getTime() < DAY).length;
  const confirmedCount = rows.filter((r) => r.confirmed_at).length;

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Signups</h1>
            <p className="mt-1 text-sm text-muted-foreground">Internal view of the ferret waitlist.</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign out
          </Button>
        </header>

        {adminQuery.isLoading && (
          <p className="mt-10 text-sm text-muted-foreground">Checking access…</p>
        )}

        {adminQuery.isError && (
          <p className="mt-10 text-sm text-destructive">Could not verify your access.</p>
        )}

        {adminQuery.isSuccess && !isAdmin && (
          <div className="mt-10 rounded-lg border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground">No admin access</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your account is signed in but has not been granted the admin role yet.
            </p>
          </div>
        )}

        {isAdmin && (
          <>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:max-w-2xl sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{rows.length}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Confirmed</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{confirmedCount}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">New (24h)</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{newCount}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Input
                placeholder="Search name, email, city or message…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <Button variant="outline" onClick={() => signupsQuery.refetch()}>
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={() => exportCsv(filtered)}
                disabled={filtered.length === 0}
              >
                Export CSV
              </Button>

            </div>

            {signupsQuery.isLoading && (
              <p className="mt-8 text-sm text-muted-foreground">Loading signups…</p>
            )}
            {signupsQuery.isError && (
              <p className="mt-8 text-sm text-destructive">Could not load signups.</p>
            )}

            {signupsQuery.isSuccess && (
              <>
                <p className="mt-6 text-xs text-muted-foreground">
                  Showing {filtered.length} of {rows.length}
                </p>
                <ul className="mt-3 space-y-3">
                  {filtered.map((row) => {
                    const status = statusFor(row.created_at);
                    return (
                      <li
                        key={row.id}
                        className="rounded-lg border border-border bg-card p-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold text-foreground">{row.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {row.email} · {row.city}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                row.confirmed_at
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }
                            >
                              {row.confirmed_at ? "Confirmed" : "Unconfirmed"}
                            </Badge>
                            <Badge className={status.className}>{status.label}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(row.created_at)}
                            </span>
                          </div>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/80">
                          {row.message}
                        </p>
                      </li>
                    );
                  })}
                  {filtered.length === 0 && (
                    <li className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      No signups match your search.
                    </li>
                  )}
                </ul>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
