var svaZauzeca;
var osobeZacrtanje = [];

window.onload = function() {
  Pozivi.ucitajOsoblje(osoblje);
};

window.setInterval(function() {
  Pozivi.ucitajOsoblje(osoblje);
  console.log("Proslo 30 sekundi, ponovo ucitavam osoblje");
}, 30000);

function osoblje(podaci) {
  osobeZacrtanje = [];
  for (let i = 0; i < podaci.length; i++) {
    osobeZacrtanje[podaci[i].ime + " " + podaci[i].prezime] = "u kancelariji";
  }
  Pozivi.ucitajZauzeca(rezervacije);
}

//obrisi ove uloge
function rezervacije(podaci) {
  let danasnjiDatum = dajDanasnjiDatum();
  var trenutnoVrijeme = dajTrenutnoVrijeme();
  var prviDan = dajPrviDanMjeseca();
  let dan = dajDan();
  for (let i = 0; i < podaci.vanredna.length; i++) {
    if (
      podaci.vanredna[i].datum == danasnjiDatum &&
      podaci.vanredna[i].pocetak <= trenutnoVrijeme &&
      podaci.vanredna[i].kraj >= trenutnoVrijeme
    ) {
      let imePrezime = dajImeOsobe(podaci.vanredna[i].predavac);
      osobeZacrtanje[imePrezime] = podaci.vanredna[i].naziv;
    }
  }
  //meni su dani: 1, 2, 3 ...
  //a u tabeli termin pocinju od 0
  for (let i = 0; i < podaci.periodicna.length; i++) {
    let danPeriodicne = podaci.periodicna[i].dan;
    if (danPeriodicne == 0) danPeriodicne = 7;
    if (
      (prviDan + parseInt(dan) - 1) % 7 == danPeriodicne &&
      podaci.periodicna[i].semestar == dajSemestarZahtjeva(danasnjiDatum) &&
      podaci.periodicna[i].pocetak <= trenutnoVrijeme &&
      podaci.periodicna[i].kraj >= trenutnoVrijeme
    ) {
      let imePrezime = dajImeOsobe(podaci.periodicna[i].predavac);
      osobeZacrtanje[imePrezime] = podaci.periodicna[i].naziv;
    }
  }
  iscrtajTabelu();
}

function iscrtajTabelu() {
  let tabela = document.getElementById("tabelaSala");
  var rez =
    '<table id="tabelaSala"> <tr> <th> OSOBA </th> <th> SALA </th> </tr>';
  for (var k in osobeZacrtanje) {
    rez += "<tr> <td> " + k + "</td> <td> " + osobeZacrtanje[k] + "</td> </tr>";
  }
  rez += "</table>";
  tabela.innerHTML = rez;
}

function dajSemestarZahtjeva(datum) {
  let mjesec = datum.substr(3, 2);
  mjesec = parseInt(mjesec, 10);
  if (mjesec >= 10 || mjesec <= 2) return "zimski";
  if (mjesec >= 3 && mjesec <= 7) return "ljetni";
  return "";
}

function dajPrviDanMjeseca() {
  let godina = new Date().getFullYear();
  let mjesec = new Date().getMonth();
  let datum = new Date(godina, mjesec, 1);
  let rezultat = datum.getDay();
  if (rezultat == 0) rezultat = 7;
  return rezultat;
}

function dajDanasnjiDatum() {
  let danasnjiDatumString = new Date().toLocaleDateString("en-BS");
  let dan = danasnjiDatumString.substr(0, 2);
  let mjesec = danasnjiDatumString.substr(3, 2);
  let godina = new Date().getFullYear();
  let danasnjiDatum = dan + "." + mjesec + "." + godina;
  return danasnjiDatum;
}

function dajDan() {
  let danasnjiDatumString = new Date().toLocaleDateString("en-BS");
  let dan = danasnjiDatumString.substr(0, 2);
  return dan;
}

function dajTrenutnoVrijeme() {
  let sati = new Date().getHours().toString();
  if (sati.length == 1) sati = "0" + sati;
  let minute = new Date().getMinutes().toString();
  if (minute.length == 1) minute = "0" + minute;
  let trenutnoVrijeme = sati + ":" + minute;
  return trenutnoVrijeme;
}

function dajImeOsobe(podatak) {
  let dijeloviImena = podatak.split(" ");
  let ime = dijeloviImena[0];
  let prezime = dijeloviImena[1];
  let imePrezime = ime + " " + prezime;
  return imePrezime;
}
