# Graphix Authentication & Parts Management Setup Guide

## ✅ What's Been Implemented

### 1. **User Authentication System** 
- Email/password login page
- Role-based access control (Admin & Technician)
- User session management (localStorage)
- Demo accounts for quick testing

### 2. **Admin Dashboard**
- Parts inventory management (CRUD operations)
- Parts pricing by device type
- Track who creates/manages pricing
- Admin-only access restrictions

### 3. **Enhanced Device Management**
- **Comprehensive Phone Models**:
  - iPhone: 6 through iPhone 17 Pro Max (all variants)
  - Samsung Galaxy series
  - Tecno, Infinix, Realme, Redmi (popular in Philippines)
  - Vivo, OPPO, OnePlus, iPad/Tablets
  
- **Device-Specific Parts & Pricing**
- Device model selection during ticket creation
- Automatic parts cost calculation

### 4. **Updated Ticket System**
- Device model field (linked to device type)
- Parts selection with checkboxes
- Real-time parts cost calculation
- Total parts cost stored with ticket

---

## 🚀 Complete Setup Instructions

### Step 1: Import Updated Database Schema

1. **Go to Supabase Dashboard**
   - URL: https://app.supabase.com
   - Project: Graphix (retxhosccttjpwckmrzd)

2. **Navigate to SQL Editor**
   - Click: SQL Editor (left sidebar)
   - Click: New Query

3. **Copy & Paste Schema**
   - Open file: `SUPABASE_SCHEMA.sql` in your project
   - Copy all content
   - Paste into Supabase SQL Editor

4. **Execute the Query**
   - Click: Run (green play button)
   - Wait for completion
   - Check: "Tables" section should show: users, technicians, tickets, parts, parts_pricing

### Step 2: Verify Database Tables

Expected tables in Supabase:
- ✅ `users` - Contains admin and technician accounts
- ✅ `technicians` - Linked to users table
- ✅ `tickets` - With new device_model and parts columns
- ✅ `parts` - Inventory of repair parts
- ✅ `parts_pricing` - Pricing for parts by device

Expected data:
- ✅ 1 Admin user (admin@graphix.com)
- ✅ 4 Technician users (Jefford, Jhondel, Mark, Mohammad)
- ✅ Sample parts for iPhone and Android
- ✅ Sample pricing for all parts

### Step 3: Start Development Server

```bash
cd C:\Users\milli\Desktop\GRAPHIX
npm run dev
```

Server runs on: **http://localhost:5173**

---

## 🔐 Demo Login Credentials

### Admin Account
- **Email**: admin@graphix.com
- **Password**: admin@graphix2026
- **Access**: Dashboard + Parts Management + Admin features

### Technician Account
- **Email**: jefford@graphix.com
- **Password**: tech123
- **Access**: Dashboard + Ticket management only

### Quick Demo
Click "Login as Admin" or "Login as Technician" buttons on login page for instant access.

---

## 📝 Testing Workflow

### Test 1: Admin Login & Parts Management
1. Click "Login as Admin" on login page
2. In top-right, click your profile dropdown
3. Click "Parts Management"
4. Add new parts (e.g., "Samsung Battery", "Tecno Screen")
5. Set prices for different device types
6. Edit/Delete parts as needed

### Test 2: Technician Login & Create Ticket
1. Click "Login as Technician"
2. Click "New Ticket" button
3. Fill in customer details
4. **Select Device Type** (e.g., iPhone)
5. **Select Device Model** (e.g., iPhone 15 Pro Max)
6. **Select Parts** - checkboxes appear with prices
7. **View Total Cost** - calculates automatically
8. Describe the issue
9. Click "Create Ticket"
10. Print ticket label if needed

### Test 3: View Ticket with Parts Cost
1. On Dashboard, click any ticket
2. Verify: device_model displayed
3. Verify: total parts cost shown
4. Verify: selected parts listed

---

## 🔄 User Experience Flow

### **Admin User Path**
```
Login → Admin Dashboard
        ↓
      Create Tickets (with parts pricing)
      Parts Management (add/edit/delete parts & pricing)
      View all technicians' tickets
```

### **Technician User Path**
```
Login → Dashboard (view tickets)
        ↓
      Create Tickets (select parts by price)
      Update ticket status & notes
      (Cannot access Parts Management)
```

---

## 📊 Database Schema Overview

### Users Table
```
id (UUID)
email (unique)
password (plain text - consider bcrypt for production)
name
role ('admin' | 'technician')
active (boolean)
created_at, updated_at
```

### Parts Table
```
id (UUID)
name
category (battery, screen, camera, etc.)
device_type (iPhone, Samsung, etc.)
description
created_at, updated_at
```

### Parts_Pricing Table
```
id (UUID)
part_id (FK → parts)
price (decimal)
device_type
created_by (FK → users)
created_at, updated_at
```

### Tickets Table (Updated)
```
...existing fields...
device_model (new) - e.g., "iPhone 15 Pro Max"
parts (new) - JSON array of selected part IDs
total_parts_cost (new) - decimal
```

---

## ⚙️ Custom Features Available

### For Admins Only
- View all parts inventory
- Add/Edit/Delete parts
- Set pricing by device type
- Track pricing changes (created_by)
- Manage technicians

### For Technicians
- Create tickets with parts selection
- Automatic cost calculation
- Update ticket status
- Add notes to tickets
- Cannot modify parts or pricing

---

## 🐛 Troubleshooting

### "Login fails with valid credentials"
- Verify `SUPABASE_SCHEMA.sql` was imported successfully
- Check Supabase SQL Editor → Table Browser → confirm users exist
- Re-import schema if tables don't exist

### "No parts appear when creating ticket"
- Verify parts_pricing table has entries
- In Supabase, check: parts table has entries
- Check: parts_pricing has matching device_type
- Admin must add pricing before parts show to technicians

### "Device models dropdown is empty"
- Check: DEVICE_TYPES in `src/lib/constants.ts` 
- Verify device_type selected matches DEVICE_TYPES keys
- Models are hardcoded in frontend (not from database yet)

### CSS/styling issues
- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server (`npm run dev`)
- Check browser console for errors (F12)

---

## 📱 Device Type Models Reference

### iPhone Models
6, 6 Plus, 6s, 6s Plus, 7, 7 Plus, 8, 8 Plus, X, XS, XS Max, XR, 11, 11 Pro, 11 Pro Max, 12, 12 mini, 12 Pro, 12 Pro Max, 13, 13 mini, 13 Pro, 13 Pro Max, 14, 14 Plus, 14 Pro, 14 Pro Max, 15, 15 Plus, 15 Pro, 15 Pro Max, 16, 16 Plus, 16 Pro, 16 Pro Max, 17, 17 Plus, 17 Pro, 17 Pro Max

### Android Brands
- **Samsung**: Galaxy S21-S24 series, A series, M series, Note series
- **Tecno**: Spark, Phantom, Pova, Camon, Pop
- **Infinix**: Hot, Note, Zero, Smart series
- **Realme**: Number series (12, 11, 10, etc.), GT, C series
- **Redmi**: Note series, K series, A series
- **Vivo**: X series, V series, Y series
- **OPPO**: Find X, Reno, A series, F series
- **OnePlus**: 12, 11, Ace series
- **Other**: Vivo, Oppo, Poco, Motorola

---

## 🔒 Security Notes (For Production)

⚠️ **Current Implementation (Development Only)**
- Passwords stored in plain text
- No HTTPS verification
- RLS policies are permissive (allow all)

✅ **Before Going to Production**
1. Implement proper password hashing (bcrypt)
2. Use Supabase Auth with JWT tokens
3. Implement proper RLS policies based on user roles
4. Add rate limiting on login attempts
5. Enable HTTPS
6. Audit and harden database queries
7. Add comprehensive error logging
8. Implement password reset flow

---

## 📞 Support & Customization

### Common Customizations
- **Add more device types**: Edit `src/lib/constants.ts` → `DEVICE_TYPES`
- **Add more parts categories**: Edit `src/lib/constants.ts` → `PART_CATEGORIES`
- **Change color scheme**: Edit `tailwind.config.js`
- **Modify technician names**: Update SUPABASE_SCHEMA.sql before first import

### Adding New Features
- Technician availability/schedule
- Customer history & repeat visits
- Payment tracking
- Parts inventory (stock levels)
- Service history reports
- SMS/Email notifications

---

## ✨ Project Status

✅ **Completed**
- React + TypeScript setup
- Supabase integration
- Authentication system
- Admin parts management
- Enhanced ticket creation with parts selection
- Comprehensive device models
- Role-based access control
- Responsive design (mobile, tablet, desktop)

📋 **Ready for Testing**
- All features implemented and compiled
- No errors in code
- Database schema complete
- Demo accounts created

🚀 **Next: Import Schema & Test**

---

## 📖 File Reference

**Frontend Components:**
- `src/pages/Login.tsx` - Login page
- `src/pages/AdminPartsManagement.tsx` - Admin dashboard
- `src/pages/CreateTicket.tsx` - Enhanced ticket creation
- `src/App.tsx` - Main app with auth routing
- `src/components/Navigation.tsx` - Updated with user profile
- `src/lib/constants.ts` - Device types and parts categories

**Database:**
- `SUPABASE_SCHEMA.sql` - Complete database schema with sample data

**Config:**
- `.env.local` - Supabase credentials
- `tailwind.config.js` - Styling configuration
- `package.json` - Dependencies

---

## 🎉 You're All Set!

Everything is ready to go. Your next steps:

1. **Import SUPABASE_SCHEMA.sql** into Supabase
2. **Start the dev server**: `npm run dev`
3. **Test login** with demo credentials
4. **Create a ticket** with parts selection
5. **Access admin panel** to manage parts

Enjoy your Graphix phone repair ticketing system! 🛠️
