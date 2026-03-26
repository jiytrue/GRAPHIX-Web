# 🎯 Quick Start - Get Running in 5 Minutes

## Step 1: Import Database Schema (1 minute)

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select **Graphix** project
3. Click **SQL Editor** → **New Query**
4. Open `SUPABASE_SCHEMA.sql` file in editor and copy ALL content
5. Paste into Supabase and click **Run**

✅ **Done!** Your database is ready with:
- 5 users (1 admin, 4 technicians)
- Parts inventory
- Sample pricing
- All tables and indexes

---

## Step 2: Start Dev Server (1 minute)

```bash
# Navigate to project
cd C:\Users\milli\Desktop\GRAPHIX

# Start development server
npm run dev
```

✅ **Open**: http://localhost:5173

---

## Step 3: Login & Test (3 minutes)

### Test Admin Account
1. Click **"Login as Admin"** button
2. You're logged in as: admin@graphix.com (role: admin)
3. Click profile dropdown → **"Parts Management"**
4. Add/Edit/Delete parts and set prices
5. Go back to Dashboard

### Test Technician Account  
1. Click profile dropdown → **Logout**
2. Click **"Login as Technician"** button
3. You're logged in as: jefford@graphix.com (role: technician)
4. Click **"New Ticket"** button
5. Fill form:
   - Customer name & phone
   - **Device Type**: Select "iPhone"
   - **Device Model**: Select "iPhone 15 Pro Max"
   - **Select Parts**: Check battery + screen (see prices)
   - Issue description
   - Assign technician
6. Click **"Create Ticket"** → Ticket generated with parts cost!

---

## 🎓 Understanding the System

```
┌─────────────────────────────────────┐
│         Graphix Ticketing           │
└─────────────────────────────────────┘
          ↓
    ┌─────────┐
    │  LOGIN  │
    └────┬────┘
         ↓
    ┌────────────────┐
    │   Admin?       │
    └────┬───────┬───┘
    YES  │       │  NO
         ↓       ↓
   ┌─────────┐  ┌──────────────┐
   │ ADMIN   │  │ TECHNICIAN   │
   │ PANEL   │  │ DASHBOARD    │
   └────┬────┘  └──────┬───────┘
        │               │
   ┌───────────┐   ┌────────────┐
   │ Manage    │   │ Create     │
   │ Parts &   │   │ Tickets    │
   │ Pricing   │   │ w/ Parts   │
   └───────────┘   └────────────┘
```

---

## 📱 Demo Accounts

```
ADMIN:
  Email: admin@graphix.com
  Pass:  admin@graphix2026
  
TECHNICIAN (4 available):
  jefford@graphix.com (Jefford Calvo)
  jhondel@graphix.com (Jhondel Virtudazo)
  mark@graphix.com (Mark Saludares)
  mohammad@graphix.com (Mohammad)
  Pass: tech123 (same for all)
```

---

## ✨ Features in Action

### Creating a Ticket with Parts

```
┌─ Customer Info ─┐
│ Name: Juan      │
│ Phone: 555-1234 │
└─────────────────┘
         ↓
┌─ Device Info ──┐
│ Type: iPhone   │
│ Model: 15 Pro  │
│ Tech: Jefford  │
└────────────────┘
         ↓
┌─ Parts Selection ─────────────────┐
│ ☑ iPhone Battery ......... ₱1500  │
│ ☑ iPhone Screen .......... ₱8500  │
│ ☐ iPhone Camera           ₱4500   │
│ ─────────────────────────────────  │
│ TOTAL PARTS COST: ₱10,000         │
└────────────────────────────────────┘
         ↓
┌─ Issue Description ─┐
│ Screen shattered,   │
│ not charging...     │
└─────────────────────┘
         ↓
  [CREATE TICKET] 
         ↓
✅ GFX-123456-ABC CREATED WITH ₱10,000 PARTS COST
```

---

## 🔑 Key Features

### Admins Can
- ✅ Add new repair parts
- ✅ Set prices by device type
- ✅ Track pricing history
- ✅ Edit/delete parts
- ✅ Create tickets with parts
- ✅ See all technicians' work

### Technicians Can
- ✅ Create tickets
- ✅ Select parts from price list
- ✅ See automatic cost calculation
- ✅ Update ticket status
- ✅ Add notes
- ✅ Print ticket labels

### Both Can
- ✅ View dashboard
- ✅ Filter tickets by status
- ✅ View ticket details

---

## 🚨 If Something's Wrong

### "Database error" when logging in
→ You haven't imported SUPABASE_SCHEMA.sql yet
→ Go back to Step 1

### "Parts don't appear when creating ticket"  
→ Admin needs to add parts first
→ Login as admin, go to Parts Management, add parts & pricing

### "Device models dropdown is empty"
→ This shouldn't happen (models are hardcoded)
→ Check browser console (F12) for errors
→ Restart dev server

### "Different numbers on parts"
→ Prices vary by device type
→ Select different device type to see different prices

---

## 📊 What's Happening Behind the Scenes

1. **Login Page** reads from `users` table
2. **Admin Panel** manages `parts` and `parts_pricing` tables
3. **Ticket Creation** queries `parts_pricing` based on device type
4. **New Ticket** calculates total cost and stores part IDs
5. **Dashboard** shows all tickets with costs

---

## 🎮 Try This Sequence

1. **Login as Admin**
2. Go to Parts Management
3. Add new part: "Screen Protector", category: screen, device: iPhone
4. Set price: ₱500
5. Go back to Dashboard
6. Logout
7. **Login as Technician**
8. Create new ticket
9. Select iPhone → iPhone 15 Pro Max
10. You should see "Screen Protector ₱500" in parts list!

---

## 💾 Everything's Saved

All your:
- ✅ Tickets
- ✅ Parts inventory
- ✅ Pricing
- ✅ User accounts

Are stored in **Supabase PostgreSQL database** and will persist between server restarts.

---

## 🚀 You're Ready!

**Current Status:**
- ✅ Code compiled (0 errors)
- ✅ Components ready
- ✅ Database schema complete
- ✅ Demo accounts created
- ✅ Styling applied

**Just execute:**
```bash
npm run dev
```

**Then:**
1. Import schema (if not already done)
2. Open http://localhost:5173
3. Click demo login button
4. Create a test ticket
5. Try admin panel

**That's it!** You have a fully functional phone repair ticketing system! 🎉

---

For detailed documentation, see:
- `SETUP_AUTHENTICATION.md` - Complete guide
- `IMPLEMENTATION_SUMMARY.md` - What was built
