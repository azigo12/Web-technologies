let Pozivi = (function() {
  function ucitajPodatkeSaServera() {
    $.ajax({
      type: "Get",
      url: "http://localhost:8080/dosadasnjaZauzeca",
      dataType: "json",
      success: function(objekat) {
        let p = [];
        let v = [];
        for (let i = 0; i < objekat.periodicna.length; i++) {
          p.push(objekat.periodicna[i]);
        }
        for (let i = 0; i < objekat.vanredna.length; i++) {
          v.push(objekat.vanredna[i]);
        }
        Kalendar.ucitajPodatke(p, v);
      },
      error: function() {
        alert("fajl nije pronadjen");
      }
    });
  }

  var brojPrikazanih = 0;

  function dodajZauzece(zauzece, callbackOK, callbackErr) {
    var ajax = new XMLHttpRequest();
    //ova funkcija ce se izvrsiti kada se dobije odg od servera
    ajax.onreadystatechange = function() {
      if (ajax.readyState == 4 && ajax.status == 200) {
        var jsonRez = JSON.parse(ajax.responseText);
        callbackOK(jsonRez.zauzeca);
        callbackErr(jsonRez.err);
      }
    };
    ajax.open("POST", "http://localhost:8080/dodajZauzeca", true);
    ajax.setRequestHeader("Content-Type", "application/json");
    ajax.send(JSON.stringify(zauzece));
  }

  function dajSlike(fnCallback) {
    var ajax = new XMLHttpRequest();
    ajax.open("GET", "http://localhost:8080/images", true);
    ajax.onreadystatechange = function() {
      if (ajax.readyState == 4 && ajax.status == 200) {
        var slike = JSON.parse(ajax.responseText);
        fnCallback(slike.length);
      }
    };
    ajax.send();
  }

  function ucitajOsobljeImpl(callback) {
    var ajax = new XMLHttpRequest();
    ajax.open("GET", "http://localhost:8080/osoblje", true);
    ajax.onreadystatechange = function() {
      if (ajax.readyState == 4 && ajax.status == 200) {
        var jsonRez = JSON.parse(ajax.responseText);
        callback(jsonRez);
      }
    };
    ajax.send();
  }

  function ucitajDosadasnjaZauzecaImpl(callback) {
    var ajax = new XMLHttpRequest();
    ajax.open("GET", "http://localhost:8080/dosadasnjaZauzeca", true);
    ajax.onreadystatechange = function() {
      if (ajax.readyState == 4 && ajax.status == 200) {
        var jsonRez = JSON.parse(ajax.responseText);
        callback(jsonRez);
      }
    };
    ajax.send();
  }

  function ucitajSlikeImplementacija(sadrzajPocetne, fnCallback) {
    sadrzajPocetne.innerHTML = "";
    var ajax = new XMLHttpRequest();
    ajax.open("GET", "http://localhost:8080/sl", true);
    ajax.responseType = "arraybuffer";
    ajax.onreadystatechange = function() {
      if (ajax.readyState == 4 && ajax.status == 200) {
        var rez = new Uint8Array(ajax.response);
        var r = String.fromCharCode.apply(null, rez);
        var b64 = btoa(r);
        var urlSlike = "data:image/jpeg;base64," + b64;
        fnCallback(urlSlike);
        let slika = document.createElement("img");
        slika.src = urlSlike;
        sadrzajPocetne.appendChild(slika);
      }
    };
    ajax.send();
  }
  /*
  function naredneSlikeImplementacija() {
    let sadrzaj = document.getElementById("sadrzaj");
    sadrzaj.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      brojPrikazanih++;
      if(brojPrikazanih == 10) {
        break;
      }
      var ajax = new XMLHttpRequest();
      ajax.open("GET", "http://localhost:8080/sl", true);
      ajax.responseType = "arraybuffer";

      ajax.onreadystatechange = function() {
        if (ajax.readyState == 4 && ajax.status == 200) {
          var rez = new Uint8Array(ajax.response);
          var r = String.fromCharCode.apply(null, rez);
          var b64 = btoa(r);
          var urlSlike = "data:image/jpeg;base64," + b64;
          fnCallback1(urlSlike);
          let slika = document.createElement("img");
          slika.src = urlSlike;
          sadrzajPocetne.appendChild(slika);
        } else if (ajax.readyState == 4) fnCallback2(ajax.statusText, null);
      };
      ajax.send();
    }
  }*/

  return {
    ucitaj: ucitajPodatkeSaServera,
    dodaj: dodajZauzece,
    ucitajSlike: ucitajSlikeImplementacija,
    slike: dajSlike,
    ucitajOsoblje: ucitajOsobljeImpl,
    ucitajZauzeca: ucitajDosadasnjaZauzecaImpl
    //naredneSlike: naredneSlikeImplementacija
  };
})();
