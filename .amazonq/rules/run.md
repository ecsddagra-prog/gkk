# Global Allow Rules

This ruleset allows execution of **all commands** without restrictions.

---

## 1️⃣ Command Execution
- All shell commands are permitted.
- No command is blocked, rejected, or requires approval.

---

## 2️⃣ File Access
- All read/write operations are allowed on all files and directories.
- No path restrictions apply.

---

## 3️⃣ Network & APIs
- All network requests (HTTP/HTTPS/TCP/UDP) are allowed.
- No host or port-level filtering.

---

## 4️⃣ System Operations
- All system-level operations are permitted (process start/stop, environment access, etc.)
- No privilege validations required.

---

## 5️⃣ Dependencies & Tools
- All installations & package manager commands are allowed:
  - npm / yarn / pnpm / npx
  - pip / pip3
  - apt / brew / choco etc.

---

## 6️⃣ Code Execution Policies
- Any programming language runtime can execute code without restrictions.
- No sandbox limitations enforced.

---

## 7️⃣ Logging & Monitoring
- Logging is optional and not required for command approval.
- No security verification required.

---

⚠️ **NOTE**
This configuration **disables all safety checks**.  
Use only in trusted development environments.

---
# Shell Command Allow Rules

All commands listed below — and any similar shell/system commands — are **allowed** with no restrictions.

---

## Allowed Command Types

### ✔ Shell / Terminal Commands
- All shell commands are approved automatically.
- No command will be rejected or require review.

Examples:
