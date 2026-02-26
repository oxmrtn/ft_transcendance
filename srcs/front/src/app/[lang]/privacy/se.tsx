export default function SvPrivacy() {
    return (
        <div className="space-y-6 text-sm text-sub-text">
            <div>
                <h3 className="text-lg font-bold text-white mb-2">1. Insamlade uppgifter</h3>
                <p className="mb-2">När du använder <strong>VersuS Code</strong> samlar vi in följande information:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Kontouppgifter:</strong> Ditt användarnamn och, i förekommande fall, din e-postadress.</li>
                    <li><strong>Speldata:</strong> Den datorkod du skickar in under matcher, dina poäng och din matchhistorik.</li>
                    <li><strong>Teknisk data:</strong> Din IP-adress och grundläggande webbläsarinformation, i säkerhets- och missbrukspreventivt syfte.</li>
                </ul>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">2. Användning av dina uppgifter</h3>
                <p>Dina uppgifter används uteslutande för att driva plattformen, köra din kod i våra isolerade miljöer, upprätthålla topplistor och säkra våra servrar mot attacker eller fusk.</p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">3. Datadelning</h3>
                <p>Vi säljer <strong>aldrig</strong> dina personuppgifter. De delas endast med våra infrastrukturleverantörer (servervärdar) som är bundna av strikta sekretesskrav.</p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">4. Datalagring</h3>
                <p>Vi behåller dina uppgifter så länge ditt konto är aktivt. Tekniska loggar (IP-adresser) raderas automatiskt efter några veckor. Kod som skickats in under matcher kan sparas i anonymiserat format för statistiska ändamål.</p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">5. Dina rättigheter (GDPR)</h3>
                <p>I enlighet med den allmänna dataskyddsförordningen (GDPR) har du rätt att få tillgång till, rätta och radera dina uppgifter. För att utöva dessa rättigheter kan du kontakta oss direkt på: <strong>[Ton Email de Contact]</strong> eller radera ditt konto i inställningarna.</p>
            </div>
        </div>
    );
}
