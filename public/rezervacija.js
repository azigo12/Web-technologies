$(function() {
  Kalendar.iscrtajKalendar(
    document.getElementsByClassName("tabelaRezervacija")[0],
    trenutni
  );

  Pozivi.ucitaj();
  Kalendar.obojiZauzeca;

  $("#forma").change(function() {
    Kalendar.ucitaj();
  });

  $("#lijevi").click(-1, promijeniMjesec);
  $("#desni").click(1, promijeniMjesec);
  $("#sadrzajKalendara").on("click", "td", function() {
    var td = $(this).get(0);
    let kliknutaKolona = $(this).index() + 1;

    let lista = document.getElementById("listaSala");
    let izabranaSala = lista.options[lista.selectedIndex].text;
    let izabraniPocetak = document.getElementById("pocetak").value;
    let izabraniKraj = document.getElementById("kraj").value;
    let periodicna = document.getElementById("periodicnost").checked;
    let listaZaOsobe = document.getElementById("listaOsoba");
    let izabranaOsoba = listaZaOsobe.options[listaZaOsobe.selectedIndex].text;

    if (
      izabranaSala !== "" &&
      izabraniPocetak != "" &&
      izabraniKraj != "" &&
      izabraniPocetak < izabraniKraj &&
      izabranaOsoba != "" &&
      !td.classList.contains("skrivenaCelija") &&
      !td.classList.contains("zauzeta") &&
      td.classList.contains("slobodna")
    ) {
      let izbor = confirm(
        "Želite li rezervisati ovaj termin za salu " + izabranaSala + "?"
      );
      if (izbor) {
        let mjesec = document.getElementById("naslov").innerHTML;
        let trenutniMjesec = dajTrenutniMjesec(mjesec.substr(0, 3));
        let trenutniSemestar = dajTrenutniSemestar(trenutniMjesec);
        let godina = new Date().getFullYear();
        let zauzece;
        let danVanredno = td.innerHTML;

        if (periodicna) {
          zauzece = {
            dan: kliknutaKolona,
            semestar: trenutniSemestar,
            pocetak: izabraniPocetak,
            kraj: izabraniKraj,
            naziv: izabranaSala,
            predavac: izabranaOsoba
          };
        } else {
          if (danVanredno.length == 1) danVanredno = "0" + danVanredno;
          let trazeniDatum = danVanredno + "." + trenutniMjesec + "." + godina;

          zauzece = {
            datum: trazeniDatum,
            pocetak: izabraniPocetak,
            kraj: izabraniKraj,
            naziv: izabranaSala,
            predavac: izabranaOsoba
          };
        }
        Pozivi.dodaj(zauzece, dodanoZauzece, neispravnoZauzece);
      }
    }
  });
});

function dodanoZauzece(zauzeca) {
  if (typeof zauzeca != undefined) {
    Pozivi.ucitaj();
  }
}

function neispravnoZauzece(err) {
  if (err !== undefined) {
    let mjesec = document.getElementById("naslov").innerHTML;
    let trenutniMjesec = dajTrenutniMjesec(mjesec.substr(0, 3));
    let trenutniSemestar = dajTrenutniSemestar(trenutniMjesec);
    let duzina = mjesec.length - 4;
    let zaIspis = mjesec.substr(0, duzina);
    if(trenutniSemestar === "nista") err = "Nije moguce napraviti periodicnu rezervaciju u mjesecu: " + zaIspis + "!";
    alert(err);
    Pozivi.ucitaj();
  }
}

function dajTrenutniSemestar(trenutni) {
  if (trenutni >= 10 || trenutni == 1) return "zimski";
  else if (trenutni > 1 && trenutni < 7) return "ljetni";
  return "nista";
}

function dajTrenutniMjesec(mjesec) {
  var mjeseci = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Maj",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Dec"
  ];
  let rezultat = mjeseci.indexOf(mjesec);
  rezultat++;
  if (rezultat.toString().length == 1) rezultat = "0" + rezultat;
  return rezultat;
}

window.onload = () => {
  $.ajax({
    type: "GET",
    url: "/osoblje",
    success: data => {
      Kalendar.izlistajOsobe();
    }
  }),
    $.ajax({
      type: "GET",
      url: "/svesale",
      success: data => {
        Kalendar.izlistajSale(data);
      }
    });
};
