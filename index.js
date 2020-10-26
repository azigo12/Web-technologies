const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

var dosadasnjaZauzeca = { vanredna: [], periodicna: [] };
var predavacKojiJeZauzeo = "";

const db = require("./db.js");
db.sequelize.sync({ force: true }).then(function() {
  inicializacija()
    .then(function() {
      console.log("Gotovo kreiranje tabela i ubacivanje pocetnih podataka!");
    })
    .catch(e => {
      console.log("greska ", e);
    });
});

function inicializacija() {
  var promises = [];

  return new Promise(function(resolve, reject) {
    //unosimo tabelu OSOBLJE
    promises.push(
      db.osoblje.findOrCreate({
        where: { ime: "Neko", prezime: "Nekić", uloga: "profesor" }
      })
    );

    promises.push(
      db.osoblje.findOrCreate({
        where: { ime: "Drugi", prezime: "Neko", uloga: "asistent" }
      })
    );

    promises.push(
      db.osoblje.findOrCreate({
        where: { ime: "Test", prezime: "Test", uloga: "asistent" }
      })
    );

    //unosimo tabelu SALA
    promises.push(db.sala.findOrCreate({ where: { naziv: "1-11" } }));
    promises.push(db.sala.findOrCreate({ where: { naziv: "1-15" } }));

    //unosimo tabelu TERMIN
    promises.push(
      db.termin.findOrCreate({
        where: {
          redovni: false,
          dan: null,
          datum: "01.01.2020",
          semestar: null,
          pocetak: "12:00",
          kraj: "13:00"
        }
      })
    );

    promises.push(
      db.termin.findOrCreate({
        where: {
          redovni: true,
          dan: 0,
          datum: null,
          semestar: "zimski",
          pocetak: "13:00",
          kraj: "14:00"
        }
      })
    );

    //unosimo tabelu REZERVACIJA
    promises.push(db.rezervacija.findOrCreate({ where: { id: 1 } }));
    promises.push(db.rezervacija.findOrCreate({ where: { id: 2 } }));

    Promise.all(promises)
      .then(function(data) {
        data[3][0].setOdgovornaOsobaSale(data[0][0]);
        data[4][0].setOdgovornaOsobaSale(data[1][0]);

        data[7][0].setRezervisanaSala(data[3][0]);
        data[7][0].setOpisTerminaRezervacije(data[5][0]);
        data[7][0].setIzvrsiocRezervacije(data[0][0]);

        data[8][0].setRezervisanaSala(data[3][0]);
        data[8][0].setOpisTerminaRezervacije(data[6][0]);
        data[8][0].setIzvrsiocRezervacije(data[2][0]);
      })
      .catch(function(err) {
        console.log("Greska " + err);
      });
  }).catch(function(err) {
    console.log("Greska " + err);
  });
}

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/pocetna.html"));
});

app.get("/zauzeca", (req, res) => {
  fs.readFile("zauzeca.json", function(err, podaci) {
    res.send(JSON.parse(podaci.toString()));
  });
});

function dajSvaZauzeca(callback) {
  dosadasnjaZauzeca = { vanredna: [], periodicna: [] };
  db.rezervacija
    .findAll({
      include: [
        {
          model: db.osoblje,
          as: "izvrsiocRezervacije"
        },
        {
          model: db.sala,
          as: "rezervisanaSala"
        },
        {
          model: db.termin,
          as: "opisTerminaRezervacije"
        }
      ]
    })
    .then(function(svaZauzeca) {
      for (let i = 0; i < svaZauzeca.length; i++) {
        if (svaZauzeca[i].opisTerminaRezervacije != null) {
          if (svaZauzeca[i].opisTerminaRezervacije.redovni == true) {
            //dan semestar pocetak kraj naziv predavac
            let dan = svaZauzeca[i].opisTerminaRezervacije.dan;
            let semestar = svaZauzeca[i].opisTerminaRezervacije.semestar;
            let pocetak = svaZauzeca[i].opisTerminaRezervacije.pocetak.substr(
              0,
              5
            );
            let kraj = svaZauzeca[i].opisTerminaRezervacije.kraj.substr(0, 5);
            let naziv = svaZauzeca[i].rezervisanaSala.naziv;
            let predavac =
              svaZauzeca[i].izvrsiocRezervacije.ime +
              " " +
              svaZauzeca[i].izvrsiocRezervacije.prezime;
            dosadasnjaZauzeca.periodicna.push({
              dan: dan,
              semestar: semestar,
              pocetak: pocetak,
              kraj: kraj,
              naziv: naziv,
              predavac: predavac
            });
          } else if (svaZauzeca[i].opisTerminaRezervacije.redovni == false) {
            let datum = svaZauzeca[i].opisTerminaRezervacije.datum;
            let pocetak = svaZauzeca[i].opisTerminaRezervacije.pocetak.substr(
              0,
              5
            );
            let kraj = svaZauzeca[i].opisTerminaRezervacije.kraj.substr(0, 5);
            let naziv = svaZauzeca[i].rezervisanaSala.naziv;
            let predavac =
              svaZauzeca[i].izvrsiocRezervacije.ime +
              " " +
              svaZauzeca[i].izvrsiocRezervacije.prezime +
              " " +
              svaZauzeca[i].izvrsiocRezervacije.uloga;
            dosadasnjaZauzeca.vanredna.push({
              datum: datum,
              pocetak: pocetak,
              kraj: kraj,
              naziv: naziv,
              predavac: predavac
            });
          }
        }
      }
      callback(dosadasnjaZauzeca);
    });
}

app.get("/dosadasnjaZauzeca", (req, res) => {
  dajSvaZauzeca(function(dosadasnjaZauzeca) {
    res.send(dosadasnjaZauzeca);
  });
});

app.use(
  session({
    secret: "sesija",
    resave: true,
    saveUninitialized: true
  })
);

app.get("/images", function(req, res) {
  fs.readdir("./images", function(err, items) {
    res.write(JSON.stringify(items));
    let sveSlike = [];
    for (let i = 0; i < items.length; i++) {
      let slika = { naziv: items[i], vrijednost: 0 };
      sveSlike.push(slika);
    }
    req.session.images = sveSlike;
    res.send();
  });
});

app.get("/osoblje", (req, res) => {
  db.osoblje.findAll().then(rez => {
    res.send(JSON.stringify(rez));
    //res.json(rez);
  });
});

app.get("/sveSale", (req, res) => {
  db.sala.findAll().then(rez => {
    res.send(JSON.stringify(rez));
    //res.json(rez);
  });
});

app.get("/sl", (req, res) => {
  res.sendFile(__dirname + "/images/" + dajMogucuSliku(req.session.images));
});

function dajMogucuSliku(sveSlike) {
  for (let i = 0; i < sveSlike.length; i++) {
    if (sveSlike[i].vrijednost == 0) {
      sveSlike[i].vrijednost = 1;
      return sveSlike[i].naziv;
    }
  }
}

app.post("/dodajZauzeca", function(req, res) {
  dajSvaZauzeca(function(dosadasnjaZauzeca) {
    let zahtjev = req.body;
    zahtjev = JSON.stringify(zahtjev);
    let periodicna = jeLiIspravnaPeriodicna(zahtjev);
    let vanredna = jeLiIspravnaVanredna(zahtjev);
    let mogucePeriodicnoZauzet = false;
    let moguceVanrednoZauzet = false;
    let datumZaIspis;

    if (periodicna) {
      datumZaIspis = "mjesec (periodicno)";
      mogucePeriodicnoZauzet = jeLiMogucePeriodicnoZauzet(
        zahtjev,
        dosadasnjaZauzeca
      );
    }

    if (vanredna) {
      datumZaIspis = "datum " + zahtjev["datum"];
      moguceVanrednoZauzet = jeLiMoguceVanrednoZauzet(
        zahtjev,
        dosadasnjaZauzeca
      );
    }

    if (periodicna && mogucePeriodicnoZauzet) {
      dosadasnjaZauzeca["periodicna"].push(JSON.parse(zahtjev));
      dodajUBazu(zahtjev, "periodicno", function() {
        res.json({ zauzeca: dosadasnjaZauzeca, err: undefined });
      });
    } else if (vanredna && moguceVanrednoZauzet) {
      dosadasnjaZauzeca["vanredna"].push(JSON.parse(zahtjev));
      dodajUBazu(zahtjev, "vanredno", function() {
        res.json({ zauzeca: dosadasnjaZauzeca, err: undefined });
      });
    } else {
      zahtjev = JSON.parse(zahtjev);
      let dijeloviImena = predavacKojiJeZauzeo.split(" ");
      let ime = dijeloviImena[0];
      let prezime = dijeloviImena[1];
      let uloga = dijeloviImena[2];
      let greska =
        "Nije moguće rezervisati salu " +
        zahtjev["naziv"] +
        " za navedeni " +
        datumZaIspis +
        " i termin od " +
        zahtjev["pocetak"] +
        " do " +
        zahtjev["kraj"] +
        "! Salu je rezervisao " +
        ime +
        " " +
        prezime +
        " (" +
        uloga +
        ").";
      res.json({ zauzeca: undefined, err: greska });
    }
  });
});

function dodajUBazu(zahtjev, vrstaZauzeca, callback) {
  zahtjev = JSON.parse(zahtjev);
  var promises = [];
  let dijeloviImena = zahtjev["predavac"].split(" ");
  let ime = dijeloviImena[0];
  let prezime = dijeloviImena[1];
  let uloga = dijeloviImena[2];
  if (uloga == undefined) uloga = null;

  let naziv = zahtjev["naziv"];
  let zaduzenaOsoba = null;
  let pocetak = zahtjev["pocetak"];
  let kraj = zahtjev["kraj"];
  let dan, datum;

  let redovni;
  if (vrstaZauzeca === "periodicno") {
    redovni = true;
    dan = zahtjev["dan"];
    datum = null;
    semestar = zahtjev["semestar"];
  } else {
    redovni = false;
    datum = zahtjev["datum"];
    dan = null;
    semestar = null;
  }

  promises.push(
    db.termin.create({
      redovni: redovni,
      dan: dan,
      datum: datum,
      semestar: semestar,
      pocetak: pocetak,
      kraj: kraj
    })
  );

  promises.push(db.sala.findOrCreate({ where: { naziv: naziv } }));
  promises.push(
    db.osoblje.findOrCreate({
      where: { ime: ime, prezime: prezime }
    })
  );
  promises.push(db.rezervacija.create({}));

  Promise.all(promises)
    .then(function(result) {
      result[0].setOpisTerminaRezervacije(result[3]);
      result[1][0].addRezervisanaSala([result[3]]);
      result[2][0].addIzvrsiocRezervacije([result[3]]);
      callback();
    })
    .catch(function(err) {
      console.log("Greska pri dodavanju " + err);
    });
}

function jeLiMoguceVanrednoZauzet(zahtjev, podaci) {
  zahtjev = JSON.parse(zahtjev);
  let kolonaZauzeca = dajKolonuZauzeca(zahtjev["datum"]);

  //prvo provjerimo da li u vanrednim zauzecima postoji sala sa istim nazivom, istim datumom kao i ona iz zahtjeva
  //te da li se njihova vremena zauzeca poklapaju
  for (let i = 0; i < podaci.vanredna.length; i++) {
    if (
      podaci.vanredna[i].naziv === zahtjev["naziv"] &&
      podaci.vanredna[i].datum == zahtjev["datum"] &&
      kolizijaTermina(
        podaci.vanredna[i].pocetak,
        podaci.vanredna[i].kraj,
        zahtjev["pocetak"],
        zahtjev["kraj"]
      )
    ) {
      predavacKojiJeZauzeo = podaci.vanredna[i].predavac;
      return false;
    }
  }
  let semestarZahtjeva = dajSemestarZahtjeva(zahtjev["datum"]);
  for (let i = 0; i < podaci.periodicna.length; i++) {
    if (
      podaci.periodicna[i].naziv == zahtjev["naziv"] &&
      podaci.periodicna[i].semestar == semestarZahtjeva &&
      kolizijaTermina(
        podaci.vanredna[i].pocetak,
        podaci.vanredna[i].kraj,
        zahtjev["pocetak"],
        zahtjev["kraj"]
      ) &&
      dajKolonuZauzeca(zahtjev["datum"]) == podaci.vanredna[i].dan
    ) {
      predavacKojiJeZauzeo = podaci.periodicna[i].predavac;
      return false;
    }
  }
  return true;
}

function jeLiMogucePeriodicnoZauzet(zahtjev, podaci) {
  zahtjev = JSON.parse(zahtjev);
  for (let i = 0; i < podaci.periodicna.length; i++) {
    if (
      podaci.periodicna[i].naziv == zahtjev["naziv"] &&
      podaci.periodicna[i].semestar == zahtjev["semestar"] &&
      podaci.periodicna[i].dan == zahtjev["dan"] &&
      kolizijaTermina(
        podaci.periodicna[i].pocetak,
        podaci.periodicna[i].kraj,
        zahtjev["pocetak"],
        zahtjev["kraj"]
      )
    ) {
      predavacKojiJeZauzeo = podaci.periodicna[i].predavac;
      return false;
    }
  }
  for (let i = 0; i < podaci.vanredna.length; i++) {
    if (
      podaci.vanredna[i].naziv == zahtjev["naziv"] &&
      dajSemestarZahtjeva(podaci.vanredna[i].datum) == zahtjev["semestar"] &&
      dajKolonuZauzeca(podaci.vanredna[i].datum) == zahtjev["dan"] &&
      kolizijaTermina(
        podaci.vanredna[i].pocetak,
        podaci.vanredna[i].kraj,
        zahtjev["pocetak"],
        zahtjev["kraj"]
      )
    ) {
      predavacKojiJeZauzeo = podaci.vanredna[i].predavac;
      return false;
    }
  }
  return true;
}

//ovdje je mjesec 1 - 12
function dajSemestarZahtjeva(datum) {
  let mjesec = datum.substr(3, 2);
  mjesec = parseInt(mjesec, 10);
  if (mjesec >= 10 || mjesec == 1) return "zimski";
  if (mjesec >= 2 && mjesec <= 6) return "ljetni";
  return "nista";
}

//ponedjeljak 1 utorak 2 srijeda 3 ... nedjelja 7
function dajKolonuZauzeca(datum) {
  let dan = datum.substr(0, 2);
  let mjesec = datum.substr(3, 2);
  let godina = datum.substr(6, 4);
  dan = parseInt(dan, 10);
  mjesec = parseInt(mjesec, 10);
  mjesec--;
  godina = parseInt(godina, 10);
  let d = new Date(godina, mjesec, dan);
  let kolona = d.getDay();
  if (kolona == 0) kolona = 7;
  return kolona;
}

function kolizijaTermina(vp, vk, zp, zk) {
  return !(vk < zp || zk < vp);
}

function jeLiIspravnaVanredna(zahtjev) {
  zahtjev = JSON.parse(zahtjev);
  //JEDINI ISPRAVAN FORMAT ZA VANREDNO ZAUZECE:
  //moze i drugim redoslijedom ali ovako mi je u zauzeca.json
  //console.log(kljucevi[0] + " " + kljucevi[1] + " " + kljucevi[2] + " " + kljucevi[3] + " " + kljucevi[4]);
  //datum pocetak kraj naziv predavac
  let kljucevi = Object.keys(zahtjev);
  kljucevi.forEach(element => (element = element.toLowerCase()));

  return (
    kljucevi[0] == "datum" &&
    kljucevi[1] == "pocetak" &&
    kljucevi[2] == "kraj" &&
    kljucevi[3] == "naziv" &&
    kljucevi[4] == "predavac" &&
    kljucevi.length == 5 &&
    zahtjev["datum"] != undefined &&
    zahtjev["pocetak"] != undefined &&
    zahtjev["kraj"] != undefined &&
    zahtjev["naziv"] != undefined &&
    zahtjev["predavac"] != undefined &&
    validirajDatum(zahtjev["datum"]) &&
    validirajVrijeme(zahtjev["pocetak"]) &&
    validirajVrijeme(zahtjev["kraj"]) &&
    zahtjev["pocetak"] < zahtjev["kraj"] &&
    validirajNaziv(zahtjev["naziv"])
  );
}

function jeLiIspravnaPeriodicna(zahtjev) {
  //JEDINI ISPRAVAN FORMAT ZA PERIODICNO ZAUZECE:
  //moze i drugim redoslijedom ali ovako mi je u zauzeca.json
  //console.log(kljucevi[0] + " " + kljucevi[1] + " " + kljucevi[2] + " " + kljucevi[3] + " " + kljucevi[4] + " " kljucevi[5]);
  //dan semestar pocetak kraj naziv predavac
  zahtjev = JSON.parse(zahtjev);
  let kljucevi = Object.keys(zahtjev);
  kljucevi.forEach(element => (element = element.toLowerCase()));
  return (
    kljucevi[0] == "dan" &&
    kljucevi[1] == "semestar" &&
    kljucevi[2] == "pocetak" &&
    kljucevi[3] == "kraj" &&
    kljucevi[4] == "naziv" &&
    kljucevi[5] == "predavac" &&
    kljucevi.length == 6 &&
    zahtjev["dan"] != undefined &&
    zahtjev["semestar"] != undefined &&
    zahtjev["pocetak"] != undefined &&
    zahtjev["kraj"] != undefined &&
    zahtjev["naziv"] != undefined &&
    zahtjev["predavac"] != undefined &&
    validirajDan(zahtjev["dan"]) &&
    validirajSemestar(zahtjev["semestar"]) &&
    validirajVrijeme(zahtjev["pocetak"]) &&
    validirajVrijeme(zahtjev["kraj"]) &&
    zahtjev["pocetak"] < zahtjev["kraj"] &&
    validirajNaziv(zahtjev["naziv"])
  );
}

function validirajDan(dan) {
  dan = parseInt(dan, 10);
  return dan >= 1 && dan <= 7;
}

function validirajSemestar(semestar) {
  return semestar == "ljetni" || semestar == "zimski";
}

//u zauzeca.json format datuma je dd.mm.yyyy
function validirajDatum(datum) {
  let dan = datum.substr(0, 2);
  let mjesec = datum.substr(3, 2);
  let godina = datum.substr(6, 4);
  dan = parseInt(dan, 10);
  mjesec = parseInt(mjesec, 10);
  godina = parseInt(godina, 10);
  return dan >= 0 && dan <= 31 && mjesec >= 0 && mjesec <= 12 && godina >= 2019;
}

//duzina vremena + dvijetacke na sredini
function validirajVrijeme(vrijeme) {
  let sati = vrijeme.substr(0, 2);
  let minute = vrijeme.substr(3, 2);
  sati = parseInt(sati, 10);
  minute = parseInt(minute, 10);
  return sati >= 0 && sati <= 24 && minute >= 0 && minute <= 60;
}

function validirajNaziv(naziv) {
  let sale = [
    "0-01",
    "0-02",
    "0-03",
    "0-04",
    "0-05",
    "0-06",
    "0-07",
    "0-08",
    "0-09",
    "1-01",
    "1-02",
    "1-03",
    "1-04",
    "1-05",
    "1-06",
    "1-07",
    "1-08",
    "1-09",
    "1-11",
    "1-15",
    "VA1",
    "VA2",
    "MA",
    "EE1",
    "EE2"
  ];
  for (let i = 0; i < sale.length; i++) {
    if (sale[i] === naziv) return true;
  }
  return false;
}

app.listen(8080);
