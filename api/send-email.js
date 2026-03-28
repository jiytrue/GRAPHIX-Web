const nodemailer = require('nodemailer');

// All staff email mapping
const TECH_EMAILS = {
  'Jefford Calvo': 'jeffordcalvo02@gmail.com',
  'Jhondel Virtudazo': 'jhondelvirtudazo@gmail.com',
  'Mark Saludares': 'saludaresmarky@gmail.com',
};

const WORKER_EMAILS = {
  'Kent': 'aprilkentwagalazo@gmail.com',
  'Krissha': 'casino.krissha22@gmail.com',
  'Karin': 'karintudtud@gmail.com',
  'Jetrho': 'jetrwu@gmail.com',
};

const ALL_STAFF_EMAILS = [
  ...Object.values(TECH_EMAILS),
  ...Object.values(WORKER_EMAILS),
];

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'jetrwu@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'ywyz pydj dldw ejta',
  },
});

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { technicianName, ticketId, customerName, deviceType, deviceModel, issueDescription, assignedTechnician, amountToPay, notifyAll } = req.body;

    if (!ticketId) {
      return res.status(400).json({ error: 'Missing ticket ID' });
    }

    let recipients;
    let subject;
    let heading;

    if (notifyAll) {
      // Send to ALL staff
      recipients = ALL_STAFF_EMAILS.join(', ');
      subject = `🔧 New Ticket Created - #${ticketId}`;
      heading = 'New Ticket Created';
    } else {
      // Send to specific technician
      const techEmail = TECH_EMAILS[technicianName];
      if (!techEmail) {
        return res.status(200).json({ message: 'No email found for technician, skipped', skipped: true });
      }
      recipients = techEmail;
      subject = `🔧 Repair Assigned to You - Ticket #${ticketId}`;
      heading = 'New Repair Assignment';
    }

    const techName = assignedTechnician || technicianName || 'Unassigned';

    const mailOptions = {
      from: `"Graphix Repair System" <${process.env.GMAIL_USER || 'jetrwu@gmail.com'}>`,
      to: recipients,
      subject: subject,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px;">
          <div style="background: #7f1d1d; color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Graphix Phone Repair</h1>
            <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">${heading}</p>
          </div>
          <div style="background: white; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
            <p style="margin: 0 0 20px; color: #475569; font-size: 14px;">
              A ${notifyAll ? 'new repair ticket has been created' : 'repair ticket has been assigned to <strong>' + techName + '</strong>'}. Details below:
            </p>
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 12px 6px 0; color: #64748b; font-size: 13px; font-weight: 600;">Ticket ID</td>
                  <td style="padding: 6px 0; color: #7f1d1d; font-size: 18px; font-weight: bold;">#${ticketId}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px 6px 0; color: #64748b; font-size: 13px; font-weight: 600;">Customer</td>
                  <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${customerName || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px 6px 0; color: #64748b; font-size: 13px; font-weight: 600;">Device</td>
                  <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${deviceType || ''} ${deviceModel ? '- ' + deviceModel : ''}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px 6px 0; color: #64748b; font-size: 13px; font-weight: 600;">Issue</td>
                  <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${issueDescription || 'See system for details'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px 6px 0; color: #64748b; font-size: 13px; font-weight: 600;">Assigned To</td>
                  <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${techName}</td>
                </tr>
                ${amountToPay ? `
                <tr>
                  <td style="padding: 6px 12px 6px 0; color: #64748b; font-size: 13px; font-weight: 600;">Amount</td>
                  <td style="padding: 6px 0; color: #059669; font-size: 16px; font-weight: bold;">₱${parseFloat(amountToPay).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
              This is an automated notification from Graphix Repair System.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
};
