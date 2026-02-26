export default function SvConditions() {
    return (
        <div className="space-y-6 text-sm text-sub-text">
            <div>
                <h3 className="text-lg font-bold text-white mb-2">1. Godkännande av villkor</h3>
                <p>Genom att få åtkomst till och använda <strong>VersuS Code</strong> godkänner du att vara bunden av dessa användarvillkor. Om du inte godkänner dessa villkor, vänligen använd inte plattformen.</p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">2. Beskrivning av tjänsten</h3>
                <p><strong>VersuS Code</strong> är en flerspelarplattform som låter användare skriva, skicka in och köra C kod i en konkurrenskraftig miljö.</p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">3. Uppförandekod och inlämning av kod</h3>
                <p className="mb-2">Du samtycker till att använda våra tjänster på ett lagligt sätt. Det är strängt förbjudet att:</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Skicka in kod utformad för att skada, störa eller kringgå säkerheten i vår infrastruktur (skadlig programvara, logiska bomber, utvinning av kryptovaluta).</li>
                    <li>Försöka få åtkomst till filsystemet, det interna nätverket eller andra spelares data.</li>
                    <li>Avsiktligt överbelasta våra servrar (överbelastningsattack / DoS).</li>
                </ul>
                <p className="mt-2 italic">Allt sådant beteende kommer att leda till en omedelbar och permanent avstängning från plattformen.</p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">4. Immateriella rättigheter</h3>
                <p>Du behåller all upphovsrätt till den kod du skickar in. Genom att skicka in din kod till <strong>VersuS Code</strong> ger du oss dock en royaltyfri licens att köra, lagra och visa den för andra användare som en del av spelet.</p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">5. Ansvarsbegränsning</h3>
                <p>Tjänsten tillhandahålls i "befintligt skick" och "i mån av tillgång". Vi garanterar inte att plattformen kommer att vara fri från buggar eller avbrott. <strong>VersuS Code</strong> kan inte hållas ansvarigt för dataförlust, tidsförlust eller indirekta skador som uppstår vid användning av tjänsten.</p>
            </div>
        </div>
    );
}
