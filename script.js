// =========================
//  استبيان السكري - مستشفى بدية
// =========================

// إعدادات عامة
const startBtn = document.getElementById("startBtn");
const survey = document.getElementById("survey");
const steps = document.querySelectorAll(".step");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const submitBtn = document.getElementById("submitBtn");
const restartBtn = document.getElementById("restartBtn");
const finalResult = document.getElementById("finalResult");

// ✅ رابط Google Apps Script Web App (رابطك)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxKvNwCstOrITjxISnPWIFSaZmNnb2giROtmv7ESr5Y1cXsOCvmmC2z7OG1cRNJqIKGwQ/exec";

// حفظ البيانات
let userData = {};
let currentStep = 1;

// بدء الاستبيان
startBtn.addEventListener("click", () => {
  document.getElementById("intro").hidden = true;
  survey.hidden = false;
  showStep(1);
});

// عرض خطوة
function showStep(step) {
  steps.forEach(s => s.hidden = true);
  const el = document.querySelector(`.step[data-step="${step}"]`);
  if (el) el.hidden = false;

  prevBtn.hidden = step === 1;
  nextBtn.hidden = step === steps.length;

  // ⭐ عندما يصل لخطوة النتيجة نعرض النتيجة
  if (step === 8) showFinalResult();
}

// تنقل
nextBtn.addEventListener("click", () => {
  saveCurrentStepData();
  currentStep++;
  showStep(currentStep);
});

prevBtn.addEventListener("click", () => {
  currentStep--;
  if (currentStep < 1) currentStep = 1;
  showStep(currentStep);
});

// أزرار الاختيار
document.querySelectorAll(".btn.option").forEach(btn => {
  btn.addEventListener("click", e => {
    const step = e.target.closest(".step");
    const stepNum = step.dataset.step;
    userData[`step${stepNum}`] = e.target.dataset.value;
    currentStep++;
    showStep(currentStep);
  });
});

// حفظ المدخلات
function saveCurrentStepData() {
  const step = document.querySelector(`.step[data-step="${currentStep}"]`);
  if (!step) return;

  step.querySelectorAll("input, select").forEach(el => {
    if (el.id) userData[el.id] = el.value;
  });
}

// =========================
// BMI
// =========================
const heightInput = document.getElementById("height");
const weightInput = document.getElementById("weight");
const bmiValue = document.getElementById("bmiValue");
const bmiCategory = document.getElementById("bmiCategory");

function calculateBMI() {
  const h = parseFloat(heightInput.value);
  const w = parseFloat(weightInput.value);

  if (h && w) {
    const bmi = (w / ((h / 100) ** 2)).toFixed(1);
    bmiValue.textContent = bmi;

    let category = "";
    if (bmi < 18.5) category = "نحافة";
    else if (bmi < 25) category = "طبيعي";
    else if (bmi < 30) category = "زيادة وزن";
    else category = "سمنة";

    bmiCategory.textContent = category;
    userData.BMI = bmi;
    userData.BMI_Category = category;
  }
}

heightInput?.addEventListener("input", calculateBMI);
weightInput?.addEventListener("input", calculateBMI);

// =========================
// عرض النتيجة
// =========================
function showFinalResult() {
  let score = 0;

  if (userData.step2 === "yes") score += 2;
  if (userData.step3 === "yes") score += 2;
  if (userData.BMI && parseFloat(userData.BMI) > 30) score += 3;
  if (userData.step5 === "rarely") score += 2;
  if (userData.step7 === "0") score += 2;

  let level = "منخفض";
  if (score >= 3 && score < 6) level = "متوسط";
  if (score >= 6) level = "مرتفع";

  finalResult.innerHTML = `
    <p><strong>مستوى الخطورة:</strong> ${level}</p>
    <p>النقاط: ${score}</p>
  `;

  userData.Risk_Score = score;
  userData.Risk_Level = level;

  if (level === "متوسط" || level === "مرتفع") {
    setTimeout(() => {
      Swal.fire({
        title: "تنبيه مهم",
        html: `
          <p style="font-size:18px; line-height:1.7;">
            مشاركتك دليل وعيك واهتمامك... ولأن صحتك تستحق الأفضل تواصل مع عيادة التثقيف الصحي:<br>
            <a href="https://wa.me/96825584055"
               target="_blank"
               style="color:#0a7aff; font-size:22px; font-weight:bold;">
              25584055
            </a>
          </p>
        `,
        icon: "warning",
        confirmButtonText: "متابعة"
      });
    }, 300);
  }
}

// =========================
// إرسال البيانات
// =========================
submitBtn.addEventListener("click", async () => {
  saveCurrentStepData();

  // تثبيت القيم الأساسية (مهم)
  userData.civilNumber = document.getElementById("civilNumber").value;
  userData.phoneNumber = document.getElementById("phoneNumber").value;

  // ✅ تحقق سريع قبل الإرسال
  const cleanPhone = (userData.phoneNumber || "").toString().replace(/\s+/g, "").trim();
  if (!cleanPhone) {
    Swal.fire({ icon: "error", title: "لم يتم الحفظ", text: "رقم الهاتف مطلوب" });
    return;
  }
  const omaniRegex = /^(?:968)?\d{8}$/;
  if (!omaniRegex.test(cleanPhone)) {
    Swal.fire({ icon: "error", title: "لم يتم الحفظ", text: "رقم الهاتف غير صحيح (8 أرقام أو يبدأ بـ 968)" });
    return;
  }

  // عرض النتيجة (لو لم تكن ظهرت)
  showFinalResult();

  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData) // ✅ JSON مباشر
    });

    let result = {};
    try { result = await res.json(); } catch (e) {}

    if (!result || result.status !== "success") {
      Swal.fire({
        icon: "error",
        title: "لم يتم الحفظ",
        text: (result && result.message) ? result.message : "تعذر حفظ البيانات"
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "تم الحفظ بنجاح",
      text: result.message || "شكراً لمشاركتك"
    });

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "خطأ اتصال",
      text: "تعذر الاتصال بالخادم"
    });
  }
});

// إعادة التقييم
restartBtn.addEventListener("click", () => {
  userData = {};
  currentStep = 1;
  showStep(1);
});
