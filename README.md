# Graphix Phone Repair Ticketing System

A modern, responsive web-based ticketing system for phone repair shops, built with React, Vite, and Supabase.

## Features

- **Create Tickets**: Simple form to create new repair tickets with customer and device information
- **Ticket Dashboard**: View all tickets with real-time status updates
- **Status Tracking**: Track ticket progress through pending, in-progress, on-hold, and completed states
- **Technician Assignment**: Assign tickets to available technicians
- **Printable Labels**: Generate and print ticket IDs for attaching to phones
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates**: Powered by Supabase for instant data synchronization
- **Cost Estimation**: Add estimated repair costs to tickets
- **Notes & Comments**: Add internal notes to tickets

## Tech Stack

- **Frontend**: React 18.3 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3.4
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Environment**: Node.js + npm

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account with a project created

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Setup Supabase Database

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `SUPABASE_SCHEMA.sql`
5. Click "Run" to execute the SQL

Your database is now ready!

### Step 3: Configure Environment Variables

1. Create a `.env.local` file in the project root
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these credentials in:
- Supabase Dashboard → Settings → API
- Project URL: Copy from the "Project URL" field
- Anon Key: Copy from the "anon public" key

### Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
graphix/
├── src/
│   ├── components/
│   │   ├── Navigation.tsx      # Top navigation bar
│   │   ├── TicketCard.tsx      # Individual ticket display
│   │   └── StatusFilter.tsx    # Filter dropdown for statuses
│   ├── pages/
│   │   ├── Dashboard.tsx       # Main dashboard view
│   │   ├── CreateTicket.tsx    # New ticket form
│   │   └── TicketDetail.tsx    # Ticket details & editing
│   ├── lib/
│   │   └── supabase.ts         # Supabase client configuration
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # React entry point
│   └── index.css               # Global styles
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── SUPABASE_SCHEMA.sql         # Database schema
```

## Usage

### Creating a New Ticket

1. Click the **"+ New Ticket"** button in the top right
2. Fill in customer information (name, phone)
3. Select device type and describe the issue
4. Assign a technician (optional)
5. Click **"Create Ticket"**
6. Print the generated ticket ID label
7. Attach the label to the back of the phone

### Managing Tickets

- **Dashboard**: View all tickets with status indicators
- **Filter**: Filter tickets by status or assigned technician
- **View Details**: Click on a ticket card to view full details
- **Edit**: Click "Edit" to update ticket status, notes, and cost estimate
- **Print**: Print a ticket label for reference

### Updating Ticket Status

1. Click on a ticket to view details
2. Click **"Edit"** button
3. Update the status from the dropdown
4. Click **"Save Changes"**
5. Ticket status will update in real-time

## Built-in Technicians

The following technicians are pre-configured:
- Jefford Calvo
- Jhondel Virtudazo  
- Mark Saludares
- Mohammad

You can add more technicians by running an INSERT query in Supabase SQL Editor:

```sql
INSERT INTO technicians (name, active) VALUES ('Technician Name', true);
```

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Deployment Options

### Option 1: Vercel (Recommended for Free Hosting)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
5. Deploy!

### Option 2: Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Choose "New site from Git"
4. Select your repository
5. Build command: `npm run build`
6. Publish directory: `dist`
7. Add environment variables
8. Deploy!

### Option 3: Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Troubleshooting

### Cannot connect to Supabase

- Verify your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check that the `.env.local` file exists and has correct formatting
- Restart the dev server after adding environment variables

### RLS Policy Errors

If you see permission denied errors:
1. Go to Supabase Dashboard → Policies
2. Verify that row-level security policies allow your operations
3. You can temporarily disable RLS for testing (not recommended for production)

### Database tables not appearing

- Run the SQL schema again in the SQL Editor
- Check for syntax errors in the SQL

## Contributing

Feel free to fork and submit pull requests for any improvements!

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please open an issue on the GitHub repository.

---

**Made with ❤️ for Graphix Phone Repair Shop**
