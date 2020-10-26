window.onload = function() {
  Pozivi.slike(prikaziSlike);
  sessionStorage.clear();
};

var brojPrikazanih = 0;
var brojUcitanih = 0;
var sljedeci = document.getElementById("desni");
var prethodni = document.getElementById("lijevi");
var sadrzaj = document.getElementById("sadrzaj");
var kliknutoSljedeci = 0;
var kliknutoPrethodni = 0;

function prikaziSlike(brojSlika) {
  for (let i = 0; i < 3; i++) {
    if (brojPrikazanih < brojSlika) {
      brojPrikazanih++;
      Pozivi.ucitajSlike(sadrzaj, sacuvajURL);
    }
  }
}

function sacuvajURL(url) {
  sessionStorage.setItem(brojUcitanih++, url);
}

function ucitajNaredneTri() {
  kliknutoSljedeci++;
  let i;
  for (i = 0; i < 3; i++) {
    if (brojPrikazanih < 10) {
      Pozivi.ucitajSlike(sadrzaj, sacuvajURL);
      brojPrikazanih++;
    } else break;
  }

  if (i < 3) {
    sljedeci.disabled = true;
  }
}

function ucitajPrethodneTri() {
  kliknutoPrethodni++;
  sljedeci.disabled = false;
  kliknutoSljedeci--;
  if (kliknutoSljedeci >= 0 && kliknutoPrethodni < 4) {
    sadrzaj.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      let slika = document.createElement("img");
      slika.src = sessionStorage.getItem(kliknutoSljedeci * 3 + i);
      sadrzaj.appendChild(slika);
      brojPrikazanih--;
      brojUcitanih--;
    }
  }
  if (brojUcitanih <= 1) {
    Pozivi.slike(prikaziSlike);
    sessionStorage.clear();
    brojUcitanih = 0;
    kliknutoSljedeci = 0;
    kliknutoPrethodni = 0;
  }
}
