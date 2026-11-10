import { createContext, useContext } from "react";
import type { ItemKind, Profile } from "../profile/schema";
import type { Tab } from "./types";

/*
 * Every chrome string of the page, in English and Simplified Chinese (brief O4). The person's own words come from the profile;
 * this is only what the page itself says. `Profile.lang` starting with "zh" picks the Chinese chrome.
 * Copy rules (§1.9): sentence case, quiet, one sentence, no exclamation marks. Chinese: plain, Chinese punctuation (，。「」),
 * a space between Han and Latin or numbers.
 */

export type Lang = "en" | "zh";
/** Things the detail view can hold: the five pouch kinds plus the two album kinds. */
export type HeldName = ItemKind | "colour" | "postcard";

export type Dict = {
  lang: Lang;
  /** <html lang> for the chrome */
  htmlLang: string;
  booklet: Record<Tab, { name: string; local: string; latin: string; noun: (n: number) => string }>;
  nav: { booklets: string; skip: string };
  /** the language switch (each language is named in itself: English · 中文) */
  langs: { label: string };
  handling: { resume: string; cards: string; postcards: (n: number) => string; closed: string; printed: string };
  clock: (time: string, city?: string) => string;
  controls: {
    open: string;
    openFolio: string;
    openAlbum: string;
    close: string;
    closeAlbum: string;
    closeFolio: string;
    closeFolioShort: string;
    shake: string;
    tilt: string;
    tiltOff: string;
    tiltAria: string;
    prevPage: string;
    nextPage: string;
    pageOf: (i: number, n: number) => string;
    prev: string;
    next: string;
    putBack: string;
    putBackShort: string;
    openIt: string;
    foldIt: string;
    turnOver: string;
    turnBack: string;
    pages: (a: number, b: number) => string;
    pagesAria: (a: number, b: number, n: number) => string;
    objectOf: (i: number, n: number) => string;
    /**
     * the accessible name of a card or postcard in an open album (the book's keyboard links): `title` is its label, `item` the album
     * thing itself (src/book/labels BookLabelItem), for the name its caption is titled by
     */
    openCard: (title: string, item?: { label?: string; nameLocal?: string; placeLocal?: string }) => string;
    copyHex: string;
    copied: string;
    toolbar: string;
    /** the document's own words, read on the page (the paper or the assignment's body). */
    readFull: string;
    /** back from the document to the card itself. */
    backToCard: string;
    /** the file the document came from (.docx), offered under the text. */
    original: string;
  };
  colophon: { label: string; email: string; emailCopied: string; copy: string; copied: string; newTab: string; source: string; sound: string; on: string; off: string; textVersion: string };
  profile: { open: string; sheet: string; close: string };
  held: Record<HeldName, { local: string; latin: string }>;
  spec: {
    name: string; role: string; event: string; talk: string; date: string; time: string; venue: string; city: string; seat: string; serial: string;
    caption: string; place: string; from: string; colour: string; series: string; seriesValue: string; postmarked: string; credit: string; pages: string;
  };
  detail: { pdf: string; download: string; text: string; readAsText: string; links: string; story: string; turned: string; downloadAria: string };
  hagaki: string;
  text: {
    hashira: { local: string; latin: string };
    back: string;
    profile: string; experience: string; education: string; skills: string; languages: string; elsewhere: string; pouch: string; cards: string; postcards: string; contact: string;
    json: string; jsonBack: string; copy: string; copied: string; download: string; lookCloser: string; printed: string; jsonAria: string;
    /** between a role and its organisation, a degree and its school: ", " / "，" */
    join: string;
  };
  loading: { folio: string; album: string; noGl: string; noGlLink: string };
  /** the paper viewer's accessible labels */
  paper: { resume: string; card: string; page: (p: number, n: number) => string; pages: (a: number, b: number, n: number) => string; cardClosed: string; cardOpen: string; hint: string; cardHint: string };
  date: (iso: string) => string;
  months: string[];
  meta: { description: (p: Profile) => string; title: (p: Profile, view: "folio" | "text" | "json") => string };
};

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2024-09-14" → "14 Sep 2024" (anything else is returned as given). */
function dateEn(d: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d.trim());
  if (!m) return d;
  const mon = MONTHS_EN[Number(m[2]) - 1];
  return mon ? `${Number(m[3])} ${mon} ${m[1]}` : d;
}
/** "2024-09-14" → "2024 年 9 月 14 日" */
function dateZh(d: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d.trim());
  return m ? `${m[1]} 年 ${Number(m[2])} 月 ${Number(m[3])} 日` : d;
}
const ZH_NUM = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
/** 1 … 99 in Chinese numerals (anything else in digits). */
export function zhNum(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 99) return String(n);
  if (n <= 10) return ZH_NUM[n]!;
  const t = Math.floor(n / 10);
  const u = n % 10;
  return `${t > 1 ? ZH_NUM[t] : ""}十${u ? ZH_NUM[u] : ""}`;
}
const EN_NUM = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
const enWord = (n: number) => EN_NUM[n] ?? String(n);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const en: Dict = {
  lang: "en",
  htmlLang: "en",
  booklet: {
    cards: { name: "Assignments", local: "課題帖", latin: "Assignments", noun: (n) => (n === 1 ? "assignment" : "assignments") },
    postcards: { name: "Papers", local: "論集", latin: "Papers", noun: (n) => (n === 1 ? "paper" : "papers") },
    resume: { name: "Academic CV", local: "経歴書", latin: "Academic CV", noun: (n) => (n === 1 ? "item" : "items") },
  },
  nav: { booklets: "Booklets", skip: "Skip to the booklet" },
  langs: { label: "Language" },
  handling: {
    resume: "Tilt, or lift one thing out to read it.",
    cards: "Turn a page, then open an assignment.",
    postcards: (n) => `${cap(enWord(n))} papers — turn a page, open one to read its abstract.`,
    closed: "Open the cover.",
    printed: "This desk needs WebGL, so here is the printed version.",
  },
  clock: (time, city) => `Local time ${time}${city ? ` in ${city}` : ""}`,
  controls: {
    open: "Open",
    openFolio: "Open the folio",
    openAlbum: "Open the album",
    close: "Close",
    closeAlbum: "Close the album",
    closeFolio: "Close folio",
    closeFolioShort: "Close",
    shake: "Shake",
    tilt: "Tilt",
    tiltOff: "Tilt off",
    tiltAria: "Tilt the folio with your phone",
    prevPage: "Previous page",
    nextPage: "Next page",
    pageOf: (i, n) => `Page ${i} of ${n}`,
    prev: "Previous",
    next: "Next",
    putBack: "Put it back",
    putBackShort: "Put back",
    openIt: "Open it",
    foldIt: "Fold it",
    turnOver: "Turn over",
    turnBack: "Turn back",
    pages: (a, b) => (a === b ? `Page ${a}` : `Pages ${a}–${b}`),
    pagesAria: (a, b, n) => (a === b ? `Page ${a} of ${n}` : `Pages ${a} to ${b} of ${n}`),
    objectOf: (i, n) => `${i} of ${n}`,
    openCard: (title) => `Open ${title}`,
    copyHex: "Copy",
    copied: "Copied",
    toolbar: "Controls",
    readFull: "Read the whole text",
    backToCard: "Back to the card",
    original: "Original file",
  },
  colophon: { label: "Contact", email: "Email", emailCopied: "Email copied", copy: "Copy", copied: "Copied", newTab: "(opens a new tab)", source: "Source", sound: "Sound", on: "On", off: "Off", textVersion: "Text version" },
  profile: { open: "Profile", sheet: "Profile", close: "Close" },
  held: {
    card: { local: "名刺", latin: "Contact card" },
    resume: { local: "経歴書", latin: "Academic CV" },
    ticket: { local: "課題票", latin: "Assignment slip" },
    polaroid: { local: "写真", latin: "Photo" },
    note: { local: "一筆箋", latin: "Note" },
    colour: { local: "課題札", latin: "Assignment card" },
    postcard: { local: "論集", latin: "Paper card" },
  },
  spec: {
    name: "Name", role: "Role", event: "Course", talk: "Title", date: "Submitted", time: "Due", venue: "Instructor", city: "Term", seat: "Grade", serial: "No.",
    caption: "Caption", place: "Published in", from: "Author", colour: "Colour", series: "Track", seriesValue: "Assignment", postmarked: "Filed", credit: "Photo", pages: "Pages",
  },
  detail: { pdf: "PDF", download: "Download", text: "Text", readAsText: "Read as text", links: "Links", story: "Story", turned: "The back", downloadAria: "Download the academic CV as a PDF" },
  hagaki: "郵便はがき",
  text: {
    hashira: { local: "本文", latin: "Text" },
    back: "Back to the desk",
    profile: "Profile", experience: "Experience", education: "Education", skills: "Skills", languages: "Languages", elsewhere: "Elsewhere", pouch: "In the folio", cards: "Assignments", postcards: "Papers", contact: "Contact",
    json: "JSON", jsonBack: "Text version", copy: "Copy", copied: "Copied", download: "Download", lookCloser: "Look closer", printed: "Printed version", jsonAria: "Profile as JSON",
    join: ", ",
  },
  loading: { folio: "Opening the folio", album: "Opening the album", noGl: "This desk needs WebGL. Here is the text version", noGlLink: "Text version" },
  paper: {
    resume: "Academic CV",
    card: "Contact card",
    page: (p, n) => `Page ${p} of ${n}`,
    pages: (a, b, n) => `Pages ${a}–${b} of ${n}`,
    cardClosed: "closed",
    cardOpen: "open",
    hint: "Drag a page, click it or use the arrow keys to turn.",
    cardHint: "Drag the cover or click to open and close.",
  },
  date: dateEn,
  months: MONTHS_EN,
  meta: {
    description: (p) => `${p.name}${p.nameLocal ? ` (${p.nameLocal})` : ""}, ${p.role}${p.location ? ` in ${p.location}` : ""}. ${p.bio}`,
    title: (p, v) => (v === "folio" ? `${p.name} — ${p.role}` : v === "json" ? `${p.name} — profile.json` : `${p.name} — text version`),
  },
};

export const zh: Dict = {
  lang: "zh",
  htmlLang: "zh-CN",
  booklet: {
    cards: { name: "课程作业", local: "课程作业", latin: "Assignments", noun: () => "门作业" },
    postcards: { name: "论文", local: "论文", latin: "Papers", noun: () => "篇论文" },
    resume: { name: "学术履历", local: "学术履历", latin: "Academic CV", noun: () => "件东西" },
  },
  nav: { booklets: "册子", skip: "跳到册子" },
  langs: { label: "语言" },
  handling: {
    resume: "倾斜，或取出一件细看。",
    cards: "翻一页，点开看作业。",
    postcards: (n) => `${zhNum(n)}篇论文，翻一页读摘要。`,
    closed: "点封面打开。",
    printed: "这张桌面需要 WebGL，下面是印刷版。",
  },
  clock: (time, city) => `${city ? `${city}` : ""}当地时间 ${time}`,
  controls: {
    open: "打开",
    openFolio: "打开文件夹",
    openAlbum: "打开册子",
    close: "合上",
    closeAlbum: "合上册子",
    closeFolio: "合上文件夹",
    closeFolioShort: "合上",
    shake: "晃一晃",
    tilt: "倾斜",
    tiltOff: "无法倾斜",
    tiltAria: "用手机倾斜文件夹",
    prevPage: "上一页",
    nextPage: "下一页",
    pageOf: (i, n) => `第 ${i} 页，共 ${n} 页`,
    prev: "上一件",
    next: "下一件",
    putBack: "放回",
    putBackShort: "放回",
    openIt: "打开",
    foldIt: "合上",
    turnOver: "翻面",
    turnBack: "翻回",
    pages: (a, b) => (a === b ? `第 ${a} 页` : `第 ${a}–${b} 页`),
    pagesAria: (a, b, n) => (a === b ? `第 ${a} 页，共 ${n} 页` : `第 ${a} 至 ${b} 页，共 ${n} 页`),
    objectOf: (i, n) => `第 ${i} 件，共 ${n} 件`,
    // the name the caption is titled by: a colour card's colour name (月白), a postcard's Chinese label (龙安寺; its placeLocal is the
    // Japanese caption, 雪の龍安寺, which reads oddly in a Chinese sentence)
    openCard: (title, item) => `细看「${item?.nameLocal ?? title}」`,
    copyHex: "复制",
    copied: "已复制",
    toolbar: "操作",
    readFull: "读全文",
    backToCard: "回到卡片",
    original: "原文件",
  },
  colophon: { label: "联系", email: "邮箱", emailCopied: "邮箱已复制", copy: "复制", copied: "已复制", newTab: "（在新标签页打开）", source: "源码", sound: "声音", on: "开", off: "关", textVersion: "文字版" },
  profile: { open: "简介", sheet: "简介", close: "关闭" },
  held: {
    card: { local: "名帖", latin: "Contact card" },
    resume: { local: "学术履历", latin: "Academic CV" },
    ticket: { local: "选题票", latin: "Assignment slip" },
    polaroid: { local: "照片", latin: "Photo" },
    note: { local: "便笺", latin: "Note" },
    colour: { local: "作业卡", latin: "Assignment card" },
    postcard: { local: "论文卡", latin: "Paper card" },
  },
  spec: {
    name: "姓名", role: "身份", event: "课程", talk: "题目", date: "提交日期", time: "截止", venue: "教师", city: "学期", seat: "成绩", serial: "编号",
    caption: "题字", place: "载体", from: "作者", colour: "色值", series: "类别", seriesValue: "课程作业", postmarked: "收录", credit: "摄影", pages: "页数",
  },
  detail: { pdf: "PDF", download: "下载", text: "文字", readAsText: "以文字阅读", links: "链接", story: "故事", turned: "背面", downloadAria: "下载 PDF 版学术履历" },
  // the card stock is printed in Japan: the same 郵便はがき as on the 3D album's back film (set lang ja)
  hagaki: "郵便はがき",
  text: {
    hashira: { local: "正文", latin: "Text" },
    back: "回到桌面",
    profile: "简介", experience: "经历", education: "教育", skills: "技能", languages: "语言", elsewhere: "链接", pouch: "袋中之物", cards: "课程作业", postcards: "论文", contact: "联系",
    json: "JSON", jsonBack: "文字版", copy: "复制", copied: "已复制", download: "下载", lookCloser: "细看", printed: "印刷版", jsonAria: "JSON 格式的简介",
    join: "，",
  },
  loading: { folio: "正在打开文件夹", album: "正在打开册子", noGl: "这张桌面需要 WebGL。这里是文字版", noGlLink: "文字版" },
  paper: {
    resume: "学术履历",
    card: "名帖",
    page: (p, n) => `第 ${p} 页，共 ${n} 页`,
    pages: (a, b, n) => `第 ${a}–${b} 页，共 ${n} 页`,
    cardClosed: "合着",
    cardOpen: "打开",
    hint: "拖动或点击页面翻页，也可以用方向键。",
    cardHint: "拖动或点击封面，打开或合上。",
  },
  date: dateZh,
  months: ["1 月", "2 月", "3 月", "4 月", "5 月", "6 月", "7 月", "8 月", "9 月", "10 月", "11 月", "12 月"],
  meta: {
    description: (p) => `${p.nameLocal ?? p.name}，${p.role}${p.location ? `，${p.location}` : ""}。${p.bio}`,
    title: (p, v) => (v === "folio" ? `${p.nameLocal ?? p.name} — ${p.role}` : v === "json" ? `${p.nameLocal ?? p.name} — profile.json` : `${p.nameLocal ?? p.name} — 文字版`),
  },
};

/** The chrome language for a profile: Chinese when its `lang` is zh-anything, else English. */
export function langOfProfile(p: Pick<Profile, "lang">): Lang {
  return /^zh(-|$)/i.test(p.lang ?? "") ? "zh" : "en";
}
export const dictFor = (p: Pick<Profile, "lang">): Dict => (langOfProfile(p) === "zh" ? zh : en);

export const I18n = createContext<Dict>(en);
export const useT = () => useContext(I18n);
