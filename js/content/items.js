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
  hollowApple: {name:"Hohler Apfel", type:"misc", desc:"Innen steckt eine Treppe. Ein Apfel muss seine Grenzen kennen."},
  moorfrog: {name:"Moorfrosch-Talisman", type:"trinket", defense:1, damage:2, desc:"Ein kleiner Frosch aus Holz. Er wirkt uralt. Der Aufkleber darunter sagt 3,90 €."},
  brotzeit: {name:"Mysteriöse Almbrotzeit", type:"misc", desc:"Brot, Käse, Zwiebel. Die älteste bekannte Form von Crafting."},
  ledger: {name:"Apfelmarkt-Chronik", type:"misc", desc:"Die Chronik beginnt 1992. Auf einer fremden Randseite steht ein viel älterer Name: Fulinpah."},
  variety: {name:"Vergessener Apfelzweig", type:"trinket", defense:3, damage:2, desc:"Die Sorte steht auf keinem Schild. Der Zweig kennt den Weg zum langsamen Bach."},
  vow: {name:"Erfülltes Gelübde", type:"misc", desc:"An der Taxakapelle erinnert dich eine Geschichte von 1647 daran, ein Versprechen einzuhalten."},
  spring: {name:"Klang der Quelle", type:"misc", desc:"Am Litzldorfer Wasserfall klingt das Wasser, als würde es rückwärts zählen."},
  lantern: {name:"Moorlicht im Glas", type:"trinket", defense:3, desc:"Nur auf dem Bohlenweg eingefangen. Ein Irrlicht gehört sonst niemandem."},
  hikingStick: {name:"Stecken vom Farrenpoint", type:"weapon", damage:16, defense:3, desc:"Für den Weg zum Wendelstein. Für die letzte Wanderung besonders geeignet."},
  mannlgift: {name:"Gabe der Wendelstein-Männlein", type:"trinket", defense:7, damage:6, desc:"Die Männlein stellen lieber Fragen, bevor sie helfen. Der Ring wärmt sich, wenn du etwas teilst."},
  fahrkarte: {name:"Alte Fahrkarte", type:"misc", desc:"Die Schrift auf der Fahrkarte ist blass. 1897 begann die Fahrt nach Bad Aibling; 1973 endete sie. Zwischen den Zahlen steht ein Apfelbaum."}
};

// Bäume auf der Streuobstwiese: Kosten in Kernen, Reifezeit in Sekunden, Ertrag.
const FARM_VARIETIES={
  young:{name:"Junger Apfelbaum",cost:5,seconds:45,apples:25,seeds:6,icon:".\\|/."},
  old:{name:"Alte Apfelsorte",cost:8,seconds:75,apples:45,seeds:8,icon:"/###\\"},
  rare:{name:"Sagenapfel",cost:12,seconds:120,apples:85,seeds:12,icon:"(o)(o)"}
};

// Angebot des Händlers. action: was beim Kauf passiert.
const shopItems = [
  {id:"spoon", label:"Holzlöffel", cost:{apples:60}, action:()=>addItem("spoon")},
  {id:"linenVest", label:"Leinenweste vom Obststand", cost:{apples:110}, action:()=>addItem("linenVest")},
  {id:"seedCollector", label:"Kernsammler", cost:{apples:140}, action:()=>{g.seedRate=.5;say("Der Kernsammler sortiert Kerne. Sein Betriebsrat besteht aus einer Krähe.","good")}},
  {id:"rustySword", label:"Rostiges Obstmesser", cost:{seeds:35}, action:()=>addItem("rustySword")},
  {id:"pickerGloves", label:"Pflückerhandschuhe", cost:{seeds:20}, action:()=>addItem("pickerGloves")},
  {id:"hikingBoots", label:"Jenbachtaler Wanderstiefel", cost:{seeds:40}, action:()=>addItem("hikingBoots")},
  {id:"map", label:"Verdächtig genaue Wanderkarte", cost:{apples:220,seeds:10}, action:()=>{g.flags.mapBought=true;g.unlocks.map=true;say("Du faltest die Karte auf. Die Orte stimmen. Die eingezeichneten Monster eher nicht.","good")}},
  {id:"insurance", label:"Sehr lokale Abenteuer-Versicherung", cost:{apples:300}, repeat:true, action:()=>{g.insuranceBonus+=25;g.maxHp+=25;g.hp=g.maxHp;say("Versichert sind Monster und existenzielle Schäden. Äpfel: natürlich nicht.","good")}},
  {id:"doNotBuy", label:"NICHT KAUFEN", cost:{apples:666}, action:()=>{g.flags.doNotBuy=true;g.bark+=3;g.stats.secrets++;say("Du kaufst den Gegenstand mit der Aufschrift NICHT KAUFEN. Der Händler notiert deinen Namen.","secret");say("Drei Rindenzeichen erscheinen in deiner Tasche. Du untersuchst die Tasche nicht weiter.")}}
];

// Gegner: hp = Lebenspunkte, damage = Schaden pro Angriff, interval = Angriffstakt in ms.
const enemies={
  bachratte:{
    name:"Der Bachrattenkönig", hp:90,maxHp:90,damage:7,interval:1300,
    reward:()=>{g.bark+=2;addItem("ratCrown");g.flags.jenbachWon=true;g.flags.ratRoute="kampf";say("Der Bachrattenkönig fällt. Am Jenbach beginnt eine sehr kleine Verfassungskrise.","good")}
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
