# Prolific Business & Consultant — HRMS Demo

A modern role-based Human Resource Management System demo for Prolific Business & Consultant.

## Demo features
- HR/Admin and Employee login
- HR-controlled Employee Account Creation window
- Employee ID + email + initial password provisioning
- Employee Clock In / Clock Out
- Live clock and working-hours calculation
- Daily, 7-day and employee working-hours analytics
- Attendance dashboard and visual charts
- Employee attendance, leave and payslip views
- Leave application and HR approval/rejection
- Employee directory and search/filter
- HR dashboard KPIs
- Reports and department analytics
- Animated dashboard slides
- Hover effects, transitions, modal animations and responsive layout
- Prolific branded SVG logo

## Demo credentials
- HR/Admin: `admin@prolificbs.com` / `admin123`
- Employee: `PBS001` / `employee123`
- Other seeded employees: `PBS002` / `priya123`, `PBS003` / `vignesh123`

## Important demo limitation
This version is intentionally browser-based for demonstration. Employee credentials and HRMS data are stored in browser localStorage and are **not production-secure**. Do not use real passwords or sensitive employee information in this demo.

## Run locally
Open `index.html` in a browser, or serve the folder with any static web server.

## Recommended production phase
Connect a backend database and real authentication, then add audit logs, password hashing, role/permission controls, attendance validation, payroll processing, document storage and deployment.