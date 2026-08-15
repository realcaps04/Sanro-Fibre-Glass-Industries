import { Button } from "@/components/ui/Button";
import { Overlay } from "@/components/ui/Overlay";
import { cn } from "@/lib/cn";
import { formatDate, toISODate } from "@/lib/dates";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

interface DateRangeSheetProps {
  open: boolean;
  onClose: () => void;
  from?: string;
  to?: string;
  onApply: (from: string, to: string) => void;
}

function monthCells(year: number, month: number) {
  const first = new Date(year, month, 1);
  const weekday = first.getDay();
  const pad = weekday === 0 ? 6 : weekday - 1;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ iso: string; day: number; inMonth: boolean }> = [];

  for (let i = pad; i > 0; i--) {
    const date = new Date(year, month, 1 - i);
    cells.push({ iso: toISODate(date), day: date.getDate(), inMonth: false });
  }
  for (let day = 1; day <= days; day++) {
    const date = new Date(year, month, day);
    cells.push({ iso: toISODate(date), day, inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1];
    const date = new Date(`${last.iso}T00:00:00`);
    date.setDate(date.getDate() + 1);
    cells.push({ iso: toISODate(date), day: date.getDate(), inMonth: false });
  }
  return cells;
}

export function DateRangeSheet({ open, onClose, from, to, onApply }: DateRangeSheetProps) {
  const todayIso = toISODate();
  const initial = from ? new Date(`${from}T00:00:00`) : new Date();
  const [cursor, setCursor] = useState({ year: initial.getFullYear(), month: initial.getMonth() });
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);

  useEffect(() => {
    if (!open) return;
    const seed = from ? new Date(`${from}T00:00:00`) : new Date();
    setCursor({ year: seed.getFullYear(), month: seed.getMonth() });
    setDraftFrom(from);
    setDraftTo(to);
  }, [from, open, to]);

  const cells = useMemo(() => monthCells(cursor.year, cursor.month), [cursor.month, cursor.year]);
  const title = new Date(cursor.year, cursor.month, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const pick = (iso: string) => {
    if (iso > todayIso) return;
    if (!draftFrom || (draftFrom && draftTo)) {
      setDraftFrom(iso);
      setDraftTo(undefined);
      return;
    }
    if (iso < draftFrom) {
      setDraftTo(draftFrom);
      setDraftFrom(iso);
      return;
    }
    setDraftTo(iso);
  };

  const canApply = Boolean(draftFrom && draftTo);

  return (
    <Overlay open={open} onClose={onClose} title="Date range">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-muted px-3 py-3">
            <p className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
              From
            </p>
            <p className="mt-1 text-sm font-semibold">
              {draftFrom ? formatDate(draftFrom) : "Start date"}
            </p>
          </div>
          <div className="rounded-2xl bg-muted px-3 py-3">
            <p className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
              To
            </p>
            <p className="mt-1 text-sm font-semibold">
              {draftTo ? formatDate(draftTo) : "End date"}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground"
              aria-label="Previous month"
              onClick={() =>
                setCursor((current) =>
                  current.month === 0
                    ? { year: current.year - 1, month: 11 }
                    : { year: current.year, month: current.month - 1 },
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold tracking-[-0.02em]">{title}</p>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground"
              aria-label="Next month"
              onClick={() =>
                setCursor((current) =>
                  current.month === 11
                    ? { year: current.year + 1, month: 0 }
                    : { year: current.year, month: current.month + 1 },
                )
              }
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center">
            {WEEKDAYS.map((day) => (
              <span key={day} className="py-1 text-[11px] font-semibold text-muted-foreground">
                {day}
              </span>
            ))}
            {cells.map((cell) => {
              const selectedStart = cell.iso === draftFrom;
              const selectedEnd = cell.iso === draftTo;
              const inRange =
                Boolean(draftFrom && draftTo) && cell.iso > draftFrom! && cell.iso < draftTo!;
              const isToday = cell.iso === todayIso;
              const disabled = cell.iso > todayIso;
              const rangeStart = Boolean(selectedStart && draftTo);
              const rangeEnd = Boolean(selectedEnd && draftFrom && draftFrom !== draftTo);

              return (
                <button
                  key={`${cell.iso}-${cell.inMonth ? "in" : "out"}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(cell.iso)}
                  className={cn(
                    "relative flex h-10 w-full items-center justify-center text-sm font-semibold",
                    (inRange || rangeStart || rangeEnd) && "bg-muted",
                    rangeStart && "rounded-l-full",
                    rangeEnd && "rounded-r-full",
                    disabled && "opacity-35",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full",
                      !cell.inMonth && "text-muted-foreground/45",
                      selectedStart || selectedEnd
                        ? "bg-primary text-primary-foreground"
                        : "text-inherit",
                    )}
                  >
                    {cell.day}
                  </span>
                  {isToday && !selectedStart && !selectedEnd ? (
                    <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
                  ) : null}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Tap a start date, then an end date.
          </p>
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            fullWidth
            disabled={!canApply}
            onClick={() => {
              if (!draftFrom || !draftTo) return;
              onApply(draftFrom, draftTo);
              onClose();
            }}
          >
            Apply
          </Button>
        </div>
      </div>
    </Overlay>
  );
}