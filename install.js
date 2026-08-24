//Laddar ner paket
const { Client } = require("pg");
require("dotenv").config(); 

//Skapar en ny databas
const client = new Client({
    host: process.env.DB_HOST, 
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE, 
    ssl: {
        rejectUnauthorized: false,
    },
});

//Kopplar upp mot databas
client.connect((err ) => {
     if (err) {
        console.log("Connection error: " + err);
    } else {
        console.log("Connected to database!");
        createTables(); 
    };
}); 

//Skapar tabeller i databasen
async function createTables() {

    try {
        const res = await client.query(`
            DROP TABLE IF EXISTS courses; 
            DROP TABLE IF EXISTS profile; 
            CREATE TABLE IF NOT EXISTS profile (
                profile_id SERIAL PRIMARY KEY,
                firstname TEXT NOT NULL,
                lastname TEXT NOT NULL,
                occupation TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE, 
                telephone TEXT NOT NULL
                 );
            CREATE TABLE IF NOT EXISTS courses (
                course_id SERIAL PRIMARY KEY,
                profile_id INTEGER NOT NULL, 
                coursename TEXT NOT NULL, 
                coursecode TEXT NOT NULL, 
                syllabus TEXT NOT NULL, 
                progression TEXT NOT NULL, 
                
                FOREIGN KEY (profile_id)
                    REFERENCES profile(profile_id)
                    ON DELETE CASCADE
                );
        `)
    } catch (err) {
        console.log(err)
    } finally {
        await client.end()
    }
}