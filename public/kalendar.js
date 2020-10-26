var trenutni = new Date().getMonth();
var trenutnaGodina = new Date().getFullYear();
var kalendar = document.getElementsByClassName("tabelaRezervacija")[0];

let Kalendar = (function() {
  var mjeseci = [
    "Januar",
    "Februar",
    "Mart",
    "April",
    "Maj",
    "Juni",
    "Juli",
    "August",
    "Septembar",
    "Oktobar",
    "Novembar",
    "Decembar"
  ];
  var periodicnaPodaci, vanredniPodaci;

  //DODAJ UCITAVANJE
  function ucitajPodatkeImpl(periodicna, vanredni) {
    periodicnaPodaci = periodicna;
    vanredniPodaci = vanredni;
    ucitajSaForme();
  }

  function ucitajSaForme() {
    let lista = document.getElementById("listaSala");
    if (lista.selectedIndex < 0) return;
    let izabranaSala = lista[lista.selectedIndex].text;
    let izabraniPocetak = document.getElementById("pocetak").value;
    let izabraniKraj = document.getElementById("kraj").value;
    if (
      izabranaSala !== "" &&
      izabraniPocetak != "" &&
      izabraniKraj != "" &&
      izabraniPocetak < izabraniKraj
    ) {
      obojiZauzecaImpl(
        kalendar,
        trenutni,
        izabranaSala,
        izabraniPocetak,
        izabraniKraj
      );
    }
  }

  function trenutniSemestar() {
    if (trenutni >= 9 || trenutni == 0) return "zimski";
    else if (trenutni >= 1 && trenutni < 6) return "ljetni";
    return "";
  }

  function imaKolizijuTermina(p1, k1, p2, k2) {
    return !(k1 < p2 || k2 < p1);
  }

  function obojiZauzecaImpl(
    kalendarRef,
    mjesec,
    izabranaSala,
    izabraniPocetak,
    izabraniKraj
  ) {
    mjesec = mjesec % 12;
    Kalendar.iscrtajKalendar(
      document.getElementsByClassName("tabelaRezervacija")[0],
      mjesec
    );
    if (
      periodicnaPodaci === null ||
      typeof periodicnaPodaci === "undefined" ||
      vanredniPodaci === null ||
      typeof vanredniPodaci === "undefined"
    )
      return;
    if (mjesec < 10) mjesec = "0" + mjesec.toString();
    let tabela = document.getElementById("sadrzajKalendara");
    for (let i = 0; i < periodicnaPodaci.length; i++) {
      if (
        periodicnaPodaci[i].semestar === trenutniSemestar() &&
        periodicnaPodaci[i].naziv === izabranaSala &&
        imaKolizijuTermina(
          periodicnaPodaci[i].pocetak,
          periodicnaPodaci[i].kraj,
          izabraniPocetak,
          izabraniKraj
        )
      ) {
        for (let k = 0; k < tabela.rows.length; k++) {
          for (let l = 0; l < tabela.rows[k].cells.length; l++) {
            if (
              !tabela.rows[k].cells[l].classList.contains("skrivenaCelija") &&
              l === periodicnaPodaci[i].dan - 1
            ) {
              tabela.rows[k].cells[l].classList.add("zauzeta");
            }
          }
        }
      }
    }
    for (let j = 0; j < vanredniPodaci.length; j++) {
      if (
        parseInt(vanredniPodaci[j].datum.substr(3, 2)) - 1 == mjesec &&
        vanredniPodaci[j].naziv === izabranaSala &&
        imaKolizijuTermina(
          vanredniPodaci[j].pocetak,
          vanredniPodaci[j].kraj,
          izabraniPocetak,
          izabraniKraj
        )
      ) {
        let dan = parseInt(vanredniPodaci[j].datum.substr(0, 2), 10);
        let brojac = 0;
        for (let k = 0; k < tabela.rows.length; k++) {
          for (let l = 0; l < tabela.rows[k].cells.length; l++) {
            if (tabela.rows[k].cells[l].classList.contains("skrivenaCelija"))
              continue;
            brojac++;
            if (brojac === dan)
              tabela.rows[k].cells[l].classList.add("zauzeta");
          }
        }
      }
    }
  }

  function iscrtajKalendarImpl(kalendarRef, mjesec) {
    mjesec = mjesec % 12;
    var prviDan = new Date(trenutnaGodina, mjesec).getDay();
    prviDan--;
    if (prviDan === -1) prviDan = 6;
    //vdje je bilo mjesec + 1
    var brojDana = new Date(trenutnaGodina, mjesec + 1, 0).getDate();

    let naslov = document.getElementById("naslov");
    naslov.innerHTML = mjeseci[mjesec] + " " + trenutnaGodina;

    let tabela = document.getElementById("sadrzajKalendara");
    tabela.innerHTML = "";

    let dan = 1;
    for (let i = 0; i < 7; i++) {
      let red = document.createElement("tr");
      for (let j = 0; j < 7; j++) {
        if (dan > brojDana) break;
        else if (i === 0 && j < prviDan) {
          let celija = document.createElement("td");
          let unutrasnjostCelije = document.createTextNode("");
          celija.classList.add("skrivenaCelija");
          celija.appendChild(unutrasnjostCelije);
          red.appendChild(celija);
        } else {
          let celija = document.createElement("td");
          let unutrasnjostCelije = document.createTextNode(dan);
          celija.appendChild(unutrasnjostCelije);
          celija.classList.add("slobodna");
          red.appendChild(celija);
          dan++;
        }
      }
      tabela.appendChild(red);
    }
  }

  function izlistajOsobeImpl() {
    Pozivi.ucitajOsoblje(function(podaci) {
      var polje = document.getElementById("listaOsoba");
      polje.innerHTML = "";
      for (let i = 0; i < podaci.length; i++) {
        polje.options[polje.options.length] = new Option(
          podaci[i].ime + " " + podaci[i].prezime,
          i
        );

      }
    });

  }

  function izlistajSaleImpl(podaci) {
    var req = new XMLHttpRequest();
    req.open("GET", "http://localhost:8080/sveSale");
    req.onload = function() {
      var podaci = JSON.parse(req.responseText);
      console.log(podaci);
      var polje = document.getElementById("listaSala");

      for (let i = 0; i < podaci.length; i++) {

        polje.options[polje.options.length] = new Option(podaci[i].naziv, i);
      }
    };
    req.send();
  }

  return {
    obojiZauzeca: obojiZauzecaImpl,
    ucitajPodatke: ucitajPodatkeImpl,
    ucitaj: ucitajSaForme,
    iscrtajKalendar: iscrtajKalendarImpl,
    izlistajOsobe: izlistajOsobeImpl,
    izlistajSale: izlistajSaleImpl
  };
})();


function promijeniMjesec(pomak) {
  let naslov = document.getElementById("naslov").innerHTML;
  trenutni += pomak.data;
  if (trenutni == 12) {
    trenutni = 0;
    trenutnaGodina++;
  } else if (trenutni == -1) {
    trenutni = 11;
    trenutnaGodina--;
  }
  Kalendar.iscrtajKalendar(
    document.getElementsByClassName("tabelaRezervacija")[0],
    trenutni
  );

  Kalendar.ucitaj();
}
