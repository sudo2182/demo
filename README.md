# Vulnerability Showcase: Admin Dashboard API

A FastAPI-powered demonstration project designed to showcase common security and compliance pitfalls in modern web applications, particularly those incorporating AI-generated code.

## ⚠️ Purpose & Problem Statement

This project is **intentionally insecure**. It was created to solve the problem of **identifying and teaching security/compliance anti-patterns**. 

As developers increasingly rely on AI to generate application scaffolding, certain "hallucinations" or suboptimal patterns often slip into production. This repository demonstrates:

1.  **Secret Management Failures**: API keys (Gemini), database passwords, and AWS secrets are hardcoded in the source or committed in `.env` files.
2.  **Broken Authentication**: Implementation of "leaky" auth logic, weak hashing algorithms (MD5), and unauthenticated sensitive endpoints.
3.  **Compliance Violations**:
    *   **GDPR**: Broken consent logic and non-compliant data deletion.
    *   **SOC 2**: Publicly accessible audit logs and hardcoded "PASS" reports.
    *   **PCI DSS**: Plaintext storage and logging of credit card numbers and CVVs.
    *   **HIPAA**: Unprotected Patient Health Information (PHI) and insecure SSN handling.
4.  **Insecure Coding**: Use of dangerous functions like `pickle.loads` (insecure deserialization) and `os.system` (command injection risk).

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- SQLite (default) / PostgreSQL (optional)

### Local Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/sudo2182/demo.git
    cd demo
    ```

2.  **Install dependencies**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run the application**
    ```bash
    uvicorn app:app --reload --host 0.0.0.0 --port 8000
    ```

4.  **Access the Dashboard**
    Open `http://localhost:8000` in your browser to view the Admin UI.

---

## 🛠️ Main Components

- **`app.py`**: The core FastAPI router and application logic.
- **`compliance.py`**: Logic for GDPR and SOC 2 (Vulnerable implementation).
- **`payment.py`**: PCI DSS "compliant" (but actually insecure) payment processing.
- **`health.py`**: HIPAA health record management (Vulnerable implementation).
- **`auth.py`**: Weak authentication and hashing utilities.
- **`static/`**: Modern dashboard UI to interact with the vulnerable backend.

## 📡 API Overview (Partial)

| Method | Endpoint | Description |
| ---- | ---- | ---- |
| POST | `/chat` | AI conversation logic |
| POST | `/payments/charge` | Insecure payment processing |
| POST | `/health/patients` | PHI storage with SSN exposure |
| GET | `/compliance/status` | Mock compliance overview |

## ⚖️ License

For educational and demonstration purposes only. Do not deploy to production.
