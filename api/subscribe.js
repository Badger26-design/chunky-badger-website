import https from 'https';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, name } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const apiKey = process.env.MAILERLITE_API_KEY;

    if (!apiKey) {
        console.error('Configuration Error: MAILERLITE_API_KEY is missing');
        return res.status(500).json({ error: 'Server Config Error: Missing API Key' });
    }

    const data = JSON.stringify({
        email: email,
        fields: {
            name: name || ''
        }
    });

    const options = {
        hostname: 'connect.mailerlite.com',
        path: '/api/subscribers',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`,
            'Accept': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    return new Promise((resolve, reject) => {
        const request = https.request(options, (response) => {
            let body = '';

            response.on('data', (chunk) => {
                body += chunk;
            });

            response.on('end', () => {
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    try {
                        const parsedBody = JSON.parse(body);
                        res.status(200).json({ success: true, message: 'Successfully subscribed', data: parsedBody });
                    } catch (e) {
                        res.status(200).json({ success: true, message: 'Successfully subscribed (raw response)' });
                    }
                    resolve();
                } else {
                    console.error('MailerLite Error Status:', response.statusCode);
                    console.error('MailerLite Error Body:', body);

                    try {
                        const errorJson = JSON.parse(body);
                        res.status(response.statusCode).json({ error: errorJson.message || 'Failed to subscribe' });
                    } catch (e) {
                        res.status(response.statusCode).json({ error: body || 'Failed to subscribe' });
                    }
                    resolve();
                }
            });
        });

        request.on('error', (error) => {
            console.error('Server Error:', error);
            res.status(500).json({ error: 'Internal server error' });
            resolve();
        });

        request.write(data);
        request.end();
    });
}
