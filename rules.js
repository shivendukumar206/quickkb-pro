// ==========================================
// 1. CENTRAL BRAND CONFIG (EDIT ANYTIME!)
// ==========================================
const SITE_CONFIG = {
  name: "QuickKB", // Kal ko naam badalna ho toh bas yahan change karein!
  supportEmail: "quickkb.help@gmail.com"
};

// Apply Brand Name Automatically Across Entire Site
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".brand-name").forEach(el => el.innerText = SITE_CONFIG.name);
  renderAlerts();
});

// ==========================================
// 2. LIVE FORM SIZE ALERTS (BELL ICON FEED)
// ==========================================
const EXAM_ALERTS = [
  { id: "a1", title: "SSC & Railway Forms 2026", desc: "Photo: 20-50 KB (200x230px), Sign: 10-20 KB. Click to apply!", pKB: 48, sKB: 19, w: 200, h: 230 },
  { id: "a2", title: "Banking (IBPS / SBI) Rules", desc: "Photo <50KB, Sign <20KB + Left Thumb & Declaration.", pKB: 45, sKB: 19, w: 200, h: 230 },
  { id: "a3", title: "CBSE / ICSE & State Boards", desc: "CBSE requires Name + Date on photo (<40KB).", pKB: 38, sKB: 38, w: 350, h: 450 }
];

function renderAlerts() {
  const list = document.getElementById("alertList");
  if (!list) return;
  list.innerHTML = EXAM_ALERTS.map(a => `
    <div class="alert-item" onclick="applyAlertPreset(${a.pKB}, ${a.sKB}, ${a.w}, ${a.h}, '${a.title}')">
      <strong>🔥 ${a.title}</strong><br><span style="color:#64748b;">${a.desc}</span>
    </div>
  `).join("");
  if (localStorage.getItem("quickkb_alerts_read") === "true") {
    document.getElementById("bellBadge").style.display = "none";
  }
}

function toggleAlerts() {
  const box = document.getElementById("alertDropdown");
  box.style.display = (box.style.display === "block") ? "none" : "block";
}

function markAlertsRead() {
  localStorage.setItem("quickkb_alerts_read", "true");
  document.getElementById("bellBadge").style.display = "none";
  document.getElementById("alertDropdown").style.display = "none";
}

function applyAlertPreset(pKB, sKB, w, h, title) {
  applyExamMode(pKB, sKB, w, h, title, null);
  document.getElementById("alertDropdown").style.display = "none";
}

// ==========================================
// 3. SMART ASSISTANT & LEGAL PAGES DATA
// ==========================================
function toggleAssistant() {
  const box = document.getElementById("aiHelperBox");
  box.style.display = (box.style.display === "block") ? "none" : "block";
}

function askBot(topic) {
  const replies = {
    ssc: "📌 <strong>SSC / Railway:</strong> Photo 20–50 KB (200×230 px) &amp; Sign 10–20 KB in JPG. Preset applied!",
    banking: "📌 <strong>Banking (IBPS/SBI):</strong> Photo <50KB, Sign <20KB, Left Thumb <50KB &amp; Declaration <100KB.",
    cbse: "📌 <strong>CBSE / State Boards:</strong> Photo &amp; Sign under 40KB (JPG) with Name &amp; DOP strip. Preset applied!",
    aadhar: "📌 <strong>Front + Back ID:</strong> Opened <strong>Front + Back ID Joiner</strong> tool for you!"
  };
  if (topic === "ssc") applyExamMode(48, 19, 200, 230, "SSC / Railway", null);
  if (topic === "banking") applyExamMode(45, 19, 200, 230, "Banking IBPS / SBI", null);
  if (topic === "cbse") applyExamMode(38, 38, 350, 450, "CBSE / Board", null);
  if (topic === "aadhar") switchTool("idJoinTool", null);

  const chat = document.getElementById("aiMessages");
  chat.innerHTML += `<div class="bot-msg">${replies[topic]}</div>`;
  chat.scrollTop = chat.scrollHeight;
}

function handleUserAsk() {
  const input = document.getElementById("aiUserInput");
  const q = input.value.trim().toLowerCase();
  if (!q) return;
  const chat = document.getElementById("aiMessages");
  chat.innerHTML += `<div class="user-msg">${input.value}</div>`;
  input.value = "";

  if (q.includes("ssc") || q.includes("rail")) return askBot("ssc");
  if (q.includes("bank") || q.includes("ibps")) return askBot("banking");
  if (q.includes("cbse") || q.includes("bihar") || q.includes("board")) return askBot("cbse");
  if (q.includes("aadhar") || q.includes("id")) return askBot("aadhar");

  let ans = "Select any tool from the menu! Use 'Custom KB' inside Photo or Signature Resizer for exact custom sizes.";
  if (q.includes("age")) { switchTool("calcTool", null); ans = "Opened the Government Job Age Calculator!"; }
  if (q.includes("pdf")) { switchTool("compressPdfTool", null); ans = "Opened the PDF Compressor (<150KB) tool!"; }

  chat.innerHTML += `<div class="bot-msg">${ans}</div>`;
  chat.scrollTop = chat.scrollHeight;
}

function openInfoModal(type) {
  const n = SITE_CONFIG.name;
  const data = {
    about: `<h3>About ${n}</h3><p>${n} is a free, ultra-fast browser utility platform designed for students and cyber cafes to resize photos, signatures, ID cards, and PDFs accurately.</p>`,
    privacy: `<h3>Privacy Policy</h3><p>100% Client-Side Processing: ${n} never uploads or stores your photos, Aadhar cards, or marksheets on any server. Everything happens locally in your browser.</p>`,
    disclaimer: `<h3>Disclaimer</h3><p>${n} is an independent utility tool and not affiliated with any government board. Always verify exact dimensions in your official exam notification.</p>`,
    contact: `<h3>Contact Support</h3><p>For feedback, bug reports, or new preset requests, email us at: <strong>${SITE_CONFIG.supportEmail}</strong></p>`
  };
  document.getElementById("infoContent").innerHTML = data[type];
  document.getElementById("infoModal").style.display = "flex";
}
function openArticle(id) {
  const articles = {
    art1: `<h3>SSC &amp; Railway Photo and Signature Guidelines 2026</h3>
      <p style="margin-top:8px;">Thousands of applications get rejected every year due to blurry photos or wrong file sizes. For SSC (CGL, CHSL, GD, MTS) and RRB Railway forms, your passport photograph must be in <strong>JPG/JPEG format between 20 KB and 50 KB</strong> with standard 200×230 pixel dimensions.</p>
      <p style="margin-top:8px;">Ensure both ears are visible, background is plain white or light grey, and no cap or dark glasses are worn. Your signature must be on white paper in black/blue ink between <strong>10 KB and 20 KB</strong>. Use QuickKB's Signature White Cleaner to remove grey mobile camera shadows automatically.</p>`,
    art2: `<h3>How to Compress Marksheet PDF Under 150KB Without Losing Quality</h3>
      <p style="margin-top:8px;">State PSCs (BPSC, UPPSC), scholarship portals, and college admission forms strictly limit PDF uploads to <strong>100 KB or 200 KB</strong>. Scanning documents directly from a mobile camera often creates 2 MB to 5 MB files.</p>
      <p style="margin-top:8px;">To fix this safely, first enhance your document using QuickKB's Document Scanner filter to whiten the background, then use our <strong>Compress PDF</strong> tool on Strong or Medium mode. Because QuickKB processes everything inside your browser, your sensitive academic records never leave your device.</p>`,
    art3: `<h3>Banking (IBPS/SBI), BPSC &amp; Board Exam 4-Document Checklist</h3>
      <p style="margin-top:8px;">Banking exams like IBPS PO, Clerk, and SBI require four separate files: <strong>1) Photograph (20–50 KB)</strong>, <strong>2) Signature (10–20 KB)</strong>, <strong>3) Left Thumb Impression (20–50 KB)</strong>, and <strong>4) Handwritten Declaration (50–100 KB)</strong>.</p>
      <p style="margin-top:8px;">For CBSE Class 10/12 private and LOC forms, keep photo and signature strictly under <strong>40 KB</strong> with your Name and Date of Photo (DOP) printed clearly at the bottom strip. If a portal asks for both sides of your Aadhar Card, use our Front + Back ID Joiner to merge them onto a single page.</p>`
  };
  document.getElementById("infoContent").innerHTML = articles[id];
  document.getElementById("infoModal").style.display = "flex";
}
