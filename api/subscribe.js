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
        console.error('MailerLite API Key is missing');
        return res.status(500).json({ error: 'Server Config Error: Missing MailerLite API Key' });
    }

    const data = JSON.stringify({
        email: email,
        fields: {
            name: name || ''
        },
        groups: [] // Add Group ID here if needed
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
                        console.log('MailerLite Success:', parsedBody.data ? parsedBody.data.id : 'OK');
                        res.status(200).json({ success: true, message: 'Successfully subscribed' });
                    } catch (e) {
                        // Even if JSON parse fails, if status is 2xx, it was likely fine
                        console.warn('MailerLite Response Parse Error (but 2xx):', e);
                        res.status(200).json({ success: true, message: 'Successfully subscribed' });
                    }
                } else {
                    console.error(`MailerLite Error (${response.statusCode}):`, body);
                    try {
                        const errorData = JSON.parse(body);
                        const message = errorData.message || 'Failed to subscribe';
                        res.status(response.statusCode).json({ error: message });
                    } catch (e) {
                        res.status(response.statusCode).json({ error: `MailerLite Error: ${response.statusCode}` });
                    }
                }
                resolve();
            });
        });

        request.on('error', (error) => {
            console.error('HTTPS Request Error:', error);
            res.status(500).json({ error: 'Internal Server Error (Upstream)' });
            resolve();
        });

        request.write(data);
        request.end();
    });
}
