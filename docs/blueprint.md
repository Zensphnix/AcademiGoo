# **App Name**: AcademiGo

## Core Features:

- Route Display: Display bus routes and schedules in a clear, tabular format. Allow filtering by day and time.
- Real-time Tracking: Display a map with current bus locations and route paths.
- Route Preferences: Allow users to save their preferred routes for quick access.
- Login/Signup: Login/Signup Screen with email and password fields, and signup option for students and teachers.
- Home Dashboard: Home Dashboard with personalized greeting, live bus location map, quick actions (View/Renew Pass, Check ETA), and Emergency SOS button.
- Bus Pass Screen: Bus Pass Screen displaying QR code, student details, bus route, number, and buttons to download or renew the pass.
- ETA Screen: ETA Screen showing live map and stop list with estimated times of arrival, refresh and notification options.
- Complaint/Contact Transport: Complaint Submission Screen with dropdown for issue type, text field for description, photo upload, and contact option.
- OTP Login: OTP Login for drivers with mobile number input and OTP verification.
- Duty Dashboard: Duty Dashboard for drivers showing route card, bus number, stop list, and action buttons to start/scan/end trip with live GPS badge.
- Attendance Scanner: Attendance Scanner View for drivers to scan student QR codes, live attendance list, and navigation buttons.
- SOS + Navigation: SOS and Navigation section for drivers with emergency alert and external route launch.
- Admin Login: Admin Login with email, password, OTP (2FA) fields.
- Admin Dashboard: Admin Dashboard with overview cards, quick actions (Add/Edit Routes, View Live Map, Complaint Queue).
- User & Bus Management: User & Bus Management section for admin to manage students, drivers, and conductors with search bar and action buttons (Assign Bus, Edit Info, Remove User).
- Complaint Resolution: Complaint Resolution table for admin to view and resolve complaints with details and resolution modal.

## Style Guidelines:

- Primary color: Deep blue (#1A237E) for a professional and trustworthy feel.
- Secondary color: Light gray (#EEEEEE) for backgrounds and subtle contrasts.
- Accent: Teal (#009688) for interactive elements and highlights.
- Clean and readable sans-serif fonts.
- Use clear and recognizable icons for navigation and bus stops.
- Use a card-based layout for bus routes and schedules.
- Smooth transitions for map updates and route selections.

## Original User Request:
Perfect! Here's a more detailed breakdown of every screen in your AcademiGo app wireframe—with the exact content that should appear on buttons, fields, labels, cards, and actions—organized by role and feature. This will make your Figma design crystal clear.


---

1. Student Role – Detailed Wireframe Content

a. Login/Signup Screen

Title: “Welcome to AcademiGo”

Fields:

Email: Enter your college email (e.g., yourname@university.edu)

Password: Enter password


Buttons:

[Login] → Navigate to Home Dashboard

[Don’t have an account? Sign Up]


Signup Fields:

Full Name

College Email

Role: Dropdown: Student / Teacher

Password

[Register Account]




---

b. Home Dashboard (Post-Login)

Header: “Hello, Shashi!” (Personalized)

Map Section:

Label: “Live Bus Location”

Google Map (mock) with animated bus icon


Quick Actions (Cards with icons):

[View My Bus Pass] → Opens pass screen

[Check ETA] → Opens ETA/map screen

[Renew Pass] → Opens renewal page (only if pass expires in < 15 days)


SOS Button:

Label: “Emergency SOS”

Action: Opens confirmation modal → “Are you sure you want to send an SOS alert?”

[Yes, Send Alert] / [Cancel]




---

c. Bus Pass Screen

Header: “Your Digital Bus Pass”

Content:

QR Code (plugin-generated)

Text:

Name: Shashi Sharma

Valid Till: June 30, 2025

Bus Route: Route 5 – North Campus Line

Bus Number: DL 1A 4567



Buttons:

[Download Pass as PDF]

[Renew Pass] → Goes to payment/renewal form




---

d. ETA Screen

Header: “Bus ETA”

Live Map: Google Maps view

Below Map:

Stop List with ETAs:

e.g., “North Gate – ETA: 8:15 AM”

“Main Library – ETA: 8:25 AM”

“Admin Block – ETA: 8:30 AM”



Buttons:

[Refresh ETA]

[Notify Me if Delayed] → Toggle switch




---

e. Complaint / Contact Transport

Header: “Submit a Complaint”

Dropdown (Type of Issue):

Cleanliness

Late Arrival

Driver Behavior

Overcrowded

Other


Text Field: “Describe the issue briefly…”

Photo Upload: [Attach Photo]

Buttons:

[Submit Complaint]

[Call Transport Office] → (Clickable contact)




---

2. Driver/Conductor Role – Detailed Content

a. OTP Login

Header: “Driver Login”

Fields:

Mobile Number: Enter registered mobile number


Buttons:

[Send OTP]

OTP Input Popup → Enter 6-digit code

[Verify OTP] → Goes to Duty Dashboard




---

b. Duty Dashboard

Header: “Today’s Duty”

Route Card:

Route: South Campus Express

Bus Number: HR 26 B 7890

Stops: List of stop names with times


Action Buttons:

[Start Trip] → Activates GPS tracking

[Scan Attendance] → Opens scanner interface

[End Trip]


Live GPS Badge: “Tracking On” (once trip started)



---

c. Attendance Scanner

QR Scanner View (camera mock)

Below Camera:

Live Attendance List:

Student Name – Time Scanned – Status (Tick or Cross)



Buttons:

[Refresh List]

[Back to Dashboard]




---

d. SOS + Navigation

SOS Section:

[Emergency Alert] (Red, large button)

Confirmation: “Send emergency alert to admin?”

[Confirm Alert] / [Cancel]


Navigation Section:

[Open Route in Google Maps] → External launch

[Back to Dashboard]




---

3. Admin Role – Detailed Wireframe Content

a. Admin Login

Fields:

Admin Email

Password

OTP (2FA code)


Buttons:

[Login to Dashboard]




---

b. Admin Dashboard

Overview Cards:

Total Active Buses: 18

Complaints Today: 4 (Click → Complaint Queue)

Renewals Pending: 9


Quick Actions:

[Add/Edit Routes]

[View Bus Live Map]

[Complaint Queue]




---

c. User & Bus Management

Tabs: Students | Drivers | Conductors

Search Bar: “Search by name or ID…”

List Table Columns:

Name | Role | Assigned Bus | Actions


Actions:

[Assign Bus] → Dropdown

[Edit Info]

[Remove User]




---

d. Complaint Resolution

Complaint Table:

ID | Type | Submitted By | Priority | View | Status


View Button: Opens complaint details + image (if uploaded)

Resolution Modal:

“Add your notes on resolution…”

[Mark as Resolved]




---

Would you like me to now generate these screens in Figma and export the starter file for you? Or do you want me to help you build just the student flow first?
  