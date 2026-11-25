if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cloudflare.com';
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  document.getElementById('themeBtn').innerText = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
}

function searchTools() {
  const q = document.getElementById('toolSearch').value.toLowerCase();
  document.querySelectorAll('.side-btn').forEach(btn => {
    const keys = (btn.getAttribute('data-keys') + ' ' + btn.innerText).toLowerCase();
    btn.style.display = keys.includes(q) ? 'flex' : 'none';
  });
}

function switchTool(toolId, btn) {
  document.querySelectorAll('.tool-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.side-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(toolId).classList.add('active');
  if (btn) btn.classList.add('active');
}

function applyExamMode(photoKB, signKB, w, h, labelText, chipBtn) {
  if (chipBtn) {
    document.querySelectorAll('.exam-chip').forEach(c => c.classList.remove('active'));
    chipBtn.classList.add('active');
  }
  document.getElementById('examPreset').value = photoKB;
  document.getElementById('sPreset').value = signKB;
  document.getElementById('photoDim').value = `${w}x${h}`;
  document.getElementById('customPhotoKBBox').style.display = 'none';
  document.getElementById('customSignKBBox').style.display = 'none';
  document.getElementById('activeModeBanner').innerHTML = `Mode: <strong>${labelText}</strong>`;
}

function toggleCustomKB(selectId, boxId) {
  document.getElementById(boxId).style.display = (document.getElementById(selectId).value === 'custom') ? 'block' : 'none';
}

function getFileName(defaultName) {
  const prefix = document.getElementById('filePrefix').value.trim().replace(/\s+/g, '_');
  return prefix ? `${prefix}_${defaultName}` : `${SITE_CONFIG.name}-${defaultName}`;
}

function addRecentFile(label, url, fileName) {
  const box = document.getElementById('recentHistoryBox');
  const list = document.getElementById('recentList');
  box.style.display = 'block';
  const a = document.createElement('a');
  a.href = url; a.download = fileName; a.innerText = `⬇ ${label}`;
  list.prepend(a);
}

function updateLabel(inputId, textId) {
  const f = document.getElementById(inputId).files[0];
  if (f) document.getElementById(textId).innerText = "✅ Selected: " + f.name;
}

function updateMultiLabel(inputId, textId) {
  const count = document.getElementById(inputId).files.length;
  if (count > 0) document.getElementById(textId).innerText = `✅ ${count} file(s) selected`;
}

function resetTool(inputId, labelId, resultId) {
  document.getElementById(inputId).value = "";
  document.getElementById(labelId).innerText = "Click to Upload New File";
  document.getElementById(resultId).style.display = "none";
}

function resetIDTool() {
  document.getElementById('idFront').value = "";
  document.getElementById('idBack').value = "";
  document.getElementById('idFrontLabel').innerText = "1. Front Side";
  document.getElementById('idBackLabel').innerText = "2. Back Side";
  document.getElementById('idResult').style.display = "none";
}

function compressCanvas(canvas, maxKB) {
  let q = 0.92;
  let dataUrl = canvas.toDataURL('image/jpeg', q);
  while ((dataUrl.length * 0.75) / 1024 > maxKB && q > 0.08) {
    q -= 0.05;
    dataUrl = canvas.toDataURL('image/jpeg', q);
  }
  return dataUrl;
}

function loadImageFile(file, callback) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => callback(img);
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// 1. PHOTO SIZE REDUCER
function makeExamPhoto() {
  const file = document.getElementById('pFile').files[0];
  if (!file) return alert("Please select a photo first!");
  const pVal = document.getElementById('examPreset').value;
  const maxKB = pVal === 'custom' ? parseInt(document.getElementById('customPhotoKB').value) : parseInt(pVal);
  if (!maxKB || maxKB < 5) return alert("Enter valid KB (min 5 KB)!");

  const dim = document.getElementById('photoDim').value;
  const name = document.getElementById('pName').value.trim().toUpperCase();
  const date = document.getElementById('pDate').value.trim();

  loadImageFile(file, img => {
    const canvas = document.createElement('canvas');
    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    let w = 350, h = Math.round((img.height / img.width) * w);

    if (dim !== 'original') {
      const [tw, th] = dim.split('x').map(Number);
      w = tw; h = th;
      const targetRatio = w / h, imgRatio = img.width / img.height;
      if (imgRatio > targetRatio) { sw = img.height * targetRatio; sx = (img.width - sw) / 2; }
      else { sh = img.width / targetRatio; sy = (img.height - sh) / 4; }
    }

    const strip = (name || date) ? 46 : 0;
    canvas.width = w; canvas.height = h + strip;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h + strip);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

    if (strip > 0) {
      ctx.fillStyle = "#000"; ctx.font = "bold 13px Arial"; ctx.textAlign = "center";
      if (name && date) { ctx.fillText(name, w/2, h+18); ctx.fillText("DOP: " + date, w/2, h+36); }
      else { ctx.fillText(name || ("DOP: " + date), w/2, h+27); }
    }
    const url = compressCanvas(canvas, maxKB);
    const kb = Math.round((url.length * 0.75) / 1024);
    const fName = getFileName("Photo.jpg");
    document.getElementById('pPreview').src = url;
    document.getElementById('pDownload').href = url;
    document.getElementById('pDownload').download = fName;
    document.getElementById('pStatus').innerText = `✅ Ready: ${kb} KB (${w}×${h + strip} px)`;
    document.getElementById('pResult').style.display = 'grid';
    addRecentFile(`Photo (${kb}KB)`, url, fName);
  });
}

// 2. SIGNATURE RESIZER
function makeSignature() {
  const file = document.getElementById('sFile').files[0];
  if (!file) return alert("Please select signature image!");
  const sVal = document.getElementById('sPreset').value;
  const maxKB = sVal === 'custom' ? parseInt(document.getElementById('customSignKB').value) : parseInt(sVal);
  if (!maxKB || maxKB < 5) return alert("Enter valid KB!");

  const mode = document.getElementById('sFilter').value;
  loadImageFile(file, img => {
    const canvas = document.createElement('canvas');
    const w = 300, h = Math.round((img.height / img.width) * w);
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    if (mode === 'clean') {
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const avg = (d[i] + d[i+1] + d[i+2]) / 3;
        if (avg > 150) { d[i] = d[i+1] = d[i+2] = 255; }
        else { d[i] *= 0.6; d[i+1] *= 0.6; d[i+2] *= 0.6; }
      }
      ctx.putImageData(imgData, 0, 0);
    }
    const url = compressCanvas(canvas, maxKB);
    const kb = Math.round((url.length * 0.75) / 1024);
    const fName = getFileName("Sign.jpg");
    document.getElementById('sPreview').src = url;
    document.getElementById('sDownload').href = url;
    document.getElementById('sDownload').download = fName;
    document.getElementById('sStatus').innerText = `✅ Ready: ${kb} KB (JPG)`;
    document.getElementById('sResult').style.display = 'grid';
    addRecentFile(`Sign (${kb}KB)`, url, fName);
  });
}
// 3. FRONT + BACK ID JOINER
let combinedIdUrl = "";
function joinFrontBackID() {
  const f1 = document.getElementById('idFront').files[0];
  const f2 = document.getElementById('idBack').files[0];
  if (!f1 || !f2) return alert("Upload both Front & Back images!");

  loadImageFile(f1, img1 => {
    loadImageFile(f2, img2 => {
      const canvas = document.createElement('canvas');
      const w = 800, h1 = Math.round((img1.height / img1.width) * w), h2 = Math.round((img2.height / img2.width) * w);
      canvas.width = w + 60; canvas.height = h1 + h2 + 90;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img1, 30, 30, w, h1); ctx.strokeStyle = "#cbd5e1"; ctx.strokeRect(30, 30, w, h1);
      ctx.drawImage(img2, 30, h1 + 60, w, h2); ctx.strokeRect(30, h1 + 60, w, h2);

      combinedIdUrl = canvas.toDataURL('image/jpeg', 0.9);
      const kb = Math.round((combinedIdUrl.length * 0.75) / 1024);
      const fName = getFileName("ID_Card.jpg");
      document.getElementById('idPreview').src = combinedIdUrl;
      document.getElementById('idDownload').href = combinedIdUrl;
      document.getElementById('idDownload').download = fName;
      document.getElementById('idStatus').innerText = `✅ Combined ID Ready (${kb} KB)`;
      document.getElementById('idResult').style.display = 'grid';
    });
  });
}

async function downloadIDAsPDF() {
  if (!combinedIdUrl) return;
  const { PDFDocument } = PDFLib;
  const pdfDoc = await PDFDocument.create();
  const img = await pdfDoc.embedJpg(await fetch(combinedIdUrl).then(r => r.arrayBuffer()));
  const page = pdfDoc.addPage([img.width, img.height]);
  page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  downloadBlob(await pdfDoc.save(), getFileName("ID_Card.pdf"), 'application/pdf');
}

// 4. DOCUMENT SCANNER + SELF-ATTESTED STAMP
function scanDocument() {
  const file = document.getElementById('scanFile').files[0];
  if (!file) return alert("Select document image!");
  const mode = document.getElementById('scanMode').value;
  const stamp = document.getElementById('attestStamp').value;

  loadImageFile(file, img => {
    const canvas = document.createElement('canvas');
    const w = Math.min(img.width, 1200), h = Math.round((img.height / img.width) * w);
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.filter = mode === 'bw' ? 'grayscale(100%) contrast(175%) brightness(115%)' : 'contrast(135%) brightness(110%)';
    ctx.drawImage(img, 0, 0, w, h);
    ctx.filter = 'none';

    if (stamp === 'yes') {
      const today = new Date().toLocaleDateString('en-GB');
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillRect(w - 250, h - 75, 230, 55);
      ctx.strokeStyle = "#1d4ed8"; ctx.lineWidth = 2; ctx.strokeRect(w - 250, h - 75, 230, 55);
      ctx.fillStyle = "#1d4ed8"; ctx.font = "bold 15px Arial"; ctx.textAlign = "center";
      ctx.fillText("SELF ATTESTED", w - 135, h - 50);
      ctx.font = "12px Arial"; ctx.fillText(`Date: ${today}`, w - 135, h - 30);
    }

    const url = canvas.toDataURL('image/jpeg', 0.88);
    const kb = Math.round((url.length * 0.75) / 1024);
    const fName = getFileName("Scanned_Doc.jpg");
    document.getElementById('scanPreview').src = url;
    document.getElementById('scanDownload').href = url;
    document.getElementById('scanDownload').download = fName;
    document.getElementById('scanStatus').innerText = `✅ Scanned Ready (${kb} KB)`;
    document.getElementById('scanResult').style.display = 'grid';
  });
}

// 5. ALL-FORMAT CONVERTER & A4 SHEET
function convertImg() {
  const file = document.getElementById('cFile').files[0];
  if (!file) return alert("Select image!");
  const [mime, ext] = document.getElementById('cFormat').value.split('|');
  const qual = parseFloat(document.getElementById('cQuality').value);
  loadImageFile(file, img => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const url = canvas.toDataURL(mime, qual);
    const kb = Math.round((url.length * 0.75) / 1024);
    document.getElementById('cPreview').src = url;
    document.getElementById('cDownload').href = url;
    document.getElementById('cDownload').download = getFileName(`Converted.${ext}`);
    document.getElementById('cStatus').innerText = `✅ Converted to ${ext.toUpperCase()} (${kb} KB)`;
    document.getElementById('cResult').style.display = 'grid';
  });
}

function makeA4Sheet() {
  const file = document.getElementById('sheetFile').files[0];
  if (!file) return alert("Select passport photo!");
  loadImageFile(file, img => {
    const canvas = document.createElement('canvas');
    canvas.width = 1240; canvas.height = 1754;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const pw = 240, ph = 300, gap = 45;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) {
        const x = 75 + c * (pw + gap), y = 100 + r * (ph + gap);
        ctx.drawImage(img, x, y, pw, ph); ctx.strokeStyle = "#ccc"; ctx.strokeRect(x, y, pw, ph);
      }
    }
    const url = canvas.toDataURL('image/jpeg', 0.9);
    document.getElementById('sheetPreview').src = url;
    document.getElementById('sheetDownload').href = url;
    document.getElementById('sheetStatus').innerText = "✅ A4 8-Photo Sheet Ready!";
    document.getElementById('sheetResult').style.display = 'grid';
  });
}

// 6. PDF STUDIO (COMPRESS, IMAGES TO PDF, PDF TO JPG, MERGE/SPLIT/ROTATE)
async function compressRealPDF() {
  const file = document.getElementById('compPdfFile').files[0];
  if (!file) return alert("Select PDF file!");
  const qual = parseFloat(document.getElementById('pdfCompLevel').value);
  const st = document.getElementById('compPdfStatus');
  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const { PDFDocument } = PDFLib;
  const newPdf = await PDFDocument.create();

  for (let i = 1; i <= pdf.numPages; i++) {
    st.innerText = `⏳ Compressing Page ${i} of ${pdf.numPages}...`;
    const page = await pdf.getPage(i);
    const vp = page.getViewport({ scale: 1.2 });
    const canvas = document.createElement('canvas');
    canvas.width = vp.width; canvas.height = vp.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
    const jpgImg = await newPdf.embedJpg(await fetch(canvas.toDataURL('image/jpeg', qual)).then(r => r.arrayBuffer()));
    const np = newPdf.addPage([vp.width, vp.height]);
    np.drawImage(jpgImg, { x: 0, y: 0, width: vp.width, height: vp.height });
  }
  const out = await newPdf.save();
  st.innerText = `✅ Done! Compressed Size: ${Math.round(out.byteLength / 1024)} KB`;
  downloadBlob(out, getFileName("Compressed.pdf"), 'application/pdf');
}

async function imagesToRealPDF() {
  const files = document.getElementById('pdfFiles').files[0];
  if (!files.length) return alert("Select at least 1 image!");
  const { PDFDocument } = PDFLib;
  const pdfDoc = await PDFDocument.create();
  for (let f of files) {
    const b = await f.arrayBuffer();
    const img = f.type === 'image/png' ? await pdfDoc.embedPng(b) : await pdfDoc.embedJpg(b);
    const p = pdfDoc.addPage([img.width, img.height]);
    p.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  downloadBlob(await pdfDoc.save(), getFileName("Document.pdf"), 'application/pdf');
}

async function convertPdfToImages() {
  const file = document.getElementById('pdfToImgFile').files[0];
  if (!file) return alert("Select PDF file!");
  const [mime, ext] = document.getElementById('pdfImgFormat').value.split('|');
  const outDiv = document.getElementById('pdfPagesOutput');
  outDiv.innerHTML = "<p>⏳ Extracting pages...</p>";
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  outDiv.innerHTML = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const vp = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    canvas.width = vp.width; canvas.height = vp.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
    const url = canvas.toDataURL(mime, 0.92);
    outDiv.innerHTML += `<div class="page-thumb"><img src="${url}"><a href="${url}" download="Page-${i}.${ext}"><button class="save-btn" style="padding:6px 10px;font-size:12px;">⬇ Page ${i}</button></a></div>`;
  }
}

async function mergeRealPDFs() {
  const files = document.getElementById('mergeFiles').files[0];
  if (files.length < 2) return alert("Select at least 2 PDFs!");
  const { PDFDocument } = PDFLib;
  const merged = await PDFDocument.create();
  for (let f of files) {
    const pdf = await PDFDocument.load(await f.arrayBuffer());
    (await merged.copyPages(pdf, pdf.getPageIndices())).forEach(p => merged.addPage(p));
  }
  downloadBlob(await merged.save(), getFileName("Merged.pdf"), 'application/pdf');
}

async function processAdvancedPDF() {
  const file = document.getElementById('rotFile').files[0];
  if (!file) return alert("Select PDF file!");
  const pg = parseInt(document.getElementById('splitPageNum').value);
  const ang = parseInt(document.getElementById('rotAngle').value);
  const { PDFDocument, degrees } = PDFLib;
  const src = await PDFDocument.load(await file.arrayBuffer());
  const out = await PDFDocument.create();
  const idx = pg > 0 ? [pg - 1] : src.getPageIndices();
  if (pg > src.getPageCount()) return alert("Invalid page number!");
  (await out.copyPages(src, idx)).forEach(p => { if (ang > 0) p.setRotation(degrees(ang)); out.addPage(p); });
  downloadBlob(await out.save(), getFileName("Edited.pdf"), 'application/pdf');
}

function downloadBlob(bytes, name, mime) {
  const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
}

// 7. AGE, PERCENTAGE, RATING & WHATSAPP SHARE
function calculateExactAge() {
  const d1 = document.getElementById('dobInput').value, d2 = document.getElementById('cutoffInput').value;
  if (!d1 || !d2) return alert("Select both dates!");
  const dob = new Date(d1), cut = new Date(d2);
  if (dob > cut) return alert("DOB cannot be after cutoff date!");
  let y = cut.getFullYear() - dob.getFullYear(), m = cut.getMonth() - dob.getMonth(), d = cut.getDate() - dob.getDate();
  if (d < 0) { m--; d += new Date(cut.getFullYear(), cut.getMonth(), 0).getDate(); }
  if (m < 0) { y--; m += 12; }
  document.getElementById('ageResult').innerText = `✅ Exact Age: ${y} Years, ${m} Months, ${d} Days`;
}

function calcPercent() {
  const obt = parseFloat(document.getElementById('obtMarks').value), max = parseFloat(document.getElementById('maxMarks').value);
  if (!obt || !max || obt > max) return alert("Enter valid marks!");
  const pct = ((obt / max) * 100).toFixed(2);
  document.getElementById('calcStatus').innerText = `✅ Percentage: ${pct}% | CGPA: ${(pct / 9.5).toFixed(2)}`;
}

function rateSite() {
  document.getElementById('ratingText').innerHTML = `<strong>5.0 / 5</strong> (Thank you for voting! 🎉)`;
}

function shareToWhatsApp(docType) {
  const msg = encodeURIComponent(`I prepared my ${docType} in exact exam size using ${SITE_CONFIG.name}! Try free: ${window.location.href}`);
  window.open(`https://wa.me{msg}`, '_blank');
}
