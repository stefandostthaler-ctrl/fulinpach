# Fulinpach – Das Flüstern der Streuobstwiesen

Ein Idle-Adventure in Bad Feilnbach. Äpfel sammeln, die Streuobstwiese bestellen,
Orte besuchen, Geschichte lesen. Läuft komplett im Browser: kein Server, kein Konto,
keine Installation.

## Spielen

1. Den Ordner **`src`** öffnen.
2. Doppelklick auf **`index.html`** (also `src/index.html`).

Das war's. Es funktioniert auch ohne Internet. Der Spielstand wird automatisch im
Browser gespeichert (Reiter „Speichern“ zum Sichern als Datei).

**Von einer älteren Fassung umsteigen:** Früher lag die `index.html` direkt im
Hauptordner. Vor dem Umstieg im alten Spiel den Reiter „Speichern“ → „Spielstand als
JSON herunterladen“ benutzen und die Datei danach im neuen Spiel über „JSON-Datei
importieren“ wieder laden. Manche Browser merken sich den Spielstand pro Ordner.

**Weitergeben:** den **ganzen Ordner `src`** weitergeben (z. B. als ZIP), nicht nur
die `index.html`. Die Bilder, Texte und die Spiellogik liegen in den Unterordnern.

## Was liegt wo?

Alles, was zum Spiel gehört, liegt im Ordner `src/`:

```
src/index.html            Die Seite selbst. Hier muss man normalerweise nichts ändern.
src/css/style.css         Aussehen: Farben, Schriftgrößen, Abstände.
src/js/content/art.js     Alle ASCII-Zeichnungen (Orte, Gegenstände, Gegner, Wiese).
src/js/content/items.js   Gegenstände, Händlerangebot, Baumsorten, Gegnerwerte.
src/js/content/story.js   Ortschronik, Erkundungen, Wegbuch-Spuren (die langen Texte).
src/js/game.js            Spielregeln: was bei Klicks passiert, Kampf, Speichern/Laden.
src/js/ui.js              Anzeige: baut aus dem Spielstand die Reiter und Schaltflächen.
src/js/main.js            Start und Spieltakt (zählt fünfmal pro Sekunde die Äpfel).
```

Der Ordner `openspec/` enthält nur Planungsnotizen für die Entwicklung und wird zum
Spielen nicht gebraucht.

Für kleine Änderungen reicht der Ordner `src/js/content/`:

- **Ein Bild ändern:** in `art.js` die Zeichnung zwischen den Backticks (`` ` ``)
  anpassen. Die Breite darf sich ändern, nur die Backticks müssen bleiben.
- **Preise, Schaden, Reifezeiten:** Zahlen in `items.js` (z. B. `cost`, `damage`,
  `seconds`).
- **Geschichten und Fragen:** Texte in `story.js`. Gerade Anführungszeichen `"` im
  Text vermeiden, stattdessen „…“ oder »…« benutzen.

Nach dem Speichern der Datei einfach die Seite im Browser neu laden (F5).

Kurze Texte, die beim Klicken erscheinen (z. B. „Du isst 12 Äpfel …“), stehen direkt
in `src/js/game.js` und `src/js/ui.js` bei der jeweiligen Handlung. Mit der Suche des
Editors (Strg+F) nach dem Satz findet man die Stelle schnell.

## Wenn etwas kaputt ist

- Seite neu laden (F5). Bleibt sie leer, im Browser F12 drücken: Unter „Konsole“
  steht dann, in welcher Datei und Zeile der Fehler liegt. Meist fehlt ein Komma
  oder ein Anführungszeichen.
- Spielstand zurücksetzen: Reiter „Speichern“ → „Alles zurücksetzen“.
- Im Notfall die Dateien aus der letzten funktionierenden Fassung zurückkopieren
  (oder mit Git: `git checkout -- .`).

## Für Entwickler

- Bewusst **ohne Build-Tools, npm oder Server**, damit das Spiel per Doppelklick
  läuft. Deshalb klassische `<script src>`-Dateien statt ES-Module: Module werden
  von Browsern über `file://` blockiert.
- Die Skripte teilen sich einen globalen Namensraum; die Ladereihenfolge in
  `src/index.html` ist daher wichtig (Inhalte → Logik → Oberfläche → Start).
- Der Spielstand ist das Objekt `g` (siehe `fresh()` in `game.js`). In der
  Browser-Konsole kann man ihn direkt ansehen und ändern, z. B. `g.apples=500;render()`.
- Spielstände liegen im `localStorage` unter `fulinpach_bad_feilnbach_v3`.
  Beim Ändern der Speicherstruktur `VERSION` in `game.js` erhöhen und die Wandlung
  in `normalizeSave()` ergänzen.
- Spieltakt: `main.js` ruft alle 200 ms `tick()` auf. Ein kompletter Neuaufbau
  (`render()`) passiert nur bei Klicks und Freischaltungen; dazwischen führt
  `refreshView()` nur Zahlen, Schaltflächen und Zeitanzeigen nach. Schaltflächen,
  deren Verfügbarkeit von Ressourcen abhängt, bekommen in `btn()` eine Funktion
  als drittes Argument.
- Online stellen: Den Inhalt von `src/` unverändert auf jeden statischen Webspace
  legen. Bei GitHub Pages entweder `src/` als Veröffentlichungsordner wählen (per
  GitHub Action) oder das Spiel unter `/src/index.html` verlinken.
