# Fulinpach im Vergleich zu Candy Box 2

Stand: 5. Oktober 2026. Grundlage: der aktuelle Spielcode (`src/js/game.js`, `items.js`,
`story.js`, Weltkarten-Spezifikation) und die veröffentlichten Quelltexte von Candy Box 2.

Ziel des Projekts: ein Candy-Box-2-Klon mit eigener Geschichte über Bad Feilnbach, erzählt
auf humorvolle Weise.

## Kurzfassung

Fulinpach hat das Gerüst von Candy Box 2 bereits: vier Ressourcen, Essen und Auslegen,
Händler, Streuobstwiese, Ausrüstung mit sechs Plätzen, Karte, Fragen zur Ortschronik,
Geheimnisse, zwei Enden. Es fehlt der Körper dazu:

1. Die Wirtschaft wächst nicht. Die Apfelrate steigt von 1 auf 2 pro Sekunde und bleibt
   dort. Alle Preise liegen zwischen 5 und 666. Candy Box 2 lebt davon, dass das nächste
   Ziel zehnmal so teuer ist und man das Spiel offen lässt.
2. Die Quests sind keine Quests. Candy Box 2 hat seitlich scrollende Kämpfe, in denen
   Gegnerwellen auf einen zulaufen und man mitten im Kampf Tränke trinkt. Fulinpach hat drei
   Einzelkämpfe mit zwei Zeitgebern und einem Schlag-Knopf. Die Orte sind da, aber es
   passiert nichts in ihnen.
3. Es gibt keine Verbrauchs- und Verzauberungsebene: keinen Kessel, keine Tränke, keine
   Zaubersprüche, keine Verzauberungen. Diese Ebene macht aus „Äpfel sammeln“ ein
   „Äpfel sammeln, damit ich das brauen kann, womit ich den Golem schaffe“.

Und: Die Geschichte ist heute lyrisch und ernst, nicht komisch. Die Witze stecken in den
Nebensätzen, der Hauptbogen ist melancholisch.

## System für System

| System | Candy Box 2 | Fulinpach heute | Lücke |
|---|---|---|---|
| Ressourcen | Candies, Lollipops, Schokoriegel, Pains au chocolat | Äpfel, Kerne, Most, Rindenzeichen | keine, Zuordnung ist vollständig |
| Essen / Werfen | Essen erhöht LP, Werfen ist ein Dauerwitz mit Höhlen-Easter-Egg | Essen erhöht LP, Auslegen füttert die Krähe | in Ordnung |
| Leerlauf-Wachstum | Rate steigt von 1/s auf Tausende/s über Farm, Mühle, Teich, Lolligator | Rate 1 auf 2, Kerne 0,5/s nach einem Kauf | größte Lücke: keine Wachstumskurve, kein Grund zurückzukommen |
| Farm | Lollipops pflanzen, Mühle, Teich, passives Einkommen | 3 Plätze, von Hand pflanzen, gießen, ernten | keine Automatisierung, keine Ausbaustufen |
| Händler | Preise steigen, Zeitring, Hüte | 9 Einmalkäufe, 1 wiederholbarer | keine Preisstaffel, nichts fürs Spätspiel |
| Kampf | scrollende Quest, Gegnerwellen, Beute, Tränke im Kampf | Takt-Kampf 1 gegen 1, 3 Gegner insgesamt | das Markenzeichen von Candy Box 2 fehlt |
| Quest-Orte | Keller, Wüste, Brücke, Höhle, Wald, Burgeingang, Burg, Burgturm, Hölle, Berge, Leuchtturm, Pier, Meer, Hexenhütte, Loch, Wunschbrunnen, Schmiede, Arena | 18 Orte, meist ein Text und ein bis zwei Knöpfe | Orte gibt es, Inhalt zum Kämpfen nicht |
| Endloses / Wiederholbares | Meer mit Stufen und Bossen, Hölle | nichts | kein wiederholbarer Inhalt |
| Tränke | Kessel: Heil-, Schildkröten-, Antischwerkraft-, Berserker-, Klon-, Teleport-, X-Trank; Zauber wie Feuerball und Beschwörungen | Most als Heilung | ganzes System fehlt |
| Ausrüstung | rund 30 Gegenstände auf Waffe, Hut, Körper, Handschuhe, Stiefel, dazu Verzauberungen am Wunschbrunnen | 21 Gegenstände, 6 Plätze | Leiter passt, Verzaubern fehlt |
| Rätsel | Höhlenmuster, Zyklop im Leuchtturm, Festungsräume, einsames Haus, Tic-Tac-Toe-Eichhörnchen, Minispiele in Dorfhäusern | Chronik-Fragen, Flüster-Passwort | die Chronik ist das Eichhörnchen; Minispiele fehlen |
| Vierte Wand | Der Computer als Entwicklerkonsole, der Entwickler als Endgegner | README-Hinweis auf Konsolenbefehle, „NICHT KAUFEN“ | ein „Rathaus-PC“ wäre ein freier Platz |
| Speichern | lokal plus Server-Passwort | lokal plus JSON-Datei | für die Doppelklick-Fassung passend |
| Fortschritt bei Abwesenheit | keiner | bis zu 8 Stunden angerechnet | Fulinpach ist hier voraus |
| Verzweigte Geschichte | keine | Wegbuch-Spuren, Begegnungen, Wasser-Quests, zwei Enden | Fulinpach ist voraus, aber im Ton ernst |

## Die Ton-Frage

Die Ortschronik ist bewusst quellengebunden, und der Hauptbogen ist still: ein Gelübde in
Au, ein Baum ohne Schild, „Der Bach bleibt“. Candy Box 2 macht es umgekehrt: Die Welt ist
ein trockener Witz, die Geschichte ist Nebensache.

Die echte Zeitleiste von Bad Feilnbach passt erstaunlich gut auf die Orte von Candy Box 2:

| Candy-Box-2-Ort | Echter Anknüpfungspunkt | mögliche komische Quest |
|---|---|---|
| Keller mit Ratten | Rathaus, Gebietsreform 1972/1978 | Aktenratten, Eingemeindungsformulare |
| Wüste mit Stamm | Sterntaler Filze, „schwarzes Gold“ | Moor als endlose Fläche, Torfbarone |
| Brückentroll | Jenbachbrücke | schon da: der Bachrattenkönig |
| Wald mit Baumgeist | Streuobstwiese, 25.000 Bäume | Apfelbaum-Ents, die keinen Namen wollen |
| Burg mit Drache | Kurhaus, Prädikat „Bad“ 1973 | Kurdirektor als Drache, Kurbeitrag als Lava |
| Leuchtturm-Zyklop | Wendelstein-Observatorium, Wendelsteinbahn | Rätsel der Wendelstein-Männlein |
| Meer | Moorbad bei 45 Grad | endlos, wird pro Stufe heißer |
| Schmiede | Elektrische Bahn 1897 bis 1973 | Lokführer schmiedet Waffen aus Schienen |
| Hexenhütte | Kräuterweiberl | Mostkessel, in dem Tränke gebraut werden |
| Wunschbrunnen | Taxakapelle, Gelübde 1647 | Äpfel hineinwerfen, Verzauberungen bekommen |
| Eichhörnchen-Baum | Chronik-Fragen | schon da |
| Der Computer | Rathaus-PC mit Windows 95 | Entwicklerkonsole, Endgegner: der Sachbearbeiter |
| Minispiele im Dorf | Leibl und Sperl in Kutterling | Mal-Minispiel? |

Die eigentliche Frage ist also weniger „Was fehlt?“ als: Bleibt der heutige poetische Bogen
als zweite Ebene erhalten, oder wird die Hauptgeschichte als Komödie neu geschrieben, bei
der die Chronik-Fakten die Pointen liefern? Je nach Antwort ist in `story.js` wenig oder
fast alles umzuschreiben.

## Wünsche des Autors (GitHub-Issues 2, 3 und 4)

Stand 6. Oktober 2026: Alle drei Issues sind umgesetzt (OpenSpec-Änderung
`implement-author-issues-2-3-4`). Die Notizen unten beschreiben die Ausgangslage und die
Entscheidungen, die dabei getroffen wurden:

- Issue 2: Tregler Alm, Wirtsalm, Farrenpoint und Wendelstein brauchen jetzt die
  Wanderstiefel. Alte Spielstände, die dort schon waren, bekommen die Stiefel beim Laden.
- Issue 3: Der Goldene Apfel der Stadt kommt bei beiden Enden als Talisman (Schutz 5,
  Schaden 5).
- Issue 4: Bei 980 maximalen LP erscheint der Talisman „An apple a day…“; Gegner richten
  dann keinen Schaden mehr an, auch der letzte Pflücker nicht. Preis der Versicherung
  unverändert, also bleibt es ein langes Ziel.

Ursprüngliche Einschätzung:

**Issue 2: Berge und Almen erst mit Wanderstiefeln.**
Betroffen wären Tregler Alm, Wirtsalm, Farrenpoint und Wendelstein. Die „Jenbachtaler
Wanderstiefel“ gibt es beim Händler schon (40 Kerne, +1 Schutz), sie sperren bisher aber
nichts. Die Reisesperren stehen in `travel()` und `journalGo()` in `game.js`, dort wäre
eine Bedingung „Stiefel im Inventar“ zu ergänzen. Das ist genau die Candy-Box-2-Logik:
Gegenstände öffnen Orte. Aufwand klein. Offene Frage: Sollen die Stiefel dafür teurer
werden, damit der Kauf ein Meilenstein ist?

**Issue 3: „Goldener Apfel der Stadt“ als Belohnung für den Spielabschluss.**
Der Abschluss ist heute die Entscheidung beim letzten Pflücker (`decideFate()`), danach
gibt es nur Text. Ein Talisman-Gegenstand mit eigener ASCII-Zeichnung, der nach der
Entscheidung ins Inventar kommt, passt gut und ist klein. Candy Box 2 belohnt das Ende
ähnlich mit einem besonderen Gegenstand. Offene Frage: Soll der Apfel nur Schmuck sein oder
Werte haben, und bekommen ihn beide Enden?

**Issue 4: Bei 980 LP erhält der Spieler den Talisman „An apple a day…“ und wird
unbesiegbar.**
Die Zahl 980 ist ein schöner Bezug auf die erste Erwähnung als „Fulinpah“ im Jahr 980.
Heute sind die maximalen LP aber praktisch gedeckelt: 100 Grundwert, +2 je 20 gegessene
Äpfel, +10 für die Kerze, +25 je Versicherung für 300 Äpfel. Für 980 LP bräuchte man rund
35 Versicherungen oder 8.800 gegessene Äpfel, bei 1 bis 2 Äpfeln pro Sekunde also viele
Stunden ohne Gegenwert. Dieser Wunsch funktioniert erst, wenn die Wirtschaftskurve aus
Punkt 1 der Kurzfassung gebaut ist. Dann wird er zu einem echten Langzeitziel, wie in Candy
Box 2 die teuren Spätspiel-Gegenstände. Unbesiegbarkeit sollte vermutlich erst nach dem
Ende greifen oder die Endgegner ausnehmen, sonst verliert der letzte Pflücker seinen Sinn.

## Neue Issues vom 7. Oktober 2026 (5 bis 8)

- **Issue 5, Jenbach-Status und Rattenkampf: umgesetzt** (Änderung
  `fix-jenbach-status-and-rat-fight`). Der Hinweis an der Brücke folgt jetzt dem Hochwasser,
  die Ankunftsmeldung passt zum Stand, beide Entscheidungen bleiben getrennt im Questbuch.
  Der Bachrattenkönig holt vor jedem dritten Angriff 1,5 Sekunden sichtbar zum „Sprung von
  der Brücke“ aus (doppelter Schaden); ein gezielter Angriff in dieser Zeit unterbricht ihn
  und lässt ihn taumeln. LP bleiben bei 90. Kampf bringt zusätzlich 15 Äpfel, der friedliche
  Weg 6 Kerne.
- **Issue 6, Stiefel und Goldener Apfel: umgesetzt** (in `implement-author-issues-2-3-4`
  ergänzt). Entscheidung: Besitz zählt, nicht Anlegen, damit niemand auf der Alm strandet.
  Alle Wege laufen über eine Prüfung. Der Goldene Apfel bringt +1 Apfel pro Sekunde und
  seine Beschreibung nennt das gewählte Ende.
- **Issue 7, Wirtschaft: geplant, wartet auf Freigabe** (Änderung `rebalance-progression`).
  Das Issue verlangt, die Bilanztabelle vor der Umsetzung vorzulegen. Sie steht in
  `openspec/changes/rebalance-progression/design.md`: sechs passive Ausbauten der
  Streuobstwiese, von 1 auf 11 Äpfel pro Sekunde, jeweils an eine Quest gebunden, ohne neue
  Plätze oder Klickschleifen. Preisänderungen nur nach der Karte, maßvoll.
- **Issue 8, Humor und Folgen: geplant** (Änderung `refine-humor-and-consequences`). Die
  Folgen-Tabelle in `openspec/changes/refine-humor-and-consequences/design.md` nennt für jede
  gespeicherte Entscheidung eine spätere Antwort im Spiel, dazu eine Stimme je Ort. Sollte
  nach Issue 7 umgesetzt werden, weil mehrere Folgen Preise senken.

## Vorschlag zur Reihenfolge

0. Die kleinen Issues 2 und 3 zuerst: beide sind in einem Nachmittag machbar und ändern
   nichts an der Richtung.
1. Ton klären (siehe oben). Das entscheidet, wie viele bestehende Texte bleiben.
2. Wirtschaftskurve: Streuobstwiese mit Ausbaustufen, die die Apfelrate vervielfachen, und
   Händlerpreise, die mitwachsen.
3. Quest-Engine: ein scrollender Kampfstreifen, in dem die bestehenden Orte gefüllt werden
   können. Die drei heutigen Gegner werden die ersten Bewohner.
4. Kessel und Tränke, danach Verzauberungen am „Wunschbrunnen“ (Taxakapelle).
5. Wiederholbarer Endlos-Ort (Moorbad) und ein bis zwei Minispiele.
6. Issue 4 (980 LP) als Langzeitziel, sobald die Wirtschaft das hergibt.

Jeder dieser Punkte kann als eigene OpenSpec-Änderung geplant werden.
