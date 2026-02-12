import admin from 'firebase-admin';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, name } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    // Initialize Firebase inside handler to catch errors gracefully
    if (!admin.apps.length) {
        try {
            const projectId = process.env.FIREBASE_PROJECT_ID;
            const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
            // Handle both escaped newlines (from Vercel env vars) and regular newlines, and remove quotes if present
            const privateKey = process.env.FIREBASE_PRIVATE_KEY
                ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '')
                : undefined;

            if (!projectId || !clientEmail || !privateKey) {
                console.error('Missing Env Vars', { projectId: !!projectId, clientEmail: !!clientEmail, privateKey: !!privateKey });
                return res.status(500).json({ error: 'Server Config Error: Missing Firebase Credentials' });
            }

            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
            console.log('Firebase Admin Initialized Successfully');
        } catch (error) {
            console.error('Firebase Initialization Error:', error);
            return res.status(500).json({ error: `Firebase Init Failed: ${error.message}` });
        }
    }

    const db = admin.firestore();

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
        return res.status(500).json({ error: `Database Error: ${error.message}` });
    }
}
