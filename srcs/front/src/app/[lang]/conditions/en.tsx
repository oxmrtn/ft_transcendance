export default function EnConditions() {
    return (
        <div className="space-y-6 text-sm text-sub-text">
            <div>
                <h3 className="text-lg font-bold text-white mb-2">1. Acceptance of Terms</h3>
                <p>By accessing and using <strong>VersuS Code</strong>, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform.</p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">2. Description of Service</h3>
                <p><strong>VersuS Code</strong> is a multiplayer gaming platform that allows users to write, submit, and execute C code in a competitive environment.</p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">3. Code of Conduct and Code Submission</h3>
                <p className="mb-2">You agree to use our services lawfully. It is strictly prohibited to:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Submit code designed to damage, disrupt, or bypass the security of our infrastructure (malware, logic bombs, cryptocurrency mining).</li>
                    <li>Attempt to access the file system, internal network, or other players' data.</li>
                    <li>Intentionally overload our servers (Denial of Service).</li>
                </ul>
                <p className="mt-2 italic">Any such behavior will result in an immediate and permanent ban from the platform.</p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">4. Intellectual Property</h3>
                <p>You retain all copyright to the code you submit. However, by submitting your code to <strong>VersuS Code</strong>, you grant us a royalty-free license to execute, store, and display it to other users as part of the gameplay.</p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">5. Limitation of Liability</h3>
                <p>The service is provided on an "as is" and "as available" basis. We do not guarantee that the platform will be bug-free or uninterrupted. <strong>VersuS Code</strong> shall not be held liable for any data loss, time loss, or indirect damages arising from the use of the service.</p>
            </div>
        </div>
    );
}
