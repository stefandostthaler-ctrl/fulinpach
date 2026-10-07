"use strict";
/* =====================================================================
   GEGENSTÄNDE, HÄNDLER, BÄUME UND GEGNER
   Hier stehen Namen, Beschreibungen, Preise und Kampfwerte.
   Zahlen kannst du gefahrlos ändern (z. B. cost, damage, defense, hp).
   ===================================================================== */

// Ausrüstungsplätze im Inventar.
const EQUIPMENT_SLOTS = [
  {id:"head",label:"KOPF"},{id:"chest",label:"KÖRPER"},
  {id:"weapon",label:"WAFFE"},{id:"hands",label:"HÄNDE"},
  {id:"feet",label:"FÜSSE"},{id:"trinket",label:"TALISMAN"}
];

// Alle Gegenstände. type: weapon, armor (mit slot), trinket oder misc.
const itemDb = {
  wrapper: {name:"Erstes Rindenzeichen", type:"misc", desc:"In die Rinde ist ein träger Wasserlauf geritzt. Die Jahreszahl ist verwischt."},
  spoon: {name:"Holzlöffel", type:"weapon", damage:3, desc:"Offiziell Küchenutensil. Inoffiziell Verhandlungsstrategie."},
  rustySword: {name:"Rostiges Obstmesser", type:"weapon", damage:8, desc:"Im Kampf kannst du damit gezielt zuschlagen. An der Mauer lässt sich ein Wegweiser schnitzen."},
  ratCrown: {name:"Krone des Bachrattenkönigs", type:"armor", slot:"head", defense:2, desc:"Riecht nach Jenbach und gescheiterter Monarchie."},
  linenVest: {name:"Leinenweste vom Obststand", type:"armor", slot:"chest", defense:1, desc:"Viele Taschen. Eine davon ist schon voller Apfelkerne."},
  pickerGloves: {name:"Pflückerhandschuhe", type:"armor", slot:"hands", damage:1, desc:"Besserer Griff am Messer und an widerspenstigen Ästen."},
  hikingBoots: {name:"Jenbachtaler Wanderstiefel", type:"armor", slot:"feet", defense:1, desc:"Mit trockenen Füßen kämpft es sich erstaunlich besser."},
  chalk: {name:"Stück Kreide", type:"misc", desc:"Besiegt etwas, das härter ist als Stahl: schlechte Wegführung."},
  tooth: {name:"Verdächtiger Zahn", type:"trinket", damage:1, desc:"Du hast ihn gefunden, weil du die Überschrift belästigt hast. Das sagt mehr über dich als über den Zahn."},
  kurkarte: {name:"Kurkarte aus einem Paralleluniversum", type:"trinket", defense:4, desc:"Keiner weiß, wofür sie gilt. Genau deshalb wirkt sie."},
  hollowApple: {name:"Hohler Apfel", type:"misc", desc:()=>`Innen steckt eine Treppe. Ein Apfel muss seine Grenzen kennen.${g.lore.choices.name===2?" An der Innenwand verläuft dieselbe geschwungene Linie, die du am Sockel ins Wegbuch gezeichnet hast.":g.lore.choices.name===1?" Wenn du ihn ans Ohr hältst, sagt er deinen Namen für den Bach nach, aber langsamer.":""}`},
  moorfrog: {name:"Moorfrosch-Talisman", type:"trinket", defense:1, damage:2, desc:"Ein kleiner Frosch aus Holz. Er wirkt uralt. Der Aufkleber darunter sagt 3,90 €."},
  brotzeit: {name:"Mysteriöse Almbrotzeit", type:"misc", desc:"Brot, Käse, Zwiebel. Die älteste bekannte Form von Crafting."},
  ledger: {name:"Apfelmarkt-Chronik", type:"misc", desc:"Die Chronik beginnt 1992. Auf einer fremden Randseite steht ein viel älterer Name: Fulinpah."},
  variety: {name:"Vergessener Apfelzweig", type:"trinket", defense:3, damage:2, desc:"Die Sorte steht auf keinem Schild. Der Zweig kennt den Weg zum langsamen Bach."},
  vow: {name:"Erfülltes Gelübde", type:"misc", desc:"An der Taxakapelle erinnert dich eine Geschichte von 1647 daran, ein Versprechen einzuhalten."},
  spring: {name:"Klang der Quelle", type:"misc", desc:"Am Litzldorfer Wasserfall klingt das Wasser, als würde es rückwärts zählen."},
  lantern: {name:"Moorlicht im Glas", type:"trinket", defense:3, desc:"Nur auf dem Bohlenweg eingefangen. Ein Irrlicht gehört sonst niemandem."},
  hikingStick: {name:"Stecken vom Farrenpoint", type:"weapon", damage:16, defense:3, desc:"Für den Weg zum Wendelstein. Für die letzte Wanderung besonders geeignet."},
  mannlgift: {name:"Gabe der Wendelstein-Männlein", type:"trinket", defense:7, damage:6, desc:"Die Männlein stellen lieber Fragen, bevor sie helfen. Der Ring wärmt sich, wenn du etwas teilst."},
  fahrkarte: {name:"Alte Fahrkarte", type:"misc", desc:"Die Schrift auf der Fahrkarte ist blass. 1897 begann die Fahrt nach Bad Aibling; 1973 endete sie. Zwischen den Zahlen steht ein Apfelbaum."},
  // desc darf eine Funktion sein, wenn der Text vom Spielstand abhängt.
  goldenApple: {name:"Goldener Apfel der Stadt", type:"trinket", defense:5, damage:5, desc:()=>`Verliehen für den Abschluss der Geschichte${g.flags.finalChoice==="share"?", weil die Ernte geteilt wurde":g.flags.finalChoice==="rest"?", weil der Bach bleiben durfte":""}. Bad Feilnbach ist offiziell keine Stadt, der Apfel offiziell nicht aus Gold. Beides stört niemanden. Seit der Verleihung fällt jede Sekunde ein Apfel mehr in die Kiste.`},
  appleADay: {name:"An apple a day…", type:"trinket", defense:1, damage:1, desc:"980 Lebenspunkte, wie das Jahr der ersten Erwähnung. Seitdem hält kein Arzt und kein Gegner mehr Schritt mit dir. Du bist unbesiegbar."}
};

// Bäume auf der Streuobstwiese: Kosten in Kernen, Reifezeit in Sekunden, Ertrag.
const FARM_VARIETIES={
  young:{name:"Junger Apfelbaum",cost:5,seconds:45,apples:25,seeds:6,icon:".\\|/."},
  old:{name:"Alte Apfelsorte",cost:8,seconds:75,apples:45,seeds:8,icon:"/###\\"},
  rare:{name:"Sagenapfel",cost:12,seconds:120,apples:85,seeds:12,icon:"(o)(o)"}
};

// Preise der späteren Geschichte (Issue #7). Alle Zahlen in Äpfeln; die Schaltflächen lesen sie hier aus.
const STORY_COSTS={ledger:200,vow:80,mannl:150,picker:200};

// Passive Ausbauten der Streuobstwiese (Issue #7). Jeder Ausbau wird durch eine Quest oder
// Entdeckung freigeschaltet, einmal gekauft und erhöht dauerhaft Äpfel oder Kerne pro Sekunde.
// unlock: wann er kaufbar ist. hint: was vorher fehlt. apples/seeds: Bonus pro Sekunde.
const UPGRADES=[
  {id:"crowPost",name:"Krähenpost",cost:{},apples:.5,seeds:0,unlock:()=>has("chalk"),
    hint:"Füttere die Krähe am Rathausplatz, bis sie dir etwas dalässt.",
    desc:"Die Krähe bringt jede zweite Sekunde einen Apfel vorbei. Woher, fragt man besser nicht."},
  {id:"rinnen",name:"Holzrinnen zur Wiese",cost:{apples:80,seeds:10},apples:1,seeds:0,unlock:()=>g.water.oster.stage==="solved",
    hint:"Erst muss am Wasserspielplatz Am Osterbach wieder Wasser fließen.",
    desc:"Die Spielrinnen vom Osterbach führen jetzt bis zur Wiese. Die Bäume trinken, die Kinder beschweren sich."},
  {id:"fuhre",name:"Apfelfuhre über die Brücke",cost:{apples:150},apples:1.5,seeds:0,unlock:()=>g.flags.jenbachWon,
    hint:"Solange der Bachrattenkönig die Jenbachbrücke hält, fährt niemand hinüber.",
    desc:"Ein Anhänger voller Äpfel rollt über die Jenbachbrücke. Die Ratten haben keine Einwände mehr."},
  {id:"alm",name:"Almwirtschaft",cost:{apples:300,seeds:20},apples:2,seeds:0,unlock:()=>g.flags.wirtsalmWon,
    hint:"Auf der Wirtsalm muss erst wieder Ruhe einkehren.",
    desc:"Die Hüttenwirtin nimmt deine Äpfel in Kommission. Der Golem schweigt dazu."},
  {id:"sorten",name:"Sortengarten",cost:{seeds:40},apples:0,seeds:1,unlock:()=>g.flags.orchardSong,
    hint:"Der vergessene Sortenname bei Wiechs fehlt noch.",
    desc:"Ein Beet mit alten Sorten liefert laufend Kerne. Jeder trägt einen Namen, den niemand aussprechen kann."},
  {id:"markt",name:"Marktstand",cost:{apples:500},apples:3,seeds:0,unlock:()=>g.flags.marketLedger,
    hint:"Erst die Marktchronik lesen, dann einen Stand beantragen.",
    desc:"Ein eigener Stand auf dem Apfelmarkt. Die Chronik vermerkt dich als Aussteller ohne Nachnamen."}
];

// Angebot des Händlers. action: was beim Kauf passiert.
const shopItems = [
  {id:"spoon", label:"Holzlöffel", cost:{apples:60}, action:()=>addItem("spoon")},
  {id:"linenVest", label:"Leinenweste vom Obststand", cost:{apples:110}, action:()=>addItem("linenVest")},
  {id:"seedCollector", label:"Kernsammler", cost:{apples:140}, action:()=>{g.seedRate=.5;say("Der Kernsammler sortiert Kerne. Sein Betriebsrat besteht aus einer Krähe.","good")}},
  {id:"rustySword", label:"Rostiges Obstmesser", cost:{seeds:35}, action:()=>addItem("rustySword")},
  {id:"pickerGloves", label:"Pflückerhandschuhe", cost:{seeds:20}, action:()=>addItem("pickerGloves")},
  {id:"hikingBoots", label:"Jenbachtaler Wanderstiefel", cost:{seeds:40}, action:()=>addItem("hikingBoots")},
  {id:"map", label:"Verdächtig genaue Wanderkarte", cost:{apples:250,seeds:10}, action:()=>{g.flags.mapBought=true;g.unlocks.map=true;say("Du faltest die Karte auf. Die Orte stimmen. Die eingezeichneten Monster eher nicht.","good")}},
  {id:"insurance", label:"Sehr lokale Abenteuer-Versicherung", cost:{apples:300}, repeat:true, action:()=>{g.insuranceBonus+=25;g.maxHp+=25;g.hp=g.maxHp;say("Versichert sind Monster und existenzielle Schäden. Äpfel: natürlich nicht.","good");checkAppleADay()}},
  {id:"doNotBuy", label:"NICHT KAUFEN", cost:{apples:666}, action:()=>{g.flags.doNotBuy=true;g.bark+=3;g.stats.secrets++;say("Du kaufst den Gegenstand mit der Aufschrift NICHT KAUFEN. Der Händler notiert deinen Namen.","secret");say("Drei Rindenzeichen erscheinen in deiner Tasche. Du untersuchst die Tasche nicht weiter.")}}
];

// Gegner: hp = Lebenspunkte, damage = Schaden pro Angriff, interval = Angriffstakt in ms.
// special (optional): schwerer Angriff. every = jeder wievielte Angriff, windup = Ausholen in ms,
// factor = Vielfaches des normalen Schadens. Ein gezielter Angriff während des Ausholens unterbricht ihn.
const enemies={
  bachratte:{
    name:"Der Bachrattenkönig", hp:90,maxHp:90,damage:7,interval:1300,
    special:{name:"Sprung von der Brücke",every:3,windup:1500,factor:2},
    reward:()=>{g.bark+=2;g.apples+=15;addItem("ratCrown");g.flags.jenbachWon=true;g.flags.ratRoute="kampf";say("Der Bachrattenkönig fällt. Am Jenbach beginnt eine sehr kleine Verfassungskrise.","good");say("Im Rattennest liegen 15 gehortete Äpfel. Der Hofstaat hatte offenbar Vorräte, aber keinen Plan.","good")}
  },
  golem:{
    name:"Der Schmalznudel-Golem", hp:150,maxHp:150,damage:9,interval:1300,
    reward:()=>{g.cider+=3;g.bark+=3;addItem("kurkarte");g.flags.wirtsalmWon=true;g.flags.golemRoute="kampf";say("Der Schmalznudel-Golem zerfällt in überraschend appetitliche Einzelteile.","good");say("Dazu erhältst du 3 Mostflaschen und 3 Rindenzeichen.","good")}
  },
  picker:{
    name:"Der letzte Pflücker", hp:260,maxHp:260,damage:12,interval:1400,
    reward:()=>{g.flags.finalWon=true;g.combat=null;g.stats.secrets++;say("Der Pflücker fällt. Die Kerne seiner Äpfel zeigen auf denselben Bach.","secret");say("Jetzt ist es an dir, über Fulinpach zu entscheiden.","good")}
  }
};
