export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, name } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                fields: {
                    name: name || ''
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('MailerLite Error:', errorData);
            return res.status(response.status).json({ error: 'Failed to subscribe' });
        }

        const data = await response.json();
        return res.status(200).json({ success: true, message: 'Successfully subscribed' });

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
