import type { Channel, Status, Tag } from "@/lib/mock-data";

const statusMeta: Record<
  Status,
  { label: string; color: string; soft: string }
> = {
  active: { label: "Active", color: "var(--green)", soft: "rgba(61,220,151,0.16)" },
  paused: { label: "Paused", color: "var(--amber)", soft: "rgba(245,181,68,0.16)" },
  draft: { label: "Draft", color: "var(--text-faint)", soft: "var(--surface-2)" },
};

const channelMeta: Record<
  Channel,
  { label: string; color: string; soft: string }
> = {
  sms: { label: "AI SMS", color: "var(--sms)", soft: "var(--sms-soft)" },
  call: { label: "AI Call", color: "var(--call)", soft: "var(--call-soft)" },
};

const tagMeta: Record<Tag, { label: string; color: string; soft: string }> = {
  booked: { label: "Booked", color: "var(--green)", soft: "rgba(61,220,151,0.16)" },
  hot: { label: "Hot", color: "var(--accent)", soft: "var(--accent-soft)" },
  cold: { label: "Cold", color: "var(--text-faint)", soft: "var(--surface-2)" },
};

type BaseProps = { className?: string };

function Pill({
  label,
  color,
  soft,
  className,
}: { label: string; color: string; soft: string } & BaseProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[8px] px-2 py-[3px] text-[11px] font-bold ${className ?? ""}`}
      style={{ background: soft, color }}
    >
      <span
        className="h-[6px] w-[6px] rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: Status } & BaseProps) {
  const m = statusMeta[status];
  return <Pill {...m} className={className} />;
}

export function ChannelBadge({ channel, className }: { channel: Channel } & BaseProps) {
  const m = channelMeta[channel];
  return <Pill {...m} className={className} />;
}

export function TagBadge({ tag, className }: { tag: Tag } & BaseProps) {
  const m = tagMeta[tag];
  return <Pill {...m} className={className} />;
}

export function chanMeta(channel: Channel) {
  return channelMeta[channel];
}
export function statusMetaOf(status: Status) {
  return statusMeta[status];
}
export function tagMetaOf(tag: Tag) {
  return tagMeta[tag];
}
