export default function EnPrivacy() {
    return (
        <div className="space-y-6 text-sm text-sub-text">
            <div>
                <h3 className="text-lg font-bold text-white mb-2">1. Data Collected</h3>
                <p className="mb-2">When you use <strong>VersuS Code</strong>, we collect the following information:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Account Data:</strong> Your username and, if applicable, your email address.</li>
                    <li><strong>Game Data:</strong> The computer code you submit during matches, your scores, and your match history.</li>
                    <li><strong>Technical Data:</strong> Your IP address and basic browser information, for security and abuse prevention purposes.</li>
                </ul>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">2. Use of Your Data</h3>
                <p>Your data is used exclusively to operate the platform, execute your code in our isolated environments, maintain leaderboards, and secure our servers against attacks or cheating.</p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">3. Data Sharing</h3>
                <p>We <strong>never</strong> sell your personal data. It is only shared with our infrastructure providers (server hosting) who are bound by strict confidentiality obligations.</p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">4. Data Retention</h3>
                <p>We retain your data as long as your account is active. Technical logs (IP addresses) are automatically deleted after a few weeks. Code submitted during matches may be kept in an anonymized format for statistical purposes.</p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">5. Your Rights (GDPR)</h3>
                <p>In accordance with the General Data Protection Regulation (GDPR), you have the right to access, rectify, and delete your data. To exercise these rights, you can contact us directly at: <strong>[Ton Email de Contact]</strong> or delete your account from the settings.</p>
            </div>
        </div>
    );
}
