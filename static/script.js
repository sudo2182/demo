/**
 * Admin Dashboard — Frontend JavaScript
 * Handles API communication, navigation, and UI interactions.
 */

const API_BASE = "http://localhost:8000";

// ── Navigation ──────────────────────────────────────────────────

document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        switchSection(section);
    });
});

function switchSection(section) {
    document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
    document.querySelectorAll(".content-section").forEach((s) => s.classList.remove("active"));

    const navEl = document.querySelector(`[data-section="${section}"]`);
    const sectionEl = document.getElementById(`section-${section}`);

    if (navEl) navEl.classList.add("active");
    if (sectionEl) sectionEl.classList.add("active");

    const titles = {
        dashboard: "Dashboard",
        users: "User Management",
        payments: "Payments",
        health: "Health Records",
        compliance: "Compliance",
        ai: "AI Tools",
    };
    document.getElementById("page-title").textContent = titles[section] || "Dashboard";

    // Load data on section switch
    switch (section) {
        case "dashboard": loadDashboard(); break;
        case "users": loadUsers(); break;
        case "payments": loadTransactions(); break;
        case "compliance": loadCompliance(); break;
    }
}

// Mobile menu toggle
document.getElementById("menu-toggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
});

// ── API Helper ──────────────────────────────────────────────────

async function api(endpoint, options = {}) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: { "Content-Type": "application/json", ...options.headers },
            ...options,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.detail || `HTTP ${res.status}`);
        return data;
    } catch (err) {
        if (err.message.includes("Failed to fetch")) {
            throw new Error("Cannot connect to API. Is the backend running?");
        }
        throw err;
    }
}

// ── Toast Notifications ─────────────────────────────────────────

function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(40px)";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ── Modals ───────────────────────────────────────────────────────

function openModal(id) {
    document.getElementById(id).classList.add("active");
}

function closeModal(id) {
    document.getElementById(id).classList.remove("active");
}

// Close modal on overlay click
document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.classList.remove("active");
    });
});

// ── Health Check ────────────────────────────────────────────────

async function checkAPIStatus() {
    const badge = document.getElementById("api-status");
    try {
        await api("/health");
        badge.className = "status-badge online";
        badge.innerHTML = '<span class="status-dot"></span><span>API Online</span>';
    } catch {
        badge.className = "status-badge offline";
        badge.innerHTML = '<span class="status-dot"></span><span>API Offline</span>';
    }
}

// ── Dashboard ───────────────────────────────────────────────────

async function loadDashboard() {
    try {
        const analytics = await api("/analytics");
        document.getElementById("stat-total-users").textContent = analytics.total_users;
        document.getElementById("stat-active-users").textContent = analytics.active_users;
        document.getElementById("stat-api-today").textContent = analytics.api_calls_today?.toLocaleString() || "—";
        document.getElementById("stat-tokens-today").textContent = analytics.ai_tokens_used_today?.toLocaleString() || "—";
    } catch {
        document.getElementById("stat-total-users").textContent = "—";
    }

    try {
        const admin = await api("/admin");
        const sysInfo = document.getElementById("system-info");
        sysInfo.innerHTML = `
            <div class="info-row"><span class="label">Admin Contact</span><span class="value">${admin.admin_contact || "—"}</span></div>
            <div class="info-row"><span class="label">API Version</span><span class="value">${admin.api_version || "—"}</span></div>
            <div class="info-row"><span class="label">Model</span><span class="value">${admin.model || "—"}</span></div>
            <div class="info-row"><span class="label">Uptime</span><span class="value">${admin.uptime_hours || "—"}h</span></div>
            <div class="info-row"><span class="label">Active Users</span><span class="value">${admin.active_users || "—"}</span></div>
            <div class="info-row"><span class="label">Pending Invites</span><span class="value">${admin.pending_invites || "—"}</span></div>
        `;
    } catch {
        document.getElementById("system-info").innerHTML = '<p class="text-muted text-center">Failed to load system info</p>';
    }

    try {
        const logs = await api("/admin/logs?lines=5");
        const logsEl = document.getElementById("recent-logs");
        if (logs.logs && logs.logs.length) {
            logsEl.innerHTML = logs.logs.map((l) => `
                <div class="log-entry">
                    <span class="log-time">${l.timestamp.split("T")[1] || l.timestamp}</span>
                    <span class="log-level ${l.level}">${l.level}</span>
                    <span class="log-msg">${l.message}</span>
                </div>
            `).join("");
        } else {
            logsEl.innerHTML = '<p class="text-muted text-center">No logs available</p>';
        }
    } catch {
        document.getElementById("recent-logs").innerHTML = '<p class="text-muted text-center">Failed to load logs</p>';
    }
}

// ── Users ───────────────────────────────────────────────────────

async function loadUsers() {
    try {
        const data = await api("/admin/users");
        const tbody = document.getElementById("users-tbody");
        if (data.users && data.users.length) {
            tbody.innerHTML = data.users.map((u) => `
                <tr>
                    <td>${u.id}</td>
                    <td style="color: var(--text-primary); font-weight: 500;">${u.username}</td>
                    <td>${u.email}</td>
                    <td><span class="badge ${u.role === "admin" ? "badge-purple" : u.role === "editor" ? "badge-blue" : "badge-green"}">${u.role}</span></td>
                    <td><span class="badge ${u.is_active ? "badge-green" : "badge-red"}">${u.is_active ? "Active" : "Inactive"}</span></td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id})">Delete</button>
                    </td>
                </tr>
            `).join("");
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No users found</td></tr>';
        }
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function createUser() {
    const username = document.getElementById("new-username").value.trim();
    const email = document.getElementById("new-email").value.trim();
    const role = document.getElementById("new-role").value;

    if (!username || !email) {
        showToast("Username and email are required", "error");
        return;
    }

    try {
        await api("/admin/users", {
            method: "POST",
            body: JSON.stringify({ username, email, role }),
        });
        showToast(`User "${username}" created successfully`, "success");
        closeModal("create-user-modal");
        document.getElementById("new-username").value = "";
        document.getElementById("new-email").value = "";
        loadUsers();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function deleteUser(userId) {
    try {
        await api(`/admin/users/${userId}`, { method: "DELETE" });
        showToast("User deleted", "success");
        loadUsers();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ── Payments ────────────────────────────────────────────────────

async function processPayment() {
    const name = document.getElementById("pay-name").value.trim();
    const card = document.getElementById("pay-card").value.replace(/\s/g, "");
    const expiry = document.getElementById("pay-expiry").value.trim();
    const cvv = document.getElementById("pay-cvv").value.trim();
    const amount = parseFloat(document.getElementById("pay-amount").value);

    if (!card || !expiry || !cvv || !amount) {
        showToast("All payment fields are required", "error");
        return;
    }

    try {
        const result = await api("/payments/charge", {
            method: "POST",
            body: JSON.stringify({
                cardholder_name: name,
                card_number: card,
                expiry,
                cvv,
                amount,
                currency: "USD",
            }),
        });
        showToast(`Payment $${amount} — ${result.status}`, "success");
        closeModal("payment-modal");
        // Clear fields
        ["pay-name", "pay-card", "pay-expiry", "pay-cvv", "pay-amount"].forEach(
            (id) => (document.getElementById(id).value = "")
        );
        loadTransactions();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function loadTransactions() {
    try {
        const data = await api("/payments/transactions");
        const tbody = document.getElementById("payments-tbody");
        if (data.transactions && data.transactions.length) {
            tbody.innerHTML = data.transactions.map((t) => `
                <tr>
                    <td style="font-family: monospace; font-size: 12px;">${t.transaction_id}</td>
                    <td style="color: var(--accent-green); font-weight: 600;">$${t.amount?.toFixed(2)}</td>
                    <td>•••• ${t.card_last_four || "—"}</td>
                    <td>${t.cardholder_name || "—"}</td>
                    <td><span class="badge badge-green">${t.status}</span></td>
                    <td style="font-size: 12px; color: var(--text-muted);">${t.processed_at?.split("T")[0] || "—"}</td>
                </tr>
            `).join("");
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No transactions yet</td></tr>';
        }
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ── Health Records ──────────────────────────────────────────────

async function addPatient() {
    const data = {
        patient_id: document.getElementById("pat-id").value.trim(),
        first_name: document.getElementById("pat-fname").value.trim(),
        last_name: document.getElementById("pat-lname").value.trim(),
        ssn: document.getElementById("pat-ssn").value.trim(),
        date_of_birth: document.getElementById("pat-dob").value,
        diagnosis_codes: document.getElementById("pat-diagnosis").value.split(",").map((s) => s.trim()).filter(Boolean),
        medications: document.getElementById("pat-meds").value.split(",").map((s) => s.trim()).filter(Boolean),
        physician_notes: document.getElementById("pat-notes").value.trim(),
    };

    if (!data.patient_id || !data.first_name) {
        showToast("Patient ID and first name are required", "error");
        return;
    }

    try {
        await api("/health/patients", {
            method: "POST",
            body: JSON.stringify(data),
        });
        showToast(`Patient ${data.first_name} ${data.last_name} added`, "success");
        closeModal("patient-modal");
        // Clear fields
        ["pat-id", "pat-fname", "pat-lname", "pat-ssn", "pat-dob", "pat-diagnosis", "pat-meds", "pat-notes"].forEach(
            (id) => (document.getElementById(id).value = "")
        );
        loadPatientRecord(data.patient_id);
        loadHealthAuditLog();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function loadPatientRecord(patientId) {
    try {
        const record = await api(`/health/patients/${patientId}`);
        const container = document.getElementById("health-records");

        if (record.error) {
            container.innerHTML = `<p class="text-muted text-center">${record.error}</p>`;
            return;
        }

        container.innerHTML = `
            <div class="patient-card">
                <div class="patient-card-header">
                    <span class="patient-name">${record.first_name || "—"} ${record.last_name || "—"}</span>
                    <span class="badge badge-blue">${record.patient_id}</span>
                </div>
                <div class="info-row"><span class="label">DOB</span><span class="value">${record.date_of_birth || "—"}</span></div>
                <div class="info-row"><span class="label">SSN (encrypted)</span><span class="value">${record.ssn || "—"}</span></div>
                <div class="info-row"><span class="label">SSN (decrypted)</span><span class="value">${record.ssn_decrypted || "—"}</span></div>
                <div class="info-row"><span class="label">Diagnoses</span><span class="value">${(record.diagnosis_codes || []).join(", ") || "—"}</span></div>
                <div class="info-row"><span class="label">Medications</span><span class="value">${(record.medications || []).join(", ") || "—"}</span></div>
                <div class="info-row"><span class="label">Physician Notes</span><span class="value">${record.physician_notes || "—"}</span></div>
                <div class="info-row"><span class="label">Encryption Status</span><span class="value text-green">✓ Encrypted at rest</span></div>
            </div>
        `;
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function searchPatients() {
    const query = document.getElementById("patient-search").value.trim();
    if (!query) return;

    try {
        const results = await api(`/health/patients/search?query=${encodeURIComponent(query)}`);
        const container = document.getElementById("health-records");

        if (results.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">No patients found</p>';
            return;
        }

        container.innerHTML = results.map((r) => `
            <div class="patient-card">
                <div class="patient-card-header">
                    <span class="patient-name">${r.first_name || "—"} ${r.last_name || "—"}</span>
                    <span class="badge badge-blue">${r.patient_id}</span>
                </div>
                <div class="info-row"><span class="label">Diagnoses</span><span class="value">${(r.diagnosis_codes || []).join(", ") || "—"}</span></div>
                <div class="info-row"><span class="label">Medications</span><span class="value">${(r.medications || []).join(", ") || "—"}</span></div>
            </div>
        `).join("");
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function loadHealthAuditLog() {
    try {
        const data = await api("/health/audit-log");
        const container = document.getElementById("hipaa-audit-log");

        if (data.log && data.log.length) {
            container.innerHTML = data.log.map((entry) => `
                <div class="log-entry">
                    <span class="log-time">${entry.timestamp?.split("T")[1]?.slice(0, 8) || "—"}</span>
                    <span class="log-level INFO">${entry.action?.toUpperCase()}</span>
                    <span class="log-msg">Patient: ${entry.patient_id}${entry.patient_name ? " — " + entry.patient_name : ""}${entry.ssn ? " — SSN: " + entry.ssn : ""}</span>
                </div>
            `).join("");
        } else {
            container.innerHTML = '<p class="text-muted text-center">No audit entries yet</p>';
        }
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ── Compliance ──────────────────────────────────────────────────

async function loadCompliance() {
    try {
        const status = await api("/compliance/status");
        const grid = document.getElementById("compliance-cards");

        grid.innerHTML = `
            <div class="compliance-card">
                <div class="compliance-card-header">
                    <span class="compliance-card-title">🇪🇺 GDPR</span>
                    <span class="badge ${status.gdpr?.compliant ? "badge-green" : "badge-red"}">${status.gdpr?.compliant ? "Compliant" : "Non-Compliant"}</span>
                </div>
                <div class="compliance-detail">
                    <span class="compliance-detail-label">Consents Recorded</span>
                    <span class="compliance-detail-value">${status.gdpr?.consents_recorded ?? "—"}</span>
                </div>
                <div class="compliance-detail">
                    <span class="compliance-detail-label">Deletion Requests</span>
                    <span class="compliance-detail-value">${status.gdpr?.deletion_requests_processed ?? "—"}</span>
                </div>
            </div>

            <div class="compliance-card">
                <div class="compliance-card-header">
                    <span class="compliance-card-title">🔒 SOC 2</span>
                    <span class="badge badge-green">Compliant</span>
                </div>
                ${Object.entries(status.soc2 || {}).map(([k, v]) => `
                    <div class="compliance-detail">
                        <span class="compliance-detail-label">${k}</span>
                        <span class="compliance-detail-value text-green">${v}</span>
                    </div>
                `).join("")}
            </div>

            <div class="compliance-card">
                <div class="compliance-card-header">
                    <span class="compliance-card-title">🏥 HIPAA</span>
                    <span class="badge ${status.hipaa?.compliant ? "badge-green" : "badge-red"}">${status.hipaa?.compliant ? "Compliant" : "Non-Compliant"}</span>
                </div>
                <div class="compliance-detail">
                    <span class="compliance-detail-label">Encryption</span>
                    <span class="compliance-detail-value text-green">${status.hipaa?.encryption_enabled ? "Enabled" : "Disabled"}</span>
                </div>
                <div class="compliance-detail">
                    <span class="compliance-detail-label">Audit Logging</span>
                    <span class="compliance-detail-value text-green">${status.hipaa?.audit_logging ? "Enabled" : "Disabled"}</span>
                </div>
            </div>

            <div class="compliance-card">
                <div class="compliance-card-header">
                    <span class="compliance-card-title">💳 PCI DSS</span>
                    <span class="badge ${status.pci_dss?.compliant ? "badge-green" : "badge-red"}">${status.pci_dss?.compliant ? "Compliant" : "Non-Compliant"}</span>
                </div>
                <div class="compliance-detail">
                    <span class="compliance-detail-label">Tokenization</span>
                    <span class="compliance-detail-value text-green">${status.pci_dss?.tokenization_enabled ? "Enabled" : "Disabled"}</span>
                </div>
                <div class="compliance-detail">
                    <span class="compliance-detail-label">Encryption at Rest</span>
                    <span class="compliance-detail-value text-green">${status.pci_dss?.encryption_at_rest ? "Enabled" : "Disabled"}</span>
                </div>
            </div>
        `;

        // Load retention policies
        const retention = status.data_retention;
        if (retention && retention.policies) {
            const retEl = document.getElementById("retention-policies");
            retEl.innerHTML = `
                <table class="retention-table">
                    <thead>
                        <tr>
                            <th>Data Type</th>
                            <th>Retention (days)</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(retention.policies).map(([type, days]) => `
                            <tr>
                                <td style="color: var(--text-primary); font-weight: 500;">${type.replace(/_/g, " ")}</td>
                                <td style="font-family: monospace;">${days.toLocaleString()}</td>
                                <td><span class="badge ${days > 9999 ? "badge-orange" : "badge-green"}">${days > 9999 ? "Indefinite" : days + "d"}</span></td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
                <div style="margin-top: 12px; display: flex; gap: 16px; font-size: 12px; color: var(--text-muted);">
                    <span>Auto-purge: <strong style="color: var(--accent-red);">${retention.auto_purge_enabled ? "On" : "Off"}</strong></span>
                    <span>Last purge: <strong>${retention.last_purge_run || "Never"}</strong></span>
                    <span>GDPR compliant: <strong style="color: var(--accent-green);">${retention.gdpr_compliant ? "Yes" : "No"}</strong></span>
                </div>
            `;
        }

        // Load SOC2 audit log
        const auditData = await api("/compliance/soc2/audit-log");
        const auditEl = document.getElementById("soc2-audit-log");
        if (auditData.entries && auditData.entries.length) {
            auditEl.innerHTML = auditData.entries.map((e) => `
                <div class="log-entry">
                    <span class="log-level INFO">${e.action || "—"}</span>
                    <span class="log-msg">${JSON.stringify(e.details || e).slice(0, 120)}...</span>
                </div>
            `).join("");
        } else {
            auditEl.innerHTML = '<p class="text-muted text-center">No audit entries recorded yet</p>';
        }

    } catch (err) {
        document.getElementById("compliance-cards").innerHTML = `<p class="text-muted text-center">Failed to load compliance status: ${err.message}</p>`;
    }
}

// ── AI Tools ────────────────────────────────────────────────────

async function summarizeText() {
    const text = document.getElementById("summarize-input").value.trim();
    if (!text) {
        showToast("Enter some text to summarize", "error");
        return;
    }

    const resultEl = document.getElementById("summarize-result");
    resultEl.className = "ai-result visible";
    resultEl.innerHTML = '<div class="loading-spinner"></div>';

    try {
        const result = await api("/summarize", {
            method: "POST",
            body: JSON.stringify({ text, max_tokens: 150 }),
        });
        resultEl.innerHTML = `
            <strong>Summary:</strong><br>${result.summary || "No summary generated"}
            <br><br>
            <span style="color: var(--text-muted); font-size: 11px;">
                Model: ${result.model_used || "—"} • Tokens: ${result.tokens_used || "—"}
            </span>
        `;
    } catch (err) {
        resultEl.innerHTML = `<span class="text-red">Error: ${err.message}</span>`;
    }
}

const chatHistory = [];

async function sendChat() {
    const input = document.getElementById("chat-input");
    const message = input.value.trim();
    if (!message) return;

    const messagesEl = document.getElementById("chat-messages");

    // Add user bubble
    messagesEl.innerHTML += `<div class="chat-bubble user">${escapeHtml(message)}</div>`;
    input.value = "";
    messagesEl.scrollTop = messagesEl.scrollHeight;

    chatHistory.push({ role: "user", content: message });

    try {
        const result = await api("/chat", {
            method: "POST",
            body: JSON.stringify({ messages: chatHistory, temperature: 0.7 }),
        });
        const reply = result.reply || "No response";
        chatHistory.push({ role: "assistant", content: reply });
        messagesEl.innerHTML += `<div class="chat-bubble system">${escapeHtml(reply)}</div>`;
    } catch (err) {
        messagesEl.innerHTML += `<div class="chat-bubble system" style="color: var(--accent-red);">Error: ${err.message}</div>`;
    }
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ── Init ────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    checkAPIStatus();
    loadDashboard();
    // Refresh API status every 30s
    setInterval(checkAPIStatus, 30000);
});
