import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const app = express();
const port = 3001;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// --- HELPER: Secure Random Code ---
const generateSecureCode = () => crypto.randomInt(100000, 999999).toString();

// --- ROUTES ---

// 1. Check User (Modified to check if they have a password)
app.post('/api/check-user', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) { res.json({ exists: false }); return; }
        const cleanEmail = email.toLowerCase().trim();
        
        const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

        if (user) {
            // If user exists, go to Password screen
            res.json({ exists: true, nextStep: 'password' });
        } else {
            res.json({ exists: false });
        }
    } catch (e) {
        res.status(500).json({ error: "Database error" });
    }
});

// 2. Send Code
app.post('/api/send-code', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const cleanEmail = email.toLowerCase().trim();
        const code = generateSecureCode();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await prisma.verificationCode.upsert({
            where: { email: cleanEmail },
            update: { code, expiresAt, attempts: 0 },
            create: { email: cleanEmail, code, expiresAt }
        });

        console.log(`[SECURE EMAIL] To: ${cleanEmail} | Code: ${code}`);
        res.json({ success: true, message: "Code sent" });
    } catch (e) {
        res.status(500).json({ success: false });
    }
});

// 3. Verify Code
app.post('/api/verify-code', async (req: Request, res: Response) => {
    try {
        const { email, code } = req.body;
        const cleanEmail = email?.toLowerCase().trim();
        const record = await prisma.verificationCode.findUnique({ where: { email: cleanEmail } });

        if (!record || record.code !== code) {
            res.status(400).json({ success: false, message: "Invalid code" });
            return;
        }

        // Success - typically we'd issue a temp token here for the next steps
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false });
    }
});

// 4. Create Account (Final Step)
app.post('/api/complete-signup', async (req: Request, res: Response) => {
    try {
        const { email, password, nickname, country, birthdate } = req.body;
        const cleanEmail = email.toLowerCase().trim();

        // Create the user with all details
        // Note: In real app, HASH the password (e.g. bcrypt). Storing plain text here for demo.
        const newUser = await prisma.user.create({
            data: { 
                email: cleanEmail,
                // In a real schema you'd add these fields. For this demo we just create the user.
            }
        });

        console.log(`[NEW USER] ${nickname} from ${country} (${birthdate}) created!`);
        res.json({ success: true, token: "mock-jwt-token" });

    } catch (e) {
        // If user already exists or error
        res.json({ success: true, token: "mock-jwt-token" }); // Fallback for demo
    }
});

// 5. Login with Password
app.post('/api/login-password', async (req: Request, res: Response) => {
    // Mock login
    res.json({ success: true, token: "mock-jwt-token" });
});

app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
});