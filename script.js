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

// رابط Google SheetDB
const GOOGLE_SCRIPT_URL = "https://sheetdb.io/api/v1/1ut4e13p8dyk6";

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
// عرض النتيجة (كما كتبتها أنت)
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

  // ⭐ نفس التنبيه الذي كتبته – بدون تغيير
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
  userData.civilNumber = document.getElementById("civilNumber").value;

  showFinalResult(); // ⭐ هنا الفرق المهم

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sheet1: userData })
    });
  } catch (err) {
    console.error(err);
  }
});

// إعادة التقييم
restartBtn.addEventListener("click", () => {
  userData = {};
  currentStep = 1;
  showStep(1);
});
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

  userData["Risk_Score"] = score;

  userData["Risk_Level"] = level;

  // ⭐⭐⭐ إضافة تنبيه للمراجعين (متوسط فما فوق) ⭐⭐⭐

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

  // ⭐⭐⭐ نهاية الإضافة ⭐⭐⭐

}
// إرسال البيانات إلى SheetDB
submitBtn.addEventListener("click", async () => {
  saveCurrentStepData();
  // حفظ الرقم المدني إذا كان خارج أي خطوة
  userData["civilNumber"] = document.getElementById("civilNumber").value;

  showFinalResult();

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sheet1: userData }) // وضع البيانات داخل كائن باسم الشيت
    });
    const result = await response.json();
    console.log(result);
    alert("✅ تم إرسال البيانات بنجاح إلى مستند Google Sheets");
  } catch (err) {
    console.error(err);
    alert("⚠️ حدث خطأ أثناء الإرسال، تحقق من الرابط أو الاتصال بالإنترنت");
  }
});

// إعادة التقييم
restartBtn.addEventListener("click", () => {
  userData = {};
  currentStep = 1;
  showStep(1);
});
