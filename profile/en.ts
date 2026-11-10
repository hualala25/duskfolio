import type { Profile } from "../src/profile/schema";
import { bed } from "../src/profile/bed";
import { COURSES, IDENTITY, PAPERS } from "./content";

/*
 * duskfolio —— the English profile. Same shape as profile/zh.ts (same ids, same colours, same
 * order), different words. It is loaded on demand: the primary (zh) ships in the entry chunk,
 * this one arrives when a visitor picks English.
 *
 * The shared skeleton lives in profile/content.ts, so the two languages cannot drift apart.
 */

/** The thirty-two assignment cards: four per course, light to dark. */
const assignmentCards = COURSES.flatMap((c, ci) =>
  c.en.cards.map((card, i) => ({
    id: `a${String(ci * 4 + i + 1).padStart(2, "0")}`,
    label: c.code,
    nameLocal: card.name,
    color: c.colors[i]!,
    note: `${c.en.course}: ${card.note}`,
    ...(c.extra?.[i]?.src ? { src: bed(c.extra[i]!.src!) } : {}),
    ...(c.extra?.[i]?.doc ? { doc: c.extra[i]!.doc } : {}),
  })),
);

/** The twelve paper cards: one postcard per paper. */
const paperPostcards = PAPERS.map((p) => ({
  id: p.id,
  label: p.label.en,
  place: p.place.en,
  message: p.message.en,
  from: IDENTITY.name,
  ...(p.date ? { date: p.date } : {}),
  color: p.color,
  ...(p.src ? { src: bed(p.src) } : {}),
  ...(p.href ? { href: p.href.en } : {}),
  ...(p.doc ? { doc: p.doc } : {}),
}));

export const profile: Profile = {
  lang: "en",
  name: IDENTITY.name,
  nameLocal: IDENTITY.nameLocal,
  handle: IDENTITY.handle,
  role: "Media & New Media · Intelligent Communication",
  location: IDENTITY.locationEn,
  timezone: IDENTITY.timezone,
  // the role says who I am, the contents line says what is here — the bio says what I think about
  bio: "Interested in how media content is made, how algorithms catch it, and how much agency a reader is left with.",
  coverTitle: `${IDENTITY.name} · Coursework & Papers`,
  // ⚠️ your own fork's URL — the AGPL-3.0 asks you to offer the source of what you deploy
  source: "https://github.com/hualala25/duskfolio",
  links: [
    // ⚠️ your own email and pages
    { label: "Email", href: "mailto:hualala25@users.noreply.github.com" },
    { label: "GitHub", href: "https://github.com/hualala25" },
  ],
  items: [
    {
      kind: "card",
      id: "card",
      label: "Contact card",
      story: "I printed it for myself and then spent longer on it than on most of my coursework. What is inside is for whoever actually writes back.",
      front: { name: IDENTITY.name, role: "Media & New Media · Intelligent Communication", tagline: "Say the thing clearly" },
      inside: [
        { k: "Email", v: "hualala25@users.noreply.github.com" },
        { k: "Site", v: "duskfolio (this page)" },
        { k: "Based in", v: `${IDENTITY.locationEn} · UTC+8` },
        { k: "Languages", v: "English · 中文" },
      ],
      insideNote: "All my coursework and papers live on this page. Write to me.",
    },
    {
      kind: "resume",
      id: "resume",
      label: "Academic CV",
      story: "Writing it out, I found I had done a good deal in a year — but it was scattered across folders. Put on one page, it finally has a shape.",
      specs: [
        { k: "Updated", v: "November 2026" },
        { k: "Languages", v: "Chinese · English" },
      ],
      // the bio says what I think about; the summary says what I have done — one of each, not the same line twice
      summary: "Second-year undergraduate in Media and New Media, intelligent communication. Coursework, a term paper and one competition so far; the same question runs through all of it: who makes the content, and whose hands it lands in.",
      // ⚠️ the three entries below (the media-centre internship, the 12,000 read count, the
      //    competition entry) were written to fit your situation — replace them with what you
      //    actually did, and the page will print the truth.
      experience: [
        {
          org: "Public-Service Contest",
          role: "Second Prize",
          from: "2026",
          to: "2026",
          bullets: ["Placeholder: your entry, the competition's full name, and the award, in one line."],
        },
        // A second and a third entry? Copy the shape above and add them after it.
      ],
      education: [{ school: "Northwest University", degree: "BA, Media and New Media (in progress)", from: "2024", to: "present" }],
      // ⚠️ these two lines were written to fit your situation — replace them with what you actually do
      skills: ["Reporting", "Feature planning", "Short-video scripts", "Data journalism and charts", "Podcast scripts", "Figma", "Python (basic)", "Premiere"],
      languages: ["Chinese (native)", "English"],
    },
    {
      kind: "ticket",
      id: "ticket",
      label: "Assignment slip",
      story: "The topic chit for the Digital Editing Innovation Competition. The title went through seven drafts; the one that survived is the plainest — hand the Long March to one particular person and let them walk it.",
      event: "Digital Editing Competition",
      talk: "The Long March at ninety: an interactive path",
      date: "2026-09-20",
      time: "23:59",
      venue: "Shaanxi division",
      city: IDENTITY.locationEn,
      seat: "Selected",
      serial: "No. 0186",
      links: [{ label: "Work", href: "#cards" }],
    },
    {
      kind: "polaroid",
      id: "polaroid",
      label: "Photo",
      story: "I was on page eight of the term paper when I looked up and the sky outside was exactly this colour. It became the first print.",
      caption: "Library, 19:40",
      tint: "#d9c0c6",
      place: "The library",
      date: "2026-10-28",
      back: "Page eight. The sky was this colour, so I wrote it down.",
    },
    {
      kind: "note",
      id: "note",
      label: "Note",
      story: "The note sits at the back of the folder, written for whoever pulls it out first.",
      text: "Welcome to the notebook. If a page does not make sense, write to me.",
      from: IDENTITY.name,
      date: "2026-11-08",
    },
  ],
  albums: {
    cards: assignmentCards,
    postcards: paperPostcards,
  },
};
