let assert = chai.assert;
describe("TABELA REZERVACIJA", function() {
  describe("OBOJI ZAUZECA", function() {
    //Pozivanje obojiZauzeca kada podaci nisu učitani: očekivana vrijednost da se ne oboji niti jedan dan
    it("Podaci nisu ucitani, niti jedna celija ne smije biti zauzeta", function() {
      Kalendar.obojiZauzeca(
        document.getElementsByClassName("tabelaRezervacija")[0],
        9,
        "MA",
        "08:00",
        "10:00"
      );
      let tabela = document.getElementById("sadrzajKalendara");
      assert.equal(
        tabela.getElementsByClassName("slobodna").length,
        30,
        "Broj slobodnih celija u novembru treba biti 30."
      );
    });
    //Pozivanje obojiZauzeca gdje u zauzećima postoje duple vrijednosti za zauzeće istog termina:
    //očekivano je da se dan oboji bez obzira što postoje duple vrijednosti
    it("Dan treba biti obojen iako postoje duple vrijednosti za zauzece istog termina", function() {
      let v = [
        {
          datum: "15.10.2019",
          pocetak: "08:00",
          kraj: "10:00",
          naziv: "VA1",
          predavac: "Pero Peric"
        },
        {
          //dan treba biti obojen iako postoje dupli podaci
          datum: "15.10.2019",
          pocetak: "08:00",
          kraj: "10:00",
          naziv: "VA1",
          predavac: "Pero Peric"
        }
      ];
      Kalendar.ucitajPodatke([], v);
      Kalendar.obojiZauzeca(
        document.getElementsByClassName("tabelaRezervacija")[0],
        10,
        "VA1",
        "08:00",
        "09:00"
      );
      assert.equal(
        document.getElementsByClassName("zauzeta").length,
        1,
        "Broj zauzetih celija u treba biti 1."
      );
    });
    //Pozivanje obojiZauzece kada u podacima postoji periodično zauzeće za drugi semestar: očekivano
    //je da se ne oboji zauzeće
    it("Sve sale su slobodne ako periodicno zauzece nije u trenutnom semestru", function() {
      let p = [
        {
          dan: 1,
          semestar: "ljetni",
          pocetak: "08:00",
          kraj: "10:00",
          naziv: "VA1",
          predavac: "Pero Peric"
        }
      ];
      Kalendar.ucitajPodatke(p, []);
      Kalendar.obojiZauzeca(
        document.getElementsByClassName("tabelaRezervacija")[0],
        10,
        "VA1",
        "08:00",
        "09:00"
      );
      assert.equal(
        document.getElementsByClassName("slobodna").length,
        31,
        "Broj slobodnih celija u treba biti 31."
      );
    });
    //Pozivanje obojiZauzece kada u podacima postoji zauzeće termina ali u drugom mjesecu: očekivano
    //je da se ne oboji zauzeće
    it("Ne bojimo niti jedan dan ako je zauzece u drugom mjesecu", function() {
      let v = [
        {
          datum: "15.10.2019",
          pocetak: "08:00",
          kraj: "10:00",
          naziv: "VA1",
          predavac: "Pero Peric"
        }
      ];
      Kalendar.ucitajPodatke([], v);
      Kalendar.obojiZauzeca(
        document.getElementsByClassName("tabelaRezervacija")[0],
        8,
        "VA1",
        "08:00",
        "09:00"
      );
      assert.equal(
        document.getElementsByClassName("slobodna").length,
        31,
        "Broj zauzetih celija u treba biti 31."
      );
    });
    //Pozivanje obojiZauzece kada su u podacima svi termini u mjesecu zauzeti: očekivano je da se svi
    //dani oboje
    it("Svi termini za datu salu u februaru su zauzeti, boji se svaki dan", function() {
      let p = [
        {
          dan: 0,
          semestar: "zimski",
          pocetak: "11:00",
          kraj: "14:00",
          naziv: "VA2",
          predavac: "Miki Maus"
        },
        {
          dan: 1,
          semestar: "zimski",
          pocetak: "11:00",
          kraj: "14:00",
          naziv: "VA2",
          predavac: "Miki Maus"
        },
        {
          dan: 2,
          semestar: "zimski",
          pocetak: "11:00",
          kraj: "14:00",
          naziv: "VA2",
          predavac: "Miki Maus"
        },
        {
          dan: 3,
          semestar: "zimski",
          pocetak: "11:00",
          kraj: "14:00",
          naziv: "VA2",
          predavac: "Miki Maus"
        },
        {
          dan: 4,
          semestar: "zimski",
          pocetak: "11:00",
          kraj: "14:00",
          naziv: "VA2",
          predavac: "Miki Maus"
        },
        {
          dan: 5,
          semestar: "zimski",
          pocetak: "11:00",
          kraj: "14:00",
          naziv: "VA2",
          predavac: "Miki Maus"
        },
        {
          dan: 6,
          semestar: "zimski",
          pocetak: "11:00",
          kraj: "14:00",
          naziv: "VA2",
          predavac: "Miki Maus"
        }
      ];
      Kalendar.ucitajPodatke(p, []);
      Kalendar.obojiZauzeca(
        document.getElementsByClassName("tabelaRezervacija")[0],
        02,
        "VA2",
        "10:00",
        "13:00"
      );
      assert.equal(
        document.getElementsByClassName("zauzeta").length,
        28,
        "Broj zauzetih celija u treba biti 28."
      );
    });
    //Dva puta uzastopno pozivanje obojiZauzece: očekivano je da boja zauzeća ostane ista
    it("Boja zauzeca ostaje ista iako se funkcija obojiZauzece pozove dva puta", function() {
      let v = [
        {
          datum: "15.10.2019",
          pocetak: "08:00",
          kraj: "10:00",
          naziv: "VA1",
          predavac: "Pero Peric"
        }
      ];
      Kalendar.ucitajPodatke([], v);
      Kalendar.obojiZauzeca(
        document.getElementsByClassName("tabelaRezervacija")[0],
        10,
        "VA1",
        "08:00",
        "09:00"
      );
      Kalendar.obojiZauzeca(
        document.getElementsByClassName("tabelaRezervacija")[0],
        10,
        "VA1",
        "08:00",
        "09:00"
      );
      assert.equal(
        document.getElementsByClassName("zauzeta").length,
        1,
        "Broj zauzetih celija u treba biti 1."
      );
    });
    //Pozivanje ucitajPodatke, obojiZauzeca, ucitajPodatke - drugi podaci, obojiZauzeca: očekivano da se
    //zauzeća iz prvih podataka ne ostanu obojena, tj. primjenjuju se samo posljednje učitani podaci
    it("Oboji zauzece pozvano dva puta, obojeni samo posljednje ucitani podaci", function() {
      let v1 = [
        {
          datum: "15.10.2019",
          pocetak: "08:00",
          kraj: "10:00",
          naziv: "VA1",
          predavac: "Pero Peric"
        }
      ];
      Kalendar.ucitajPodatke([], v1);
      Kalendar.obojiZauzeca(
        document.getElementsByClassName("tabelaRezervacija")[0],
        10,
        "VA1",
        "08:00",
        "09:00"
      );
      //sada ucitamo nove podatke, treba samo jedan dan biti obojen
      let v2 = [
        {
          datum: "20.10.2019",
          pocetak: "08:00",
          kraj: "10:00",
          naziv: "VA1",
          predavac: "Pero Peric"
        }
      ];
      Kalendar.ucitajPodatke([], v2);
      Kalendar.obojiZauzeca(
        document.getElementsByClassName("tabelaRezervacija")[0],
        10,
        "VA1",
        "08:00",
        "09:00"
      );
      assert.equal(
        document.getElementsByClassName("zauzeta").length,
        1,
        "Broj zauzetih celija u treba biti 1."
      );
    });
    //neispravno vrijeme na formi, niti jedan dan nece biti obojen
    it("Vrijeme na formi je neispravno, niti jedan dan nece biti obojen", function() {
      let v = [
        {
          datum: "15.10.2019",
          pocetak: "10:00",
          kraj: "08:00",
          naziv: "VA1",
          predavac: "Pero Peric"
        }
      ];
      Kalendar.ucitajPodatke([], v);
      Kalendar.obojiZauzeca(
        document.getElementsByClassName("tabelaRezervacija")[0],
        10,
        "VA1",
        "08:00",
        "09:00"
      );
      assert.equal(
        document.getElementsByClassName("zauzeta").length,
        0,
        "Broj zauzetih celija u treba biti 0."
      );
    });
    //sala unesena na formi se ne nalazi u podacima, niti jedan dan ne smije biti obojen
    it("Razlicite sale, niti jedan dan ne smije biti obojen", function() {
      let v = [
        {
          datum: "15.10.2019",
          pocetak: "08:00",
          kraj: "10:00",
          naziv: "VA1",
          predavac: "Pero Peric"
        }
      ];
      Kalendar.ucitajPodatke([], v);
      Kalendar.obojiZauzeca(
        document.getElementsByClassName("tabelaRezervacija")[0],
        10,
        "MA",
        "08:00",
        "09:00"
      );
      assert.equal(
        document.getElementsByClassName("zauzeta").length,
        0,
        "Broj zauzetih celija u treba biti 0."
      );
    });
  });
  describe("ISCRTAVANJE KALENDARA", function() {
    //Pozivanje iscrtajKalendar za mjesec sa 30 dana: očekivano je da se prikaže 30 dana
    it("Treba iscrtati 30 dana za mjesec septembar.", function() {
      Kalendar.iscrtajKalendar(
        document.getElementsByClassName("tabelaRezervacija")[0],
        8
      );
      let tabela = document.getElementById("sadrzajKalendara");
      assert.equal(
        tabela.getElementsByClassName("slobodna").length,
        30,
        "Broj iscrtanih celija treba biti 30."
      );
    });
    //Pozivanje iscrtajKalendar za mjesec sa 31 dan: očekivano je da se prikaže 31 dan
    it("Treba iscrtati 31 dan za mjesec oktobar.", function() {
      Kalendar.iscrtajKalendar(
        document.getElementsByClassName("tabelaRezervacija")[0],
        9
      );
      let tabela = document.getElementById("sadrzajKalendara");
      assert.equal(
        tabela.getElementsByClassName("slobodna").length,
        31,
        "Broj iscrtanih celija treba biti 31."
      );
    });
    //Pozivanje iscrtajKalendar za trenutni mjesec: očekivano je da je 1. dan u petak
    it("Prvi dan trenutnog mjeseca (novembra) je petak.", function() {
      Kalendar.iscrtajKalendar(
        document.getElementsByClassName("tabelaRezervacija")[0],
        10
      );
      let tabela = document.getElementById("sadrzajKalendara");
      assert.equal(tabela.rows[0].cells[4].innerHTML, 1);
    });
    //Pozivanje iscrtajKalendar za trenutni mjesec: očekivano je da je 30. dan u subotu
    it("Zadnji dan trenutnog mjeseca (novembra) je subota.", function() {
      Kalendar.iscrtajKalendar(
        document.getElementsByClassName("tabelaRezervacija")[0],
        10
      );
      let tabela = document.getElementById("sadrzajKalendara");
      assert.equal(tabela.rows[4].cells[5].innerHTML, 30);
    });
    //Pozivanje iscrtajKalendar za januar: očekivano je da brojevi dana idu od 1 do 31 počevši od utorka
    it("Prvi dan januara je utorak, zadnji dan je cetvrtak (31.)", function() {
      Kalendar.iscrtajKalendar(
        document.getElementsByClassName("tabelaRezervacija")[0],
        0
      );
      let tabela = document.getElementById("sadrzajKalendara");
      assert.equal(tabela.rows[0].cells[1].innerHTML, 1);
      assert.equal(tabela.rows[4].cells[3].innerHTML, 31);
      assert.equal(
        tabela.getElementsByClassName("slobodna").length,
        31,
        "Broj iscrtanih celija treba biti 31."
      );
    });
    //Prvi i posljednji dan decembra
    it("Prvi dan decembra je nedjelja, zadnji dan je utorak (31.)", function() {
      Kalendar.iscrtajKalendar(
        document.getElementsByClassName("tabelaRezervacija")[0],
        11
      );
      let tabela = document.getElementById("sadrzajKalendara");
      assert.equal(tabela.rows[0].cells[6].innerHTML, 1);
      assert.equal(tabela.rows[5].cells[1].innerHTML, 31);
      assert.equal(
        tabela.getElementsByClassName("slobodna").length,
        31,
        "Broj iscrtanih celija treba biti 31."
      );
    });
    //Prvi i posljednji dan februara
    it("Prvi dan februara je petak, zadnji dan je cetvrtak (28.)", function() {
      Kalendar.iscrtajKalendar(
        document.getElementsByClassName("tabelaRezervacija")[0],
        1
      );
      let tabela = document.getElementById("sadrzajKalendara");
      assert.equal(tabela.rows[0].cells[4].innerHTML, 1);
      assert.equal(tabela.rows[4].cells[3].innerHTML, 28);
      assert.equal(
        tabela.getElementsByClassName("slobodna").length,
        28,
        "Broj iscrtanih celija treba biti 28."
      );
    });
  });
});
