const fastify = require('fastify')({ 
    logger: true 
}); 
const path = require('path');
const { initializeDatabase } = require('./db_init');
const port = 3000;


const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'pong.sqlite');

let db;

async function main() {
    // 1. Initialiser la base de données (crée les tables si elles n'existent pas)
    db = await initializeDatabase(DB_PATH);

    // 2. Configurer les middlewares et les routes 
    // Fastify gère nativement le parsing du corps JSON et l'encapsulation de la réponse

    // Route de test de la base de données (lecture)
    fastify.get('/api/users', async (request, reply) => {
        try {
            // Utilisation de db.all pour récupérer les données
            const users = await db.all("SELECT id, username, email FROM users");
            return users; // Fastify gère automatiquement la sérialisation JSON
        } catch (error) {
            console.error(error);
            // Utiliser reply.code() et reply.send() pour gérer les erreurs
            reply.code(500).send("Erreur de base de données");
        }
    });

    // ----------------------------------------------------------------------
    // Route de Test : Insertion utilisateur/tournoi
    // ----------------------------------------------------------------------
    fastify.get('/api/full-test-setup', async (request, reply) => {
        if (!db) {
            reply.code(500).send({ status: "error", message: "Database not initialized." });
            return;
        }
    
        const testTime = new Date().toISOString();
        let newUserId, newTournamentId;
        
        // --- 1. Insertion de l'Utilisateur de Test ---
        const userData = {
            username: "test_creator_" + Date.now(),
            name: "Test",
            first_name: "User",
            password_hash: "hashed_test_password",
            email: `test_user_${Date.now()}@pong.com`
        };

        try {
            const userResult = await db.run(
                `INSERT INTO users (username, name, first_name, password_hash, email)
                 VALUES (?, ?, ?, ?, ?)`,
                [userData.username, userData.name, userData.first_name, userData.password_hash, userData.email]
            );
            newUserId = userResult.lastID;
            
        } catch (error) {
            console.error("Erreur insertion utilisateur:", error);
            reply.code(500).send({ status: "error", step: "User Insert", message: error.message });
            return;
        }

        // --- 2. Insertion du Tournoi et Liaison ---
        try {
            const tournamentName = `Test Tournament ${newUserId}`;
            
            const tournamentResult = await db.run(
                `INSERT INTO tournament (creator, name, start_date)
                 VALUES (?, ?, ?)`,
                [newUserId, tournamentName, testTime]
            );
            newTournamentId = tournamentResult.lastID;
            
            await db.run(
                `INSERT INTO tournament_users (id_user, id_tournament)
                 VALUES (?, ?)`,
                [newUserId, newTournamentId]
            );

        } catch (error) {
            console.error("Erreur insertion tournoi/liaison:", error);
            reply.code(500).send({ status: "error", step: "Tournament Insert/Link", message: error.message });
            return;
        }

        // --- 3. Lecture et Confirmation ---
        try {
            const check = await db.get(
                `SELECT 
                    t.name AS tournament_name,
                    u.username AS creator_username,
                    tu.id_user AS participant_id
                 FROM tournament t
                 JOIN users u ON t.creator = u.id
                 JOIN tournament_users tu ON t.id = tu.id_tournament
                 WHERE t.id = ?`,
                [newTournamentId]
            );

            // Retour direct de l'objet, Fastify l'envoie en JSON
            return {
                status: "success",
                message: "Mise en place réussie : Utilisateur, Tournoi, et Liaison confirmés.",
                data: check
            }; 
            
        } catch (error) {
            console.error("Erreur de lecture:", error);
            reply.code(500).send({ status: "error", step: "Read Check", message: error.message });
        }
    });

    // 3. Lancer le serveur Fastify (Utilise fastify.listen)
    try {
        await fastify.listen({ port: port, host: '0.0.0.0' }); // '0.0.0.0' est nécessaire dans Docker
        console.log(`Fastify Backend listening at http://localhost:${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

main();