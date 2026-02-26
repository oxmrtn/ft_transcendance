export default function FrPrivacy() {
    return (
        <div className="space-y-6 text-sm text-sub-text">
            <div>
                <h3 className="text-lg font-bold text-white mb-2">1. Données collectées</h3>
                <p className="mb-2">Lors de votre utilisation de <strong>VersuS Code</strong>, nous collectons les informations suivantes :</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Données de compte :</strong> Votre pseudonyme et, le cas échéant, votre adresse e-mail.</li>
                    <li><strong>Données de jeu :</strong> Le code informatique que vous soumettez lors des parties, vos scores et votre historique de matchs.</li>
                    <li><strong>Données techniques :</strong> Votre adresse IP et des informations basiques sur votre navigateur, à des fins de sécurité et de prévention des abus.</li>
                </ul>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">2. Utilisation de vos données</h3>
                <p>Vos données sont utilisées exclusivement pour faire fonctionner la plateforme, exécuter votre code dans nos environnements isolés, établir les classements, et assurer la sécurité de nos serveurs contre les attaques ou la triche.</p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">3. Partage des données</h3>
                <p>Nous ne vendons <strong>jamais</strong> vos données personnelles. Elles ne sont partagées qu'avec nos prestataires d'infrastructure (hébergement des serveurs) qui sont tenus à de strictes obligations de confidentialité.</p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">4. Conservation des données</h3>
                <p>Nous conservons vos données tant que votre compte est actif. Les logs techniques (adresses IP) sont supprimés automatiquement après quelques semaines. Le code soumis lors des parties peut être conservé de manière anonymisée à des fins statistiques.</p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">5. Vos droits (RGPD)</h3>
                <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ces droits, vous pouvez nous contacter directement à l'adresse suivante : <strong>[Ton Email de Contact]</strong> ou supprimer votre compte depuis les paramètres.</p>
            </div>
        </div>
    );
}
