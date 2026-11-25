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
  // Module 11: catalogue + bulk quote
  catalogue: { ta: "Catalogue", en: "Catalogue" },
  myCatalogue: { ta: "என் Catalogue", en: "My Catalogue" },
  addProduct: { ta: "+ பொருள் சேர்", en: "+ Add product" },
  editProduct: { ta: "பொருள் மாற்று", en: "Edit product" },
  newProduct: { ta: "புது பொருள்", en: "New product" },
  noProducts: { ta: "இன்னும் பொருள் எதுவும் சேர்க்கல", en: "No products yet" },
  hiddenTag: { ta: "மறைக்கப்பட்டது", en: "Hidden" },
  shareTitle: { ta: "உங்க catalogue link", en: "Your catalogue link" },
  shareSub: {
    ta: "இந்த link-ஐ distributors, கடைகளுக்கு அனுப்புங்க. Quote கேட்டா My Leads-ல வரும், credit செலவு இல்லை.",
    en: "Send this link to distributors and shops. Quote requests land in My Leads at no credit cost.",
  },
  linkName: { ta: "Link பெயர்", en: "Link name" },
  linkNameHint: { ta: "சின்ன எழுத்து, எண், hyphen மட்டும் · உதா: mannoli", en: "lowercase letters, digits, hyphen · e.g. mannoli" },
  waNumber: { ta: "WhatsApp எண் (buyers-க்கு)", en: "WhatsApp number (for buyers)" },
  publish: { ta: "Public-ஆ காட்டு", en: "Published" },
  notPublished: { ta: "இன்னும் publish பண்ணல. Link திறந்தா 'கிடைக்கவில்லை' காட்டும்.", en: "Not published. The link shows 'not found' until you publish." },
  copyLink: { ta: "Link copy", en: "Copy link" },
  copied: { ta: "Copy ஆச்சு", en: "Copied" },
  shareWa: { ta: "WhatsApp-ல share", en: "Share on WhatsApp" },
  preview: { ta: "Preview", en: "Preview" },
  saved: { ta: "சேமிச்சாச்சு", en: "Saved" },
  nameEn: { ta: "பெயர் (English)", en: "Name (English)" },
  nameTa: { ta: "பெயர் (தமிழ்)", en: "Name (Tamil)" },
  category: { ta: "வகை", en: "Category" },
  material: { ta: "Material", en: "Material" },
  size: { ta: "அளவு (size)", en: "Size" },
  description: { ta: "விவரம்", en: "Description" },
  photoUrls: { ta: "Photo links (ஒரு வரிக்கு ஒன்று, max 5)", en: "Photo links (one per line, max 5)" },
  priceFrom: { ta: "ஒரு piece விலை (₹)", en: "Single-piece price (₹)" },
  bulkTiers: { ta: "Bulk விலை", en: "Bulk prices" },
  bulkTiersHint: {
    ta: "அதிக அளவுக்கு per-piece விலை அதே அல்லது குறைவா இருக்கணும்",
    en: "Bigger quantities must have the same or a lower price per piece",
  },
  minQty: { ta: "குறைந்தது (pcs)", en: "From qty" },
  pricePerPiece: { ta: "₹ / piece", en: "₹ / piece" },
  addTier: { ta: "+ வரி சேர்", en: "+ Add row" },
  remove: { ta: "நீக்கு", en: "Remove" },
  moqPcs: { ta: "MOQ (pcs)", en: "MOQ (pcs)" },
  leadTime: { ta: "தயாரிக்க + அனுப்ப நாட்கள்", en: "Days to make + dispatch" },
  showInCatalogue: { ta: "Catalogue-ல காட்டு", en: "Show in catalogue" },
  hideProduct: { ta: "Catalogue-ல இருந்து மறை", en: "Hide from catalogue" },
  from: { ta: "முதல்", en: "from" },
  askBulkPrice: { ta: "Bulk விலைக்கு கேளுங்க", en: "Ask for bulk price" },
  citiesServed: { ta: "Supply பண்ணும் ஊர்கள்", en: "Cities served" },
  minOrder: { ta: "குறைந்தபட்ச order", en: "Minimum order" },
  pcs: { ta: "pcs", en: "pcs" },
  days: { ta: "நாட்கள்", en: "days" },
  bulkTable: { ta: "Bulk விலை பட்டியல்", en: "Bulk price list" },
  qtyPlus: { ta: "அளவு", en: "Quantity" },
  perPiece: { ta: "ஒரு piece", en: "Per piece" },
  requestQuote: { ta: "Bulk quote கேளு", en: "Request bulk quote" },
  waUs: { ta: "WhatsApp பண்ணு", en: "WhatsApp us" },
  quoteTitle: { ta: "Bulk quote கேளுங்க", en: "Request a bulk quote" },
  yourName: { ta: "உங்க பெயர் / கடை பெயர்", en: "Your name / shop name" },
  yourPhone: { ta: "உங்க mobile எண்", en: "Your mobile number" },
  yourCity: { ta: "உங்க ஊர்", en: "Your city" },
  youAre: { ta: "நீங்க", en: "You are" },
  qtyNeeded: { ta: "தேவையான அளவு (pcs)", en: "Quantity needed (pcs)" },
  neededByOpt: { ta: "எப்போ தேவை (இருந்தா)", en: "Needed by (optional)" },
  message: { ta: "Message (இருந்தா)", en: "Message (optional)" },
  send: { ta: "அனுப்பு", en: "Send request" },
  quoteSentTitle: { ta: "Request அனுப்பியாச்சு", en: "Request sent" },
  sourceVerified: { ta: "Annachi verified", en: "Annachi verified" },
  sourceCatalog: { ta: "Catalogue quote", en: "Catalogue quote" },
  notVerified: { ta: "இன்னும் verify ஆகல — call பண்ணி confirm பண்ணுங்க", en: "Not verified yet — call to confirm" },
  catalogueNotFound: { ta: "இந்த catalogue கிடைக்கவில்லை", en: "This catalogue is not available" },
  viewCatalogue: { ta: "எல்லா பொருட்களும்", en: "All products" },
  resetDemo: { ta: "Demo data reset", en: "Reset demo data" },
  demoMannoliLogin: { ta: "Mannoli பக்கம் பார்க்க demo login", en: "Demo login for Mannoli's side" },
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

export function consentText(lang: Lang, business: string): string {
  return lang === "ta"
    ? `இந்த quote பற்றி ${business} என்னை call அல்லது WhatsApp பண்ண ஒப்புக்கொள்கிறேன்.`
    : `I agree that ${business} may call or WhatsApp me about this quote.`;
}

export function quoteSentText(lang: Lang, business: string): string {
  return lang === "ta" ? `${business} உங்களை தொடர்பு கொள்வாங்க.` : `${business} will contact you.`;
}

export function inr(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}
