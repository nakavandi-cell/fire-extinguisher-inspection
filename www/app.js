const checklistConfig = [
  { section: "بخش اول: دسترسی، محل نصب و وضعیت ظاهری", id: 1, text: "۱. آیا کپسول در محل مصوب و مشخص‌شده روی نقشه ایمنی نصب شده است؟" },
  { section: "بخش اول: دسترسی، محل نصب و وضعیت ظاهری", id: 2, text: "۲. آیا مسیر دسترسی به کپسول کاملاً باز، بدون مانع و دارای علامت راهنما می‌باشد؟" },
  { section: "بخش اول: دسترسی، محل نصب و وضعیت ظاهری", id: 3, text: "۳. آیا پایه نگهدارنده محکم بوده و کپسول در ارتفاع استاندارد نصب شده است؟" },
  { section: "بخش اول: دسترسی، محل نصب و وضعیت ظاهری", id: 4, text: "۴. آیا بدنه کپسول فاقد فرورفتگی، زنگ‌زدگی، خوردگی یا آسیب فیزیکی است؟" },
  { section: "بخش دوم: اجزاء، فشار و سیستم تخلیه", id: 5, text: "۵. آیا عقربه مانومتر/گیج فشار در محدوده سبز (فشار مناسب) قرار دارد؟" },
  { section: "بخش دوم: اجزاء، فشار و سیستم تخلیه", id: 6, text: "۶. آیا پین ضامن ایمنی و پلمپ پلاستیکی سالم و در جای خود قرار دارد؟" },
  { section: "بخش دوم: اجزاء، فشار و سیستم تخلیه", id: 7, text: "۷. آیا شلنگ، نازل و شیپورک تخلیه سالم و بدون انسداد است؟" },
  { section: "بخش دوم: اجزاء، فشار و سیستم تخلیه", id: 8, text: "۸. آیا وزن کپسول در محدوده استاندارد قرار دارد؟ (مخصوص CO2)" },
  { section: "بخش سوم: کارت بازرسی و اعتبارسنجی", id: 9, text: "۹. آیا کارت بازرسی دوره‌ای روی کپسول نصب شده و تاریخ درج شده است؟" },
  { section: "بخش سوم: کارت بازرسی و اعتبارسنجی", id: 10, text: "۱۰. آیا زمان شارژ سالانه یا آزمون هیدروستاتیک کپسول منقضی نشده است؟" }
];

const STORAGE_KEY = "hse_fire_inspection_records";
function getRecords() { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
function saveRecords(records) { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }

function renderChecklist() {
  let curSec = "", html = "";
  checklistConfig.forEach(i => {
    if (i.section !== curSec) { curSec = i.section; html += `<div class="section-badge">${curSec}</div>`; }
    html += `
      <div class="checklist-item">
        <div class="item-text">${i.text}</div>
        <div class="toggle-group">
          <label class="toggle-label yes"><input type="radio" name="item_${i.id}" value="منطبق" required> منطبق</label>
          <label class="toggle-label no"><input type="radio" name="item_${i.id}" value="عدم انطباق"> عدم انطباق</label>
          <label class="toggle-label na"><input type="radio" name="item_${i.id}" value="عدم کاربرد"> عدم کاربرد</label>
        </div>
        <input type="text" id="rem_${i.id}" placeholder="شرح نقص یا اقدام اصلاحی...">
      </div>`;
  });
  document.getElementById("checklistItemsContainer").innerHTML = html;
}

function saveInspection(e) {
  e.preventDefault();
  const items = checklistConfig.map(i => ({
    question: i.text,
    status: document.querySelector(`input[name="item_${i.id}"]:checked`).value,
    remarks: document.getElementById(`rem_${i.id}`).value || "—"
  }));

  const record = {
    id: "INSP-" + new Date().getTime().toString().slice(-6),
    inspDate: document.getElementById("inspDate").value,
    inspTime: document.getElementById("inspTime").value,
    inspectorName: document.getElementById("inspectorName").value,
    equipmentTag: document.getElementById("equipmentTag").value,
    location: document.getElementById("location").value,
    extinguisherType: document.getElementById("extinguisherType").value,
    capacity: document.getElementById("capacity").value,
    periodicity: document.getElementById("periodicity").value,
    overallStatus: document.querySelector('input[name="overallStatus"]:checked').value,
    overallRemarks: document.getElementById("overallRemarks").value || "—",
    items
  };

  const records = getRecords();
  records.unshift(record);
  saveRecords(records);
  alert("✅ بازرسی با موفقیت ثبت شد.");
  document.getElementById("inspectionForm").reset();
  switchTab('history');
}

function switchTab(t) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  if (t === 'new-inspection') {
    document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
    document.getElementById('new-inspection-tab').classList.add('active');
  } else {
    document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
    document.getElementById('history-tab').classList.add('active');
    renderRecords();
    drawCharts();
  }
}

function renderRecords(filter = "") {
  const records = getRecords();
  document.getElementById("totalInspectionsCount").innerText = records.length;
  let nc = 0;
  records.forEach(r => r.items.forEach(it => { if(it.status.includes("عدم انطباق")) nc++; }));
  document.getElementById("totalNonConformCount").innerText = nc;

  const filtered = records.filter(r => (r.equipmentTag + r.inspectorName + r.location).includes(filter));
  const container = document.getElementById("recordsList");
  if (!filtered.length) { container.innerHTML = "<p style='text-align:center;padding:15px;color:#94a3b8;'>رکوردی یافت نشد.</p>"; return; }

  container.innerHTML = filtered.map(r => `
    <div class="record-card">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-weight:bold;">
        <span>${r.equipmentTag} (${r.extinguisherType})</span>
        <span>${r.inspDate}</span>
      </div>
      <div>موقعیت: ${r.location} | بازرس: ${r.inspectorName}</div>
      <div style="margin-top:4px;">وضعیت کلی: <b>${r.overallStatus}</b></div>
    </div>
  `).join("");
}

function filterRecords() { renderRecords(document.getElementById("searchInput").value); }
function clearAllData() { if(confirm("آیا همه داده‌های ذخیره‌شده پاک شوند؟")) { localStorage.removeItem(STORAGE_KEY); renderRecords(); drawCharts(); } }

// تابع رسم نمودارها با استفاده از Canvas داخلی بدون نیاز به اینترنت
function drawCharts() {
  const records = getRecords();
  
  // ۱. محاسبه آمار کل آیتم‌ها
  let compliant = 0, nonCompliant = 0, na = 0;
  // تفکیک ماهانه/دوره‌ای
  let monthlyData = {};

  records.forEach(r => {
    // کلید ماه (مثلاً از روی تاریخ ثبت: سه بخش اول یا پیش‌فرض)
    let periodKey = r.inspDate.trim().slice(0, 7) || "نامشخص";
    if (!monthlyData[periodKey]) {
      monthlyData[periodKey] = { inspections: 0, comp: 0, nonComp: 0 };
    }
    monthlyData[periodKey].inspections += 1;

    r.items.forEach(it => {
      if (it.status === "منطبق") { compliant++; monthlyData[periodKey].comp++; }
      else if (it.status === "عدم انطباق") { nonCompliant++; monthlyData[periodKey].nonComp++; }
      else { na++; }
    });
  });

  drawDonutChart(compliant, nonCompliant, na);
  drawBarChart(monthlyData);
}

// رسم نمودار دایره‌ای
function drawDonutChart(comp, nonComp, na) {
  const canvas = document.getElementById("donutChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const total = comp + nonComp + na;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 80;

  if (total === 0) {
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 24;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px Vazirmatn, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("داده‌ای ثبت نشده", centerX, centerY + 5);
    return;
  }

  const data = [
    { value: comp, color: "#22c55e" },
    { value: nonComp, color: "#ef4444" },
    { value: na, color: "#94a3b8" }
  ];

  let currentAngle = -0.5 * Math.PI;
  ctx.lineWidth = 26;

  data.forEach(slice => {
    if (slice.value === 0) return;
    const sliceAngle = (slice.value / total) * 2 * Math.PI;
    ctx.strokeStyle = slice.color;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.stroke();
    currentAngle += sliceAngle;
  });

  // درصد انطباق در مرکز
  const complianceRate = Math.round((comp / (comp + nonComp || 1)) * 100);
  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 20px Vazirmatn, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(complianceRate + "%", centerX, centerY + 2);
  ctx.font = "11px Vazirmatn, sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("نرخ انطباق", centerX, centerY + 20);
}

// رسم نمودار میله‌ای مقایسه‌ای
function drawBarChart(monthlyData) {
  const canvas = document.getElementById("barChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const keys = Object.keys(monthlyData).slice(-4); // نمایش نهایتاً ۴ دوره اخیر
  if (keys.length === 0) {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px Vazirmatn, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("داده‌ای جهت نمایش نمودار ماهانه وجود ندارد", canvas.width / 2, canvas.height / 2);
    return;
  }

  let maxVal = 1;
  keys.forEach(k => {
    const d = monthlyData[k];
    maxVal = Math.max(maxVal, d.inspections, d.comp, d.nonComp);
  });

  const chartBottom = canvas.height - 30;
  const chartHeight = canvas.height - 60;
  const groupWidth = canvas.width / keys.length;
  const barWidth = 14;

  keys.forEach((key, i) => {
    const d = monthlyData[key];
    const groupCenter = (i * groupWidth) + (groupWidth / 2);

    const hTotal = (d.inspections / maxVal) * chartHeight;
    const hComp = (d.comp / maxVal) * chartHeight;
    const hNonComp = (d.nonComp / maxVal) * chartHeight;

    // میله ۱: کل بازرسی (آبی)
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(groupCenter - barWidth * 1.6, chartBottom - hTotal, barWidth, hTotal);

    // میله ۲: منطبق (سبز)
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(groupCenter - barWidth * 0.5, chartBottom - hComp, barWidth, hComp);

    // میله ۳: عدم انطباق (قرمز)
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(groupCenter + barWidth * 0.6, chartBottom - hNonComp, barWidth, hNonComp);

    // برچسب پایین (نام دوره/ماه)
    ctx.fillStyle = "#475569";
    ctx.font = "11px Vazirmatn, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(key, groupCenter, canvas.height - 10);
  });
}

function exportToExcel() {
  const records = getRecords();
  if (!records.length) { alert("هیچ رکوردی جهت خروجی وجود ندارد."); return; }

  let csvData = "\uFEFFشناسه ثبت,تاریخ,زمان,نام بازرس,کد تجهیز,محل استقرار,نوع کپسول,ظرفیت,دوره بازرسی,عنوان آیتم چک لیست,وضعیت انطباق,توضیحات نقص و اقدام اصلاحی,نتیجه کلی\n";

  records.forEach(r => {
    r.items.forEach(it => {
      csvData += `"${r.id}","${r.inspDate}","${r.inspTime}","${r.inspectorName}","${r.equipmentTag}","${r.location}","${r.extinguisherType}","${r.capacity}","${r.periodicity}","${it.question.replace(/"/g, '""')}","${it.status}","${it.remarks.replace(/"/g, '""')}","${r.overallStatus}"\n`;
    });
  });

  showExportModal(csvData);
}

function showExportModal(text) {
  const existing = document.getElementById('exportModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'exportModal';
  modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:9999;display:flex;flex-direction:column;padding:20px;box-sizing:border-box;";
  
  modal.innerHTML = `
    <h3 style="color:white;text-align:center;margin-top:10px;font-size:16px;">گزارش متنی جهت انتقال به اکسل</h3>
    <p style="color:#cbd5e1;font-size:12px;text-align:center;">متن زیر را کپی کرده و در Saved Messages تلگرام یا یادداشت بفرستید:</p>
    <textarea id="csvOutput" style="flex:1;width:100%;border-radius:8px;padding:10px;font-size:12px;direction:ltr;" readonly>${text}</textarea>
    <div style="display:flex;gap:10px;margin-top:15px;">
      <button onclick="copyToClipboard()" style="flex:1;padding:14px;background:#22c55e;color:white;border:none;border-radius:8px;font-weight:bold;font-size:14px;">📋 کپی متن گزارش</button>
      <button onclick="this.parentElement.parentElement.remove()" style="flex:1;padding:14px;background:#ef4444;color:white;border:none;border-radius:8px;font-size:14px;">بستن</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function copyToClipboard() {
  const textArea = document.getElementById("csvOutput");
  textArea.select();
  document.execCommand('copy');
  alert("✅ متن گزارش کپی شد! می‌توانید آن را در تلگرام، واتساپ یا نوت گوشی Paste کنید.");
}

window.onload = () => {
  renderChecklist();
  const d = new Date();
  document.getElementById("inspTime").value = String(d.getHours()).padStart(2, '0') + ":" + String(d.getMinutes()).padStart(2, '0');
};
