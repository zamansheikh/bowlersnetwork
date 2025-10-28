// Shared OTP store for verification codes
// In production, replace this with Redis or a database

interface OTPData {
    code: string;
    timestamp: number;
}

class OTPStore {
    private store: Map<string, OTPData>;
    private readonly EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

    constructor() {
        this.store = new Map();
    }

    // Generate a 6-digit OTP
    generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Store OTP for an email
    set(email: string, code: string): void {
        this.store.set(email.toLowerCase(), {
            code,
            timestamp: Date.now()
        });
        this.cleanupExpired();
    }

    // Get OTP data for an email
    get(email: string): OTPData | undefined {
        const data = this.store.get(email.toLowerCase());

        // Check if expired
        if (data && Date.now() - data.timestamp > this.EXPIRY_TIME) {
            this.delete(email);
            return undefined;
        }

        return data;
    }

    // Delete OTP for an email
    delete(email: string): void {
        this.store.delete(email.toLowerCase());
    }

    // Check if OTP exists and is valid
    isValid(email: string, code: string): boolean {
        const data = this.get(email);
        return data !== undefined && data.code === code;
    }

    // Clean up expired OTPs
    private cleanupExpired(): void {
        const now = Date.now();
        for (const [email, data] of this.store.entries()) {
            if (now - data.timestamp > this.EXPIRY_TIME) {
                this.store.delete(email);
            }
        }
    }

    // Get expiry time in milliseconds
    getExpiryTime(): number {
        return this.EXPIRY_TIME;
    }
}

// Export singleton instance
export const otpStore = new OTPStore();
