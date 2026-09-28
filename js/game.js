"use strict";
/* =====================================================================
   SPIELLOGIK
   Spielstand (g), Regeln, Quests, Kampf, Speichern und Laden.
   Alles, was hier steht, verändert den Spielstand; die Anzeige
   liegt in ui.js.
   ===================================================================== */

const SAVE_KEY = "fulinpach_bad_feilnbach_v3";
const OLD_SAVE_KEY = "candy_box_3_bad_feilnbach_de_v2";
const VERSION = 11;
const MAX_OFFLINE_SECONDS = 8*3600; // Längste Abwesenheit, die als Ernte angerechnet wird

const fresh = () => ({
  version: VERSION,
  born: Date.now(), lastTick: Date.now(), lastSave: Date.now(),
  apples: 0, seeds: 0, cider: 0, bark: 0,
  eaten: 0, thrown: 0, insuranceBonus:0,
  appleRate: 1, seedRate: 0,
  hp: 100, maxHp: 100, damage: 2, defense: 0,
  currentTab: "main", location: "rathaus",
  inventory: [], equipped: { head:null, chest:null, weapon:null, hands:null, feet:null, trinket:null },
  shopBought: {},
  unlocks: { eat:false, throw:false, wrapper:false, farm:false, shop:false, inventory:false, map:false, journal:true, quests:false, box:false, save:true },
  farm:{selection:"young",harvests:0,plots:[null,null,null]},
  lore:{opened:{},choices:{}},
  chronicle:{visited:["rathaus"],solved:[]},
  encounters:{},
  water:{oster:{stage:"new",solution:null},flood:{stage:"new",warning:null,solution:null}},
  flags: {
    wrapperSeen:false, wrapperChoice:null, crateInspected:false, titleClicks:0, tooth:false,
    jenbachVisited:false, jenbachWon:false, ratRoute:null,
    filzeVisited:false, filzeSecret:false,
    churchVisited:false, candleLit:false,
    wallSeen:false, wallPassed:false,
    wallMarker:false,
    treglerVisited:false, treglerReward:false,
    wirtsalmVisited:false, wirtsalmWon:false, golemRoute:null,
    mapBought:false, chalkUsed:false,
    crow:false, crowFeed:0,
    doNotBuy:false, whisperUnlocked:false, boxOpened:false,
    ending:false, marketVisited:false, marketLedger:false, orchardVisited:false,
    orchardSong:false, auVisited:false, vowKept:false, litzldorfVisited:false,
    springHeard:false, farrenpointVisited:false, mountainVisited:false,
    mannlGift:false, fulinpachVisited:false, finalWon:false, finalChoice:null,
    moorLight:false, loreSeen:false, farmMilestone:false, oldHarvest:false,
    bahnhofVisited:false, bahnhofFound:false
  },
  combat: null,
  messages: ["Die Kiste ist leer."], notice:null,
  stats: { deaths:0, enemies:0, secrets:0 }
});

let g = fresh();

function gearSlot(id){
  const it=itemDb[id];
  return it?.slot || (it?.type==="weapon"?"weapon":it?.type==="trinket"?"trinket":null);
}

function addItem(id){
  if(!g.inventory.includes(id)){
    g.inventory.push(id); g.unlocks.inventory = true;
    say(`Du erhältst: ${itemDb[id]?.name || id}.`, "good");
    const it=itemDb[id], slot=gearSlot(id);
    if(slot && (!g.equipped[slot] || (it.damage||0)>(itemDb[g.equipped[slot]]?.damage||0) && slot==="weapon")){
      g.equipped[slot]=id; recomputeStats();
      say(`${it.name} ist am Platz ${EQUIPMENT_SLOTS.find(s=>s.id===slot).label} angelegt. Schaden: ${g.damage}, Schutz: ${g.defense}.`, "good");
    }
  }
}
function has(id){ return g.inventory.includes(id); }
function say(msg, cls=""){
  const entry=(cls?`[${cls}] `:"")+msg;
  g.messages.push(entry);
  if(g.messages.length>90) g.messages.shift();
  const now=Date.now();
  if(!g.notice || now-g.notice.at>160 || g.notice.tab!==g.currentTab || g.notice.location!==g.location)
    g.notice={at:now,tab:g.currentTab,location:g.location,lines:[]};
  g.notice.lines.push(entry);
  if(g.notice.lines.length>4)g.notice.lines.shift();
  scheduleMessageRender();
}
// Mehrere Meldungen hintereinander werden nur einmal gezeichnet.
let messageRenderQueued=false;
function scheduleMessageRender(){
  if(messageRenderQueued)return;
  messageRenderQueued=true;
  queueMicrotask(()=>{messageRenderQueued=false;renderNotice();renderLog()});
}

function spend(kind, amount){
  if(g[kind] + 1e-9 < amount) return false;
  g[kind] -= amount; return true;
}

function updateUnlocks(){
  if(g.flags.crateInspected)g.unlocks.farm=true;
  if((g.apples >= 10 || g.eaten>0) && !g.unlocks.eat){
    g.unlocks.eat = true; say("Du kannst Äpfel essen. Je 20 gegessene Äpfel erhöhen deine maximalen LP.");
  }
  if((g.apples >= 25 || g.thrown>0) && !g.unlocks.throw){
    g.unlocks.throw = true; say("Du kannst Äpfel für die Krähe auslegen. Sie beobachtet dich bereits.");
  }
  if((g.apples >= 40 || g.thrown >= 20) && !g.flags.wrapperSeen && !g.unlocks.wrapper){
    g.unlocks.wrapper = true; say("Unter den Äpfeln liegt ein Rindenstück. Untersuche es in der Apfelkiste.","secret");
  }
  if((g.flags.wrapperSeen || g.apples >= 90) && !g.unlocks.shop){
    g.unlocks.shop = true; say("Der Händler hat seinen Stand geöffnet. Auf dem Rathausplatz gibt es jetzt mehr zu entdecken.","good");
  }
  if(g.unlocks.inventory && g.shopBought.map) g.unlocks.map = true;
  if(g.unlocks.map && (g.flags.jenbachVisited || g.flags.filzeVisited || g.flags.churchVisited)) g.unlocks.quests = true;
  if(g.bark >= 3 || g.flags.crow || g.flags.wirtsalmWon) g.unlocks.box = true;
}

function eatApples(){
  const amt = Math.max(1, Math.min(20, Math.floor(g.apples)));
  if(!spend("apples", amt)) return;
  g.eaten += amt;
  const old = g.maxHp;
  g.maxHp = 100 + g.insuranceBonus + Math.floor(g.eaten / 20) * 2 + (g.flags.candleLit?10:0);
  g.hp = Math.min(g.maxHp, g.hp + Math.ceil(amt/2));
  say(`Du isst ${amt} Äpfel. Ein Obstbauer nickt anerkennend. Nach dem zwanzigsten Apfel nicht mehr.`);
  if(g.maxHp>old) say("Deine maximalen LP steigen. Obst ist jetzt offenbar Medizin.","good");
  render();
}

function leaveApples(){
  if(!spend("apples", 10)) return;
  g.thrown += 10;
  say("Du legst 10 Äpfel neben die Kiste. Wegwerfen wäre selbst für dieses Spiel zu dumm.");
  if(g.thrown>=30 && !g.flags.crow){
    g.flags.crow=true; g.stats.secrets++;
    say("Eine Krähe landet neben der Kiste, mustert dich und beschließt, dass du leicht zu erziehen bist.","secret");
  }
  render();
}

function inspectWrapper(){
  g.flags.wrapperSeen=true; g.unlocks.wrapper=false; addItem("wrapper");
  say("Das Rindenzeichen ist warm. Es liegt draußen in Bad Feilnbach. Trotzdem ist das verdächtig.");
  render();
}
function inspectCrate(){
  if(g.flags.crateInspected)return;
  g.flags.crateInspected=true; g.apples+=12;g.seeds+=5;g.unlocks.farm=true;
  say("Du klopfst die Kiste ab. Ein loses Brett gibt nach; dahinter liegen 12 Äpfel, 5 Kerne und eine eingeritzte Bachlinie.","good");
  say("Mit den Kernen kannst du die ersten Bäume auf der Streuobstwiese pflanzen.","good");
  say("Jetzt kannst du die Äpfel essen. Wenn du später welche für die Krähe auslegst, wird sie aufmerksam.","secret");
  render();
}


function farmVarieties(){return Object.keys(FARM_VARIETIES).filter(id=>id==="young"||id==="old"&&g.flags.marketLedger||id==="rare"&&g.flags.orchardSong)}
function plantPlot(index){
  const id=g.farm.selection,variety=FARM_VARIETIES[id];
  if(!g.unlocks.farm||!farmVarieties().includes(id)||g.farm.plots[index]||!spend("seeds",variety.cost))return;
  g.farm.plots[index]={variety:id,plantedAt:Date.now(),readyAt:Date.now()+variety.seconds*1000,watered:false};
  say(`Du pflanzt ${variety.name} auf Platz ${index+1}. Die ersten Äpfel reifen in ${variety.seconds} Sekunden.`,"good");render();saveGame();
}
function waterPlot(index){
  const plot=g.farm.plots[index];
  if(!plot||plot.watered||Date.now()>=plot.readyAt||!spend("apples",3))return;
  plot.watered=true;plot.readyAt=Math.max(Date.now()+1000,plot.readyAt-12000);
  say(`Du gießt Baum ${index+1}. Die Ernte reift früher und fällt etwas üppiger aus.`,"good");render();saveGame();
}
function harvestPlot(index){
  const plot=g.farm.plots[index];if(!plot||Date.now()<plot.readyAt)return;
  const variety=FARM_VARIETIES[plot.variety],apples=variety.apples+(plot.watered?8:0);
  g.apples+=apples;g.seeds+=variety.seeds;g.farm.harvests++;g.farm.plots[index]=null;
  say(`Ernte auf Platz ${index+1}: ${apples} Äpfel und ${variety.seeds} Kerne.`,"good");
  if(plot.variety==="old"&&!g.flags.oldHarvest){g.flags.oldHarvest=true;g.bark++;say("Unter der alten Sorte findest du ein Rindenzeichen.","secret")}
  if(g.farm.harvests>=3&&!g.flags.farmMilestone){g.flags.farmMilestone=true;g.appleRate++;say("Drei Ernten! Deine kleine Streuobstwiese bringt jetzt dauerhaft 1 Apfel pro Sekunde zusätzlich.","good")}
  render();saveGame();
}

function wrapperChoice(choice){
  if(g.flags.wrapperChoice) return;
  g.flags.wrapperChoice=choice;
  if(choice==="eat"){
    g.hp=Math.max(1,g.hp-15); g.bark+=1;
    say("Du kaust auf der Rinde herum. Geschmack: Baum. Urteil: verdient.","bad");
    say("Du erhältst trotzdem 1 Rindenzeichen. Die Buchhaltung verweigert jede Stellungnahme.","good");
  } else if(choice==="tear"){
    g.bark+=2;
    say("Du reißt es in zwei Hälften. Zwei Hälften gelten hier als zwei Rindenzeichen. Volkswirtschaft abgeschlossen.","good");
  } else {
    g.bark+=1;
    say("Du behältst es. Jede Sammlung beginnt mit einem Gegenstand, den man besser weggeworfen hätte.");
  }
  render();
}


function canAfford(cost){return Object.entries(cost).every(([k,v])=>g[k]>=v)}
function costText(cost){
  const names={apples:"Äpfel",seeds:"Apfelkerne",cider:"Mostflaschen",bark:"Rindenzeichen"};
  return Object.entries(cost).map(([k,v])=>`${v} ${names[k]||k}`).join(" + ");
}
function buy(si){
  if(!si.repeat && g.shopBought[si.id]) return;
  if(!canAfford(si.cost)) return;
  for(const [k,v] of Object.entries(si.cost)) g[k]-=v;
  if(!si.repeat) g.shopBought[si.id]=true;
  si.action(); render(); saveGame();
}

function equipSlot(slot,id){
  if(!EQUIPMENT_SLOTS.some(s=>s.id===slot))return;
  if(id && (!has(id) || gearSlot(id)!==slot))return;
  if(g.equipped[slot]===id)return;
  g.equipped[slot]=id||null;
  recomputeStats();
  say(`${EQUIPMENT_SLOTS.find(s=>s.id===slot).label}: ${id?itemDb[id].name:"leer"}. Schaden ${g.damage}, Schutz ${g.defense}.`,"good");
  render(); saveGame();
}
function recomputeStats(){
  g.damage=2; g.defense=0;
  for(const {id} of EQUIPMENT_SLOTS){
    const it=itemDb[g.equipped[id]];
    if(it?.damage)g.damage+=it.damage;
    if(it?.defense)g.defense+=it.defense;
  }
}


function startCombat(id){
  const e=enemies[id];
  g.combat={id,enemyHp:e.maxHp,nextEnemy:Date.now()+e.interval,nextPlayer:Date.now()+850,nextStrike:0,lastHit:0,lastHurt:0};
  say(`${e.name} versperrt dir den Weg. Deine ausgerüstete Waffe: ${g.equipped.weapon?itemDb[g.equipped.weapon].name:"keine"}.`,"bad");
  if(!g.equipped.weapon)say("Ohne Waffe dauert das lange. Fliehen geht jederzeit, und meistens gibt es auch einen friedlichen Weg.","bad");
}

function travel(place){
  if(place==="biberdamm"&&g.water.oster.stage==="new" || place==="siedlung"&&(!g.flags.jenbachWon||g.water.oster.stage!=="solved"||g.water.flood.stage==="new"))return;
  g.currentTab="quests"; g.unlocks.quests=true; g.location=place; g.combat=null;
  if(!g.chronicle.visited.includes(place)){
    g.chronicle.visited.push(place);
    if(["rathaus","bahnhof","filze","kirche","au","markt","wiechs","litzldorf"].includes(place))say("Eine neue Seite der Ortschronik ist im Questbuch aufgeschlagen.","secret");
  }
  if(place==="osterbach")say(g.water.oster.stage==="solved"?"Am Wasserspielplatz Am Osterbach gluckert wieder Wasser durch die Holzrinnen.":"Am Wasserspielplatz Am Osterbach sind die Holzrinnen trocken.");
  if(place==="biberdamm")say("Oberhalb des Platzes hält ein Biberdamm Wasser zurück. Der Biber sieht den Damm als Wohnung, nicht als Problem.");
  if(place==="siedlung")say("An den Wohnhäusern am Jenbach liegt der Hof tiefer als die Straße. Du siehst nach, ob alle die Warnung erhalten haben.");
  if(place==="rathaus") say("Du kehrst zum Rathausplatz zurück. Die Kiste steht noch da. Offenbar ist niemand zuständig.");
  if(place==="kirche"){
    g.flags.churchVisited=true;
    say("Du stehst an der Pfarrkirche Herz Jesu. Für einen Moment ist sogar das Spiel still.");
  }
  if(place==="filze"){
    g.flags.filzeVisited=true;
    say("Du betrittst die Sterntaler Filze. Der Bohlenweg knarzt. Das Moor wirkt älter als deine Spielstände.");
  }
  if(place==="bahnhof"){
    g.flags.bahnhofVisited=true;
    say("Hier lag einst der Feilnbacher Bahnhof. Auf Teilen der früheren Bahntrasse verläuft heute ein Radweg.");
  }
  if(place==="jenbach"){
    g.flags.jenbachVisited=true;
    say(!g.flags.jenbachWon?"Der Bachrattenkönig sitzt an der Brücke. Du kannst ihn vertreiben oder mit Äpfeln vom Weg locken.":g.water.oster.stage==="solved"&&g.water.flood.stage!=="solved"?"Die Ratten sind fort, doch nach starkem Regen schwillt der Jenbach an.":"Das Jenbachparadies ist wieder ruhig. Die Ratten haben offenbar auf demokratische Strukturen umgestellt.");
  }
  if(place==="wall"){
    g.flags.wallSeen=true;
    say("Im unteren Jenbachtal steht eine Mauer quer über dem Weg. Sie war laut Karte gestern noch nicht da. Wahrscheinlich ein Update.");
  }
  if(place==="tregler"){
    g.flags.treglerVisited=true;
    say("Du erreichst die Tregler Alm. Die Aussicht reicht weit über die Streuobstwiesen. Hinter dir atmet etwas im Gebüsch.");
  }
  if(place==="wirtsalm"){
    if(!g.flags.wallPassed){say("Der Weg Richtung Wirtsalm endet vor der Mauer.","bad");g.location="wall";render();return;}
    g.flags.wirtsalmVisited=true;
    say(!g.flags.wirtsalmWon?"Der Schmalznudel-Golem bewacht den Weg. Bekämpfen oder mit einer Brotzeit ablenken?":"Bei der Wirtsalm ist wieder Ruhe eingekehrt. Niemand spricht über den Golem. Das ist vermutlich besser so.");
  }
  if(place==="markt"){
    g.flags.marketVisited=true;
    say("Am Rathausplatz beginnt der Apfelmarkt. Zwischen alten Sortennamen steht plötzlich FULINPAH auf einer Kiste.");
  }
  if(place==="wiechs"){
    g.flags.orchardVisited=true;
    say("Bei Wiechs sind die Streuobstwiesen voller alter Sorten. Ein Baum trägt Früchte, aber keinen Namen.");
  }
  if(place==="au"){
    g.flags.auVisited=true;
    say("Au. Die Taxakapelle steht am Aubach. Ein altes Gelübde gab der Kapelle ihren Anfang. Deines wartet noch.");
  }
  if(place==="litzldorf"){
    g.flags.litzldorfVisited=true;
    say("Bei Litzldorf stürzt Wasser in die Tiefe. Auf deinem Rindenzeichen fließt es langsam.");
  }
  if(place==="farrenpoint"){
    g.flags.farrenpointVisited=true;
    say("Am Farrenpoint wird der Blick weit. Der Fels antwortet auf kein geflüstertes Passwort.");
  }
  if(place==="wendelstein"){
    g.flags.mountainVisited=true;
    say("Der Wendelstein. Die Männlein aus der Sage fragen, ob du Hilfe suchst oder bloß Beute.");
  }
  if(place==="fulinpach"){
    g.flags.fulinpachVisited=true;
    say("Unter der alten Kiste fließt ein Bach, der kaum vorankommt. Auf der Rinde steht: Fulinpah.");
  }
  render();
}

function inspectOster(){
  if(g.location!=="osterbach"||g.water.oster.stage!=="new")return;
  g.water.oster.stage="trail";
  say("Du folgst dem trockenen Gerinne oberhalb des Spielplatzes. Fußspuren im Schlamm und frisch angenagte Zweige führen bachaufwärts.","secret");render();saveGame();
}
function inspectDam(){
  if(g.location!=="biberdamm"||g.water.oster.stage!=="trail")return;
  g.water.oster.stage="assessed";
  say("Ein Biberdamm staut das Wasser. Die Biberfamilie wohnt hier; den Damm einfach einzureißen wäre weder klug noch nötig. Eine Fachperson kann die Lage beurteilen.","secret");render();saveGame();
}
function osterCosts(){return {fachstelle:g.encounters.osterbach==="survey"?4:8,gemeinschaft:g.encounters.osterbach==="neighbors"?5:15}}
function solveOster(method){
  const w=g.water.oster;if(g.location!=="biberdamm"||w.stage!=="assessed")return;
  const cost=osterCosts();
  const routes={
    fachstelle:{cost:{seeds:cost.fachstelle},text:"Die Fachstelle richtet mit Zustimmung aller Beteiligten einen kontrollierten Ablauf ein. Die Biberburg bleibt ungestört."},
    versorgung:{cost:{apples:35},text:"Das Team verlegt die Zuleitung der Spielrinnen. Der natürliche Bach und der Biberdamm bleiben, wie sie sind."},
    gemeinschaft:{cost:{apples:cost.gemeinschaft,seeds:5},text:"Die Nachbarschaft übernimmt mit der Gemeinde eine kleine alternative Wasserversorgung. Niemand fasst den Biberdamm an."}
  };
  const route=routes[method];if(!route||!canAfford(route.cost))return;
  for(const [key,cost] of Object.entries(route.cost))spend(key,cost);
  w.stage="solved";w.solution=method;g.seeds+=10;
  say(route.text,"good");say("Die Spielrinnen führen wieder Wasser. In einem Säckchen am Rand liegen 10 Kerne für die Streuobstwiese.","good");
  if(g.flags.jenbachWon)say("Wenig später kündigt starker Regen einen zweiten Wasserfall an: Am Jenbach wird Hilfe gebraucht.","bad");
  render();saveGame();
}
function inspectRain(){
  if(g.location!=="jenbach"||g.water.oster.stage!=="solved"||!g.flags.jenbachWon||g.water.flood.stage!=="new")return;
  g.water.flood.stage="observed";
  say("Starker Regen, ein steigender Pegel und angeschwemmtes Holz: Am Jenbach sind die Häuser unterhalb der Brücke gefährdet. Zuerst müssen die Menschen Bescheid wissen.","bad");render();saveGame();
}
function warnHomes(method){
  const f=g.water.flood;if(f.stage!=="observed"||g.location!=="siedlung"||!["nachbarn","gemeinde"].includes(method))return;
  f.stage="warned";f.warning=method;
  say(method==="nachbarn"?"Du gehst mit den Nachbarn von Tür zu Tür. Alle im gefährdeten Bereich wissen Bescheid und bringen sich in Sicherheit.":"Du informierst die Gemeinde. Die Einsatzkräfte warnen die gefährdeten Häuser und sichern den Zugang zum Bach.","good");
  say("Jetzt zurück zum Jenbach: Das Wasser steigt weiter. Die Einsatzkräfte übernehmen die Arbeiten am Ufer.","bad");render();saveGame();
}
function solveFlood(method){
  const f=g.water.flood;if(f.stage!=="warned"||g.location!=="jenbach")return;
  const routes={
    treibholz:{cost:{apples:30},text:"Du versorgst die Einsatzkräfte. Sie räumen das Treibholz an der Brücke kontrolliert aus dem Abfluss. Das Wasser kann wieder passieren."},
    rueckhalt:{cost:{seeds:15,apples:20},text:"Die Gemeinde aktiviert mit Helfern eine dafür vorgesehene Rückhaltefläche abseits der Häuser. Der Scheitel sinkt."},
    hausschutz:{cost:{apples:65},text:"Die Einsatzkräfte sichern die gefährdeten Eingänge und leiten das Oberflächenwasser von den Häusern weg."}
  };
  const route=routes[method];if(!route||!canAfford(route.cost))return;
  for(const [key,cost] of Object.entries(route.cost))spend(key,cost);
  f.stage="solved";f.solution=method;g.cider+=2;g.stats.secrets++;
  say(route.text,"good");say("Die Wohnhäuser bleiben trocken. Zwei Flaschen Apfelmost bringt die Nachbarschaft als Dank vorbei.","good");render();saveGame();
}

function combatTick(now){
  if(!g.combat)return;
  const e=enemies[g.combat.id];
  if(now>=g.combat.nextPlayer){
    g.combat.enemyHp-=g.damage; g.combat.nextPlayer=now+850;g.combat.lastHit=now;
    if(g.combat.enemyHp<=0){
      finishCombat(e); return;
    }
  }
  if(g.combat && now>=g.combat.nextEnemy){
    const dmg=Math.max(1,e.damage-g.defense); g.hp-=dmg; g.combat.nextEnemy=now+e.interval;g.combat.lastHurt=now;
    if(g.hp<=0){
      g.stats.deaths++; g.hp=g.maxHp;
      say(`Du wurdest von ${e.name} besiegt. Du wachst am Rathausplatz auf. Neben dir liegt ein Formular, das du nicht bestellt hast.`,"bad");
      g.combat=null; g.location="rathaus";
      saveGame();
    }
  }
}
function finishCombat(enemy){
  g.stats.enemies++; g.combat=null; enemy.reward(); saveGame(); render();
}
function resolveRatPeacefully(){
  if(g.location!=="jenbach"||g.combat||g.flags.jenbachWon||!spend("apples",35))return;
  g.flags.jenbachWon=true;g.flags.ratRoute="locken";g.bark+=2;addItem("ratCrown");
  say("Du legst 35 Äpfel abseits des Wegs aus. Der Bachrattenkönig zieht mit seinem Hofstaat um und lässt Krone und Rindenzeichen zurück.","good");render();saveGame();
}
function resolveGolemPeacefully(){
  if(g.location!=="wirtsalm"||g.combat||g.flags.wirtsalmWon||!g.flags.treglerReward||!spend("apples",45))return;
  g.flags.wirtsalmWon=true;g.flags.golemRoute="brotzeit";g.cider+=3;g.bark+=3;addItem("kurkarte");
  say("Mit der Tregler Brotzeit und 45 Äpfeln lockst du den Schmalznudel-Golem an einen freien Tisch. Er schläft ein und lässt Most, Rinde und Kurkarte zurück.","good");render();saveGame();
}
function strike(){
  if(!g.combat || Date.now()<(g.combat.nextStrike||0))return;
  const e=enemies[g.combat.id], weapon=g.equipped.weapon;
  const impact=g.damage+(weapon==="rustySword"?12:4);
  g.combat.enemyHp-=impact;
  g.combat.lastHit=Date.now();
  g.combat.nextStrike=Date.now()+3200;
  say(weapon==="rustySword"?`Du setzt das Obstmesser gezielt ein: ${impact} Schaden.`:`Du greifst gezielt an: ${impact} Schaden.`,"good");
  if(g.combat.enemyHp<=0){finishCombat(e);return;}
  render();
}

function carveMarker(){
  if(g.location!=="wall" || !has("rustySword") || g.flags.wallMarker)return;
  g.flags.wallMarker=true; g.seeds+=10;
  say("Mit dem Obstmesser schnitzt du einen Wegweiser in ein Stück Fallholz. Darunter liegen 10 Apfelkerne.","good");
  if(!has("chalk"))say("Ein eingeritzter Pfeil zeigt zur Krähe am Rathausplatz. Vielleicht hat sie etwas zum Zeichnen.","secret");
  render();
}

function drawDoor(){
  if(g.flags.wallPassed)return;
  if(!has("chalk")){say("Du brauchst etwas zum Zeichnen. Blut wäre dramatisch, aber hygienisch schwierig.","bad");return}
  g.flags.chalkUsed=true; g.flags.wallPassed=true;g.flags.wallRoute="chalk";g.stats.secrets++;
  say("Du zeichnest eine Tür auf die Mauer.","secret");
  say("Die Mauer akzeptiert die Tür. Cartoonrecht schlägt Baurecht.","good");
  render();
}
function bypassWall(){
  const apples=g.encounters.bahnhof==="route"?5:20;
  if(g.location!=="wall"||g.flags.wallPassed||!canAfford({apples,seeds:10}))return;
  spend("apples",apples);spend("seeds",10);g.flags.wallPassed=true;g.flags.wallRoute="path";
  say(`Ein Ortskundiger zeigt dir einen sicheren Pfad um die Mauer. ${apples===5?"Deine Wegskizze vom Bahnhof hilft ihm. ":""}Du versorgst die Helfer mit ${apples} Äpfeln und 10 Kernen.`,"good");render();saveGame();
}

function crowFeed(){
  if(g.apples<5)return; g.apples-=5; g.flags.crowFeed++;
  if(g.flags.crowFeed===1) say("Die Krähe frisst die Äpfel. Sie bedankt sich nicht. Krähen haben Standards.");
  if(g.flags.crowFeed===5){g.bark+=1;say("Die Krähe lässt ein Rindenzeichen fallen. Sie erwartet offenbar eine Fortsetzung dieser Geschäftsbeziehung.","secret");g.stats.secrets++}
  if(g.flags.crowFeed===10 && !has("chalk")){addItem("chalk");say("Die Krähe lässt ein Stück Kreide fallen. Du fragst nicht, warum eine Krähe Kreide besitzt.","secret");g.stats.secrets++}
  render();
}

function filzeExplore(){
  if(g.flags.filzeSecret){say("Der Moorfrosch ist verschwunden. Vermutlich hat er bessere Quests gefunden.");return;}
  if(g.apples<40){say("Ein Moorfrosch sieht dich an. Du hast zu wenig Äpfel, um seriös zu wirken.");return;}
  g.apples-=40; g.flags.filzeSecret=true; g.stats.secrets++; addItem("moorfrog");
  say("Du legst 40 Äpfel auf einen trockenen Holzpfosten. Der Moorfrosch ignoriert sie und zeigt auf einen Talisman.","secret");
  say("Das Moor nimmt keine Äpfel an. Offenbar ist selbst ein Hochmoor finanziell vernünftiger als du.");
  render();
}
function filzeExploreQuiet(){
  const cost=g.chronicle.solved.includes("moor1900")||g.encounters.filze==="frog"?5:15;
  if(g.flags.filzeSecret||!spend("seeds",cost))return;
  g.flags.filzeSecret=true;g.stats.secrets++;addItem("moorfrog");
  say(`Du legst ${cost} Kerne neben den Bohlenweg und wartest ruhig. ${cost===5?"Deine Beobachtungen zeigen dir den alten Torfstich. ":""}Der Moorfrosch bleibt sitzen; du findest den Talisman im Moos.`,"secret");render();
}
function findFahrkarte(){
  if(g.flags.bahnhofFound)return;
  g.flags.bahnhofFound=true; g.stats.secrets++; addItem("fahrkarte");
  say("Zwischen zwei verwitterten Schwellen steckt eine alte Fahrkarte. Die Schrift ist blass, aber lesbar.","secret");
  render();
}

function lightCandle(quiet=false){
  if(g.flags.candleLit){say("Die Kerze brennt bereits. Mehrfachklicks erhöhen die Spiritualität nicht.");return;}
  g.flags.candleLit=true; g.maxHp+=10; g.hp=g.maxHp; g.stats.secrets++;
  say(quiet?"Du setzt dich für einen Moment in die Stille. Eine Pause ist manchmal eine Handlung.":"Du zündest eine Kerze an. Eine Pause ist manchmal eine Handlung.","secret");
  say("Deine maximalen LP steigen um 10. Videospiel-Logik bleibt unbesiegt.","good");
  render();
}

function takeBrotzeit(){
  if(g.flags.treglerReward){say("Du hattest bereits eine Brotzeit. Gier ist kein Skilltree.");return;}
  g.flags.treglerReward=true; g.hp=g.maxHp;
  say("Du nimmst die Brotzeit. Deine LP sind vollständig geheilt. Niemand weiß, ob das am Käse oder an der Aussicht liegt.","good");
  render();
}
function packBrotzeit(){
  if(g.flags.treglerReward)return;
  g.flags.treglerReward=true;g.cider++;
  say("Du teilst die Brotzeit mit der Hüttenwirtin. Sie packt dir stattdessen eine Flasche Most ein und erzählt, was Schmalznudeln beruhigt.","good");render();
}

function drinkCider(){
  if(g.cider<1 || g.hp>=g.maxHp)return;
  g.cider-=1;
  g.hp=Math.min(g.maxHp,g.hp+45);
  say("Du trinkst eine Flasche Apfelmost. Die Wunde heilt; der Händler verkauft es jetzt als Kur.","good");
  render();
}

function whisper(text){
  const s=text.trim().toLowerCase(); if(!s)return;
  if(s.includes("bitte") && !g.flags.whisperUnlocked){
    g.flags.whisperUnlocked=true; g.bark+=1; g.stats.secrets++;
    say("Die Kiste schätzt die Höflichkeit. Ein Rindenzeichen erscheint.","secret");
  } else if(s.includes("fulinpah") || s.includes("fulinpach")) {
    say("Ein träger Bach antwortet: »Ich war schon hier, bevor du Äpfel gezählt hast.«","secret");
  } else if(s.includes("faul")) {
    say("„Fulinpah” heißt wörtlich fauler Bach, auf Englisch: lazy creek. Ein Spiel, in dem man wartet, bis Äpfel wachsen, spielt ausgerechnet dort. Die Kiste findet das auch bemerkenswert.","secret");
  } else if(s.includes("kurbeitrag") || s.includes("steuer")) {
    say("Die Kiste klappt sich zu und tut so, als wäre niemand da.");
  } else if((s.includes("sesam") || s.includes("öffne dich")) && g.flags.wirtsalmWon && !g.flags.boxOpened){
    g.flags.boxOpened=true; addItem("hollowApple"); g.stats.secrets++;
    say("Etwas in der Kiste flüstert: »Falsches Märchen. Passwort trotzdem akzeptiert.«","secret");
  } else if(s.includes("wendelstein")) {
    say(g.flags.ending?"Die Kiste antwortet: »Bring dem Berg eine Geschichte mit.«":"Die Kiste antwortet: »Zu groß. Später.«");
  } else {
    say("Die Kiste schweigt. Vielleicht ignoriert sie dich professionell.");
  }
  render();
}

function finishSlice(){
  if(g.flags.ending)return;
  if(loreCount(1)<3){say(`Vor der Treppe fehlen dir ${3-loreCount(1)} Spuren aus Name, Moor und Wasserlauf. Sie stehen im Wegbuch der Schauplätze.`,"bad");render();return;}
  if(chronicleCount(1)<2){say(`Vor der Treppe fehlen dir ${2-chronicleCount(1)} verstandene Seiten der Ortschronik. Öffne das Questbuch und besuche Rathaus, Kirche, Filze oder Bahnhof.`,"bad");g.currentTab="journal";render();return;}
  if(g.flags.wirtsalmWon && g.flags.boxOpened && g.bark>=8){
    g.flags.ending=true;
    say("Der Boden der Kiste bewegt sich.","secret");
    say("Die Kerbe am Rathausplatz, die Ringe im Moor und die beiden Wellen vom Bach passen ineinander. Das Holz war nie nur eine Kiste: Es ist ein Wegweiser, der langsam lesbar wurde.","secret");
    say("Unter dem Boden liegt eine Treppe. Sie führt tiefer, als die Kiste von außen hoch ist. Am Geländer stehen drei neue Zeichen: ein Apfel, ein Zweig und ein kleiner Berg.","secret");
    say("Eine Rindenzeichnung zeigt Au, Wiechs und Litzldorf. Ganz oben steht FULINPAH. Die Reise ist noch nicht zu Ende.","good");
  }
}

function collectLedger(){
  if(g.flags.marketLedger || !spend("apples",120))return;
  g.flags.marketLedger=true;addItem("ledger");g.stats.secrets++;
  say("Die Marktchronik nennt 1992 als Beginn des Apfelmarkts. Auf einer älteren, lose eingelegten Seite steht: Fulinpah, 980.","secret");render();
}
function borrowLedger(){
  const cost=g.chronicle.solved.includes("apfel1992")?15:35;
  if(g.flags.marketLedger||!spend("seeds",cost))return;
  g.flags.marketLedger=true;addItem("ledger");g.stats.secrets++;
  say(`Du hilfst der Händlerin beim Sortieren von ${cost} Apfelkernen. Dafür darfst du die Chronik abschreiben: Fulinpah, 980.`,"secret");render();
}
function learnVariety(){
  if(g.flags.orchardSong || !g.flags.marketLedger || !spend("seeds",20))return;
  g.flags.orchardSong=true;addItem("variety");
  say("Du sortierst 20 Kerne. Einer trägt den Namen eines Baumes, den niemand gepflanzt haben will.","secret");render();
}
function learnVarietyFromTree(){
  if(g.flags.orchardSong||!g.flags.marketLedger||!g.flags.oldHarvest)return;
  g.flags.orchardSong=true;addItem("variety");
  say("Du vergleichst deine Ernte der alten Sorte mit der Chronik. Der vergessene Baum bekommt seinen Namen zurück.","secret");render();
}
function keepVow(){
  if(g.flags.vowKept || !spend("apples",50))return;
  g.flags.vowKept=true;addItem("vow");g.hp=g.maxHp;
  say("Du gibst 50 Äpfel für die nächste Ernte weiter. Ein eingehaltenes Versprechen öffnet keinen Laden, aber einen Weg.","good");render();
}
function keepSeedVow(){
  if(g.flags.vowKept||!spend("seeds",20))return;
  g.flags.vowKept=true;addItem("vow");g.hp=g.maxHp;
  say("Du gibst 20 Kerne für neue Obstbäume weiter. Dein Versprechen wächst langsamer, aber länger.","good");render();
}
function hearSpring(){
  if(g.flags.springHeard)return;
  if(!g.flags.vowKept || !g.flags.orchardSong){say("Zwischen den Wassergeräuschen fehlt dir noch ein Versprechen und ein alter Sortenname.");return;}
  g.flags.springHeard=true;addItem("spring");g.stats.secrets++;
  say("Du hörst nicht den Wasserfall, sondern die Pausen dazwischen. Darin flüstert der langsame Bach seinen Namen.","secret");render();
}
function readSpring(){
  if(g.flags.springHeard||!g.flags.vowKept||!g.flags.orchardSong||!has("ledger"))return;
  g.flags.springHeard=true;addItem("spring");g.stats.secrets++;
  say("Du vergleichst Wasserfall, Chronik und Sortennamen. Zwischen zwei Zeilen steht, wie man den langsamen Bach findet.","secret");render();
}
function catchLight(){
  if(g.flags.moorLight || !g.flags.springHeard)return;
  g.flags.moorLight=true;addItem("lantern");g.stats.secrets++;
  say("Ein Irrlicht folgt dir auf dem Bohlenweg. Du bleibst auf dem Weg; es hüpft freiwillig in dein Glas.","secret");render();
}
function craftMoorLight(){
  if(g.flags.moorLight||!g.flags.springHeard||!spend("seeds",20))return;
  g.flags.moorLight=true;addItem("lantern");g.stats.secrets++;
  say("Du gibst 20 Kerne für eine Laterne aus. Das Irrlicht folgt ihrem Schein freiwillig auf dem Bohlenweg.","secret");render();
}
function takeStick(){
  if(has("hikingStick"))return;
  addItem("hikingStick");say("Ein Wanderstock steckt zwischen den Felsen. Der Vorbesitzer hat nur eine Rechnung hinterlassen.");render();
}
function craftStick(){
  if(has("hikingStick")||!has("rustySword")||!spend("seeds",10))return;
  addItem("hikingStick");say("Mit dem Obstmesser schnitzt du aus Fallholz einen Wanderstock. 10 Kerne gehen für das Material drauf.","good");render();
}
function meetMannl(){
  if(g.flags.mannlGift)return;
  if(!g.flags.springHeard || !g.flags.moorLight || !g.flags.vowKept){say("Die Männlein hören sich deine Geschichte an. Sie ist noch nicht ganz erzählt.");return;}
  g.flags.mannlGift=true;addItem("mannlgift");g.hp=g.maxHp;
  say("Die Wendelstein-Männlein schenken dir einen Rindenring. Sie helfen in Sagen lieber als auf Rechnungen.","secret");render();
}
function tradeMannl(){
  if(g.flags.mannlGift||!g.flags.springHeard||!g.flags.vowKept||!spend("apples",90))return;
  g.flags.mannlGift=true;addItem("mannlgift");g.hp=g.maxHp;
  say("Du teilst 90 Äpfel mit den Wendelstein-Männlein. Das Moorlicht fehlt in deiner Geschichte, aber dein Gelübde überzeugt sie.","secret");render();
}
function enterFinal(){
  if(!g.flags.mannlGift || !g.flags.boxOpened || !g.flags.ending)return;
  if(loreCount(2)<3){say(`Der letzte Pflücker wartet. Im Wegbuch fehlen noch ${3-loreCount(2)} Spuren aus Ernte, Gelübde und Berg.`,"bad");render();return;}
  if(chronicleCount(2)<2){say(`Zum letzten Pflücker fehlen dir ${2-chronicleCount(2)} verstandene Seiten der Ortschronik aus Au, Markt, Wiechs oder den Filzen.`,"bad");g.currentTab="journal";render();return;}
  travel("fulinpach");
  if(!g.flags.finalWon && !g.flags.finalChoice){
    startCombat("picker");g.currentTab="quests";render();
  }
}
function bargainPicker(){
  if(!g.flags.ending||!g.flags.boxOpened||!g.flags.mannlGift||loreCount(2)<3||chronicleCount(2)<2||g.flags.finalWon||g.combat||!canAfford({apples:120,bark:8}))return;
  spend("apples",120);spend("bark",8);g.flags.finalWon=true;
  say("Du legst 120 Äpfel und acht Rindenzeichen auf den Boden der Kiste. Der letzte Pflücker erinnert sich, warum die Ernte geteilt werden sollte. Er tritt beiseite.","secret");render();saveGame();
}
function decideFate(choice){
  if(!g.flags.finalWon || g.flags.finalChoice || !["share","rest"].includes(choice))return;
  g.flags.finalChoice=choice;
  const seed=g.lore.choices.harvest===2?"den weitergereichten Apfel":"den aufgehobenen Kern";
  say(`Der Pflücker schaut auf ${seed} in deinem Wegbuch. Er hatte Äpfel gesammelt, damit kein alter Name verloren geht. Dabei vergaß er, dass ein Baum erst weiterlebt, wenn etwas von ihm fortgetragen wird.`,"secret");
  if(choice==="share"){
    say("Du öffnest die Kiste. Nicht auf einmal: Erst tragen die Nachbarn die Äpfel zur Wiese, dann legen Kinder Kerne neben die Spielrinnen, und zuletzt findet der namenlose Baum bei Wiechs seinen Platz in der Chronik.","good");
    say("Am Jenbach lesen die Menschen die Pegelmarke wieder gemeinsam. In Au liegt ein neuer Zweig vor der Kapelle. Fulinpach fließt langsam weiter. Niemand ist reich; alle haben etwas zu essen. ENDE: DIE GETEILTE ERNTE.","good");
  }else{
    say("Du schließt die Kiste und lässt den Bach unter den Wurzeln weiterziehen. Seine Quelle bleibt, wo sie ist. Auf den Wiesen wachsen Bäume ohne Schild, und niemand muss ihren Namen besitzen, um darunter Rast zu machen.","secret");
    say("Der Händler versucht vergeblich, das Schweigen zu verkaufen. Du lässt dein Wegbuch am Rathausplatz liegen, damit der nächste Mensch selbst entscheiden kann, was er mitnimmt. ENDE: DER BACH BLEIBT.","secret");
  }
  saveGame();render();
}


function chronicleCount(phase){return CHRONICLE.filter(entry=>entry.phase===phase&&g.chronicle.solved.includes(entry.id)).length}
let chronicleOpen=null;
function solveChronicle(id,answer,feedback){
  const entry=CHRONICLE.find(x=>x.id===id);
  if(!entry||!g.chronicle.visited.includes(entry.place)||entry.phase===2&&!g.flags.ending)return;
  chronicleOpen=id;
  if(answer!==entry.correct){feedback.textContent="Schau noch einmal in den Text: Die Antwort steht in der Chronik.";return}
  if(!g.chronicle.solved.includes(id)){
    g.chronicle.solved.push(id);
    say(`Du hältst fest: ${entry.answers[answer]}`,"secret");
    if(chronicleCount(1)===2&&!g.flags.ending)say("Zwei Seiten der Ortschronik sind verstanden. Ihre Spuren führen zur Treppe.","good");
    if(chronicleCount(2)===2)say("Zwei weitere Seiten verbinden die Ernte mit dem alten Ortsnamen.","good");
  }
  saveGame();render();
}

function chooseEncounter(id,choiceId){
  const scene=ENCOUNTERS.find(x=>x.id===id),choice=scene?.choices.find(x=>x.id===choiceId);
  if(!scene||!choice||g.location!==scene.place||g.encounters[id]||g.combat)return;
  g.encounters[id]=choiceId;
  if(choice.apples)g.apples+=choice.apples;
  if(choice.seeds)g.seeds+=choice.seeds;
  if(choice.bark)g.bark+=choice.bark;
  say(choice.text,"secret");saveGame();render();
}

function loreCount(chapter){return LORE_THREADS.filter(thread=>thread.chapter===chapter&&g.lore.choices[thread.id]).length}
function openLore(id){
  const thread=LORE_THREADS.find(x=>x.id===id&&x.places.includes(g.location));
  if(!thread||g.lore.opened[id])return;
  g.lore.opened[id]=g.location;
  say(`Du findest eine neue Spur: ${thread.title}.`,"secret");render();saveGame();
}
function chooseLore(id,index){
  const thread=LORE_THREADS.find(x=>x.id===id),choice=thread?.choices[index];
  if(!thread||!choice||!g.lore.opened[id]||g.lore.choices[id])return;
  g.lore.choices[id]=index+1;
  say(choice.text,"secret");
  if(thread.chapter===1&&loreCount(1)===3)say("Die drei Spuren treffen sich unter der Apfelkiste. Die Treppe wartet auf dich.","good");
  if(thread.chapter===2&&loreCount(2)===3)say("Die Wege von Markt, Kapelle und Berg führen zum langsamen Bach.","good");
  saveGame();render();
}

function journalEntries(){
  const f=g.flags,w=g.water.oster,h=g.water.flood,entries=[];
  const add=(id,title,group,done,step,decision,place,tab)=>entries.push({id,title,group,done,step,decision,place,tab});
  add("kiste","Die Apfelkiste","Hauptgeschichte",Boolean(g.unlocks.map),
    !f.crateInspected?"Untersuche das lose Brett auf dem Rathausplatz.":!f.wrapperSeen?"Untersuche das Rindenstück in der Apfelkiste.":!g.unlocks.map?"Besorge beim Händler die Wanderkarte.":"Die Wanderkarte führt dich zu weiteren Orten.",
    f.wrapperChoice?`Rindenstück: ${{keep:"behalten",tear:"geteilt",eat:"probiert"}[f.wrapperChoice]||"untersucht"}.`:null,"rathaus",g.unlocks.map?"map":f.wrapperSeen?"shop":"main");
  if(!g.unlocks.map)return entries;
  for(const thread of LORE_THREADS){
    if(thread.chapter===2&&!f.ending)continue;
    const opened=g.lore.opened[thread.id],choice=g.lore.choices[thread.id],place=opened||thread.places[0];
    add(`lore-${thread.id}`,thread.title,"Wegbuch",Boolean(choice),
      choice?"Die Spur ist in deinem Wegbuch.":opened?"Lies die Spur zu Ende und entscheide, was du bewahren willst.":`Untersuche die Spur am Ort. Weitere Wege: ${thread.places.map(p=>SCENE_LABELS[p]?.split(" ")[0]||p).join(" / ")}.`,
      choice&&choice!=="legacy"?thread.choices[choice-1]?.label:null,place);
  }
  add("oster","Das Wasser am Spielplatz","Wasser",w.stage==="solved",
    w.stage==="new"?"Prüfe die trockenen Spielrinnen am Wasserspielplatz Am Osterbach.":w.stage==="trail"?"Folge den Spuren zur Biberburg und untersuche den Damm.":w.stage==="assessed"?"Wähle an der Biberburg eine von drei Lösungen für die Wasserversorgung.":"Die Spielrinnen führen wieder Wasser; die Biberburg bleibt bestehen.",
    w.solution?`Deine Lösung: ${{fachstelle:"Fachstelle und kontrollierter Ablauf",versorgung:"Zuleitung der Spielrinnen",gemeinschaft:"Gemeinde und Nachbarschaft"}[w.solution]}.`:null,w.stage==="new"?"osterbach":"biberdamm");
  add("ratten","Die Brücke am Jenbach","Hauptgeschichte",Boolean(f.jenbachWon),
    f.jenbachWon?"Der Weg ins untere Jenbachtal ist frei.":"Reise zur Jenbachbrücke. Bekämpfe den Bachrattenkönig oder locke ihn weg.",
    f.jenbachWon?`Gelöst durch ${f.ratRoute==="kampf"?"Kampf":f.ratRoute==="locken"?"Äpfel als Ablenkung":"einen alten Pfad"}.`:null,"jenbach");
  if(f.jenbachWon||f.wallSeen)add("mauer","Die Mauer im Tal","Hauptgeschichte",Boolean(f.wallPassed),
    f.wallPassed?"Der Weg zur Wirtsalm ist offen.":"Zeichne im unteren Jenbachtal eine Tür oder suche einen Umweg.",
    f.wallPassed?`Dein Weg: ${f.wallRoute==="path"?"ortskundiger Pfad":f.wallRoute==="chalk"?"Kreidetür":"eine alte Spur"}.`:null,"wall");
  if(f.wallPassed||f.wirtsalmVisited)add("golem","Der Weg zur Wirtsalm","Hauptgeschichte",Boolean(f.wirtsalmWon),
    f.wirtsalmWon?"Die Wirtsalm ist wieder ruhig.":"Bekämpfe den Golem oder lenke ihn mit Tregler Brotzeit und Äpfeln ab.",
    f.wirtsalmWon?`Dein Weg: ${f.golemRoute==="kampf"?"Kampf":f.golemRoute==="brotzeit"?"Brotzeit":"eine alte Spur"}.`:null,"wirtsalm");
  if(g.unlocks.box)add("geheimnis","Das Geheimnis der Kiste","Hauptgeschichte",Boolean(f.ending),
    f.ending?"Die zweite Karte ist geöffnet.":!f.boxOpened?"Suche den Hinweis an der Wirtsalm und flüstere ihn der Kiste zu.":`Sammle acht Rindenzeichen (${Math.floor(g.bark)}/8), drei Wegbuch-Spuren (${loreCount(1)}/3) und zwei Seiten der Ortschronik (${chronicleCount(1)}/2).`,
    f.boxOpened?"Die innere Lasche ist offen.":null,null,"box");
  if(w.stage==="solved"&&f.jenbachWon)add("hochwasser","Steigendes Wasser am Jenbach","Wasser",h.stage==="solved",
    h.stage==="new"?"Prüfe Pegel und Brücke am Jenbach.":h.stage==="observed"?"Warn zuerst die Wohnhäuser: persönlich oder über die Gemeinde.":h.stage==="warned"?"Kehre zur Brücke zurück und wähle den Schutz der Häuser.":"Die Bewohner wurden gewarnt; die Häuser blieben trocken.",
    h.warning?`Warnung: ${h.warning==="gemeinde"?"über Gemeinde und Einsatzkräfte":"mit den Nachbarn von Tür zu Tür"}.${h.solution?` Schutz: ${{treibholz:"Brücke freigehalten",rueckhalt:"Rückhaltefläche genutzt",hausschutz:"Eingänge gesichert"}[h.solution]}.`:""}`:null,h.stage==="observed"?"siedlung":"jenbach");
  add("kirche","Eine Pause an der Kirche","Nebenweg",Boolean(f.candleLit),f.candleLit?"Du hast eine Pause gemacht.":"Zünde eine Kerze an oder verweile still an der Herz-Jesu-Kirche.",null,"kirche");
  add("filze","Der Moorfrosch","Nebenweg",Boolean(f.filzeSecret),f.filzeSecret?"Der Talisman wurde gefunden.":"Biete dem Frosch Äpfel an oder suche mit Kernen im Moos.",null,"filze");
  add("bahnhof","Der alte Bahnhof","Nebenweg",Boolean(f.bahnhofFound),f.bahnhofFound?"Die Fahrkarte wurde gefunden.":"Sieh dir den alten Bahnhof an und such zwischen den Schwellen.",null,"bahnhof");
  if(f.ending){
    add("chronik","Die Marktchronik","Hauptgeschichte",Boolean(f.marketLedger),f.marketLedger?"Du kennst die alte Namensspur.":"Kaufe die Chronik am Markt oder hilf beim Sortieren.",null,"markt");
    add("sorte","Die vergessene Sorte","Hauptgeschichte",Boolean(f.orchardSong),f.orchardSong?"Der alte Sortenname ist gefunden.":"Sortiere Kerne bei Wiechs oder vergleiche eine alte Ernte.",null,"wiechs");
    add("geluebde","Das Gelübde an der Taxakapelle","Hauptgeschichte",Boolean(f.vowKept),f.vowKept?"Du hast eine Ernte weitergegeben.":"Teile in Au Äpfel oder stifte Kerne für neue Bäume.",null,"au");
    add("quelle","Die Stimme am Wasserfall","Hauptgeschichte",Boolean(f.springHeard),f.springHeard?"Du kennst den Klang der Quelle.":"Mit Gelübde und Sortenname kannst du bei Litzldorf zuhören oder die Chronik lesen.",null,"litzldorf");
    add("licht","Licht in den Filzen","Nebenweg",Boolean(f.moorLight),f.moorLight?"Das Licht begleitet dich.":"Nach der Quelle kannst du dem Irrlicht begegnen oder eine Laterne besorgen.",null,"filze");
    add("maennlein","Die Wendelstein-Männlein","Hauptgeschichte",Boolean(f.mannlGift),f.mannlGift?"Du hast den Rindenring erhalten.":"Nimm am Farrenpoint einen Wanderstock und erreiche den Wendelstein. Licht oder geteilte Äpfel helfen.",null,has("hikingStick")?"wendelstein":"farrenpoint");
    if(f.mannlGift||f.fulinpachVisited)add("finale","Fulinpach","Hauptgeschichte",Boolean(f.finalChoice),
      f.finalChoice?"Die Geschichte ist abgeschlossen; du kannst weiter erkunden.":loreCount(2)<3?`Sammle die drei weiteren Wegbuch-Spuren (${loreCount(2)}/3): Ernte, Gelübde, Berg.`:chronicleCount(2)<2?`Lies und verstehe zwei weitere Seiten der Ortschronik (${chronicleCount(2)}/2).`:!f.finalWon?"Begegne dem letzten Pflücker oder verhandle mit ihm.":"Entscheide, was mit der Ernte und dem Bach geschieht.",
      f.finalChoice?`Deine Entscheidung: ${f.finalChoice==="share"?"Ernte teilen":"Bach in Ruhe lassen"}.`:null,"fulinpach");
  }
  for(const scene of ENCOUNTERS){
    if(!g.chronicle.visited.includes(scene.place))continue;
    const choice=scene.choices.find(x=>x.id===g.encounters[scene.id]);
    add(`encounter-${scene.id}`,scene.title,"Nebenweg",Boolean(choice),
      choice?choice.text:`Sieh dir die kleine Begegnung in ${SCENE_LABELS[scene.place]} an und entscheide, welcher Spur du folgst.`,
      choice?`Dein Weg: ${choice.label}.`:null,scene.place);
  }
  return entries;
}
function journalGo(entry){
  if(entry.tab){
    if(entry.tab==="farrenpoint"||entry.tab==="wendelstein")return journalGo({place:entry.tab});
    g.currentTab=entry.tab;render();return;
  }
  const p=entry.place;
  const locked=p==="biberdamm"&&g.water.oster.stage==="new"||p==="siedlung"&&g.water.flood.stage==="new"||["wall","tregler"].includes(p)&&!g.flags.jenbachWon||p==="wirtsalm"&&!g.flags.wallPassed||p==="farrenpoint"&&!g.flags.springHeard||p==="wendelstein"&&!has("hikingStick")||p==="fulinpach"&&(!g.flags.mannlGift||!g.flags.boxOpened);
  if(locked){g.currentTab="map";render();return}
  travel(p);
}

function currentSceneKey(){
  if(g.location==="fulinpach"&&g.flags.finalChoice)return g.flags.finalChoice==="share"?"endingShare":"endingRest";
  if(g.location==="wall"&&g.flags.wallPassed)return g.flags.wallRoute==="path"?"wallPath":"wallOpen";
  if(g.location==="osterbach"&&g.water.oster.stage==="solved")return {fachstelle:"osterFachstelle",versorgung:"osterVersorgung",gemeinschaft:"osterGemeinschaft"}[g.water.oster.solution]||"osterFachstelle";
  if(g.location==="jenbach"&&g.water.oster.stage==="solved"&&g.flags.jenbachWon){
    if(g.water.flood.stage!=="solved")return "jenbachRain";
    return {treibholz:"jenbachClear",rueckhalt:"jenbachRetain",hausschutz:"jenbachProtect"}[g.water.flood.solution]||"jenbachSafe";
  }
  if(g.location==="siedlung"&&g.water.flood.stage==="solved")return "siedlungSafe";
  return g.location;
}


function importSaveData(data){
  if(!data || typeof data!=="object" || Array.isArray(data) ||
    !Number.isFinite(data.apples) && !Number.isFinite(data.candies) ||
    !Array.isArray(data.inventory) || !data.flags || typeof data.flags!=="object" ||
    !data.unlocks || typeof data.unlocks!=="object")throw Error("Keine gültige Fulinpach-Sicherung.");
  if(Number.isFinite(data.version) && data.version>VERSION)throw Error("Dieser Spielstand stammt aus einer neueren Spielversion.");
  g=normalizeSave(data);saveGame();
  say("Spielstand importiert. Deine Ernte und Entdeckungen sind wieder da.","good");render();
}
function exportSaveJson(){
  saveGame();
  const blob=new Blob([JSON.stringify(g,null,2)],{type:"application/json;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");
  link.href=url;link.download=`Fulinpach-Spielstand-${new Date().toLocaleDateString("sv-SE")}.json`;
  document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),5000);
  say("Dein Spielstand wurde als JSON-Datei heruntergeladen.","good");
}
async function importSaveJson(file){
  if(!file)throw Error("Wähle zuerst eine JSON-Datei aus.");
  if(file.size>2_000_000)throw Error("Diese Datei ist für einen Fulinpach-Spielstand zu groß.");
  const data=JSON.parse(await file.text());
  importSaveData(data);
}

function saveGame(){
  g.lastSave=Date.now();
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(g))}catch(e){}
}

function normalizeSave(data){
  if(!data || typeof data!=="object" || Array.isArray(data))throw Error("Ungültiger Speicherstand");
  const oldMeta=/bonbon|candy|lolli|fiktiv|erfunden|\bim spiel\b|\bist real\b|\bin dieser geschichte\b/i;
  const old=typeof data.apples!=="number" && typeof data.candies==="number";
  if(old){
    data={...data,apples:data.candies,seeds:data.lollipops||0,cider:data.chocolate||0,
      bark:data.wrappers||0,appleRate:data.candyRate||1,seedRate:data.lollipopRate||0};
  }
  const base=fresh();
  const bought={...(data.shopBought||{})};
  const oldOster=data.water?.oster,oldFlood=data.water?.flood;
  if(bought.lolliMachine){bought.seedCollector=true;delete bought.lolliMachine;}
  const result={...base,...data,
    flags:{...base.flags,...(data.flags||{})},
    unlocks:{...base.unlocks,...(data.unlocks||{})},
    stats:{...base.stats,...(data.stats||{})},
    shopBought:bought,
    water:{oster:{stage:["new","trail","assessed","solved"].includes(oldOster?.stage)?oldOster.stage:"new",solution:["fachstelle","versorgung","gemeinschaft"].includes(oldOster?.solution)?oldOster.solution:null},
      flood:{stage:["new","observed","warned","solved"].includes(oldFlood?.stage)?oldFlood.stage:"new",warning:["nachbarn","gemeinde"].includes(oldFlood?.warning)?oldFlood.warning:null,solution:["treibholz","rueckhalt","hausschutz"].includes(oldFlood?.solution)?oldFlood.solution:null}},
    farm:{selection:typeof data.farm?.selection==="string"&&Object.hasOwn(FARM_VARIETIES,data.farm.selection)?data.farm.selection:"young",
      harvests:Number.isSafeInteger(data.farm?.harvests)?Math.max(0,data.farm.harvests):0,
      plots:Array.from({length:3},(_,i)=>{const p=data.farm?.plots?.[i];return p&&Object.hasOwn(FARM_VARIETIES,p.variety)&&Number.isFinite(p.plantedAt)&&Number.isFinite(p.readyAt)&&p.readyAt>=p.plantedAt?{variety:p.variety,plantedAt:p.plantedAt,readyAt:p.readyAt,watered:Boolean(p.watered)}:null})},
    lore:{opened:{},choices:{}},
    chronicle:{visited:["rathaus"],solved:[]},
    encounters:{},
    notice:data.notice && typeof data.notice==="object" && Array.isArray(data.notice.lines) && data.notice.lines.every(x=>typeof x==="string"&&!oldMeta.test(x)) ?
      {at:Number.isFinite(data.notice.at)?data.notice.at:Date.now(),tab:String(data.notice.tab||"main"),location:String(data.notice.location||"rathaus"),lines:data.notice.lines.slice(-4)}:null,
    inventory:Array.isArray(data.inventory)?data.inventory.map(x=>x==="voidCandy"?"hollowApple":x).filter(x=>typeof x==="string" && Object.hasOwn(itemDb,x)):[],
    equipped:{...base.equipped,...(data.equipped||{})},
    messages:old?["Dein früherer Spielstand wurde übernommen."]:
      (Array.isArray(data.messages)?data.messages.filter(x=>typeof x==="string" && !oldMeta.test(x)).slice(-90):base.messages),
    combat:null,version:VERSION};
  for(const thread of LORE_THREADS){
    const opened=data.lore?.opened?.[thread.id],choice=data.lore?.choices?.[thread.id];
    if(thread.places.includes(opened))result.lore.opened[thread.id]=opened;
    if(choice===1||choice===2)result.lore.choices[thread.id]=choice;
  }
  const visited=Array.isArray(data.chronicle?.visited)?data.chronicle.visited:[];
  const solved=Array.isArray(data.chronicle?.solved)?data.chronicle.solved:[];
  result.chronicle.visited=[...new Set(["rathaus",...visited.filter(x=>CHRONICLE.some(entry=>entry.place===x)||ENCOUNTERS.some(scene=>scene.place===x))])];
  result.chronicle.solved=[...new Set(solved.filter(x=>CHRONICLE.some(entry=>entry.id===x)))];
  for(const scene of ENCOUNTERS){
    const choice=data.encounters?.[scene.id];
    if(scene.choices.some(x=>x.id===choice)){result.encounters[scene.id]=choice;result.chronicle.visited.push(scene.place)}
  }
  result.chronicle.visited=[...new Set(result.chronicle.visited)];
  if(Number.isFinite(data.version)&&data.version<10){
    if(result.flags.ending){result.chronicle.solved.push("fulinpah980","bahn1897");result.chronicle.visited.push("bahnhof")}
    if(result.flags.mannlGift||result.flags.fulinpachVisited||result.flags.finalWon||result.flags.finalChoice){result.chronicle.solved.push("gemeinde1978","apfel1992");result.chronicle.visited.push("au","markt")}
    result.chronicle.solved=[...new Set(result.chronicle.solved)];result.chronicle.visited=[...new Set(result.chronicle.visited)];
  }
  if(!Number.isFinite(data.version)||data.version<9){
    if(result.flags.wirtsalmWon||result.flags.ending)for(const id of ["name","moor","water"]){result.lore.choices[id]??=1;result.lore.opened[id]??=LORE_THREADS.find(x=>x.id===id).places[0]}
    if(result.flags.mannlGift||result.flags.finalWon)for(const id of ["harvest","promise","mountain"]){result.lore.choices[id]??=1;result.lore.opened[id]??=LORE_THREADS.find(x=>x.id===id).places[0]}
  }
  for(const key of ["apples","seeds","cider","bark","appleRate","seedRate","hp","maxHp","eaten","thrown","insuranceBonus"]){
    if(!Number.isFinite(result[key]))result[key]=base[key];
    result[key]=Math.max(0,Math.min(1e12,result[key]));
  }
  if(result.maxHp<1){result.maxHp=base.maxHp;result.hp=base.hp}
  if(old)result.insuranceBonus=Math.max(0,result.maxHp-100-Math.floor(result.eaten/20)*2-(result.flags.candleLit?10:0));
  result.hp=Math.max(1,Math.min(result.maxHp,result.hp));
  const tabUnlocks={farm:"farm",shop:"shop",inventory:"inventory",map:"map",quests:"quests",box:"box"};
  if(!["main","farm","shop","inventory","map","journal","quests","box","save"].includes(result.currentTab)||
     tabUnlocks[result.currentTab]&&!result.unlocks[tabUnlocks[result.currentTab]])result.currentTab="main";
  if(!["rathaus","kirche","filze","bahnhof","jenbach","osterbach","biberdamm","siedlung","wall","tregler","wirtsalm","markt","wiechs","au","litzldorf","farrenpoint","wendelstein","fulinpach"].includes(result.location))result.location="rathaus";
  if(result.inventory.includes("ratCrown") && !result.equipped.head){
    result.equipped.head="ratCrown";
    if(result.equipped.trinket==="ratCrown")result.equipped.trinket=null;
  }
  for(const {id} of EQUIPMENT_SLOTS){
    if(!result.inventory.includes(result.equipped[id]) || gearSlot(result.equipped[id])!==id)
      result.equipped[id]=null;
  }
  if(result.flags.ending)result.unlocks.map=true;
  if(result.flags.crateInspected)result.unlocks.farm=true;
  g=result;recomputeStats();return result;
}

// Rechnet die seit dem letzten Takt vergangene Zeit als Ernte an. Gilt auch für Zeit
// im Hintergrund oder bei geschlossener Datei, höchstens MAX_OFFLINE_SECONDS am Stück.
function creditElapsedTime(now,minSecondsForMessage){
  const elapsed=Math.min(MAX_OFFLINE_SECONDS,Math.max(0,(now-(g.lastTick||now))/1000));
  g.apples+=elapsed*g.appleRate; g.seeds+=elapsed*g.seedRate; g.lastTick=now;
  if(elapsed>=minSecondsForMessage)say(`Während du weg warst, produzierte die Kiste ${fmt(elapsed*g.appleRate)} Äpfel. Überstunden wurden nicht genehmigt.`);
}

function loadGame(){
  try{
    const raw=localStorage.getItem(SAVE_KEY)||localStorage.getItem(OLD_SAVE_KEY); if(!raw)return;
    normalizeSave(JSON.parse(raw));
    creditElapsedTime(Date.now(),30);
    saveGame();
  }catch(e){g=fresh()}
}

