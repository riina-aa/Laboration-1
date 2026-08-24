//Laddar upp paket
const { Client } = require("pg");
require("dotenv").config();

const express = require("express");
const app = express();
const port = 3000;

app.set("view engine", "ejs")
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }))

//Skapar databas
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
client.connect((err) => {
    if (err) {
        console.log("Connection error: " + err);
    } else {
        console.log("Connected to database!");
    };
});

//Routing
app.get("/", async (req, res) => { 

    try {
        const profile = await client.query( //Hämtar person-data från databasen
            "SELECT * FROM profile;"
        )
        const courses = await client.query( //Hämtar kurs-data från databasen
            "SELECT * FROM courses WHERE profile_id = 1;"
        )
        res.render("index", { //Renderar startsidan med datan som hämtats
            profile: profile.rows[0],
            courses: courses.rows
        })
    } catch (error) {
        console.log(error)
    }
});

//Routing
app.get("/create", (req, res) => {
    res.render("create", {
        profileErrors: {},
        courseErrors: {}
    })
})

//Routing
app.get("/about", (req, res) => {
    res.render("about");
});

//Tar emot och sparar data från formulär
app.post("/save-profile", async (req, res) => {
    const fname = req.body.fname;
    const lname = req.body.lname;
    const occupation = req.body.occupation;
    const email = req.body.email;
    const telephone = req.body.telephone;
    let profileErrors = {}; 

    //Lägger till felmeddelanden och sparar felen i variabeln profileErrors
    if (fname === "") {
        profileErrors.fname = "Förnamn måste fyllas i och får inte vara tomt."
    }

    if (lname === "") {
        profileErrors.lname = "Efternamn måste fyllas i och får inte vara tomt."
    }

    if (occupation === "") {
        profileErrors.occupation = "Du måste välja arbetstitel."
    }

    if (email === "" || email.includes("@") === false) {
        profileErrors.email = "E-postadressen behöver innehålla ett @."
    }

    if (telephone === "") {
        profileErrors.telephone = "Telefonnummer måste fyllas i och får inte vara tomt."
    }
  
    if (Object.keys(profileErrors).length > 0) { //Om det finns felmeddelanden så renderas sidan med de lagrade felmeddelandena
        res.render("create", {
            profileErrors: profileErrors,
            courseErrors: {}
        });
        return;
    }
       
    try { //Finns inga felmeddelanden så sparas formulärdata i databasen och renderar om sidan
        const result = await client.query(
            "INSERT INTO profile(firstname, lastname, occupation, email, telephone) VALUES($1, $2, $3, $4, $5)", [fname, lname, occupation, email, telephone]
        );
        res.redirect("create");
        return;

    } catch (error) {
        console.log(error)
    }
})

//Tar emot och sparar data från formulär
app.post("/save-course", async (req, res) => {
    const coursename = req.body.coursename;
    const coursecode = req.body.coursecode;
    const syllabus = req.body.syllabus;
    const progression = req.body.progression;
    let courseErrors = {}; 

    //Lägger till felmeddelanden och sparar felen i variabeln profileErrors
    if (coursename === "") {
        courseErrors.coursename = "Kursnamn måste fyllas i och får inte vara tomt."
    }

    if (coursecode === "") {
        courseErrors.coursecode = "Kurskod måste fyllas i och får inte vara tomt."
    }

    if (syllabus === "") {
        courseErrors.syllabus = "Syllabus måste fyllas i och får inte vara tomt."
    }

    if (progression === "") {
        courseErrors.progression = "Du måste välja ett progressionsalternativ."
    }
  
    if (Object.keys(courseErrors).length > 0) { //Om det finns felmeddelanden så renderas sidan med de lagrade felmeddelandena
        res.render("create", {
            courseErrors: courseErrors,
            profileErrors: {}
        });
        return;
    }

    try { //Finns inga felmeddelanden så sparas formulärdata i databasen och renderar om sidan
        const getProfile = await client.query("SELECT profile_id FROM profile;")
        const profile_id = getProfile.rows[0].profile_id;
        const result = await client.query(
            "INSERT INTO courses(profile_id, coursename, coursecode, syllabus, progression) VALUES($1, $2, $3, $4, $5)", [profile_id, coursename, coursecode, syllabus, progression]
        );
        res.redirect("create")
        return;

    } catch (error) {
        console.log(error)
    }
})

//Tar emot data från "radera-formuläret"
app.post("/delete-course", async (req, res) => {
    const courseID = req.body.course_id; 

    await client.query( //Skickar en radera-query till databasen
        "DELETE FROM courses WHERE course_id = $1", [courseID]
    ); 

    res.redirect("/");
})

//Startar applikation
app.listen(process.env.PORT, () => {
    console.log("Server started at http://localhost:" + process.env.PORT);
});

