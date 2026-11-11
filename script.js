(function () {
  var DEF = function () {
    return {
      p: {
        tva: 10,
        tvaA: 20,
        hr: 15,
        pack: 0.3,
        loss: 5,
        km: 0.6,
        fixed: [400, 40, 100, 40, 50, 70],
        profit: 500,
        chg: 15,
        nb: 8,
        conv: 40,
      },
      c: {
        name: "Poulet yassa, riz blanc (exemple)",
        portions: 10,
        hours: 2.5,
        ing: [
          ["Cuisses de poulet", 2.5, "kg", 6.5, 15],
          ["Oignons", 1.5, "kg", 1.6, 15],
          ["Citrons jaunes", 6, "pièce", 0.4, 0],
          ["Moutarde", 0.05, "kg", 6, 0],
          ["Huile", 0.1, "L", 4, 0],
          ["Ail", 0.03, "kg", 8, 10],
          ["Riz basmati (cru)", 1, "kg", 2.8, 0],
          ["Sel, poivre, piment (forfait)", 1, "forfait", 1, 0],
        ],
      },
      v: { coef: 2.5, marg: 55, keep: 15, comp: 14 },
      d: {
        client: "Entreprise exemple",
        date: "",
        conv: 50,
        dep: 30,
        lines: [
          { n: "Menu buffet (par convive)", r: "menu", t: 0 },
          {
            n: "Personnel de service (heures cumulées)",
            r: "hr",
            t: 0,
            q: 12,
            pu: 25,
          },
          {
            n: "Location de matériel (forfait)",
            r: "",
            t: 0,
            q: 1,
            pu: 120,
            cost: 80,
          },
          {
            n: "Livraison et installation (km)",
            r: "km",
            t: 0,
            q: 40,
            pu: 1,
          },
          {
            n: "Boissons alcoolisées (bouteilles)",
            r: "",
            t: 1,
            q: 20,
            pu: 12,
            cost: 160,
          },
          { n: "", r: "", t: 0 },
          { n: "", r: "", t: 0 },
          { n: "", r: "", t: 0 },
          { n: "", r: "", t: 0 },
        ],
      },
    };
  };
  var S = DEF(),
    KEY = "traiteur-calc-v1";
  try {
    var raw = localStorage.getItem(KEY);
    if (raw) S = JSON.parse(raw);
  } catch (e) {}
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(S));
    } catch (e) {}
  }
  var $ = function (s) {
    return document.querySelector(s);
  };
  var eur = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
  var num = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
  var f = function (v) {
    return typeof v === "number" && isFinite(v) ? eur.format(v) : "";
  };
  var pc = function (v) {
    return isFinite(v) ? num.format(v * 100) + " %" : "";
  };
  function N(v) {
    return typeof v === "number" && isFinite(v) ? v : 0;
  }
  function ref(path) {
    var a = path.split("."),
      o = S;
    for (var i = 0; i < a.length - 1; i++) o = o[a[i]];
    return [o, a[a.length - 1]];
  }
  function inp(path, o) {
    o = o || {};
    var r = ref(path),
      v = r[0][r[1]];
    return (
      '<input class="in" ' +
      (o.text
        ? 'type="text" style="text-align:left"'
        : 'type="number" step="any"') +
      ' data-k="' +
      path +
      '"' +
      (o.text ? ' data-t="1"' : "") +
      ' value="' +
      (v == null ? "" : String(v).replace(/"/g, "&quot;")) +
      '"' +
      (o.ph ? ' placeholder="' + o.ph + '"' : "") +
      (o.a ? ' aria-label="' + o.a + '"' : "") +
      ">"
    );
  }
  function row(l, c, h, cls) {
    return (
      '<div class="row ' +
      (cls || "") +
      '"><div>' +
      l +
      "</div><div>" +
      c +
      '</div><div class="h">' +
      (h || "") +
      "</div></div>"
    );
  }
  function out(id, cls) {
    return '<div class="out ' + (cls || "") + '" id="' + id + '"></div>';
  }
  function T(id, txt, cls) {
    var e = document.getElementById(id);
    if (!e) return;
    e.textContent = txt;
    if (cls !== undefined) e.className = "out " + cls;
  }
  function sgn(v) {
    return v >= 0 ? "pos" : "neg";
  }

  /* Paramètres */
  var fixedL = [
    "Location de cuisine ou laboratoire",
    "Assurance responsabilité civile professionnelle",
    "Véhicule (assurance, entretien)",
    "Téléphone, internet, logiciels",
    "Comptabilité",
    "Autres frais fixes",
  ];
  $("#s-p").innerHTML =
    '<h2>Paramètres</h2><p class="sub">Valeurs d’exemple : à remplacer par les vôtres.</p><div class="card">' +
    row(
      "Taux de TVA sur les plats et prestations (%)",
      inp("p.tva"),
      "Dépend de la prestation (5,5 % ou 10 %). Mettre 0 si vous êtes en franchise en base de TVA. À valider avec un comptable.",
    ) +
    row(
      "Taux de TVA sur les boissons alcoolisées (%)",
      inp("p.tvaA"),
      "Taux normal en général applicable aux boissons alcoolisées. À valider.",
    ) +
    row(
      "Coût horaire de main d’œuvre (€/h)",
      inp("p.hr"),
      "Votre temps ou celui d’un employé, charges comprises.",
    ) +
    row(
      "Emballage et consommables par portion (€)",
      inp("p.pack"),
      "Barquette, couverts, serviette.",
    ) +
    row(
      "Marge de sécurité pour pertes et gaspillage (%)",
      inp("p.loss"),
      "À ajuster avec vos relevés après chaque événement.",
    ) +
    row(
      "Coût de déplacement par km (€/km)",
      inp("p.km"),
      "Carburant, usure, assurance du véhicule.",
    ) +
    "</div>" +
    '<h3>Frais fixes mensuels (€)</h3><div class="card">' +
    fixedL
      .map(function (l, i) {
        return row(l, inp("p.fixed." + i));
      })
      .join("") +
    row("Total des frais fixes mensuels", out("p-fix"), "", "tot") +
    "</div>" +
    '<h3>Objectifs</h3><div class="card">' +
    row(
      "Bénéfice mensuel visé (€)",
      inp("p.profit"),
      "En plus de la main d’œuvre déjà comptée.",
    ) +
    row(
      "Charges sociales et impôts estimés (% du CA HT)",
      inp("p.chg"),
      "À remplacer après simulation de vos cotisations auprès de l’Urssaf ou de votre comptable.",
    ) +
    row(
      "Nombre moyen de prestations par mois",
      inp("p.nb"),
      "Sert à répartir les frais fixes sur chaque devis.",
    ) +
    row(
      "Nombre moyen de convives par prestation",
      inp("p.conv"),
      "Sert au calcul du seuil de rentabilité.",
    ) +
    "</div>";

  /* Prix de vente */
  $("#s-v").innerHTML =
    '<h2>Prix de vente d’une portion</h2><p class="sub">Reprend le coût de revient de l’onglet précédent.</p><div class="card">' +
    row(
      "Coût de revient direct par portion (€)",
      out("v-cost", "link"),
      "Matières, pertes, emballage et main d’œuvre.",
    ) +
    "</div>" +
    '<h3>Deux méthodes pour fixer le prix</h3><div class="cmp"><div><span>Méthode 1 : coefficient multiplicateur</span><input class="in" type="number" step="any" data-k="v.coef" style="margin:4px 0" aria-label="Coefficient"><b id="v-p1"></b><span>Coût de revient × coefficient</span></div>' +
    '<div><span>Méthode 2 : taux de marge visé (%)</span><input class="in" type="number" step="any" data-k="v.marg" style="margin:4px 0" aria-label="Taux de marge"><b id="v-p2"></b><span>Coût de revient ÷ (1 − taux de marge)</span></div></div>' +
    '<h3>Prix retenu</h3><div class="card">' +
    row(
      "Prix de vente HT retenu par portion (€)",
      inp("v.keep"),
      "À décider en comparant les deux méthodes et le marché.",
    ) +
    row(
      "Marge brute par portion (€)",
      out("v-mb"),
      "Prix retenu moins coût de revient direct.",
    ) +
    row(
      "Taux de marge sur le prix de vente",
      out("v-tm"),
      "Marge ÷ prix de vente HT.",
    ) +
    row(
      "Coefficient réel obtenu",
      out("v-cr"),
      "Prix retenu ÷ coût de revient.",
    ) +
    row(
      "Prix de vente TTC par portion (€)",
      out("v-ttc"),
      "Avec le taux de TVA des paramètres.",
    ) +
    "</div>" +
    '<h3>Comparaison avec le marché</h3><div class="card">' +
    row(
      "Prix HT d’un concurrent comparable (€)",
      inp("v.comp"),
      "Relevez 3 prix auprès de traiteurs de votre zone.",
    ) +
    row(
      "Écart avec mon prix retenu (€)",
      out("v-e1"),
      "Positif : vous êtes plus cher ; négatif : moins cher.",
    ) +
    row("Écart en %", out("v-e2"), "") +
    "</div>";

  /* Seuil */
  $("#s-s").innerHTML =
    '<h2>Seuil de rentabilité mensuel</h2><p class="sub">Combien de convives faut-il servir chaque mois ?</p><div class="card">' +
    row(
      "Frais fixes mensuels (€)",
      out("s-fix", "link"),
      "Repris des paramètres.",
    ) +
    row(
      "Bénéfice mensuel visé (€)",
      out("s-pr", "link"),
      "Au-delà de la main d’œuvre déjà comptée dans le coût de revient.",
    ) +
    row("Charges sociales et impôts (% du CA HT)", out("s-chg", "link"), "") +
    row("Prix HT retenu par convive (€)", out("s-pu", "link"), "") +
    row("Coût de revient direct par convive (€)", out("s-cost", "link"), "") +
    row(
      "Marge par convive après charges (€)",
      out("s-m"),
      "Prix HT, moins les charges proportionnelles, moins le coût direct.",
    ) +
    "</div>" +
    '<h3>Résultat</h3><div class="cmp"><div><span>Convives à servir par mois</span><b id="s-n"></b></div><div><span>Chiffre d’affaires HT mensuel nécessaire</span><b id="s-ca"></b></div><div><span>Prestations nécessaires par mois</span><b id="s-np"></b><div class="bar"><i id="s-bar" style="width:0"></i></div></div></div>' +
    '<div class="card">' +
    row(
      "Convives moyens par prestation",
      out("s-cm", "link"),
      "Repris des paramètres.",
    ) +
    "</div>";

  /* Ingrédients */
  function drawIng() {
    $("#ing").innerHTML = S.c.ing
      .map(function (r, i) {
        var b = "c.ing." + i + ".";
        return (
          "<tr><td>" +
          inp(b + "0", { text: 1, a: "Ingrédient" }) +
          "</td><td>" +
          inp(b + "1", { a: "Quantité" }) +
          "</td><td>" +
          inp(b + "2", { text: 1, a: "Unité" }) +
          "</td><td>" +
          inp(b + "3", { a: "Prix" }) +
          "</td><td>" +
          inp(b + "4", { a: "Perte" }) +
          "</td><td>" +
          out("i-n" + i) +
          "</td><td>" +
          out("i-r" + i) +
          "</td><td>" +
          out("i-c" + i) +
          '</td><td><button class="x" data-del="' +
          i +
          '" aria-label="Supprimer la ligne">×</button></td></tr>'
        );
      })
      .join("");
    calc();
  }
  $("#addIng").onclick = function () {
    S.c.ing.push(["", "", "", "", ""]);
    save();
    drawIng();
  };
  $("#ing").addEventListener("click", function (e) {
    var d = e.target.getAttribute("data-del");
    if (d !== null) {
      S.c.ing.splice(+d, 1);
      save();
      drawIng();
    }
  });
  $("#costsum").innerHTML =
    row("Total des matières premières", out("c-raw")) +
    row("Marge pour pertes et gaspillage", out("c-w")) +
    row("Coût matières avec marge de sécurité", out("c-mat")) +
    row("Emballage et consommables", out("c-pk")) +
    row(
      "Temps total de préparation, cuisson et achats (heures)",
      inp("c.hours"),
    ) +
    row("Main d’œuvre", out("c-lab")) +
    row("Coût de revient direct total", out("c-tot"), "", "tot") +
    row("Coût de revient direct par portion", out("c-pp", "big"), "", "tot");

  /* Devis */
  $("#dl").innerHTML = S.d.lines
    .map(function (l, i) {
      var b = "d.lines." + i + ".";
      var qIn =
        l.r === "menu" ? out("l-q" + i) : inp(b + "q", { a: "Quantité" });
      var pIn =
        l.r === "menu"
          ? out("l-p" + i, "link")
          : inp(b + "pu", { a: "Prix unitaire" });
      var cIn = l.r
        ? out("l-k" + i, "link")
        : inp(b + "cost", { a: "Coût estimé" });
      return (
        "<tr><td>" +
        inp(b + "n", { text: 1, a: "Désignation", ph: "Ligne libre" }) +
        "</td><td>" +
        qIn +
        "</td><td>" +
        pIn +
        '</td><td><select class="in" data-k="' +
        b +
        't" aria-label="TVA"><option value="0">Normale</option><option value="1">Alcool</option></select></td><td>' +
        out("l-e" + i) +
        "</td><td>" +
        cIn +
        "</td></tr>"
      );
    })
    .join("");
  document.querySelectorAll("#dl select").forEach(function (s) {
    var r = ref(s.getAttribute("data-k"));
    s.value = String(r[0][r[1]]);
  });

  /* Binding */
  document.addEventListener("input", function (e) {
    var t = e.target,
      k = t.getAttribute && t.getAttribute("data-k");
    if (!k) return;
    var r = ref(k),
      v = t.value;
    if (!t.getAttribute("data-t") && t.tagName !== "SELECT")
      v = v === "" ? "" : +v;
    if (t.tagName === "SELECT") v = +v;
    r[0][r[1]] = v;
    save();
    calc();
  });

  /* Calculs */
  function calc() {
    var p = S.p,
      c = S.c,
      v = S.v,
      d = S.d;
    var fix = p.fixed.reduce(function (a, b) {
      return a + N(b);
    }, 0);
    T("p-fix", f(fix));
    var raw = 0;
    c.ing.forEach(function (r, i) {
      var q = r[1],
        pu = r[3],
        l = N(r[4]) / 100;
      var net = q === "" ? "" : q * (1 - l);
      T("i-n" + i, net === "" ? "" : num.format(net));
      T("i-r" + i, pu === "" || l >= 1 ? "" : f(pu / (1 - l)));
      var cost = q === "" || pu === "" ? "" : q * pu;
      T("i-c" + i, cost === "" ? "" : f(cost));
      raw += N(cost);
    });
    var w = (raw * N(p.loss)) / 100,
      mat = raw + w,
      pk = N(c.portions) * N(p.pack),
      lab = N(c.hours) * N(p.hr),
      tot = mat + pk + lab,
      pp = c.portions > 0 ? tot / c.portions : 0;
    T("c-raw", f(raw));
    T("c-w", f(w));
    T("c-mat", f(mat));
    T("c-pk", f(pk));
    T("c-lab", f(lab));
    T("c-tot", f(tot));
    T("c-pp", f(pp));
    /* prix */
    T("v-cost", f(pp));
    T("v-p1", f(pp * N(v.coef)));
    T("v-p2", v.marg < 100 ? f(pp / (1 - N(v.marg) / 100)) : "–");
    var keep = N(v.keep),
      mb = keep - pp;
    T("v-mb", f(mb), sgn(mb));
    T("v-tm", pc(keep > 0 ? mb / keep : 0));
    T("v-cr", num.format(pp > 0 ? keep / pp : 0));
    T("v-ttc", f(keep * (1 + N(p.tva) / 100)));
    var e1 = keep - N(v.comp);
    T("v-e1", f(e1));
    T("v-e2", pc(v.comp > 0 ? e1 / v.comp : 0));
    /* devis */
    $("#d-pu").textContent = f(keep);
    var ht = 0,
      tva = 0,
      cost = 0;
    d.lines.forEach(function (l, i) {
      var q = l.r === "menu" ? N(d.conv) : l.q,
        pu = l.r === "menu" ? keep : l.pu;
      var e = q === "" || q == null || pu === "" || pu == null ? 0 : q * pu;
      var rate = (l.t ? N(p.tvaA) : N(p.tva)) / 100;
      var k =
        l.r === "menu"
          ? pp * N(d.conv)
          : l.r === "hr"
            ? N(l.q) * N(p.hr)
            : l.r === "km"
              ? N(l.q) * N(p.km)
              : N(l.cost);
      if (l.r === "menu") {
        T("l-q" + i, num.format(N(d.conv)));
        T("l-p" + i, f(keep));
      }
      if (l.r) T("l-k" + i, f(k));
      T("l-e" + i, f(e));
      ht += e;
      tva += e * rate;
      cost += k;
    });
    var ttc = ht + tva;
    T("d-ht", f(ht));
    T("d-tva", f(tva));
    T("d-ttc", f(ttc));
    T("d-acc", f((ttc * N(d.dep)) / 100));
    var fx = p.nb > 0 ? fix / p.nb : 0,
      ch = (ht * N(p.chg)) / 100,
      net = ht - cost - fx - ch,
      rate = ht > 0 ? net / ht : 0;
    T("m-cost", f(cost));
    T("m-fix", f(fx));
    T("m-chg", f(ch));
    T("m-net", f(net), "big " + sgn(net));
    T("m-rate", pc(rate), "big " + sgn(net));
    T(
      "m-msg",
      net < 0
        ? "Devis déficitaire : revoyez le prix ou les coûts."
        : rate < 0.1
          ? "Marge faible : vérifiez vos prix."
          : "Marge confortable.",
    );
    $("#m-msg").className = "h " + sgn(net);
    /* seuil */
    var chg = N(p.chg) / 100,
      mc = keep * (1 - chg) - pp;
    T("s-fix", f(fix));
    T("s-pr", f(N(p.profit)));
    T("s-chg", pc(chg));
    T("s-pu", f(keep));
    T("s-cost", f(pp));
    T("s-m", f(mc), sgn(mc));
    T("s-cm", num.format(N(p.conv)));
    var n = mc > 0 ? (fix + N(p.profit)) / mc : null,
      np = n !== null && p.conv > 0 ? n / p.conv : null;
    $("#s-n").textContent =
      n === null ? "Prix trop bas" : num.format(Math.ceil(n));
    $("#s-ca").textContent = n === null ? "–" : f(n * keep);
    $("#s-np").textContent =
      np === null ? "–" : num.format(Math.round(np * 10) / 10);
    $("#s-bar").style.width =
      np === null ? "0" : Math.min(100, (np / Math.max(p.nb, 1)) * 100) + "%";
    $("#k1").textContent = f(pp);
    $("#k2").textContent = f(keep);
    $("#k3").textContent = f(net);
    $("#k4").textContent =
      n === null ? "Prix trop bas" : num.format(Math.ceil(n));
  }

  /* Onglets */
  var secs = [].slice.call(document.querySelectorAll("section"));
  var nav = $("#tabs");
  secs.forEach(function (s, i) {
    var b = document.createElement("button");
    b.setAttribute("role", "tab");
    b.textContent = s.getAttribute("data-tab");
    b.onclick = function () {
      show(i);
    };
    nav.appendChild(b);
  });
  function show(i) {
    secs.forEach(function (s, j) {
      s.hidden = i !== j;
      nav.children[j].setAttribute("aria-selected", i === j);
    });
    window.scrollTo(0, 0);
  }
  $("#reset").onclick = function () {
    if (confirm("Remplacer toutes vos saisies par les valeurs d’exemple ?")) {
      S = DEF();
      save();
      location.reload();
    }
  };
  show(0);
  drawIng();
  document.querySelectorAll("input[data-k]").forEach(function (el) {
    if (el.hasAttribute("value")) return;
    var r = ref(el.getAttribute("data-k"));
    el.value = r[0][r[1]] == null ? "" : r[0][r[1]];
  });
})();
