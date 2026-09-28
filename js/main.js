"use strict";
/* =====================================================================
   START UND SPIELTAKT
   Lädt den Spielstand, startet die Anzeige und lässt die Kiste
   fünfmal pro Sekunde Äpfel zählen.
   ===================================================================== */

const TICK_MS=200;

function tick(){
  const now=Date.now();
  const previousUnlocks=Object.values(g.unlocks).join("");
  const wasFighting=Boolean(g.combat);
  creditElapsedTime(now,300);
  combatTick(now); updateUnlocks();
  if(now-(g.lastSave||0)>5000)saveGame();
  // Neue Freischaltung oder Kampfende: alles neu aufbauen.
  if(previousUnlocks!==Object.values(g.unlocks).join("") || (wasFighting&&!g.combat)){render();return}
  // Sonst nur Zahlen, Schaltflächen und Zeitanzeigen auffrischen.
  refreshView(now);
}

$("title").onclick=()=>{
  g.flags.titleClicks++;
  if(g.flags.titleClicks===5 && !g.flags.tooth){g.flags.tooth=true;g.stats.secrets++;addItem("tooth");say("Hör auf, die Überschrift anzuklicken.","secret")}
  else if(g.flags.titleClicks===9)say("Ernsthaft.","secret");
  else if(g.flags.titleClicks===13)say("Gut. Dafür gibt es keinen Erfolg. Vermutlich.","secret");
  render();
};

// Beim Schließen oder Verstecken des Tabs sofort speichern; beim Zurückkommen sofort nachrechnen.
window.addEventListener("pagehide",saveGame);
document.addEventListener("visibilitychange",()=>{if(document.hidden)saveGame();else tick()});

const fallingApple=resourceGraphic("apples");fallingApple.className="falling-apple";$("mainStage").appendChild(fallingApple);
loadGame(); render(); setInterval(tick,TICK_MS);
