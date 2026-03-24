export const SAMPLE_INCIDENTS = [
    {
      title: 'VPN authentication failing after password reset',
      description:
        'User reset their Active Directory password yesterday per the 90-day policy. Email and Teams work fine, but VPN client shows "authentication failed" on every attempt. Restarted laptop twice. Working remotely and cannot access internal systems.',
      affected_service: 'VPN',
      requester: 'Jane Doe',
      environment: 'Remote',
    },
    {
      title: 'Shared mailbox not loading in Outlook',
      description:
        'The finance team shared mailbox stopped appearing in Outlook this morning for 3 of 5 team members. OWA shows the mailbox fine. No recent permission changes known. Urgent because month-end invoices come to this mailbox.',
      affected_service: 'Email',
      requester: 'Tom Chen',
      environment: 'Office',
    },
    {
      title: 'Cannot install approved software from company portal',
      description:
        'Getting error 0x80070005 access denied when trying to install Visio from the company software portal. I am listed as approved for this software in the asset system. A colleague on the same team installed it fine last week.',
      affected_service: 'Software',
      requester: 'Priya Sharma',
      environment: 'Laptop',
    },
  ]