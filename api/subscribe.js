import admin from 'firebase-admin';

// Prevent initializing the app multiple times in serverless environment
if (!admin.apps.length) {
    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            : undefined;

        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
            throw new Error('Missing Firebase Environment Variables');
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });
        console.log('Firebase Admin Initialized');
    } catch (error) {
        console.error('Firebase Initialization Error:', error);
    }
}

const db = admin.firestore();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, name } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const docRef = db.collection('subscribers').doc(email);

        // Add or merge subscriber data
        await docRef.set({
            email: email,
            name: name || '',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            source: 'website_signup'
        }, { merge: true });

        console.log(`Subscriber added: ${email}`);
        return res.status(200).json({ success: true, message: 'Successfully subscribed' });

    } catch (error) {
        console.error('Firestore Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
