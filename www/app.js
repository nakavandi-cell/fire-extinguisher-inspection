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
function clearAllData() { if(confirm("آیا همه داده‌های ذخیره‌شده پاک شوند؟")) { localStorage.removeItem(STORAGE_KEY); renderRecords(); } }

function exportToExcel() {
  const records = getRecords();
  if (!records.length) {
    alert("هیچ رکوردی جهت خروجی وجود ندارد.");
    return;
  }

  // ساخت فرمت استاندارد CSV با هدرهای راست‌به‌چپ و UTF-8 BOM
  let csvContent = "\uFEFF"; // کاراکتر BOM برای نمایش بدون به‌هم‌ریختگی حروف فارسی در اکسل
  csvContent += "شناسه ثبت,تاریخ,زمان,نام بازرس,کد تجهیز,محل استقرار,نوع کپسول,ظرفیت,دوره بازرسی,عنوان آیتم چک لیست,وضعیت انطباق,توضیحات نقص و اقدام اصلاحی,نتیجه کلی\n";

  records.forEach(r => {
    r.items.forEach(it => {
      const row = [
        `"${r.id}"`,
        `"${r.inspDate}"`,
        `"${r.inspTime}"`,
        `"${r.inspectorName}"`,
        `"${r.equipmentTag}"`,
        `"${r.location}"`,
        `"${r.extinguisherType}"`,
        `"${r.capacity}"`,
        `"${r.periodicity}"`,
        `"${it.question.replace(/"/g, '""')}"`,
        `"${it.status}"`,
        `"${it.remarks.replace(/"/g, '""')}"`,
        `"${r.overallStatus}"`
      ];
      csvContent += row.join(",") + "\n";
    });
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const filename = `HSE_Fire_Inspection_${new Date().toISOString().slice(0,10)}.csv`;

  // استفاده از Web Share API برای اشتراک‌گذاری مستقیم در گوشی (واتساپ، تلگرام، ایتا یا ذخیره در فایل‌ها)
  if (navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: "text/csv" })] })) {
    const file = new File([blob], filename, { type: "text/csv" });
    navigator.share({
      files: [file],
      title: 'گزارش اکسل بازرسی کپسول‌ها',
      text: 'گزارش بازرسی کپسول‌های آتشنشانی (اکسل)'
    }).catch(() => {
      downloadFallback(blob, filename);
    });
  } else {
    downloadFallback(blob, filename);
  }
}

function downloadFallback(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

window.onload = () => {
  renderChecklist();
  const d = new Date();
  document.getElementById("inspTime").value = String(d.getHours()).padStart(2, '0') + ":" + String(d.getMinutes()).padStart(2, '0');
};
