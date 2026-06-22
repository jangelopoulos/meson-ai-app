export type Channel = "sms" | "call";
export type Status = "active" | "paused" | "draft";
export type Tag = "booked" | "hot" | "cold";

export type Campaign = {
  id: string;
  name: string;
  desc: string;
  channel: Channel;
  status: Status;
  contacts: number;
  reply: number;
  booked: number;
  progress: number;
};

export type Conversation = {
  id: string;
  name: string;
  initials: string;
  preview: string;
  time: string;
  unread: boolean;
  tag: Tag;
  campaign: string;
  phone: string;
};

export type Message = {
  ai: boolean;
  time: string;
  text: string;
};

export type Kpi = {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  spark: number[];
};

export type Activity = {
  who: string;
  what: string;
  when: string;
  dot: "accent" | "sms" | "call" | "amber";
};

export type SequenceStep = {
  n: string;
  label: string;
  sent: number;
  pct: number;
  state: "Complete" | "Sending" | "Queued";
};

export type CallLogEntry = {
  initials: string;
  name: string;
  phone: string;
  outcome: "Booked" | "Callback" | "No answer" | "Not interested";
  duration: string;
  sentiment: "positive" | "neutral" | "negative";
};

export type User = {
  name: string;
  email: string;
  initials: string;
  org: string;
};

export const user: User = {
  name: "David Chen",
  email: "david@raywhite-hawthorn.com.au",
  initials: "DC",
  org: "Ray White Hawthorn",
};

export const campaigns: Campaign[] = [
  {
    id: "c1",
    name: "Dormant lead revival",
    desc: "Re-engaging 4,820 leads that haven't been touched since 2020.",
    channel: "sms",
    status: "active",
    contacts: 4820,
    reply: 12.4,
    booked: 38,
    progress: 64,
  },
  {
    id: "c2",
    name: "Open-home follow-ups",
    desc: "Calling attendees from last weekend's inspections.",
    channel: "call",
    status: "active",
    contacts: 612,
    reply: 28.1,
    booked: 24,
    progress: 41,
  },
  {
    id: "c3",
    name: "Spring buyer waitlist",
    desc: "Warming buyers waiting for new spring listings.",
    channel: "sms",
    status: "paused",
    contacts: 1840,
    reply: 8.2,
    booked: 11,
    progress: 22,
  },
  {
    id: "c4",
    name: "Appraisal nudge — Hawthorn East",
    desc: "Owners with 5+ year holds in the postcode.",
    channel: "call",
    status: "draft",
    contacts: 0,
    reply: 0,
    booked: 0,
    progress: 0,
  },
];

export const kpis: Kpi[] = [
  {
    label: "Messages sent",
    value: "8,214",
    delta: "+12.4%",
    positive: true,
    spark: [12, 14, 11, 16, 18, 17, 22],
  },
  {
    label: "Reply rate",
    value: "14.8%",
    delta: "+2.1pp",
    positive: true,
    spark: [10, 12, 11, 13, 14, 13, 15],
  },
  {
    label: "Calls connected",
    value: "412",
    delta: "+6.7%",
    positive: true,
    spark: [8, 10, 9, 12, 11, 13, 14],
  },
  {
    label: "Meetings booked",
    value: "73",
    delta: "+18%",
    positive: true,
    spark: [4, 5, 6, 5, 8, 9, 11],
  },
];

export const messagingChart: { day: string; sent: number; replied: number }[] = [
  { day: "Mon", sent: 78, replied: 14 },
  { day: "Tue", sent: 92, replied: 19 },
  { day: "Wed", sent: 71, replied: 11 },
  { day: "Thu", sent: 104, replied: 22 },
  { day: "Fri", sent: 118, replied: 26 },
  { day: "Sat", sent: 88, replied: 17 },
  { day: "Sun", sent: 64, replied: 13 },
];

export const activity: Activity[] = [
  { who: "Sienna L.", what: "booked an appraisal via SMS", when: "2m ago", dot: "accent" },
  { who: "Michael T.", what: "replied to Dormant lead revival", when: "11m ago", dot: "sms" },
  { who: "AI agent", what: "completed 38 calls in Open-home follow-ups", when: "1h ago", dot: "call" },
  { who: "Priya N.", what: "asked to be called back tomorrow", when: "2h ago", dot: "amber" },
  { who: "AI agent", what: "paused Spring buyer waitlist", when: "3h ago", dot: "accent" },
];

export const sequence: SequenceStep[] = [
  { n: "01", label: "Opener — soft check-in", sent: 4820, pct: 100, state: "Complete" },
  { n: "02", label: "Value drop — recent comp", sent: 4112, pct: 85, state: "Complete" },
  { n: "03", label: "Direct ask — appraisal", sent: 2640, pct: 55, state: "Sending" },
  { n: "04", label: "Bump — last call", sent: 0, pct: 0, state: "Queued" },
];

export const callLog: CallLogEntry[] = [
  { initials: "ML", name: "Michael Liang", phone: "+61 412 884 220", outcome: "Booked", duration: "4:12", sentiment: "positive" },
  { initials: "JR", name: "Jenny Ratcliffe", phone: "+61 488 119 442", outcome: "Callback", duration: "2:38", sentiment: "neutral" },
  { initials: "AK", name: "Aaron Kim", phone: "+61 401 553 901", outcome: "Booked", duration: "5:01", sentiment: "positive" },
  { initials: "PS", name: "Priya Shah", phone: "+61 422 770 318", outcome: "Not interested", duration: "1:14", sentiment: "negative" },
  { initials: "TW", name: "Tom Whitmore", phone: "+61 414 990 002", outcome: "No answer", duration: "0:22", sentiment: "neutral" },
];

export const sentiment = { positive: 62, neutral: 27, negative: 11 };

export const conversations: Conversation[] = [
  {
    id: "v1",
    name: "Michael Liang",
    initials: "ML",
    preview: "Sounds good — Tuesday 6pm works for me.",
    time: "2m",
    unread: true,
    tag: "booked",
    campaign: "Open-home follow-ups",
    phone: "+61 412 884 220",
  },
  {
    id: "v2",
    name: "Sienna Lowe",
    initials: "SL",
    preview: "Yeah I'd love a quick appraisal, thanks!",
    time: "14m",
    unread: true,
    tag: "hot",
    campaign: "Dormant lead revival",
    phone: "+61 401 220 884",
  },
  {
    id: "v3",
    name: "Priya Shah",
    initials: "PS",
    preview: "Not right now, maybe early next year.",
    time: "1h",
    unread: false,
    tag: "cold",
    campaign: "Dormant lead revival",
    phone: "+61 422 770 318",
  },
  {
    id: "v4",
    name: "Aaron Kim",
    initials: "AK",
    preview: "Booked in — looking forward to chatting.",
    time: "3h",
    unread: false,
    tag: "booked",
    campaign: "Open-home follow-ups",
    phone: "+61 401 553 901",
  },
];

export const threads: Record<string, Message[]> = {
  v1: [
    { ai: true, time: "10:02", text: "Hi Michael — David from Ray White Hawthorn. Saw you came through the Glenferrie open home on the weekend. How did you find it?" },
    { ai: false, time: "10:04", text: "Yeah it was nice. A bit smaller than I was hoping though." },
    { ai: true, time: "10:05", text: "Totally fair. I've got two larger ones coming to market this Saturday — both 4 bed, one with a studio out back. Want me to send through the details?" },
    { ai: false, time: "10:06", text: "Sure, that'd be great." },
    { ai: true, time: "10:07", text: "Easiest is a 15-min walk-through Tuesday 6pm or Wednesday 7pm. Which suits?" },
    { ai: false, time: "10:12", text: "Sounds good — Tuesday 6pm works for me." },
  ],
  v2: [
    { ai: true, time: "9:48", text: "Hi Sienna — David at Ray White. We last chatted in 2020 about Hawthorn East. Curious if you'd like a fresh appraisal on the place this spring?" },
    { ai: false, time: "9:55", text: "Yeah I'd love a quick appraisal, thanks!" },
    { ai: true, time: "9:56", text: "Brilliant. Are you home Thursday around 5:30pm, or would Friday morning work better?" },
  ],
  v3: [
    { ai: true, time: "Yesterday", text: "Hi Priya, just a soft check-in — any thoughts about exploring the market this year?" },
    { ai: false, time: "Yesterday", text: "Not right now, maybe early next year." },
    { ai: true, time: "Yesterday", text: "All good — I'll circle back in January. Have a great rest of the year." },
  ],
  v4: [
    { ai: true, time: "Mon", text: "Hi Aaron — David from Ray White. You came through 22 Glenferrie on the weekend, right?" },
    { ai: false, time: "Mon", text: "Yeah! Loved it actually." },
    { ai: true, time: "Mon", text: "Great. Want to grab 15 mins to chat through what you're after?" },
    { ai: false, time: "Mon", text: "Booked in — looking forward to chatting." },
  ],
};

export const replies = [
  { initials: "SL", name: "Sienna Lowe", preview: "Yeah I'd love a quick appraisal, thanks!", time: "14m" },
  { initials: "ML", name: "Michael Liang", preview: "Sounds good — Tuesday 6pm works for me.", time: "2m" },
  { initials: "AK", name: "Aaron Kim", preview: "Booked in — looking forward to chatting.", time: "3h" },
];

export const transcript: Message[] = [
  { ai: true, time: "0:02", text: "Hi Michael — David from Ray White Hawthorn here. Got 2 minutes to chat about the Glenferrie open home?" },
  { ai: false, time: "0:06", text: "Yeah, go ahead." },
  { ai: true, time: "0:09", text: "Cheers. Quick one — were you mostly there for yourself or just having a look around?" },
  { ai: false, time: "0:14", text: "We're actively looking, yeah. Just need something a bit bigger." },
  { ai: true, time: "0:18", text: "Perfect. I've got two coming up Saturday that fit. Want me to pencil in a 15-min walk-through?" },
];

export const numbers = [
  { type: "sms" as const, label: "SMS line", number: "+61 480 117 220", provider: "Twilio · AU", active: true },
  { type: "call" as const, label: "Voice line", number: "+61 3 8772 4081", provider: "Twilio · AU", active: true },
];
