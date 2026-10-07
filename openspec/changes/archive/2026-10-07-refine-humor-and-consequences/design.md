# Design

## Context

See proposal.md. Decisions are already stored: `g.water.oster.solution`,
`g.water.flood.warning`, `g.water.flood.solution`, `g.flags.ratRoute`, `g.flags.wallRoute`,
`g.flags.golemRoute`, `g.lore.choices[thread]` (1 or 2), `g.encounters[id]`. Only a few of them
are read again later (oster → Jenbach rain message, encounters → cheaper costs, harvest choice
→ final text). Scene texts live as template strings in `renderQuests()` (ui.js), arrival lines
in `travel()` (game.js), long texts in story.js.

## Goals / Non-Goals

**Goals:**
- Every stored decision is read at least once more, visibly.
- Humour from reactions and contrast, not from meta commentary.

**Non-Goals:**
- New quests, new places, new items.
- Rewriting the chronicle paragraphs.

## Consequence map (one line each; texts written during apply)

| Decision | Stored as | Later response |
|---|---|---|
| Osterbach: Fachstelle | oster.solution=fachstelle | Flood: "Rückhalt" costs 10 Kerne instead of 15 (the Fachstelle already surveyed the meadow); Biber mentioned at the bridge |
| Osterbach: Zuleitung | versorgung | Spielplatz scene after the ending shows kids racing apples in the rinnen; +1 Kern once |
| Osterbach: Gemeinschaft | gemeinschaft | Siedlung: warning "Nachbarn" text says they already know you; flood "Häuser" costs 50 instead of 65 |
| Flood warning: Nachbarn | flood.warning=nachbarn | Au: a neighbour from the Jenbach leaves a Most bottle at the chapel (once) |
| Flood warning: Gemeinde | gemeinde | Wirtsalm: the Hüttenwirtin mentions the Einsatzkräfte; Golem distraction costs 40 instead of 45 |
| Flood: Treibholz | flood.solution=treibholz | Wall: driftwood lies at the wall; carving the marker needs no knife |
| Flood: Rückhalt | rueckhalt | Streuobstwiese: the retention meadow yields 10 Kerne once |
| Flood: Hausschutz | hausschutz | Siedlung scene after ending: sandbags became a bench; Rathaus arrival line mentions it |
| Rats: Kampf | ratRoute=kampf | Markt: no rats; the crow comments on your reputation |
| Rats: Locken | locken | Markt: rats steal 5 apples on first visit (funny), then sell you the ledger cheaper (15 instead of 35 Kerne) |
| Wall: Kreide | wallRoute=chalk | Wirtsalm arrival: the Golem has seen the door and is confused |
| Wall: Pfad | path | Farrenpoint: the Ortskundige left a sign; stick is free of the 10 Kerne craft cost |
| Golem: Kampf | golemRoute=kampf | Tregler: a Schmalznudel on the table, +1 Most once |
| Golem: Brotzeit | brotzeit | Markt: the Hüttenwirtin runs a stand; Marktchronik costs 100 instead of 120 |
| Wegbuch "name": aussprechen / zeichnen | lore.choices.name | Box whisper "fulinpah" answers differently; the drawn line shows on the hollow apple desc |
| Wegbuch "moor": liegen lassen / erzählen | lore.choices.moor | Irrlicht: free follow (left) vs lantern needed (told) |
| Wegbuch "water": nachzeichnen / Menschen | lore.choices.water | Flood intro text differs; "Menschen" makes the Siedlung warn itself (warning stage auto-set) |
| Wegbuch "harvest": Kern / Apfel | already used in decideFate | keep, plus Sortengarten text |
| Wegbuch "promise": leise / eintragen | lore.choices.promise | Männlein: "eintragen" lets them read it (Trade costs 60 instead of 90) |
| Wegbuch "mountain": Menschen / Wiese | lore.choices.mountain | Ending texts: the shared harvest names the Jenbach houses or the Wiechs tree first |

## Voice per place (guides the rewrite)

Rathaus: bureaucratic deadpan. Kirche: short sentences, no jokes about faith, jokes about the
player. Filze: old, damp, patient; the moor talks slowly. Bahnhof: nostalgic timetable
language. Jenbach: brisk, water-sounds, rats with civic ambitions. Osterbach: children's
logic. Siedlung: neighbours, half-open doors. Wall: absurd building regulations. Tregler:
Hüttenwirtin, warm, feeds you. Wirtsalm: wide and quiet, something breathing. Markt: sellers'
patter. Wiechs: orchard, names and labels. Au: vow and promise, tender. Litzldorf: water that
counts. Farrenpoint: wind. Wendelstein: tiny voices, questions before help. Fulinpach: slow.

## Decisions

- **Hooks, not rewrites of logic**: each consequence is a conditional in an existing function
  (cost tables, `travel()` arrival line, scene text) plus a once-flag in `g.flags` where a
  reward is granted. No new systems.
- **Merchant lines**: `merchantLine()` in game.js picks from a list by state (first visit,
  after doNotBuy, after ending, with Goldener Apfel, etc.), rendered above the shop.
- **Consistency scan**: a headless script lists every scene text and journal step with the
  flags it depends on and prints texts for each terminal state; reviewed by hand.

## Historical claims check (task 3.2)

No new historical statement was added. All new texts describe game events (rats, Golem,
Hüttenwirtin, Sandsäcke, Kreidetür). The chronicle paragraphs are unchanged except for one
removed meta phrase ("Der Frosch im Spiel") in the Sterntaler Filze entry. Facts that reappear
in rewritten scene texts (1897/1973 Lokalbahn, 1973 Bad, seit 1900 Moor, 1647 Taxakapelle,
1992 Apfelmarkt, 980 Fulinpah) were already present and keep their sources in story.js.

## Risks / Trade-offs

- [Cheaper costs from consequences interact with issue #7's curve] → implement #8 after #7 so
  the discounts are applied to the final numbers.
- [Humour drift] → the author reviews the diff of story.js and ui.js texts before archive.

## Open Questions

- Should the rats stealing apples at the Markt happen once or on every visit? Default: once.
