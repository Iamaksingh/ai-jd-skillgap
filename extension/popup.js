const BACKEND = "https://ai-jd-skillgap.onrender.com";

const resumeInfo = document.getElementById("resumeInfo");
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const getSelectionBtn = document.getElementById("getSelectionBtn");
const jdTextarea = document.getElementById("jdTextarea");
const analyzeBtn = document.getElementById("analyzeBtn");
const loading = document.getElementById("loading");
const resultEl = document.getElementById("result");

async function loadResume() {
  const { resume } = await chrome.storage.local.get(["resume"]);
  if (resume) {
    resumeInfo.textContent = `${resume.filename} (saved)`;
  }
  if (!resume || !resume.text || resume.text.trim().length < 30) {
  showToast("Your resume could not be parsed. Please upload another PDF.");
  return;
}
}

uploadBtn.onclick = async () => {
  const file = fileInput.files[0];
  if (!file) return showToast("Select a PDF first!");

  const fd = new FormData();
  fd.append("file", file);

  uploadBtn.textContent = "Extracting...";
  uploadBtn.disabled = true;

  try {
    const resp = await fetch(`${BACKEND}/api/v1/extract-resume`, {
      method: "POST",
      body: fd
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.error);

    await chrome.storage.local.set({
      resume: { filename: file.name, text: json.text }
    });

    resumeInfo.textContent = `${file.name} (saved)`;
    showToast("Resume extracted and saved successfully!");
    
  } catch (err) {
    showToast("Upload failed: " + err.message);
  }

  uploadBtn.disabled = false;
  uploadBtn.textContent = "Upload & Save Resume";
};

getSelectionBtn.onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.getSelection().toString()
  });

  jdTextarea.value = result[0].result || "";
};

analyzeBtn.onclick = async () => {
  const jd = jdTextarea.value.trim();
  if (!jd) return showToast("Paste or select a job description");

  const { resume } = await chrome.storage.local.get(["resume"]);
  if (!resume) return showToast("Upload a resume first");

  loading.style.display = "block";
  resultEl.style.display = "none";

  try {
    const resp = await fetch(`${BACKEND}/api/v1/analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText: resume.text, jdText: jd })
    });

    const json = await resp.json();
    loading.style.display = "none";

    if (!resp.ok) throw new Error(json.error);

    resultEl.style.display = "block";
    resultEl.innerHTML = `
      <strong>Fit Score:</strong> ${json.roleFitScore}<br>
      <strong>Missing Keywords:</strong> ${json.missingKeywords.join(", ")}<br><br>
      <strong>Skill Gaps:</strong>
      <ul>${json.skillGaps.map(s => `<li>${s}</li>`).join("")}</ul>
      <strong>Learning Plan:</strong><br>${json.learningPlan}
    `;
    scrollToResult();
  } catch (err) {
    loading.style.display = "none";
    showToast("Analysis failed: " + err.message);
  }
};

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = "toast hidden";
  }, 2500);
}

function scrollToResult() {
  const resultDiv = document.getElementById("result");
  resultDiv.scrollIntoView({ behavior: "smooth", block: "start" });
}

loadResume();
