export default function FrConditions() {
    return (
        <div className="space-y-6 text-sm text-sub-text">
            <div>
                <h3 className="text-lg font-bold text-white mb-2">1. Acceptation des conditions</h3>
                <p>En accédant et en utilisant <strong>VersuS Code</strong>, vous acceptez d'être lié par les présentes conditions. Si vous n'acceptez pas ces termes, veuillez ne pas utiliser la plateforme.</p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">2. Description du service</h3>
                <p><strong>VersuS Code</strong> est une plateforme de jeu multijoueur permettant l'écriture, la soumission et l'exécution de code C dans un environnement compétitif.</p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">3. Règles de conduite et soumission de code</h3>
                <p className="mb-2">Vous acceptez d'utiliser nos services de manière légale. Il est strictement interdit de :</p>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Soumettre du code conçu pour endommager, perturber ou contourner la sécurité de notre infrastructure (malwares, bombes logiques, minage de cryptomonnaies).</li>
                    <li>Tenter d'accéder au système de fichiers, au réseau interne ou aux données des autres joueurs.</li>
                    <li>Surcharger intentionnellement nos serveurs (Déni de Service).</li>
                </ul>
                <p className="mt-2 italic">Tout comportement de ce type entraînera un bannissement immédiat et définitif de la plateforme.</p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">4. Propriété intellectuelle</h3>
                <p>Vous conservez tous les droits d'auteur sur le code que vous soumettez. Cependant, en soumettant votre code sur <strong>VersuS Code</strong>, vous nous accordez une licence gratuite pour l'exécuter, le stocker et l'afficher aux autres utilisateurs dans le cadre des parties.</p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-2">5. Limitation de responsabilité</h3>
                <p>Le service est fourni "en l'état" et "selon la disponibilité". Nous ne garantissons pas que la plateforme sera exempte de bugs ou d'interruptions. <strong>VersuS Code</strong> ne saurait être tenu responsable des pertes de données, de temps ou des dommages indirects liés à l'utilisation du service.</p>
            </div>
        </div>
    );
}
