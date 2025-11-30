/* ========== LOCAL STORAGE HELPERS ========== */
function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getFromStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}

/* ========== SAMPLE JOB DATA ========== */
const jobData = [
    {
        id: 1,
        title: "Frontend Developer",
        company: "Tech Systems",
        location: "Bangalore",
        salary: "₹5,00,000 - ₹7,00,000",
        type: "Full Time",
        description: "We are looking for a passionate frontend developer skilled in HTML, CSS, JS.",
        skills: ["HTML", "CSS", "JavaScript", "React"]
    },
    {
        id: 2,
        title: "Python Backend Intern",
        company: "CodeBase Pvt Ltd",
        location: "Chennai",
        salary: "₹10,000/month",
        type: "Internship",
        description: "Work with backend APIs, Flask, and MySQL.",
        skills: ["Python", "Flask", "API", "MySQL"]
    },
    {
        id: 3,
        title: "UI/UX Designer",
        company: "Creative Labs",
        location: "Coimbatore",
        salary: "₹4,00,000 - ₹6,00,000",
        type: "Full Time",
        description: "Design user-friendly UI layouts and interactions.",
        skills: ["Figma", "UI Design", "Prototyping"]
    }
];

saveToStorage("jobs", jobData);

/* ========== USER AUTH FUNCTIONS ========== */

// Register User
function registerUser() {
    const name = document.getElementById("reg-name").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;

    if (!name || !email || !password) {
        alert("Please fill all fields!");
        return;
    }

    let users = getFromStorage("users") || [];

    if (users.find(u => u.email === email)) {
        alert("Email already registered!");
        return;
    }

    users.push({ name, email, password, savedJobs: [], applications: [] });
    saveToStorage("users", users);

    alert("Registration Successful!");
    window.location.href = "login.html";
}

// Login User
function loginUser() {
    const email = document.getElementById("log-email").value;
    const password = document.getElementById("log-password").value;

    let users = getFromStorage("users") || [];

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        alert("Invalid login credentials!");
        return;
    }

    saveToStorage("loggedInUser", user);
    alert("Login Successful!");
    window.location.href = "index.html";
}

// Logout
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

/* ========== JOB LISTING FUNCTIONS ========== */

function loadJobs() {
    const container = document.getElementById("job-list");
    if (!container) return;

    const jobs = getFromStorage("jobs");

    container.innerHTML = jobs.map(job => `
        <div class="card" onclick="openJob(${job.id})">
            <h3>${job.title}</h3>
            <p><strong>${job.company}</strong></p>
            <div class="card-meta">
                <span>${job.location}</span>
                <span>${job.salary}</span>
            </div>
            <div>
                ${job.skills.map(s => `<span class="badge">${s}</span>`).join("")}
            </div>
        </div>
    `).join("");
}

function openJob(id) {
    saveToStorage("currentJobId", id);
    window.location.href = "job-detail.html";
}

/* ========== JOB DETAIL PAGE ========== */

function loadJobDetail() {
    const container = document.getElementById("job-detail-content");
    if (!container) return;

    const id = getFromStorage("currentJobId");
    const jobs = getFromStorage("jobs");
    const job = jobs.find(j => j.id === id);

    container.innerHTML = `
        <h2>${job.title}</h2>
        <h3>${job.company}</h3>
        <p><strong>Location:</strong> ${job.location}</p>
        <p><strong>Salary:</strong> ${job.salary}</p>
        <p><strong>Type:</strong> ${job.type}</p>
        <h3>Description</h3>
        <p>${job.description}</p>
        <h3>Required Skills</h3>
        <p>${job.skills.join(", ")}</p>

        <button class="btn" onclick="applyJob(${job.id})">Apply Now</button>
        <button class="btn btn-secondary" onclick="saveJob(${job.id})">Save Job</button>
    `;
}

/* ========== SAVE JOB ========== */

function saveJob(jobId) {
    let user = getFromStorage("loggedInUser");
    if (!user) {
        alert("Please login first!");
        return;
    }

    if (!user.savedJobs.includes(jobId)) {
        user.savedJobs.push(jobId);
        saveUpdatedUser(user);
        alert("Job Saved!");
    } else {
        alert("Job already saved!");
    }
}

/* ========== APPLY JOB ========== */

function applyJob(jobId) {
    let user = getFromStorage("loggedInUser");
    if (!user) {
        alert("Please login first!");
        return;
    }

    if (!user.applications.includes(jobId)) {
        user.applications.push(jobId);
        saveUpdatedUser(user);
        alert("Applied Successfully!");
        window.location.href = "apply.html";
    } else {
        alert("Already applied!");
    }
}

/* ========== SAVE UPDATED USER DATA ========== */

function saveUpdatedUser(updatedUser) {
    let users = getFromStorage("users");
    users = users.map(u => u.email === updatedUser.email ? updatedUser : u);

    saveToStorage("users", users);
    saveToStorage("loggedInUser", updatedUser);
}

/* ========== LOAD SAVED JOBS ========== */

function loadSavedJobs() {
    const container = document.getElementById("saved-job-list");
    if (!container) return;

    const user = getFromStorage("loggedInUser");
    const jobs = getFromStorage("jobs");

    const saved = jobs.filter(j => user.savedJobs.includes(j.id));

    container.innerHTML = saved.length
        ? saved.map(job => `
            <div class="card">
                <h3>${job.title}</h3>
                <p>${job.company}</p>
                <button class="btn" onclick="openJob(${job.id})">View</button>
            </div>
          `).join("")
        : "<p>No saved jobs found</p>";
}

/* ========== PROFILE PAGE LOADING ========== */

function loadProfile() {
    const user = getFromStorage("loggedInUser");
    if (!user) return;

    document.getElementById("profile-name").value = user.name;
    document.getElementById("profile-email").value = user.email;
}

/* ========== UPDATE PROFILE ========== */

function updateProfile() {
    let user = getFromStorage("loggedInUser");

    user.name = document.getElementById("profile-name").value;

    saveUpdatedUser(user);
    alert("Profile updated!");
}

/* =========== removeSavedJob ================ */
function removeSavedJob(jobId) {
    try {
        let user = getFromStorage("loggedInUser");

        if (!user) {
            alert("Please login first!");
            return;
        }

        if (!Array.isArray(user.savedJobs)) {
            user.savedJobs = [];
        }

        user.savedJobs = user.savedJobs.filter(id => id !== jobId);

        saveUpdatedUser(user);

        alert("Job removed successfully!");

        loadSavedJobs(); // Refresh list
    } catch (error) {
        alert("Something went wrong while removing saved job.");
        console.error("Remove Saved Job Error:", error);
    }
}
