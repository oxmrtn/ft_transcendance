const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

async function initializeDatabase(dbPath) {
    let db;
    try {
        db = await sqlite.open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        console.log(`Database opened successfully at ${dbPath}`);

        await createTables(db);
        console.log("All tables created successfully with foreign keys.");
        
        return db;

    } catch (error) {
        console.error("Error during database initialization:", error);
        if (db) await db.close();
        process.exit(1);
    }
}


async function createTables(db) {
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(100),
            first_name VARCHAR(100),
            password_hash VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS game (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            start_time DATETIME NOT NULL,
            end_time DATETIME,
            winner_id INTEGER,
            FOREIGN KEY (winner_id) REFERENCES users(id)
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS tournament (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            creator INTEGER,
            name VARCHAR(255) NOT NULL,
            start_date DATETIME,
            end_date DATETIME,
            winner_id INTEGER,
            FOREIGN KEY (creator) REFERENCES users(id),
            FOREIGN KEY (winner_id) REFERENCES users(id)
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS game_participants (
            game_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            score INTEGER NOT NULL,
            PRIMARY KEY (game_id, user_id),
            FOREIGN KEY (game_id) REFERENCES game(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS tournament_users (
            id_user INTEGER NOT NULL,
            id_tournament INTEGER NOT NULL,
            PRIMARY KEY (id_user, id_tournament),
            FOREIGN KEY (id_user) REFERENCES users(id),
            FOREIGN KEY (id_tournament) REFERENCES tournament(id)
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS friends (
            id_user INTEGER NOT NULL,
            id_friend INTEGER NOT NULL,
            PRIMARY KEY (id_user, id_friend),
            FOREIGN KEY (id_user) REFERENCES users(id),
            FOREIGN KEY (id_friend) REFERENCES users(id)
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS tournament_games (
            tournament_id INTEGER NOT NULL,
            game_id INTEGER NOT NULL,
            round_number INTEGER,
            PRIMARY KEY (tournament_id, game_id),
            FOREIGN KEY (tournament_id) REFERENCES tournament(id),
            FOREIGN KEY (game_id) REFERENCES game(id)
        );
    `);
}

module.exports = { initializeDatabase };