const Sequelize = require("sequelize");
const sequelize = new Sequelize("DBWT19", "root", "root", {
  host: "127.0.0.1",
  dialect: "mysql",
  logging: false
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.osoblje = sequelize.import(__dirname + "/tabele/Osoblje.js");
db.rezervacija = sequelize.import(__dirname + "/tabele/Rezervacija.js");
db.sala = sequelize.import(__dirname + "/tabele/Sala.js");
db.termin = sequelize.import(__dirname + "/tabele/Termin.js");

//To create a One-To-One relationship, the hasOne and belongsTo associations are used together
// Rezervacija - jedan na jedan - Termin - P
db.termin.hasOne(db.rezervacija, {
  as: "opisTerminaRezervacije",
  foreignKey: {
    name: "termin",
    type: Sequelize.INTEGER,
    unique: true
  }
});

db.rezervacija.belongsTo(db.termin, {
  as: "opisTerminaRezervacije",
  foreignKey: {
    name: "termin",
    type: Sequelize.INTEGER,
    unique: true
  }
});

// Sala - jedan na jedan - Osoblje -P
db.osoblje.hasOne(db.sala, {
  as: "odgovornaOsobaSale",
  foreignKey: "zaduzenaOsoba"
});

db.sala.belongsTo(db.osoblje, {
  as: "odgovornaOsobaSale",
  foreignKey: "zaduzenaOsoba"
});

// Osoblje - jedan na više - Rezervacija - P
db.osoblje.hasMany(db.rezervacija, {
  as: "izvrsiocRezervacije",
  foreignKey: "osoba"
});

db.rezervacija.belongsTo(db.osoblje, {
  as: "izvrsiocRezervacije",
  foreignKey: "osoba"
});

// Sala - jedan na više - Rezervacija- P
db.sala.hasMany(db.rezervacija, {
  as: "rezervisanaSala",
  foreignKey: "sala"
});

db.rezervacija.belongsTo(db.sala, {
  as: "rezervisanaSala",
  foreignKey: "sala"
});

module.exports = db;
