// ============================================================
// QUICKKB PRO ALL-IN-ONE PLUGIN (ZERO-EDIT ARCHITECTURE)
// Includes: Android PDF Fix + Passport BG Color + Tool #13 + #14
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebarMenu");
  const studio = document.querySelector(".studio-box");
  const recentBox = document.getElementById("recentHistoryBox");
  if (!sidebar || !studio) return;

  // 1. Inject Passport Background Color Selector inside Tool #1
  const pDateInput = document.getElementById("pDate");
  if (pDateInput) {
    pDateInput.closest(".grid-2").insertAdjacentHTML("afterend", `
      <div class="grid-2" style="margin-bottom:14px;">
        <div>
          <label>🎨 Passport Background Color:</label>
          <select id="pBgColor">
            <option value="none" selected>Keep Original Background</option>
            <option value="#ffffff">Pure White Background (SSC / NEET / UPSC)</option>
            <option value="#1d4ed8">Passport Royal Blue Background</option>
            <option value="#bae6fd">Light Sky Blue Background</option>
          </select>
        </div>
        <div>
          <label>BG Edge Sensitivity (<span id="bgTolVal">45</span>):</label>
          <input type="range" id="pBgTol" min="15" max="95" value="45" oninput="document.getElementById('bgTolVal').innerText=this.value">
        </div>
      </div>
    `);
  }

  // 2. Inject Sidebar Buttons for Tool #13 & Tool #14
  sidebar.insertAdjacentHTML("beforeend", `
    <div class="side-title" style="margin-top:8px;">CREATOR &amp; PRIVACY</div>
    <button class="side-btn" data-keys="text notes biodata table marks to pdf image slip maker" onclick="switchTool('textPdfTool', this)">
      <span class="s-icon">📝</span><div><strong>Text &amp; Table to PDF/JPG</strong><small>Notes, Slip &amp; Marks Table</small></div>
    </button>
    <button class="side-btn" data-keys="edit photo add text watermark hide mask aadhar privacy blur" onclick="switchTool('annotateTool', this)">
      <span class="s-icon">🛡️</span><div><strong>Photo Text &amp; Privacy Mask</strong><small>Add Text / Hide Aadhar No.</small></div>
    </button>
  `);
  // 3. Fix Android PDF Black Box (Replace iframes with Visual Page-1 Preview + Share)
  ["compPdfFrame", "imgPdfFrame", "orgPdfFrame"].forEach(fid => {
    const iframe = document.getElementById(fid);
    if (!iframe) return;
    const imgPrev = document.createElement("img");
    imgPrev.id = fid + "_img";
    imgPrev.style.cssText = "max-width:100%;max-height:280px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;display:block;margin:8px auto;";
    iframe.parentNode.insertBefore(imgPrev, iframe);
    iframe.style.display = "none";

    const btnRow = iframe.nextElementSibling;
    if (btnRow && !btnRow.querySelector(".wa-btn")) {
      const shBtn = document.createElement("button");
      shBtn.className = "wa-btn";
      shBtn.innerText = "📲 Share";
      shBtn.onclick = () => universalShare("PDF Document");
      btnRow.appendChild(shBtn);
    }

    const obs = new MutationObserver(async () => {
      if (!iframe.src || !iframe.src.startsWith("blob:")) return;
      try {
        if (typeof ensurePdfWorker === "function") ensurePdfWorker();
        const bytes = new Uint8Array(await (await fetch(iframe.src)).arrayBuffer());
        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        const page = await pdf.getPage(1);
        const vp = page.getViewport({ scale: 1.2 });
        const c = document.createElement("canvas");
        c.width = vp.width; c.height = vp.height;
        await page.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise;
        imgPrev.src = c.toDataURL("image/jpeg", 0.88);
      } catch (e) {}
    });
    obs.observe(iframe, { attributes: true, attributeFilter: ["src"] });
  });
  // 4. Inject Tool #13 (Text/Table/Exam Checklist to PDF) & Tool #14 (Annotator + Privacy Masker)
  const pluginHTML = `
    <div id="textPdfTool" class="tool-view">
      <h2>📝 Text, Marks Table &amp; Exam Checklist to PDF / JPG</h2>
      <p class="desc">Create a clean official PDF or JPG slip from your details, marks table, or Exam Day Checklist.</p>
      <div class="grid-2">
        <div><label>Quick Template:</label><select id="tpTemplate" onchange="loadTextTemplate()"><option value="slip" selected>Candidate Summary / Bio-Data Slip</option><option value="marks">Subject Marks Table (Use | for columns)</option><option value="checklist">Exam Day Admit Card Checklist</option></select></div>
        <div><label>Document Heading:</label><input type="text" id="tpTitle" value="CANDIDATE SUMMARY &amp; NOTES"></div>
      </div>
      <div class="grid-2">
        <div><label>Candidate Name &amp; Roll No.:</label><input type="text" id="tpName" placeholder="e.g. Aarav Kumar | Roll: 10245"></div>
        <div><label>Email / Mobile / Exam City:</label><input type="text" id="tpEmail" placeholder="e.g. aarav@email.com | +91-98765XXXXX | Patna"></div>
      </div>
      <label>Notes OR Table Rows (Use | for columns, e.g. Maths | 95 | A1):</label>
      <textarea id="tpBody" rows="5" style="width:100%;padding:10px;border:1.5px solid #cbd5e1;border-radius:10px;font-family:inherit;font-size:14px;" placeholder="Item / Subject | Details / Marks | Status&#10;Mathematics | 95 / 100 | Pass&#10;Science | 89 / 100 | Pass"></textarea>
      <button class="run-btn" style="margin-top:12px;" onclick="generateTextDoc()">⚡ Generate Clean PDF &amp; JPG</button>
      <div id="tpResult" class="pro-result-card">
        <div class="res-left"><img id="tpPreview"></div>
        <div class="res-right">
          <div id="tpStatus" class="ok-msg"></div>
          <div class="btn-row">
            <a id="tpDownloadJpg" download="QuickKB-Slip.jpg"><button class="save-btn">⬇ Download JPG</button></a>
            <button class="wa-btn" onclick="downloadTextAsPDF()">📄 Download PDF</button>
            <button class="print-btn" onclick="printElement('tpPreview')">🖨️ Print</button>
          </div>
        </div>
      </div>
    </div>

    <div id="annotateTool" class="tool-view">
      <h2>🛡️ Photo Text Adder &amp; Aadhar Privacy Masker</h2>
      <p class="desc">Safely hide sensitive Aadhar/Mobile numbers with a privacy mask box OR add custom text labels on any photo/doc.</p>
      <div class="grid-3">
        <div><label>Overlay Mode:</label><select id="annMode"><option value="mask" selected>⬛ Hide / Mask Sensitive Info (Privacy Box)</option><option value="text">✏️ Add Custom Text Label / Watermark</option></select></div>
        <div><label>Box / Text Color:</label><select id="annColor"><option value="#0f172a" selected>Solid Black (Aadhar Mask)</option><option value="#ffffff">Pure White Box</option><option value="#dc2626">Red Highlight / Text</option><option value="#1d4ed8">Royal Blue Text</option></select></div>
        <div><label>Custom Text (If Text Mode):</label><input type="text" id="annText" placeholder="e.g. FOR EXAM USE ONLY"></div>
      </div>
      <div class="grid-2">
        <div><label>Position From Top (%): <span id="annYVal">50</span>%</label><input type="range" id="annY" min="5" max="90" value="50" oninput="document.getElementById('annYVal').innerText=this.value"></div>
        <div><label>Box Width (%): <span id="annWVal">45</span>%</label><input type="range" id="annW" min="10" max="90" value="45" oninput="document.getElementById('annWVal').innerText=this.value"></div>
      </div>
      <label class="drop-box" for="annFile"><span class="up-emoji">🛡️</span><strong id="annLabel">Upload Photo / Aadhar / Document</strong><input type="file" id="annFile" accept="image/*" onchange="updateLabel('annFile','annLabel')"></label>
      <button class="run-btn" onclick="applyAnnotateMask()">⚡ Apply &amp; Preview</button>
      <div id="annResult" class="pro-result-card">
        <div class="res-left"><img id="annPreview"></div>
        <div class="res-right">
          <div id="annStatus" class="ok-msg"></div>
          <div class="btn-row">
            <a id="annDownload" download="QuickKB-Protected.jpg"><button class="save-btn">⬇ Download JPG</button></a>
            <button class="print-btn" onclick="printElement('annPreview')">🖨️ Print</button>
            <button class="wa-btn" onclick="universalShare('Protected Document')">📲 Share</button>
          </div>
        </div>
      </div>
    </div>
  `;
  recentBox.insertAdjacentHTML("beforebegin", pluginHTML);
});
// 5. PASSPORT PHOTO BACKGROUND COLOR CHANGER (HOOKED TO TOOL #1)
document.addEventListener("DOMContentLoaded", () => {
  const pPrev = document.getElementById("pPreview");
  if (!pPrev) return;
  let applyingBg = false;
  new MutationObserver(() => {
    const bgSel = document.getElementById("pBgColor");
    if (!bgSel || bgSel.value === "none" || applyingBg || !pPrev.src) return;
    applyingBg = true;
    const tol = parseInt(document.getElementById("pBgTol").value) || 45;
    const targetHex = bgSel.value;
    const tr = parseInt(targetHex.slice(1, 3), 16), tg = parseInt(targetHex.slice(3, 5), 16), tb = parseInt(targetHex.slice(5, 7), 16);

    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const id = ctx.getImageData(0, 0, c.width, c.height), d = id.data;
      const br = d[0], bg = d[1], bb = d[2];
      for (let i = 0; i < d.length; i += 4) {
        if (Math.abs(d[i] - br) < tol && Math.abs(d[i+1] - bg) < tol && Math.abs(d[i+2] - bb) < tol) {
          d[i] = tr; d[i+1] = tg; d[i+2] = tb;
        }
      }
      ctx.putImageData(id, 0, 0);
      const newUrl = c.toDataURL("image/jpeg", 0.92);
      pPrev.src = newUrl;
      document.getElementById("pDownload").href = newUrl;
      setTimeout(() => { applyingBg = false; }, 100);
    };
    img.src = pPrev.src;
  }).observe(pPrev, { attributes: true, attributeFilter: ["src"] });
});

// 6. TOOL #13 LOGIC: TEXT, MARKS TABLE & EXAM CHECKLIST TO PDF / JPG
function loadTextTemplate() {
  const tpl = document.getElementById("tpTemplate").value;
  if (tpl === "checklist") {
    document.getElementById("tpTitle").value = "EXAM DAY ADMIT CARD CHECKLIST";
    document.getElementById("tpBody").value = "Document / Item | Requirement | Ready?\nPrinted Admit Card | 2 Clear Copies | [  ] Yes\nPassport Photos | 2 Same as Form | [  ] Yes\nOriginal Photo ID | Aadhar / PAN / Voter | [  ] Yes\nBallpoint Pen | Blue / Black Transparent | [  ] Yes";
  } else if (tpl === "marks") {
    document.getElementById("tpTitle").value = "ACADEMIC MARKS STATEMENT";
    document.getElementById("tpBody").value = "Subject | Marks Obtained | Max Marks\nMathematics | 95 | 100\nPhysics | 89 | 100\nChemistry | 92 | 100";
  } else {
    document.getElementById("tpTitle").value = "CANDIDATE SUMMARY & NOTES";
    document.getElementById("tpBody").value = "Category | General / OBC / SC / ST\nQualification | 10th / 12th / Graduation\nExam Center | Patna, Bihar";
  }
}

let textDocDataUrl = "";
function generateTextDoc() {
  const title = document.getElementById("tpTitle").value.trim() || "QUICKKB DOCUMENT";
  const name = document.getElementById("tpName").value.trim();
  const email = document.getElementById("tpEmail").value.trim();
  const lines = document.getElementById("tpBody").value.split("\n").filter(l => l.trim());

  const c = document.createElement("canvas");
  c.width = 900; c.height = Math.max(650, 260 + lines.length * 46);
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 3; ctx.strokeRect(24, 24, c.width - 48, c.height - 48);

  ctx.fillStyle = "#0f172a"; ctx.font = "bold 24px Arial"; ctx.textAlign = "center";
  ctx.fillText(title.toUpperCase(), c.width / 2, 75);
  ctx.font = "15px Arial"; ctx.fillStyle = "#334155";
  if (name) ctx.fillText(name, c.width / 2, 110);
  if (email) ctx.fillText(email, c.width / 2, 136);

  let y = 185; ctx.textAlign = "left";
  lines.forEach((line, idx) => {
    const cols = line.split("|").map(s => s.trim());
    if (cols.length > 1) {
      ctx.fillStyle = idx === 0 ? "#eff6ff" : "#f8fafc";
      ctx.fillRect(45, y - 26, c.width - 90, 38);
      ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1; ctx.strokeRect(45, y - 26, c.width - 90, 38);
      ctx.fillStyle = idx === 0 ? "#1d4ed8" : "#0f172a";
      ctx.font = idx === 0 ? "bold 15px Arial" : "15px Arial";
      const colW = (c.width - 110) / cols.length;
      cols.forEach((col, ci) => ctx.fillText(col, 55 + ci * colW, y));
    } else {
      ctx.fillStyle = "#0f172a"; ctx.font = "16px Arial";
      ctx.fillText("• " + line, 55, y);
    }
    y += 44;
  });

  textDocDataUrl = c.toDataURL("image/jpeg", 0.92);
  document.getElementById("tpPreview").src = textDocDataUrl;
  document.getElementById("tpDownloadJpg").href = textDocDataUrl;
  document.getElementById("tpStatus").innerText = "✅ Document Slip Ready (JPG & PDF)";
  document.getElementById("tpResult").style.display = "grid";
}

async function downloadTextAsPDF() {
  if (!textDocDataUrl) return;
  const pdfDoc = await window.PDFLib.PDFDocument.create();
  const img = await pdfDoc.embedJpg(textDocDataUrl);
  const p = pdfDoc.addPage([img.width, img.height]);
  p.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  triggerBlobDownload(await pdfDoc.save(), getFileName("Summary_Slip.pdf"), "application/pdf");
}

// 7. TOOL #14 LOGIC: PHOTO TEXT ADDER & AADHAR PRIVACY MASKER
function applyAnnotateMask() {
  const file = document.getElementById("annFile").files.item(0);
  if (!file) return alert("Please upload an image or document first!");
  const mode = document.getElementById("annMode").value;
  const color = document.getElementById("annColor").value;
  const txt = document.getElementById("annText").value.trim() || "PROTECTED COPY";
  const yPct = parseInt(document.getElementById("annY").value) / 100;
  const wPct = parseInt(document.getElementById("annW").value) / 100;

  loadImageFile(file, img => {
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const boxW = Math.round(c.width * wPct);
    const boxH = Math.max(28, Math.round(c.height * 0.065));
    const bx = Math.round((c.width - boxW) / 2);
    const by = Math.round(c.height * yPct);

    if (mode === "mask") {
      ctx.fillStyle = color;
      ctx.fillRect(bx, by, boxW, boxH);
    } else {
      ctx.fillStyle = color;
      ctx.font = `bold ${Math.max(18, Math.round(c.width * 0.045))}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText(txt, c.width / 2, by + boxH * 0.7);
    }

    const url = c.toDataURL("image/jpeg", 0.92);
    document.getElementById("annPreview").src = url;
    document.getElementById("annDownload").href = url;
    document.getElementById("annStatus").innerText = "✅ Protected Image Ready!";
    document.getElementById("annResult").style.display = "grid";
  });
}
