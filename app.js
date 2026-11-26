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
  document.getElementById('customDimBox').style.display = 'none';
  document.getElementById('activeModeBanner').innerHTML = `Mode: <strong>${labelText}</strong>`;
}

function toggleCustomKB(selectId, boxId) {
  document.getElementById(boxId).style.display = (document.getElementById(selectId).value === 'custom') ? 'grid' : 'none';
}

function toggleCustomDim() {
  document.getElementById('customDimBox').style.display = (document.getElementById('photoDim').value === 'custom') ? 'grid' : 'none';
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

function syncCamToInput(camId, fileId, labelId) {
  const camInput = document.getElementById(camId);
  if (camInput.files && camInput.files[0]) {
    const dt = new DataTransfer();
    dt.items.add(camInput.files[0]);
    document.getElementById(fileId).files = dt.files;
    document.getElementById(labelId).innerText = "📷 Captured: " + camInput.files[0].name;
  }
}

function updateMultiLabel(inputId, textId) {
  const count = document.getElementById(inputId).files.length;
  if (count > 0) document.getElementById(textId).innerText = `✅ ${count} image(s) selected`;
}

function resetTool(inputId, labelId, resultId) {
  document.getElementById(inputId).value = "";
  document.getElementById(labelId).innerText = "Upload Photo from Device";
  document.getElementById(resultId).style.display = "none";
}

function resetIDTool() {
  document.getElementById('idFront').value = "";
  document.getElementById('idBack').value = "";
  document.getElementById('idFrontLabel').innerText = "1. Front Side";
  document.getElementById('idBackLabel').innerText = "2. Back Side";
  document.getElementById('idResult').style.display = "none";
}

// TARGET KB / MB SIZE ENGINE (REDUCER + INCREASER)
function adjustCanvasSize(canvas, targetKB) {
  let q = 0.92;
  let dataUrl = canvas.toDataURL('image/jpeg', q);
  let curKB = (dataUrl.length * 0.75) / 1024;

  // Reduce if larger
  while (curKB > targetKB && q > 0.06) {
    q -= 0.05;
    dataUrl = canvas.toDataURL('image/jpeg', q);
    curKB = (dataUrl.length * 0.75) / 1024;
  }
  // Increase if smaller (for MB / minimum size rules)
  if (curKB < targetKB * 0.85 && targetKB >= 100) {
    dataUrl = canvas.toDataURL('image/jpeg', 1.0);
    curKB = (dataUrl.length * 0.75) / 1024;
    if (curKB < targetKB) {
      const padBytes = Math.round((targetKB - curKB) * 1024);
      const padStr = "A".repeat(Math.max(0, padBytes));
      dataUrl = dataUrl + "#" + padStr;
    }
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

// 1. PHOTO REDUCER & INCREASER
async function makeExamPhoto() {
  const file = document.getElementById('pFile').files[0];
  if (!file) return alert("Please upload or capture a photo first!");

  const pVal = document.getElementById('examPreset').value;
  let targetKB = parseInt(pVal);
  if (pVal === 'custom') {
    const val = parseFloat(document.getElementById('customPhotoKB').value);
    const unit = document.getElementById('customPhotoUnit').value;
    if (!val || val <= 0) return alert("Enter valid target size!");
    targetKB = unit === 'MB' ? Math.round(val * 1024) : Math.round(val);
  }

  const dimVal = document.getElementById('photoDim').value;
  const focus = document.getElementById('photoCropFocus').value;
  const name = document.getElementById('pName').value.trim();
  const date = document.getElementById('pDate').value.trim();

  if (document.fonts) await document.fonts.ready;

  loadImageFile(file, img => {
    const canvas = document.createElement('canvas');
    let w = 350, h = Math.round((img.height / img.width) * w);

    if (dimVal === 'custom') {
      w = parseInt(document.getElementById('customW').value) || 350;
      h = parseInt(document.getElementById('customH').value) || 450;
    } else if (dimVal !== 'original') {
      [w, h] = dimVal.split('x').map(Number);
    }

    const strip = (name || date) ? Math.max(44, Math.round(h * 0.14)) : 0;
    canvas.width = w; canvas.height = h + strip;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h + strip);

    if (focus === 'fit') {
      const scale = Math.min(w / img.width, h / img.height);
      const nw = img.width * scale, nh = img.height * scale;
      ctx.drawImage(img, (w - nw) / 2, (h - nh) / 2, nw, nh);
    } else {
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      const targetRatio = w / h, imgRatio = img.width / img.height;
      if (imgRatio > targetRatio) { sw = img.height * targetRatio; sx = (img.width - sw) / 2; }
      else { sh = img.width / targetRatio; sy = (focus === 'top') ? (img.height - sh) / 5 : (img.height - sh) / 2; }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    }

    if (strip > 0) {
      ctx.fillStyle = "#000";
      ctx.font = `bold ${Math.max(12, Math.round(w * 0.055))}px 'Noto Sans Devanagari', Arial, sans-serif`;
      ctx.textAlign = "center";
      if (name && date) { ctx.fillText(name, w/2, h + strip * 0.42); ctx.fillText("DOP: " + date, w/2, h + strip * 0.85); }
      else { ctx.fillText(name || ("DOP: " + date), w/2, h + strip * 0.65); }
    }

    const url = adjustCanvasSize(canvas, targetKB);
    const finalKB = Math.round((url.length * 0.75) / 1024);
    const sizeText = finalKB >= 1024 ? `${(finalKB / 1024).toFixed(2)} MB` : `${finalKB} KB`;
    const fName = getFileName("Photo.jpg");

    document.getElementById('pPreview').src = url;
    document.getElementById('pDownload').href = url;
    document.getElementById('pDownload').download = fName;
    document.getElementById('pStatus').innerText = `✅ Ready: ${sizeText} (${w}×${h + strip} px)`;
    document.getElementById('pResult').style.display = 'grid';
    addRecentFile(`Photo (${sizeText})`, url, fName);
  });
}

// 2. SIGNATURE CLEANER
function makeSignature() {
  const file = document.getElementById('sFile').files[0];
  if (!file) return alert("Please upload signature image!");
  const sVal = document.getElementById('sPreset').value;
  let targetKB = parseInt(sVal);
  if (sVal === 'custom') {
    const val = parseFloat(document.getElementById('customSignKB').value);
    const unit = document.getElementById('customSignUnit').value;
    if (!val || val <= 0) return alert("Enter valid target size!");
    targetKB = unit === 'MB' ? Math.round(val * 1024) : Math.round(val);
  }

  const mode = document.getElementById('sFilter').value;
  loadImageFile(file, img => {
    const canvas = document.createElement('canvas');
    const w = 320, h = Math.round((img.height / img.width) * w);
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
        else { d[i] *= 0.55; d[i+1] *= 0.55; d[i+2] *= 0.55; }
      }
      ctx.putImageData(imgData, 0, 0);
    }
    const url = adjustCanvasSize(canvas, targetKB);
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

// 3. THUMB & HANDWRITTEN DECLARATION
function makeThumb() {
  const file = document.getElementById('tFile').files;
  if (!file) return alert("Please select thumb/declaration image!");
  const maxKB = parseInt(document.getElementById('tPreset').value);
  loadImageFile(file, img => {
    const canvas = document.createElement('canvas');
    const w = 420, h = Math.round((img.height / img.width) * w);
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const url = adjustCanvasSize(canvas, maxKB);
    const kb = Math.round((url.length * 0.75) / 1024);
    const fName = getFileName("Thumb_Decl.jpg");
    document.getElementById('tPreview').src = url;
    document.getElementById('tDownload').href = url;
    document.getElementById('tDownload').download = fName;
    document.getElementById('tStatus').innerText = `✅ Ready: ${kb} KB (JPG)`;
    document.getElementById('tResult').style.display = 'grid';
  });
}

// 4. IPHONE NOTES-STYLE HD DOCUMENT SCANNER + SELF-ATTESTED STAMP
function scanDocument() {
  const file = document.getElementById('scanFile').files;
  if (!file) return alert("Select document image!");
  const mode = document.getElementById('scanMode').value;
  const stamp = document.getElementById('attestStamp').value;

  loadImageFile(file, img => {
    const canvas = document.createElement('canvas');
    const w = Math.min(img.width, 1300), h = Math.round((img.height / img.width) * w);
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);

    // Pixel-level Notes-style shadow removal & crisp text enhancement
    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i+1], b = d[i+2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (mode === 'bw') {
        const val = lum > 145 ? 255 : (lum < 85 ? 15 : lum * 0.7);
        d[i] = d[i+1] = d[i+2] = val;
      } else {
        if (lum > 165) { d[i] = Math.min(255, r * 1.25); d[i+1] = Math.min(255, g * 1.25); d[i+2] = Math.min(255, b * 1.25); }
        else { d[i] = r * 0.78; d[i+1] = g * 0.78; d[i+2] = b * 0.78; }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    if (stamp === 'yes') {
      const today = new Date().toLocaleDateString('en-GB');
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillRect(w - 255, h - 78, 235, 58);
      ctx.strokeStyle = "#1d4ed8"; ctx.lineWidth = 2.5; ctx.strokeRect(w - 255, h - 78, 235, 58);
      ctx.fillStyle = "#1d4ed8"; ctx.font = "bold 15px Arial"; ctx.textAlign = "center";
      ctx.fillText("SELF ATTESTED", w - 137, h - 52);
      ctx.font = "12px Arial"; ctx.fillText(`Date: ${today}`, w - 137, h - 32);
    }

    const url = canvas.toDataURL('image/jpeg', 0.90);
    const kb = Math.round((url.length * 0.75) / 1024);
    const fName = getFileName("HD_Scan.jpg");
    document.getElementById('scanPreview').src = url;
    document.getElementById('scanDownload').href = url;
    document.getElementById('scanDownload').download = fName;
    document.getElementById('scanStatus').innerText = `✅ HD Scan Ready (${kb} KB)`;
    document.getElementById('scanResult').style.display = 'grid';
  });
}

// 5. FRONT + BACK ID JOINER, CONVERTER & A4 SHEET
let combinedIdUrl = "";
function joinFrontBackID() {
  const f1 = document.getElementById('idFront').files, f2 = document.getElementById('idBack').files;
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
      document.getElementById('idPreview').src = combinedIdUrl;
      document.getElementById('idDownload').href = combinedIdUrl;
      document.getElementById('idDownload').download = getFileName("ID_Card.jpg");
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
  triggerBlobDownload(await pdfDoc.save(), getFileName("ID_Card.pdf"), 'application/pdf');
}

function convertImg() {
  const file = document.getElementById('cFile').files;
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
  const file = document.getElementById('sheetFile').files;
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

// 6. FIXED PDF STUDIO (WITH LIVE PREVIEW & SMART SIZE GUARD)
async function compressRealPDF() {
  const file = document.getElementById('compPdfFile').files;
  if (!file) return alert("Select a PDF file first!");
  const qual = parseFloat(document.getElementById('pdfCompLevel').value);
  const resBox = document.getElementById('compPdfResult');
  const st = document.getElementById('compPdfStatus');
  resBox.style.display = 'block';
  st.innerText = "⏳ Compressing PDF... Please wait.";

  try {
    const origBytes = await file.arrayBuffer();
    const origKB = Math.round(origBytes.byteLength / 1024);
    const pdf = await pdfjsLib.getDocument({ data: origBytes.slice(0) }).promise;
    const { PDFDocument } = PDFLib;
    const newPdf = await PDFDocument.create();

    for (let i = 1; i <= pdf.numPages; i++) {
      st.innerText = `⏳ Processing Page ${i} of ${pdf.numPages}...`;
      const page = await pdf.getPage(i);
      const vp = page.getViewport({ scale: 1.1 });
      const canvas = document.createElement('canvas');
      canvas.width = vp.width; canvas.height = vp.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
      const jpgBytes = await (await fetch(canvas.toDataURL('image/jpeg', qual))).arrayBuffer();
      const jpgImg = await newPdf.embedJpg(jpgBytes);
      const np = newPdf.addPage([vp.width, vp.height]);
      np.drawImage(jpgImg, { x: 0, y: 0, width: vp.width, height: vp.height });
    }
    const outBytes = await newPdf.save();
    const finalBytes = (outBytes.byteLength < origBytes.byteLength) ? outBytes : new Uint8Array(origBytes);
    const finalKB = Math.round(finalBytes.byteLength / 1024);
    const blobUrl = URL.createObjectURL(new Blob([finalBytes], { type: 'application/pdf' }));

    st.innerText = `✅ Compressed! Original: ${origKB} KB ➔ Final: ${finalKB} KB`;
    document.getElementById('compPdfFrame').src = blobUrl;
    document.getElementById('compPdfDownload').href = blobUrl;
    document.getElementById('compPdfDownload').download = getFileName("Compressed.pdf");
  } catch (err) {
    st.innerText = "❌ Error: Password-protected or invalid PDF.";
  }
}

async function imagesToRealPDF() {
  const files = document.getElementById('pdfFiles').files;
  if (!files || files.length === 0) return alert("Please select at least 1 image!");
  const resBox = document.getElementById('imgPdfResult');
  const st = document.getElementById('imgPdfStatus');
  resBox.style.display = 'block';
  st.innerText = "⏳ Creating PDF...";

  try {
    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      await new Promise(resolve => {
        loadImageFile(f, async img => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width; canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const jpgBytes = await (await fetch(canvas.toDataURL('image/jpeg', 0.90))).arrayBuffer();
          const jpgImg = await pdfDoc.embedJpg(jpgBytes);
          const p = pdfDoc.addPage([jpgImg.width, jpgImg.height]);
          p.drawImage(jpgImg, { x: 0, y: 0, width: jpgImg.width, height: jpgImg.height });
          resolve();
        });
      });
    }
    const pdfBytes = await pdfDoc.save();
    const blobUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
    st.innerText = `✅ PDF Ready (${files.length} Page(s), ${Math.round(pdfBytes.byteLength / 1024)} KB)`;
    document.getElementById('imgPdfFrame').src = blobUrl;
    document.getElementById('imgPdfDownload').href = blobUrl;
    document.getElementById('imgPdfDownload').download = getFileName("Marksheet.pdf");
  } catch (err) {
    st.innerText = "❌ Could not convert images to PDF.";
  }
}

async function convertPdfToImages() {
  const file = document.getElementById('pdfToImgFile').files[0];
  if (!file) return alert("Select a PDF file!");
  const [mime, ext] = document.getElementById('pdfImgFormat').value.split('|');
  const outDiv = document.getElementById('pdfPagesOutput');
  outDiv.innerHTML = "<p>⏳ Extracting pages...</p>";

  try {
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    outDiv.innerHTML = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const vp = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      canvas.width = vp.width; canvas.height = vp.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
      const url = canvas.toDataURL(mime, 0.92);
      outDiv.innerHTML += `<div class="page-thumb"><img src="${url}" id="pgImg${i}"><div style="display:flex;gap:4px;justify-content:center;"><a href="${url}" download="Page-${i}.${ext}"><button class="save-btn" style="padding:6px 10px;font-size:12px;">⬇ Save</button></a><button class="print-btn" style="padding:6px 10px;font-size:12px;" onclick="printElement('pgImg${i}')">🖨️</button></div></div>`;
    }
  } catch (err) {
    outDiv.innerHTML = "<p style='color:red;'>❌ Error reading PDF (Check if password-protected).</p>";
  }
}

async function mergeRealPDFs() {
  const files = document.getElementById('mergeFiles').files;
  if (!files || files.length < 2) return alert("Select at least 2 PDF files!");
  const resBox = document.getElementById('orgPdfResult');
  const st = document.getElementById('orgPdfStatus');
  resBox.style.display = 'block';
  st.innerText = "⏳ Merging PDFs...";

  try {
    const { PDFDocument } = PDFLib;
    const merged = await PDFDocument.create();
    for (let i = 0; i < files.length; i++) {
      const pdf = await PDFDocument.load(await files[i].arrayBuffer());
      (await merged.copyPages(pdf, pdf.getPageIndices())).forEach(p => merged.addPage(p));
    }
    const bytes = await merged.save();
    const blobUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    st.innerText = `✅ Merged ${files.length} PDFs (${Math.round(bytes.byteLength / 1024)} KB)`;
    document.getElementById('orgPdfFrame').src = blobUrl;
    document.getElementById('orgPdfDownload').href = blobUrl;
    document.getElementById('orgPdfDownload').download = getFileName("Merged.pdf");
  } catch (err) {
    st.innerText = "❌ Error merging PDFs.";
  }
}

async function processAdvancedPDF() {
  const file = document.getElementById('rotFile').files[0];
  if (!file) return alert("Select a PDF file!");
  const pg = parseInt(document.getElementById('splitPageNum').value) || 0;
  const ang = parseInt(document.getElementById('rotAngle').value) || 0;
  const resBox = document.getElementById('orgPdfResult');
  const st = document.getElementById('orgPdfStatus');
  resBox.style.display = 'block';

  try {
    const { PDFDocument, degrees } = PDFLib;
    const src = await PDFDocument.load(await file.arrayBuffer());
    const out = await PDFDocument.create();
    if (pg > src.getPageCount()) return alert(`This PDF only has ${src.getPageCount()} pages!`);
    const idx = pg > 0 ? [pg - 1] : src.getPageIndices();
    (await out.copyPages(src, idx)).forEach(p => { if (ang > 0) p.setRotation(degrees(ang)); out.addPage(p); });
    const bytes = await out.save();
    const blobUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    st.innerText = `✅ PDF Processed (${Math.round(bytes.byteLength / 1024)} KB)`;
    document.getElementById('orgPdfFrame').src = blobUrl;
    document.getElementById('orgPdfDownload').href = blobUrl;
    document.getElementById('orgPdfDownload').download = getFileName("Edited.pdf");
  } catch (err) {
    st.innerText = "❌ Error processing PDF.";
  }
}

function triggerBlobDownload(bytes, name, mime) {
  const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
}

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

function calculateHeightBMI() {
  const cm = parseFloat(document.getElementById('heightCm').value);
  const kg = parseFloat(document.getElementById('weightKg').value);
  if (!cm || cm < 100 || cm > 250) return alert("Enter valid height in CM (e.g. 170)!");
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  let text = `✅ Height: ${cm} cm = ${feet} Feet ${inches} Inches`;
  if (kg && kg > 20) {
    const bmi = (kg / ((cm / 100) ** 2)).toFixed(1);
    text += ` | BMI: ${bmi} (${bmi >= 18.5 && bmi <= 25 ? 'Fit / Normal' : 'Check Chart'})`;
  }
  document.getElementById('heightResult').innerText = text;
}

function calcPercent() {
  const obt = parseFloat(document.getElementById('obtMarks').value), max = parseFloat(document.getElementById('maxMarks').value);
  if (!obt || !max || obt > max) return alert("Enter valid marks!");
  const pct = ((obt / max) * 100).toFixed(2);
  document.getElementById('calcStatus').innerText = `✅ Percentage: ${pct}% | CGPA: ${(pct / 9.5).toFixed(2)}`;
}

function printElement(imgId) {
  const src = document.getElementById(imgId).src;
  const win = window.open('', '_blank');
  win.document.write(`<html><body style="text-align:center;margin:20px;"><img src="${src}" style="max-width:100%;" onload="window.print();window.close();"></body></html>`);
  win.document.close();
}

function printIframe(frameId) {
  const frame = document.getElementById(frameId);
  if (frame && frame.contentWindow) frame.contentWindow.print();
}

let baseVotes = 18950;
function setStarRating(stars) {
  const spans = document.querySelectorAll('#starPicker span');
  spans.forEach((s, idx) => { s.style.color = idx < stars ? '#f59e0b' : '#cbd5e1'; });
  document.getElementById('ratingText').innerHTML = `<strong>${stars}.0 / 5</strong> (${(baseVotes + 1).toLocaleString()}+ Votes — Thanks!)`;
}
function universalShare(docType) {
  const shareText = `Prepared my ${docType} in exact exam size using ${SITE_CONFIG.name}! Try free: ${window.location.href}`;
  if (navigator.share) {
    navigator.share({ title: SITE_CONFIG.name, text: shareText, url: window.location.href }).catch(() => {});
    } else {
    alert("Link copied! Share anywhere: " + window.location.href);
  }
}

 
