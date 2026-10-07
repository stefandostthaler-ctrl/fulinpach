# Design

## Context

See proposal.md. Income today: `g.appleRate` (1, +1 after three harvests), `g.seedRate` (0 or
0.5 after the Kernsammler), plus the Goldener Apfel bonus in `appleRateNow()`. Every cost in
the game lies between 3 and 666 apples or 5 and 40 seeds. The farm yields about 25 apples and
6 seeds per 45 s plot.

## Goals / Non-Goals

**Goals:**
- A curve where each story beat hands the player a reason to spend and a visibly higher rate.
- Apples and seeds both stay in use until the end; seeds are the "slow" currency.

**Non-Goals:**
- More plots, watering requirements, clicker loops, prestige or offline multipliers.
- Changing the 980 LP goal or the insurance mechanics beyond price.

## Balance table (to be confirmed by the author before implementation)

Rates are what the player has after the row. "Wartezeit" is the idle time to afford the next
row at that rate, ignoring farm harvests (which make it shorter).

| # | Ausbau / Ziel | Freischaltung | Kosten | Äpfel/s danach | Kerne/s danach | Wartezeit bis nächstes Ziel |
|---|---|---|---|---|---|---|
| 0 | Start | – | – | 1.0 | 0 | Holzlöffel 60: 1 min |
| 1 | Kernsammler (bestehend) | Händler offen | 140 Äpfel | 1.0 | 0.5 | Karte 250 + 10 Kerne: ~4 min |
| 2 | Streuobst-Ernte (bestehend) | 3 Ernten | 15 Kerne gesamt | 2.0 | 0.5 | Krähe füttern 10×: ~1 min |
| 3 | Krähenpost | Krähe 10× gefüttert (Kreide-Geheimnis) | 0 (die 50 Äpfel Futter) | 2.5 | 0.5 | Holzrinnen 80: 30 s |
| 4 | Holzrinnen zur Wiese | Osterbach gelöst | 80 Äpfel + 10 Kerne | 3.5 | 0.5 | Apfelfuhre 150: 45 s |
| 5 | Apfelfuhre über die Brücke | Bachrattenkönig erledigt (beide Wege) | 150 Äpfel | 5.0 | 0.5 | Versicherung 300: 1 min |
| 6 | Almwirtschaft | Wirtsalm befriedet (beide Wege) | 300 Äpfel + 20 Kerne | 7.0 | 0.5 | Marktchronik 200: 30 s |
| 7 | Sortengarten | Vergessene Sorte gefunden | 40 Kerne | 7.0 | 1.5 | Marktstand 500: 70 s |
| 8 | Marktstand | Marktchronik gelesen | 500 Äpfel | 10.0 | 1.5 | Pflücker 200 + 8 Rinde: 20 s |
| 9 | Goldener Apfel (bestehend) | Ende erreicht | – | 11.0 | 1.5 | 980 LP: ~8.800 Äpfel essen, ~13 min |

Price changes to match: Wanderkarte 220 → 250 Äpfel, Marktchronik 120 → 200 Äpfel,
Wendelstein-Männlein 90 → 150 Äpfel, letzter Pflücker 120 → 200 Äpfel, Gelübde 50 → 80 Äpfel.
Everything before the map stays as is. Insurance stays 300 flat; eating is the intended route
to 980 LP (2 LP per 20 apples), the insurance is the shortcut for the impatient.

## Decisions

- **Data-driven list** `UPGRADES=[{id,name,desc,unlock:()=>bool,cost:{apples,seeds},apples,seeds}]`
  in items.js, state in `g.upgrades={id:true}`. `appleRateNow()` and a new `seedRateNow()`
  sum base rate, bought upgrades and item bonuses. Alternative: mutate `g.appleRate` on
  purchase as the farm milestone does. Rejected: summing from flags survives migrations and
  makes the rate explainable in the UI.
- **Where to show**: Streuobstwiese tab, section "AUSBAU" under the plots: locked rows show
  the unlock hint, unlocked rows a buy button, bought rows the bonus. No new tab.
- **Krähenpost is free**: it is a discovery reward, so it costs only the feeding already in
  the game.
- **Migration**: `g.upgrades` defaults to `{}`; `appleRate` from old saves stays as base
  (it already contains the farm milestone). Nothing is auto-bought.

## Risks / Trade-offs

- [Farm harvests make early waits near zero] → intended; the farm is the active option, the
  upgrades the passive one.
- [Late story costs rise for players mid-game] → only prices after the map change; a player
  who already paid keeps the result.

## Open Questions

- Does the author want the Krähenpost tied to the existing chalk secret, or a separate feed
  counter? Default: existing secret.
