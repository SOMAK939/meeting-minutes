const apiBase = "http://localhost:5001/api"; // Your backend base URL

// Helper: Save token in localStorage
function saveToken(token) {
  localStorage.setItem("token", token);
}

// Helper: Get token
function getToken() {
  return localStorage.getItem("token");
}

// Show upload section after login
function showUploadSection() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("uploadSection").style.display = "block";
}

// Show login/register forms if no token
function showAuthForms() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("registerForm").style.display = "block";
  document.getElementById("uploadSection").style.display = "none";
}

// On page load: check if user logged in
if (getToken()) {
  showUploadSection();
} else {
  showAuthForms();
}

// Register function
async function register() {
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  const res = await fetch(`${apiBase}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name,email, password }),
  });

  const data = await res.json();
  document.getElementById("registerMessage").textContent =
    data.message || "Registered successfully!";

  if (res.ok) {
    // Optionally auto login or clear form
  }
}

// Login function
async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch(`${apiBase}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (res.ok && data.token) {
    saveToken(data.token);
    showUploadSection();
    document.getElementById("loginMessage").textContent = "";
  } else {
    document.getElementById("loginMessage").textContent =
      data.message || "Login failed";
  }
}

// Upload audio & start transcription + summarize
async function uploadAudio() {
  const fileInput = document.getElementById("audioInput");
  if (!fileInput.files.length) {
    document.getElementById("uploadMessage").textContent =
      "Please select an audio file";
    return;
  }

  document.getElementById("uploadMessage").textContent = "Uploading...";

  const token = getToken();

  // Create form data
  const formData = new FormData();
  formData.append("audio", fileInput.files[0]);

  // Upload file to backend (protected route)
  const uploadRes = await fetch(`${apiBase}/files/upload`, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!uploadRes.ok) {
    document.getElementById("uploadMessage").textContent = "Upload failed";
    return;
  }

  const { fileUrl } = await uploadRes.json();
  document.getElementById("uploadMessage").textContent =
    "Upload successful. Starting transcription...";

  // Start transcription
  const startRes = await fetch(`${apiBase}/transcribe/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ fileUrl }),
  });

  if (!startRes.ok) {
    document.getElementById("uploadMessage").textContent =
      "Failed to start transcription";
    return;
  }

  const { jobName } = await startRes.json();

  document.getElementById("uploadMessage").textContent =
    "Transcription started, waiting for completion...";

  // Poll for transcription status every 5 seconds
  const interval = setInterval(async () => {
    const statusRes = await fetch(
      `${apiBase}/transcribe/status?jobName=${jobName}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!statusRes.ok) {
      document.getElementById("uploadMessage").textContent =
        "Error checking transcription status";
      clearInterval(interval);
      return;
    }

    const statusData = await statusRes.json();

    if (statusData.status === "COMPLETED") {
      clearInterval(interval);
      document.getElementById("uploadMessage").textContent =
        "Transcription complete. Summarizing...";
      // 🔁 Fetch pre-signed URL using the key
      const key = statusData.transcriptFileUrl.split("/").pop(); // or extract full S3 key if needed

      const signedUrlRes = await fetch(`${apiBase}/s3/signed-url?key=${key}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!signedUrlRes.ok) {
        document.getElementById("uploadMessage").textContent =
          "Failed to get signed URL";
        return;
      }

      const { url: signedUrl } = await signedUrlRes.json();
      // Call summarize endpoint
      const sumRes = await fetch(`${apiBase}/gemini/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: signedUrl }),
      });

      if (!sumRes.ok) {
        document.getElementById("uploadMessage").textContent =
          "Summarization failed";
        return;
      }

      const sumData = await sumRes.json();
      document.getElementById("uploadMessage").textContent = "Summary ready!";
      document.getElementById('summaryOutput').textContent = sumData.summary.replace(/\*\*/g, '');


    } else {
      document.getElementById(
        "uploadMessage"
      ).textContent = `Transcription status: ${statusData.status}...`;
    }
  }, 5000);
}

// Logout function
function logout() {
  localStorage.removeItem("token");
  showAuthForms();
  document.getElementById("summaryOutput").textContent = "";
  document.getElementById("uploadMessage").textContent = "";
}
