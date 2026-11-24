import type { BuyerType, LeadStatus, ReportReason } from "./types";

export type Lang = "ta" | "en";

const dict = {
  appTagline: { ta: "தமிழர்களுக்காக, தமிழர்களே உருவாக்கியது", en: "Made by Tamils, for Tamils" },
  demoBanner: { ta: "Demo · மாதிரி data, உண்மையான பணம் இல்லை", en: "Demo · sample data, no real payments" },
  loginTitle: { ta: "உங்க சரக்குக்கு சரியான வாங்குபவர்", en: "The right bulk buyer for your goods" },
  loginSub: {
    ta: "நாங்க phone-ல பேசி verify பண்ணின distributors, wholesalers",
    en: "Distributors and wholesalers we have phoned and verified",
  },
  phone: { ta: "Mobile எண்", en: "Mobile number" },
  sendOtp: { ta: "OTP அனுப்பு", en: "Send OTP" },
  otp: { ta: "6 இலக்க OTP", en: "6-digit OTP" },
  demoOtpHint: { ta: "Demo OTP", en: "Demo OTP" },
  verify: { ta: "உள்ளே போ", en: "Continue" },
  terms: { ta: "தொடர்ந்தால் Terms, Privacy-க்கு ஒப்புக்கொள்கிறீர்கள்", en: "By continuing you agree to the Terms and Privacy Policy" },
  profileTitle: { ta: "உங்க business பற்றி", en: "About your business" },
  profileSub: { ta: "இதை வச்சு உங்களுக்கு பொருந்தும் leads காட்டுவோம்", en: "We use this to show leads that fit you" },
  businessName: { ta: "Business பெயர்", en: "Business name" },
  ownerName: { ta: "உரிமையாளர் பெயர்", en: "Owner name" },
  gstin: { ta: "GSTIN (இருந்தா)", en: "GSTIN (optional)" },
  categories: { ta: "நீங்க விக்கும் பொருள் வகை", en: "Product categories" },
  cities: { ta: "Supply பண்ணும் ஊர்கள்", en: "Cities you supply" },
  moq: { ta: "குறைந்தபட்ச order (MOQ)", en: "Minimum order (MOQ)" },
  save: { ta: "சேமி", en: "Save" },
  commaHint: { ta: "comma போட்டு பிரிங்க", en: "separate with commas" },
  membershipTitle: { ta: "Annachi membership", en: "Annachi membership" },
  perMonth: { ta: "/ மாதம்", en: "/ month" },
  membershipGets: { ta: "இதுல கிடைப்பது", en: "What you get" },
  mGet1: { ta: "Verified lead feed பார்க்கலாம்", en: "Browse the verified lead feed" },
  mGet2: { ta: "My Leads tracker: call முதல் order வரை", en: "My Leads tracker: from call to order" },
  mGet3: { ta: "WhatsApp support", en: "WhatsApp support" },
  membershipNot: {
    ta: "Leads இதுல சேராது. ஒவ்வொரு contact-க்கும் 1 credit (₹100) தனியா.",
    en: "Leads are not included. Each contact costs 1 credit (₹100).",
  },
  payDemo: { ta: "Pay (demo)", en: "Pay (demo)" },
  activeUntil: { ta: "Active, இந்த தேதி வரை", en: "Active until" },
  leads: { ta: "Leads", en: "Leads" },
  myLeads: { ta: "My Leads", en: "My Leads" },
  support: { ta: "Support", en: "Support" },
  account: { ta: "Account", en: "Account" },
  search: { ta: "பொருள், ஊர் தேடு", en: "Search product or city" },
  forMe: { ta: "எனக்கு பொருந்துவது", en: "Matches me" },
  all: { ta: "எல்லாம்", en: "All" },
  credits: { ta: "credits", en: "credits" },
  verified: { ta: "Verified", en: "Verified" },
  neededBy: { ta: "தேவை", en: "Needed by" },
  budget: { ta: "Budget", en: "Budget" },
  quantity: { ta: "அளவு", en: "Quantity" },
  noLeads: {
    ta: "இப்போதைக்கு பொருந்தும் lead இல்லை. புதுசா verify ஆனதும் இங்க வரும்.",
    en: "No matching leads right now. New ones appear here once verified.",
  },
  unlockedTag: { ta: "Unlocked", en: "Unlocked" },
  contact: { ta: "Contact", en: "Contact" },
  unlockCta: { ta: "Unlock · 1 credit", en: "Unlock · 1 credit" },
  unlockConfirmTitle: { ta: "இந்த contact-ஐ unlock பண்ணலாமா?", en: "Unlock this contact?" },
  unlockConfirmBody: {
    ta: "1 credit (₹100) கழியும். Wrong number / business இல்லை / duplicate-னா 7 நாளுக்குள்ள report பண்ணுங்க, approve ஆனா credit திரும்ப வரும்.",
    en: "1 credit (₹100) will be used. If it is a wrong number, not a business or a duplicate, report it within 7 days; approved reports get the credit back.",
  },
  confirm: { ta: "ஆமா, unlock", en: "Yes, unlock" },
  cancel: { ta: "வேண்டாம்", en: "Cancel" },
  call: { ta: "Call", en: "Call" },
  whatsapp: { ta: "WhatsApp", en: "WhatsApp" },
  needMembership: { ta: "Unlock பண்ண membership வேணும்", en: "Membership needed to unlock" },
  needCredits: { ta: "Credits இல்லை. Pack வாங்குங்க.", en: "No credits left. Buy a pack." },
  goWallet: { ta: "Wallet-க்கு போ", en: "Go to wallet" },
  wallet: { ta: "Wallet", en: "Wallet" },
  balance: { ta: "மீதி credits", en: "Credits left" },
  packs: { ta: "Lead packs", en: "Lead packs" },
  perLead: { ta: "ஒரு lead ₹100", en: "₹100 per lead" },
  buy: { ta: "வாங்கு (demo)", en: "Buy (demo)" },
  history: { ta: "பரிவர்த்தனைகள்", en: "History" },
  demoPayNote: {
    ta: "இது demo. பணம் எடுக்கப்படாது. Live-ல UPI (Razorpay) + GST invoice வரும்.",
    en: "This is a demo. No money is taken. Live version uses UPI (Razorpay) with a GST invoice.",
  },
  funnel: { ta: "உங்க funnel (மொத்தம்)", en: "Your funnel (all time)" },
  followUp: { ta: "Follow-up தேதி", en: "Follow-up date" },
  notes: { ta: "குறிப்புகள்", en: "Notes" },
  orderValue: { ta: "Order மதிப்பு (₹)", en: "Order value (₹)" },
  reportBad: { ta: "தப்பான lead-ஆ? Report", en: "Bad lead? Report" },
  reported: { ta: "Report", en: "Report" },
  emptyMyLeads: { ta: "இன்னும் எந்த lead-உம் unlock பண்ணல", en: "You have not unlocked any leads yet" },
  supportTitle: { ta: "உதவி வேணுமா?", en: "Need help?" },
  supportBody: {
    ta: "Payment, refund, lead பிரச்சனை எதுவானாலும் எங்க team-கிட்ட WhatsApp-ல பேசுங்க.",
    en: "For payments, refunds or lead issues, message our team on WhatsApp.",
  },
  managedTitle: { ta: "நாங்களே தேடித் தருவோம்", en: "Managed lead service" },
  managedBody: {
    ta: "₹25,000 / மாதம். குறைந்தது 25 qualified contacts guarantee, target 50. Orders guarantee இல்லை.",
    en: "₹25,000 / month. Minimum 25 qualified contacts guaranteed, target 50. Orders are not guaranteed.",
  },
  qualified: {
    ta: "Qualified = phone-ல confirm + உண்மையான வியாபாரி + பொருள்/அளவு/ஊர் match + contact பண்ண consent",
    en: "Qualified = confirmed by phone + real trader + product/quantity/city match + consent to be contacted",
  },
  requestCallback: { ta: "Callback கேளு (WhatsApp)", en: "Request a callback (WhatsApp)" },
  language: { ta: "மொழி", en: "Language" },
  logout: { ta: "Logout", en: "Log out" },
  editProfile: { ta: "Profile மாற்று", en: "Edit profile" },
  membership: { ta: "Membership", en: "Membership" },
  inactive: { ta: "Active இல்லை", en: "Not active" },
  renew: { ta: "Membership எடு", en: "Get membership" },
  error: { ta: "ஏதோ தப்பு நடந்துச்சு", en: "Something went wrong" },
  back: { ta: "பின்", en: "Back" },
} as const;

export type Key = keyof typeof dict;

export function translate(lang: Lang, key: Key): string {
  return dict[key][lang];
}

const buyerTypes: Record<BuyerType, Record<Lang, string>> = {
  distributor: { ta: "Distributor", en: "Distributor" },
  wholesaler: { ta: "Wholesaler", en: "Wholesaler" },
  shop: { ta: "கடை", en: "Shop" },
  bulk_buyer: { ta: "Bulk buyer", en: "Bulk buyer" },
};

const statuses: Record<LeadStatus, Record<Lang, string>> = {
  new: { ta: "புதுசு", en: "New" },
  called: { ta: "Call பண்ணியாச்சு", en: "Called" },
  interested: { ta: "ஆர்வம்", en: "Interested" },
  quote_sent: { ta: "Quote அனுப்பியாச்சு", en: "Quote sent" },
  won: { ta: "Order கிடைச்சது", en: "Won" },
  lost: { ta: "கிடைக்கல", en: "Lost" },
};

const reasons: Record<ReportReason, Record<Lang, string>> = {
  wrong_number: { ta: "Wrong number", en: "Wrong number" },
  not_business: { ta: "Business இல்லை", en: "Not a business" },
  duplicate: { ta: "Duplicate", en: "Duplicate" },
};

export const label = {
  buyer: (lang: Lang, t: BuyerType) => buyerTypes[t][lang],
  status: (lang: Lang, s: LeadStatus) => statuses[s][lang],
  reason: (lang: Lang, r: ReportReason) => reasons[r][lang],
};

export const STATUSES: LeadStatus[] = ["new", "called", "interested", "quote_sent", "won", "lost"];
export const REASONS: ReportReason[] = ["wrong_number", "not_business", "duplicate"];

export function fmtDate(lang: Lang, iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", { day: "numeric", month: "short" });
}

export function inr(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}
