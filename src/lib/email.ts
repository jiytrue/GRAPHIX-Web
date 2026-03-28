// Send email notification to technician when assigned to a ticket
export const sendTechnicianEmail = async (data: {
  technicianName: string
  ticketId: string
  customerName: string
  deviceType: string
  deviceModel?: string
  issueDescription: string
}) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await response.json()
    if (!response.ok) {
      console.error('Email API error:', result)
    }
    return result
  } catch (error) {
    // Don't block the main flow if email fails
    console.error('Failed to send email notification:', error)
    return null
  }
}

// Send email notification to ALL staff when a ticket is created
export const sendTicketCreatedEmail = async (data: {
  ticketId: string
  customerName: string
  deviceType: string
  deviceModel?: string
  issueDescription: string
  assignedTechnician?: string
  amountToPay?: string
}) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        notifyAll: true, // flag to send to all staff
      }),
    })
    const result = await response.json()
    if (!response.ok) {
      console.error('Email API error:', result)
    }
    return result
  } catch (error) {
    console.error('Failed to send ticket created email:', error)
    return null
  }
}
