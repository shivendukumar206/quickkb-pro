// ==========================================
// 1. CENTRAL BRAND CONFIG
// ==========================================
const SITE_CONFIG = {
  name: "QuickKB",
  supportEmail: "quickkb.help@gmail.com"
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".brand-name").forEach(el => el.innerText = SITE_CONFIG.name);
  renderAlerts();
});

// ==========================================
// 2. LIVE 2026 EXAM ALERTS (BELL ICON)
// ==========================================
const EXAM_ALERTS = [
  { title: "SSC / Railway 2026 Rules", desc: "Photo: 20-50KB (200x230px), Sign: 10-20KB.", pKB: 48, sKB: 19, w: 200, h: 230 },
  { title: "High Court / Civil Judge / Clerk", desc: "Photo <50KB, Sign <20KB + Left Thumb.", pKB: 45, sKB: 19, w: 250, h: 250 },
  { title: "JEE / NEET / CUET / UG-PG", desc: "Photo 10-100KB (3.5x4.5cm), Sign <30KB.", pKB: 95, sKB: 28, w: 350, h: 450 },
  { title: "Banking (IBPS / SBI) 4-Doc Kit", desc: "Photo <50KB, Sign <20KB, Thumb <50KB, Decl <100KB.", pKB: 45, sKB: 19, w: 200, h: 230 }
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
// 3. SMART EXAM AI HELPER (WITH GOOGLE FALLBACK)
// ==========================================
function toggleAssistant() {
  const box = document.getElementById("aiHelperBox");
  box.style.display = (box.style.display === "block") ? "none" : "block";
}

function askBot(topic) {
  const replies = {
    court: "⚖️ <strong>High Court / Civil Judge:</strong> Photo 20–50KB (white background), Sign 10–20KB, and Left Thumb <50KB. Preset applied!",
    jee: "🎓 <strong>JEE / NEET / CUET / UG-PG:</strong> Passport Photo 10–100KB (80% face coverage, white background) & Sign 4–30KB. Preset applied!",
    banking: "🏦 <strong>Banking (IBPS/SBI):</strong> Requires 4 docs—Photo (<50KB), Sign (<20KB), Left Thumb (<50KB) & Declaration (<100KB). Use our Thumb & Decl tab!",
    height: "📏 <strong>Police / Army / SSC GD Height:</strong> General Male usually requires 165–170 cm (5'5\"–5'7\"). Opened Height & BMI Calculator for you!"
  };
  if (topic === "court") applyExamMode(45, 19, 250, 250, "High Court / Civil Judge", null);
  if (topic === "jee") applyExamMode(95, 28, 350, 450, "JEE / NEET / CUET / UG-PG", null);
  if (topic === "banking") switchTool("thumbTool", null);
  if (topic === "height") switchTool("calcTool", null);

  const chat = document.getElementById("aiMessages");
  chat.innerHTML += `<div class="bot-msg">${replies[topic]}</div>`;
  chat.scrollTop = chat.scrollHeight;
}

function handleUserAsk() {
  const input = document.getElementById("aiUserInput");
  const raw = input.value.trim();
  if (!raw) return;
  const q = raw.toLowerCase();
  const chat = document.getElementById("aiMessages");

  const uDiv = document.createElement("div");
  uDiv.className = "user-msg";
  uDiv.textContent = raw;
  chat.appendChild(uDiv);
  input.value = "";

  if (q.includes("court") || q.includes("judge")) return askBot("court");
  if (q.includes("jee") || q.includes("neet") || q.includes("cuet") || q.includes("ug") || q.includes("pg")) return askBot("jee");
  if (q.includes("bank") || q.includes("thumb") || q.includes("decl")) return askBot("banking");
  if (q.includes("height") || q.includes("army") || q.includes("police") || q.includes("bmi")) return askBot("height");

  const googleUrl = "https://google.com" + encodeURIComponent(raw + " official exam form photo size rule");
  chat.innerHTML += `<div class="bot-msg">Use our left menu tools for instant KB/MB resize, PDF compression, or HD scanning. For specific official PDF notifications: <br><a href="${googleUrl}" target="_blank" style="color:#2563eb;font-weight:700;">🔍 Search Official Rule on Google →</a></div>`;
  chat.scrollTop = chat.scrollHeight;
}

// ==========================================
// 4. 2026 EXAM GUIDE ARTICLES
// ==========================================
function openArticle(id) {
  const articles = {
    art1: `<h3>SSC, Railway &amp; High Court Photo/Signature Rules 2026</h3><p style="margin-top:8px;">For SSC, RRB Railway, and High Court / Civil Judge recruitment forms, upload a clear passport photo in <strong>JPG format (20 KB – 50 KB)</strong> with plain light background and both ears visible. Signature must be in black/blue ink on white paper between <strong>10 KB – 20 KB</strong>.</p>`,
    art2: `<h3>JEE, NEET, CUET (UG/PG) &amp; Banking 4-Document Kit</h3><p style="margin-top:8px;">NTA exams (JEE, NEET, CUET) require a recent photograph (10–100 KB) with 80% face visibility without mask, and signature (4–30 KB). Banking IBPS/SBI exams additionally require Left Thumb Impression (20–50 KB) and Handwritten Declaration (50–100 KB).</p>`,
    art3: `<h3>Police / Army Height Eligibility &amp; Marksheet PDF Rules</h3><p style="margin-top:8px;">For SSC GD, Bihar Police, and Army Agniveer forms, check your exact height in centimeters (e.g., 165 cm / 170 cm) and BMI before applying. Always compress scanned marksheet PDFs under 150 KB–200 KB while keeping roll numbers readable.</p>`
  };
  document.getElementById("infoContent").innerHTML = articles[id];
  document.getElementById("infoModal").style.display = "flex";
}
