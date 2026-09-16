# SMART OVERTIME — FULL WEB APPLICATION DEVELOPMENT PROMPT

You are an expert full-stack software engineer. Build a production-ready web application called **Smart Overtime** for managing hospital staff overtime records.

The application must be secure, responsive, mobile-first, database-driven, and deployable on **Vercel** with a cloud PostgreSQL database.

Do not create a demo-only application. Build the complete working system with authentication, database, validation, CRUD operations, calculations, verification workflow, Excel export, Nepali/English date handling, and responsive UI.

---

## 1. TECHNOLOGY STACK

Use:

* Next.js latest stable version
* TypeScript
* React
* Tailwind CSS
* shadcn/ui where useful
* PostgreSQL database
* Prisma ORM
* NextAuth/Auth.js or a secure custom authentication system
* bcrypt/Argon2 for password hashing
* Zod for validation
* date-fns where useful
* Nepali date conversion library or a reliable Bikram Sambat conversion implementation
* ExcelJS or SheetJS for Excel export
* Lucide React icons

Deployment target:

* Vercel
* PostgreSQL hosted database such as Neon/Supabase
* Environment variables for secrets
* No local-only database
* Application must work 24/7 when deployed

---

# 2. APPLICATION NAME

Application name:

**Smart Overtime**

Use a clean Nepali-inspired professional design.

Theme:

* Nepali administrative/hospital management style
* Clean
* Modern
* Professional
* Easy to use
* Mobile-first
* Avoid excessive animations
* Good contrast
* Large touch-friendly buttons
* Responsive on mobile, tablet and desktop

Header should display:

**Smart Overtime**

Subtitle:

**Overtime Management System**

---

# 3. USER ROLES

There are exactly two roles:

1. ADMIN
2. STAFF

Do NOT create a role-selection dropdown during login.

The system should determine the role automatically from the credentials.

---

# 4. ADMIN LOGIN

Admin has fixed credentials:

Username/ID:

54278899

Password:

5427885427

IMPORTANT:

Do NOT expose these credentials in frontend source code.

Store them securely through environment variables or a secure server-side configuration.

For example:

ADMIN_USERNAME=54278899
ADMIN_PASSWORD_HASH=...

The admin account must have role:

ADMIN

Admin can:

* View all staff
* View all overtime records
* Add records
* Edit records
* Delete records
* Verify/unverify records
* View monthly statistics
* View daily statistics
* Search records
* Filter records
* Export Excel
* Manage staff
* View staff-wise overtime
* View staff-wise earnings
* View monthly earnings
* View total overtime hours
* View pending verification records

---

# 5. STAFF REGISTRATION

Staff must be able to register their own account.

Registration fields:

* Full Name
* Username
* Email
* Password
* Confirm Password

Username must be unique.

Email must be unique.

Password must be securely hashed.

After registration, staff can login using:

Username/email + password

Staff role must automatically be:

STAFF

There must be NO option for a staff member to register as admin.

---

# 6. LOGIN PAGE

Create a professional login page.

Fields:

* Username or Email
* Password
* Login button

Links:

* Register as Staff
* Forgot password

Do not show:

"Login as Admin"
"Login as Staff"

Instead, automatically identify the account after authentication.

---

# 7. STAFF DASHBOARD

After staff login, show a mobile-first dashboard.

Dashboard cards:

### Current Month

* Total OT Entries
* Total OT Hours
* Verified Entries
* Pending Entries
* Total Estimated Earnings

### Earnings

Show:

Major:
Rs. 1,000 per case

Intermediate:
Rs. 800 per case

Minor:
Rs. 500 per case

Calculate current month's earnings automatically.

Example:

Major = 4 × 1000 = Rs. 4,000
Intermediate = 3 × 800 = Rs. 2,400
Minor = 2 × 500 = Rs. 1,000

Total = Rs. 7,400

Only verified overtime should count toward the official payable amount.

Clearly distinguish:

* Pending amount
* Verified amount
* Total amount

---

# 8. STAFF OVERTIME RECORD FORM

Create a page:

**My Overtime**

with:

**+ Add Overtime**

Form fields:

### Date

Support both:

* English date (AD)
* Nepali date (BS)

The system must automatically synchronize them.

If the user enters/selects English date:

Automatically calculate and display Nepali date.

If the user enters/selects Nepali date:

Automatically calculate and display English date.

Example:

English:
2026-09-16

Nepali:
2083-05-31

Do not make the user manually calculate dates.

Validate Nepali dates correctly.

---

### Patient Name

Text field.

---

### Procedure

Text field / searchable text field.

Examples:

* Laparoscopic Cholecystectomy
* RIRS
* ORIF
* Appendectomy

---

### Type

Dropdown:

* Major
* Intermediate
* Minor

Rates:

Major = Rs. 1000

Intermediate = Rs. 800

Minor = Rs. 500

Do not allow users to manually enter the amount.

The system automatically calculates the amount from the case type.

---

### Shift Duty

Provide appropriate shift options:

* Morning
* Day
* Evening
* Night
* Other

Allow configuration if necessary.

---

### OT Start Time

Time picker.

---

### OT End Time

Time picker.

---

### Total OT Hours

Automatically calculate:

End Time - Start Time

Do not require manual entry.

Handle overtime crossing midnight correctly.

Example:

Start:
22:00

End:
02:00

Total:
4 hours

Store total duration reliably in the database.

---

### Remarks

Optional text area.

---

### Submit

Button:

**Submit Overtime**

After submission:

Status:

**Pending Verification**

---

# 9. STAFF RECORD ACCESS

Staff can:

* Create their own overtime
* View their own overtime
* Search their own records
* Filter their own records
* Edit their own records only within 12 hours of creation
* Cannot edit after 12 hours
* Cannot delete records after the lock period
* Cannot see other staff records
* Cannot verify their own records
* Cannot change their own amount
* Cannot change verification status

After 12 hours:

Display:

🔒 Locked

Message:

"This record is locked. Please contact the administrator for changes."

Only ADMIN can edit/delete locked records.

IMPORTANT:

The 12-hour restriction must be enforced on the SERVER, not only through frontend UI.

Do not rely on JavaScript alone for security.

---

# 10. ADMIN OVERTIME MANAGEMENT

Admin has full access.

Admin can:

* Add overtime for any staff
* Edit any overtime
* Delete any overtime
* Verify overtime
* Unverify overtime
* Change staff
* Change date
* Change procedure
* Change type
* Change time
* Change remarks

Admin should see a professional table.

Columns:

* Staff Name
* Date BS
* Date AD
* Patient
* Procedure
* Type
* Shift
* Start
* End
* OT Hours
* Amount
* Status
* Created At
* Actions

---

# 11. VERIFICATION SYSTEM

Every staff-submitted overtime starts as:

**PENDING**

Admin sees:

**Verify**

button.

After verification:

Status becomes:

**VERIFIED**

The staff dashboard and staff records page must immediately show the updated status.

Use status badges:

Pending Verification
Verified

Do not allow staff to mark their own records verified.

---

# 12. ADMIN DASHBOARD

Create a separate admin dashboard.

Show:

### Today's Statistics

* Today's OT Entries
* Today's OT Hours
* Today's Verified
* Today's Pending
* Today's Estimated Amount

### Current Month

* Total Entries
* Total OT Hours
* Verified Entries
* Pending Entries
* Total Verified Amount
* Total Pending Amount

### Staff Statistics

Show each staff member:

* Staff Name
* Total Entries
* Total OT Hours
* Major Cases
* Intermediate Cases
* Minor Cases
* Verified Amount
* Pending Amount
* Total Amount

---

# 13. STAFF-WISE ADMIN VIEW

Admin must be able to select a month.

For example:

Baisakh
Jestha
Ashadh
Shrawan
Bhadra
Ashwin
Kartik
Mangsir
Poush
Magh
Falgun
Chaitra

When a month is selected, display staff alphabetically.

Example:

Adam

* All of Adam's overtime records for selected month
* Total cases
* Major cases
* Intermediate cases
* Minor cases
* Total hours
* Verified amount
* Pending amount
* Total amount

Then:

Bikash

* His records

Then:

Dipak

etc.

Sort staff alphabetically by full name.

---

# 14. MONTHLY FILTER

Admin must have:

Year selector

Month selector

Both systems:

English calendar
Nepali Bikram Sambat calendar

The administrator should easily select:

2083 Baisakh
2083 Jestha
2083 Ashadh
2083 Shrawan
etc.

When selected, automatically show records belonging to that Nepali month.

Make the month filter very easy to use on mobile.

---

# 15. EXCEL EXPORT

Admin must be able to export records.

Button:

**Download Excel**

Options:

* Selected Month
* Selected Year
* All Staff
* Individual Staff

Excel file should be professionally formatted.

Example filename:

Smart_Overtime_2083_Shrawan.xlsx

Excel columns:

SN
Staff Name
Username
Date BS
Date AD
Patient Name
Procedure
Type
Shift Duty
OT Start
OT End
Total OT Hours
Rate
Amount
Status
Remarks

---

# 16. EXCEL STAFF-WISE ORGANIZATION

For monthly export, organize the data alphabetically by staff name.

Example:

ADAM

records...

Total Adam:
Major:
Intermediate:
Minor:
Total Hours:
Verified Amount:
Pending Amount:
Total Amount:

Then:

BIKASH

records...

Then:

DIPAK

etc.

At the bottom:

MONTHLY TOTAL

Major Cases
Intermediate Cases
Minor Cases
Total Cases
Total OT Hours
Verified Amount
Pending Amount
Grand Total

---

# 17. DATABASE DESIGN

Create a proper normalized Prisma schema.

Recommended models:

User

Fields:

* id
* fullName
* username
* email
* passwordHash
* role
* isActive
* createdAt
* updatedAt

OvertimeRecord

Fields:

* id
* staffId
* dateAD
* dateBS
* patientName
* procedure
* type
* shiftDuty
* startTime
* endTime
* totalMinutes
* totalHours
* rate
* amount
* remarks
* status
* createdAt
* updatedAt
* verifiedAt
* verifiedBy
* editedBy
* deletedAt if soft delete is used

Use proper foreign keys.

Use indexes for:

* staffId
* dateAD
* dateBS
* status
* createdAt

---

# 18. IMPORTANT DATABASE RULES

Never trust amount sent from frontend.

Calculate:

Major → 1000
Intermediate → 800
Minor → 500

on the server.

Never trust totalHours sent from frontend.

Calculate it on the server from:

startTime
endTime

Validate all submitted data using Zod.

---

# 19. AUDIT LOG

Create an audit log system.

Track important admin actions:

* Created overtime
* Edited overtime
* Deleted overtime
* Verified overtime
* Unverified overtime
* Staff account changes

Audit log fields:

* id
* userId
* action
* recordId
* oldValue
* newValue
* createdAt

This is important for hospital administrative accountability.

---

# 20. SECURITY

Implement:

* Secure password hashing
* Secure cookies/session
* Server-side authorization
* Role-based access control
* CSRF protection where applicable
* Input validation
* SQL injection protection through Prisma
* XSS protection
* Rate limiting for login
* Secure HTTP headers
* Environment variables
* No passwords in source code
* No sensitive information exposed to frontend
* Prevent staff from accessing another staff member's API records
* Prevent staff from modifying verification status
* Prevent staff from modifying amount
* Prevent staff from bypassing 12-hour edit restriction

Every protected API route must verify authentication and authorization server-side.

---

# 21. API STRUCTURE

Create clean API routes/server actions.

Examples:

POST /api/auth/register
POST /api/auth/login
POST /api/overtime
GET /api/overtime
PUT /api/overtime/:id
DELETE /api/overtime/:id
POST /api/overtime/:id/verify
POST /api/overtime/:id/unverify
GET /api/admin/statistics
GET /api/admin/staff
GET /api/export/excel

Staff API queries must automatically restrict results to the authenticated staff member.

Admin API queries can access all records.

---

# 22. RESPONSIVE MOBILE DESIGN

This is extremely important.

Many staff will use smartphones.

Design mobile-first.

On mobile:

* Bottom navigation or compact navigation
* Large buttons
* Easy date selection
* Easy time selection
* Form fields full width
* Avoid wide tables

For overtime records on mobile, use cards instead of forcing users to horizontally scroll huge tables.

Example card:

Patient:
ABC

Procedure:
RIRS

Date:
2083-05-31 / 2026-09-16

Type:
Major

OT:
2h 30m

Amount:
Rs. 1,000

Status:
Verified

On desktop, use tables.

Use responsive breakpoints to switch between cards and tables.

---

# 23. NAVIGATION

STAFF:

Dashboard
My Overtime
Add Overtime
Monthly Summary
Profile
Logout

ADMIN:

Dashboard
All Overtime
Staff
Monthly Report
Excel Export
Audit Logs
Settings
Logout

---

# 24. SEARCH AND FILTER

Admin must have:

Search by:

* Staff name
* Patient name
* Procedure
* Username

Filters:

* Date
* Nepali month
* English month
* Type
* Shift
* Status
* Staff

Staff can search only their own records.

---

# 25. DASHBOARD CHARTS

Add simple useful charts.

Staff:

* Monthly overtime count
* Major/Intermediate/Minor distribution
* Monthly earnings

Admin:

* Daily overtime count
* Staff-wise overtime
* Case-type distribution
* Monthly earnings

Charts must remain responsive on mobile.

Do not overload dashboard with unnecessary graphs.

---

# 26. DATE SYSTEM

Nepali Bikram Sambat support is a major requirement.

Create a reusable date utility.

Example:

convertADToBS(date)
convertBSToAD(date)

Display both dates throughout the application.

Store the authoritative Gregorian/AD date in the database for reliable sorting and calculations.

Also store the BS representation for reporting.

Make sure date conversion is tested thoroughly.

---

# 27. OVERTIME CALCULATION

Calculate duration accurately.

Example:

Start 17:00
End 19:30

Total:
2 hours 30 minutes

Store:

totalMinutes = 150

Display:

2h 30m

Use totalMinutes as the reliable calculation field.

For payment:

Amount depends on case type, not duration.

Major = Rs. 1000
Intermediate = Rs. 800
Minor = Rs. 500

---

# 28. PAYABLE CALCULATION

Only VERIFIED records are official payable overtime.

Staff dashboard should show:

### Verified Earnings

Major × 1000
Intermediate × 800
Minor × 500

### Pending Earnings

Pending records separately.

### Total Potential Earnings

Verified + Pending

Make the distinction visually clear.

---

# 29. ADMIN MONTHLY REPORT

Create a professional report page.

Example:

SMART OVERTIME
Monthly Overtime Report

Month:
2083 Shrawan

Staff:

ADAM

Major: 5
Intermediate: 3
Minor: 2
Total Cases: 10
Total OT Hours: 23h 30m
Verified Amount: Rs. 7,400

---

BIKASH

Major: 3
Intermediate: 4
Minor: 1
Total Cases: 8
Total OT Hours: 17h 45m
Verified Amount: Rs. 6,700

---

MONTHLY TOTAL

Total Staff:
XX

Total Cases:
XX

Total OT Hours:
XX

Total Verified Amount:
Rs. XXXXX

---

# 30. STAFF PROFILE

Staff should be able to view:

* Full Name
* Username
* Email
* Account created date

Allow changing:

* Email
* Password

Do not allow staff to change:

* Role
* Verification permissions
* Other users

---

# 31. ADMIN STAFF MANAGEMENT

Admin can:

* View staff
* Search staff
* Activate/deactivate staff
* Edit staff information
* Reset staff password
* View individual staff overtime
* View individual monthly earnings

Do not allow admin deletion to destroy historical overtime records.

Use soft-delete/deactivate where appropriate.

---

# 32. EMPTY STATES

Create useful empty states.

Example:

"No overtime records found for this month."

"No pending overtime verification."

"No staff members found."

---

# 33. LOADING STATES

Use skeleton loaders/spinners for:

* Dashboard
* Tables
* Reports
* Excel generation
* Form submission

---

# 34. ERROR HANDLING

Show user-friendly errors.

Examples:

"Invalid username or password."

"This overtime record is locked because more than 12 hours have passed since submission."

"Email already exists."

"Username already exists."

"Unable to save overtime. Please try again."

Do not expose database errors to users.

---

# 35. CONFIRMATION DIALOGS

Before deleting:

"Are you sure you want to delete this overtime record?"

Show:

Cancel
Delete

Admin only.

---

# 36. UI LANGUAGE

Primary interface should have a Nepali-inspired appearance.

Support Nepali labels where appropriate.

Examples:

Dashboard:
ड्यासबोर्ड

Overtime:
ओभरटाइम

Date:
मिति

Staff:
कर्मचारी

Patient Name:
बिरामीको नाम

Procedure:
प्रक्रिया

Type:
प्रकार

Major:
मेजर

Intermediate:
इन्टरमिडिएट

Minor:
माइनर

Status:
स्थिति

Verified:
प्रमाणित

Pending:
प्रमाणीकरण बाँकी

Amount:
रकम

Remarks:
कैफियत

However, keep English technical values such as procedure names and usernames unchanged.

---

# 37. PWA / MOBILE EXPERIENCE

Make the application installable as a Progressive Web App if practical.

Staff should be able to open it easily from their phone.

Optimize:

* Fast loading
* Low bandwidth
* Mobile forms
* Touch controls
* Responsive layout

---

# 38. PROJECT STRUCTURE

Create a professional structure similar to:

app/
login/
register/
dashboard/
overtime/
admin/
reports/
profile/
api/

components/
ui/
dashboard/
overtime/
admin/
reports/

lib/
auth/
db/
validation/
dates/
overtime/
permissions/
excel/

prisma/
schema.prisma
seed.ts

types/

public/

middleware.ts

.env.example

README.md

---

# 39. ENVIRONMENT VARIABLES

Create:

.env.example

with placeholders such as:

DATABASE_URL=

AUTH_SECRET=

ADMIN_USERNAME=

ADMIN_PASSWORD_HASH=

Do not commit real secrets.

Create clear README instructions explaining how to configure them on Vercel.

---

# 40. SEED DATABASE

Create a Prisma seed script that creates the admin account.

Do NOT create fake staff accounts unless explicitly requested.

Admin credentials must come from environment variables.

---

# 41. VERCEL DEPLOYMENT

The application must be ready for:

GitHub
↓
Vercel
↓
PostgreSQL

Provide:

* Build configuration
* Prisma generation
* Database migration instructions
* Environment variable instructions
* Production deployment instructions

Ensure Prisma client works correctly in Vercel serverless environments.

---

# 42. PERFORMANCE

Optimize for approximately:

* 50–500 staff users
* Thousands of overtime records
* Monthly reporting
* Frequent mobile usage

Use:

* Database indexes
* Pagination
* Server-side filtering
* Efficient queries
* Avoid loading all records unnecessarily

Admin monthly reports should use optimized database queries.

---

# 43. IMPORTANT BUSINESS RULES

Implement these exactly:

1. Staff can register.
2. Staff can login.
3. Admin login uses fixed admin credentials.
4. No role selection at login.
5. Staff sees only own overtime.
6. Admin sees all overtime.
7. Staff can create overtime.
8. Staff can edit their own record only within 12 hours after creation.
9. After 12 hours, record becomes locked for staff.
10. Admin can edit locked records.
11. Staff cannot delete locked records.
12. Admin can delete records.
13. Every new staff overtime starts as Pending.
14. Admin verifies overtime.
15. Verified status appears on staff dashboard.
16. Major = Rs.1000.
17. Intermediate = Rs.800.
18. Minor = Rs.500.
19. Amount is automatically calculated.
20. Total OT duration is automatically calculated.
21. Date must support both AD and BS.
22. AD ↔ BS conversion must happen automatically.
23. Admin can filter by Nepali month.
24. Admin can view staff alphabetically.
25. Admin can export selected month to Excel.
26. Staff earnings are calculated for the current month.
27. Only verified records count as official payable amount.
28. Application must be mobile responsive.
29. Server-side authorization is mandatory.
30. Application must be deployable to Vercel with cloud PostgreSQL.

---

# 44. DEVELOPMENT APPROACH

Build this incrementally.

First:

1. Initialize project.
2. Configure TypeScript/Tailwind.
3. Configure Prisma/PostgreSQL.
4. Create database schema.
5. Create authentication.
6. Create staff registration.
7. Create admin authentication.
8. Implement role-based authorization.
9. Build staff dashboard.
10. Build overtime form.
11. Implement AD/BS date conversion.
12. Implement overtime calculation.
13. Implement 12-hour edit lock.
14. Build admin dashboard.
15. Build verification system.
16. Build staff management.
17. Build monthly reports.
18. Build Excel export.
19. Add audit logs.
20. Add responsive mobile UI.
21. Add validation/error handling.
22. Test security.
23. Test database queries.
24. Prepare Vercel deployment.

Do not skip functionality.

---

# 45. TESTING

Create tests for critical business rules:

* Staff cannot access another staff's records.
* Staff cannot verify records.
* Staff cannot edit after 12 hours.
* Admin can edit after 12 hours.
* Major amount = 1000.
* Intermediate amount = 800.
* Minor amount = 500.
* OT duration calculation works.
* Overnight overtime works.
* AD → BS conversion works.
* BS → AD conversion works.
* Pending status works.
* Verification works.
* Monthly filtering works.
* Alphabetical staff sorting works.
* Excel export works.
* Unauthorized API requests are rejected.

---

# 46. IMPORTANT INSTRUCTION TO GITHUB COPILOT

Do not simply generate static frontend pages.

Build the actual functioning full-stack application.

Do not use mock data for production functionality.

Use real PostgreSQL database operations.

Use server-side authentication and authorization.

Do not put security rules only in React components.

Do not expose admin credentials.

Do not trust amount or total OT hours sent by the browser.

Calculate critical values on the server.

Make all forms fully functional.

Make the application production-ready for Vercel.

When a feature is incomplete, continue implementing it rather than replacing it with placeholder text.

At the end, provide:

1. Complete project structure
2. Database schema
3. Environment variable list
4. Local development instructions
5. Database migration instructions
6. Vercel deployment instructions
7. Default admin setup instructions
8. Testing instructions
9. Security checklist

Build the application with clean, maintainable, reusable TypeScript code.
