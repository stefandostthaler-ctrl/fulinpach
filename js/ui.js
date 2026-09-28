"use strict";
/* =====================================================================
   OBERFLÄCHE
   Baut die Anzeige aus dem Spielstand (g) auf. Hier wird nichts am
   Spielstand gerechnet, nur angezeigt und auf Klicks reagiert.
   ===================================================================== */

const $ = id => document.getElementById(id);
const fmt = n => Math.floor(n).toLocaleString("de-DE");
let boxHasAnimated=false;

function asciiGraphic(className,label,art){
  const node=document.createElement("pre");node.className=className;
  node.setAttribute("role","img");node.setAttribute("aria-label",label);
  node.textContent=art;return node;
}
function itemGraphic(id,extraClass=""){
  const art=asciiGraphic(`item-art ${extraClass}`.trim(),itemDb[id]?.name||shopItems.find(x=>x.id===id)?.label||id,ITEM_ART[id]||"[?]");
  art.setAttribute("data-item",id);return art;
}
function resourceGraphic(id){
  const art=document.createElement("span");art.className="resource-art";art.setAttribute("aria-hidden","true");
  art.textContent=RESOURCE_ART[id]||"[?]";return art;
}
function enemyGraphic(id,name){return asciiGraphic("enemy-art",name,ENEMY_ART[id]||"[?]")}

function renderNotice(){
  const n=$("notice"); if(!n)return;
  const notice=g.notice;
  if(!notice || !Array.isArray(notice.lines) || !notice.lines.length){n.innerHTML="";return;}
  const names={main:"Apfelkiste",farm:"Streuobstwiese",shop:"Händler",inventory:"Inventar",map:"Weltkarte",journal:"Questbuch",quests:SCENE_LABELS[notice.location]||"Schauplatz",box:"Das Geheimnis",save:"Spielstand"};
  n.innerHTML=`<strong>Gerade passiert · ${escapeHtml(names[notice.tab]||"Fulinpach")}</strong>`+
    notice.lines.map(line=>{const cls=/^\[(good|bad|secret)\]/.exec(line)?.[1]||"";
      return `<div class="${cls}">${escapeHtml(line.replace(/^\[(good|bad|secret)\]\s*/,""))}</div>`}).join("");
}

// disabled darf auch eine Funktion sein: dann wird sie im Spieltakt neu geprüft,
// ohne dass die Schaltfläche neu gebaut werden muss (Fokus und Scrollposition bleiben).
function btn(label, fn, disabled=false, cls=""){
  const b=document.createElement("button"); b.textContent=label;
  if(typeof disabled==="function"){b.dynamicDisabled=disabled;b.disabled=Boolean(disabled())}
  else b.disabled=disabled;
  if(cls)b.className=cls; b.onclick=fn; return b;
}
function refreshButtons(){
  for(const b of document.querySelectorAll("#topActions button,.panel.active button")){
    if(!b.dynamicDisabled)continue;
    const disabled=Boolean(b.dynamicDisabled());
    if(b.disabled!==disabled)b.disabled=disabled;
  }
}

// Wird fünfmal pro Sekunde aufgerufen: nur das nachführen, was sich ohne Klick ändert.
function refreshView(now){
  renderResources();
  if(g.currentTab==="main"&&shownMainStage!==mainStoryStage())renderMain();
  if(g.currentTab==="farm")updateFarmTimers();
  if(g.currentTab==="shop"&&shopShowsDoNotBuy!==shopWantsDoNotBuy())keepButtonFocus(renderShop);
  if(g.combat&&g.currentTab==="quests")updateCombatView(now);
  refreshButtons();
}

function renderFarm(){
  const c=$("farm");if(!g.unlocks.farm){c.innerHTML="";return}
  c.innerHTML="<h2>Streuobstwiese</h2><p>Wähle eine Sorte und klicke auf einen Pflanzplatz. Bäume wachsen auch, während die Datei geschlossen ist. Erntereife Äpfel warten auf dich.</p><p class=\"scroll-hint\">Die Wiese ist breiter als der Bildschirm und lässt sich seitlich scrollen.</p>";
  const sc=document.createElement("div");sc.className="farm-scroll";
  const land=document.createElement("div");land.className="farm-landscape";
  const farmArt=document.createElement("pre");farmArt.className="farm-ascii";
  farmArt.setAttribute("role","img");farmArt.setAttribute("aria-label","ASCII-Streuobstwiese mit drei Pflanzplätzen");
  farmArt.textContent=FARM_ART;
  land.appendChild(farmArt);
  g.farm.plots.forEach((plot,index)=>{
    const ready=plot&&Date.now()>=plot.readyAt;
    const variety=plot&&FARM_VARIETIES[plot.variety];
    const b=btn("",()=>plot?(Date.now()>=plot.readyAt?harvestPlot(index):waterPlot(index)):plantPlot(index),
      ()=>Boolean(plot&&Date.now()<plot.readyAt&&(plot.watered||g.apples<3)||!plot&&g.seeds<FARM_VARIETIES[g.farm.selection].cost));
    b.className=`farm-plot${ready?" ready":""}`;
    const icon=document.createElement("span");icon.className="plot-art";icon.setAttribute("aria-hidden","true");icon.textContent=plot?(ready?"(o)":Date.now()-plot.plantedAt>(plot.readyAt-plot.plantedAt)/2?"/###\\":variety.icon):"[ ]";b.appendChild(icon);
    const title=document.createElement("span");title.className="plot-name";title.textContent=plot?variety.name:`Platz ${index+1} · pflanzen`;b.appendChild(title);
    const timer=document.createElement("span");timer.className="plot-time";timer.id=`farmTime${index}`;timer.textContent=plot?ready?"Ernten":plot.watered?`Reif in ${Math.ceil((plot.readyAt-Date.now())/1000)} s · gegossen`:`Reif in ${Math.ceil((plot.readyAt-Date.now())/1000)} s · gießen: 3 Äpfel`:`${FARM_VARIETIES[g.farm.selection].cost} Kerne`;
    b.appendChild(timer);b.setAttribute("aria-label",`Pflanzplatz ${index+1}: ${title.textContent}. ${timer.textContent}`);
    land.appendChild(b);
  });sc.appendChild(land);c.appendChild(sc);
  const controls=document.createElement("div");controls.className="farm-controls";
  const label=document.createElement("label");label.textContent="Sorte: ";label.htmlFor="farmVariety";
  const select=document.createElement("select");select.id="farmVariety";
  for(const id of farmVarieties()){const v=FARM_VARIETIES[id],opt=document.createElement("option");opt.value=id;opt.textContent=`${v.name} · ${v.cost} Kerne · ${v.seconds} s -> ${v.apples} Äpfel`;select.appendChild(opt)}
  if(!farmVarieties().includes(g.farm.selection))g.farm.selection="young";
  select.value=g.farm.selection;select.onchange=()=>{g.farm.selection=select.value;renderFarm();saveGame()};label.appendChild(select);controls.appendChild(label);
  const info=document.createElement("p");info.className="small";info.textContent=`Ernten: ${g.farm.harvests} · Nach drei Ernten liefert die Wiese dauerhaft +1 Apfel/s.${g.flags.marketLedger?" Alte Sorte freigeschaltet.":" Eine alte Sorte wartet in der Chronik des Apfelmarkts."}`;controls.appendChild(info);
  c.appendChild(controls);
}
function updateFarmTimers(){
  if(g.currentTab!=="farm")return;
  if(g.farm.plots.some(plot=>plot&&Date.now()>=plot.readyAt&&$("farmTime"+g.farm.plots.indexOf(plot)).textContent!=="Ernten")){renderFarm();return}
  g.farm.plots.forEach((plot,i)=>{if(plot&&Date.now()<plot.readyAt){const time=$("farmTime"+i);time.textContent=`Reif in ${Math.ceil((plot.readyAt-Date.now())/1000)} s · ${plot.watered?"gegossen":"gießen: 3 Äpfel"}`}});
}

function renderResources(){
  const r=$("resources");
  const parts=[["apples","Äpfel",g.apples,`+${g.appleRate.toFixed(1)}/s`]];
  if(g.shopBought.seedCollector || g.seeds>0) parts.push(["seeds","Apfelkerne",g.seeds,`+${g.seedRate.toFixed(1)}/s`]);
  if(g.cider>0) parts.push(["cider","Mostflaschen",g.cider,""]);
  if(g.bark>0 || g.flags.wrapperSeen) parts.push(["bark","Rindenzeichen",g.bark,""]);
  parts.push(["hp","LP",`${Math.ceil(g.hp)}/${g.maxHp}`,""]);
  if(r.children.length!==parts.length || parts.some(([key],i)=>r.children[i]?.resourceKey!==key)){
    r.innerHTML="";
    for(const [key] of parts){
      const d=document.createElement("div");d.className="resource";d.resourceKey=key;
      d.appendChild(resourceGraphic(key));d.appendChild(document.createElement("span"));r.appendChild(d);
    }
  }
  for(let i=0;i<parts.length;i++){
    const [,name,val,extra]=parts[i];
    const label=r.children[i].children[1];
    const value=`${name}: ${typeof val==="number"?fmt(val):val} ${extra}`.trim();
    if(label.textContent!==value)label.textContent=value;
  }
}

function renderTopActions(){
  const c=$("topActions"); c.innerHTML="";
  if(g.unlocks.eat)c.appendChild(btn("Äpfel essen",eatApples,()=>g.apples<1));
  if(g.unlocks.throw)c.appendChild(btn("10 Äpfel für die Krähe auslegen",leaveApples,()=>g.apples<10));
  if(g.cider>0)c.appendChild(btn("1 Mostflasche trinken (+45 LP)",drinkCider,()=>g.hp>=g.maxHp));
}

function visibleTabs(){
  const arr=[["main","Apfelkiste"]];
  arr.push(["journal","Questbuch"]);
  if(g.unlocks.farm)arr.push(["farm","Streuobstwiese"]);
  if(g.unlocks.shop)arr.push(["shop","Händler"]);
  if(g.unlocks.inventory)arr.push(["inventory","Inventar"]);
  if(g.unlocks.map)arr.push(["map","Weltkarte"]);
  if(g.unlocks.quests)arr.push(["quests","Ort / Quest"]);
  if(g.unlocks.box)arr.push(["box","Das Geheimnis"]);
  arr.push(["save","Speichern"]); return arr;
}

function renderTabs(){
  const t=$("tabs");t.innerHTML="";
  for(const [id,label] of visibleTabs()){
    const b=btn(label,()=>{g.currentTab=id;render()});
    b.classList.add("tab"); if(g.currentTab===id)b.classList.add("active"); t.appendChild(b);
  }
}

function renderPanels(){
  for(const id of ["main","farm","shop","inventory","map","journal","quests","box","save"]) $("panel-"+id).classList.toggle("active",g.currentTab===id);
  // Nur das aktive Panel neu aufbauen. Jeder Tab-Wechsel ruft render() auf.
  const renderActive={main:renderMain,farm:renderFarm,shop:renderShop,inventory:renderInventory,
    map:renderMap,journal:renderJournal,quests:renderQuests,box:renderBox,save:renderSave}[g.currentTab];
  (renderActive||renderMain)();
}

function renderEncounterPanel(){
  const panel=$("encounterPanel");panel.innerHTML="";
  if(g.combat)return;
  const scene=ENCOUNTERS.find(x=>x.place===g.location);
  if(!scene)return;
  const choice=scene.choices.find(x=>x.id===g.encounters[scene.id]);
  const card=document.createElement("section");card.className="encounter-card";
  const title=document.createElement("h3");title.textContent=`ERKUNDUNG · ${scene.title}`;card.appendChild(title);
  const text=document.createElement("p");text.textContent=choice?choice.text:scene.intro;card.appendChild(text);
  if(!choice)for(const option of scene.choices)card.appendChild(btn(option.label,()=>chooseEncounter(scene.id,option.id)));
  panel.appendChild(card);
}

function renderLorePanel(){
  const panel=$("lorePanel");panel.innerHTML="";
  if(g.combat)return;
  const available=LORE_THREADS.filter(x=>x.places.includes(g.location)&&(x.chapter===1||g.flags.ending));
  const thread=available.find(x=>!g.lore.choices[x.id])||available.find(x=>g.lore.opened[x.id]===g.location);
  if(!thread)return;
  const card=document.createElement("section");card.className="lore-card";
  const title=document.createElement("h3");title.textContent=`WEGBUCH ${thread.chapter} · ${thread.title}`;card.appendChild(title);
  const body=document.createElement("p");
  const origin=g.lore.opened[thread.id]||g.location;
  body.textContent=g.lore.opened[thread.id]?thread.story[origin]:thread.intro[g.location];card.appendChild(body);
  if(!g.lore.opened[thread.id])card.appendChild(btn("Spur untersuchen",()=>openLore(thread.id)));
  else if(!g.lore.choices[thread.id])for(let i=0;i<thread.choices.length;i++)card.appendChild(btn(thread.choices[i].label,()=>chooseLore(thread.id,i)));
  else {const result=document.createElement("p");result.className="good";result.textContent=thread.choices[g.lore.choices[thread.id]-1]?.text||"Diese Spur ist in deinem Wegbuch.";card.appendChild(result)}
  panel.appendChild(card);
}

function showScene(element, key, label, animate=true){
  if(element.textContent!==SCENES[key]){
    element.textContent=SCENES[key];
    element.className="scene-art";
    if(animate){void element.offsetWidth;element.className="scene-art scene-enter";}
  }
  element.setAttribute("aria-label",`ASCII-Illustration: ${label}`);
}

function drawHotspots(container,spots){
  const isDisabled=s=>Boolean(typeof s.disabled==="function"?s.disabled():s.disabled);
  const signature=spots.map(s=>`${s.label}:${isDisabled(s)?1:0}`).join("|");
  if(container.hotspotSignature===signature)return;
  container.hotspotSignature=signature;container.innerHTML="";
  for(const spot of spots){
    const button=btn(spot.label,spot.action,spot.disabled);button.className="scene-hotspot";
    button.title=spot.label;button.setAttribute("aria-label",spot.label);
    container.appendChild(button);
  }
}
function renderQuestHotspots(){
  const f=g.flags,spots=[];
  const add=(label,action,disabled=false)=>spots.push({label,action,disabled});
  if(!g.combat){
    switch(g.location){
      case "osterbach":if(g.water.oster.stage==="new")add("Spuren verfolgen",inspectOster);break;
      case "biberdamm":if(g.water.oster.stage==="trail")add("Damm untersuchen",inspectDam);
        if(g.water.oster.stage==="assessed"){
          add("Fachstelle",()=>solveOster("fachstelle"),()=>g.seeds<osterCosts().fachstelle);
          add("Zuleitung",()=>solveOster("versorgung"),()=>g.apples<35);
          add("Gemeinde",()=>solveOster("gemeinschaft"),()=>g.apples<osterCosts().gemeinschaft||g.seeds<5);
        }break;
      case "jenbach":if(!g.flags.jenbachWon){add("Ratten verhandeln",resolveRatPeacefully,()=>g.apples<35);break}
        if(g.water.oster.stage==="solved"&&g.flags.jenbachWon){
        if(g.water.flood.stage==="new")add("Pegel prüfen",inspectRain);
        if(g.water.flood.stage==="warned"){
          add("Brücke",()=>solveFlood("treibholz"),()=>g.apples<30);
          add("Rückhalt",()=>solveFlood("rueckhalt"),()=>g.apples<20||g.seeds<15);
          add("Häuser",()=>solveFlood("hausschutz"),()=>g.apples<65);
        }
      }break;
      case "siedlung":if(g.water.flood.stage==="observed"){
        add("Nachbarn warnen",()=>warnHomes("nachbarn"));
        add("Gemeinde rufen",()=>warnHomes("gemeinde"));
      }break;
      case "kirche":add("Kerze anzünden",()=>lightCandle(),f.candleLit);break;
      case "bahnhof":add("Zwischen den Schwellen suchen",findFahrkarte,f.bahnhofFound);break;
      case "filze":add("Moorfrosch",filzeExplore,()=>f.filzeSecret||g.apples<40);
        if(f.ending)add("Irrlicht",catchLight,!f.springHeard||f.moorLight);break;
      case "wall":if(!f.wallPassed){add(has("chalk")?"Tür zeichnen":"Umweg suchen",()=>has("chalk")?drawDoor():bypassWall(),()=>!has("chalk")&&(g.apples<(g.encounters.bahnhof==="route"?5:20)||g.seeds<10));
        if(has("rustySword")&&!f.wallMarker)add("Wegweiser schnitzen",carveMarker)}break;
      case "tregler":add("Brotzeit nehmen",takeBrotzeit,f.treglerReward);break;
      case "wirtsalm":if(!f.wirtsalmWon)add("Golem ablenken",resolveGolemPeacefully,()=>!f.treglerReward||g.apples<45);break;
      case "markt":add("Chronik erwerben",collectLedger,()=>f.marketLedger||g.apples<120);break;
      case "wiechs":add("Kerne sortieren",learnVariety,()=>!f.marketLedger||f.orchardSong||g.seeds<20);break;
      case "au":add("Ernte teilen",keepVow,()=>f.vowKept||g.apples<50);break;
      case "litzldorf":add("Wasserfall hören",hearSpring,f.springHeard||!f.vowKept||!f.orchardSong);break;
      case "farrenpoint":add("Wanderstock nehmen",takeStick,has("hikingStick"));break;
      case "wendelstein":add("Männlein fragen",meetMannl,f.mannlGift||!f.moorLight||!f.springHeard||!f.vowKept);break;
      case "fulinpach":if(f.finalWon&&!f.finalChoice){add("Ernte teilen",()=>decideFate("share"));add("Bach ruhen lassen",()=>decideFate("rest"))}
        else if(!f.finalWon)add("Verhandeln",bargainPicker,()=>loreCount(2)<3||chronicleCount(2)<2||g.apples<120||g.bark<8);break;
    }
  }
  drawHotspots($("questHotspots"),spots);
}


// Der Text an der Kiste hängt vom Apfelstand ab; die Stufe merken, damit der Takt nur bei Wechsel neu zeichnet.
let shownMainStage=null;
function mainStoryStage(){return g.flags.wrapperSeen?"after":g.apples<10?0:g.apples<40?1:2}
function renderMain(){
  showScene($("mainArt"),"main","Apfelkiste am Rathausplatz");
  const hotspots=[];
  if(!g.flags.crateInspected)hotspots.push({label:"Loses Brett",action:inspectCrate});
  if(g.unlocks.wrapper&&!g.flags.wrapperSeen)hotspots.push({label:"Rindenstück",action:inspectWrapper});
  if(g.flags.crow&&g.flags.crowFeed<10)hotspots.push({label:"Krähe füttern",action:crowFeed,disabled:()=>g.apples<5});
  if(g.unlocks.shop)hotspots.push({label:"Zum Händler",action:()=>{g.currentTab="shop";render()}});
  if(g.unlocks.farm)hotspots.push({label:"Zur Wiese",action:()=>{g.currentTab="farm";render()}});
  drawHotspots($("mainHotspots"),hotspots);
  shownMainStage=mainStoryStage();
  let text="";
  if(!g.flags.wrapperSeen){
    if(g.apples<10) text="Bad Feilnbach. Rathausplatz.\n\nVor dir steht eine Apfelkiste mit einem losen Brett.\nNiemand scheint sie zu vermissen. Das Rathaus wirkt unbeteiligt.\n\nDann erscheint ein Apfel. Kurz darauf noch einer, ganz von allein.\n\nAus dem Holz hörst du Wasser.";
    else if(g.apples<40) text="Die Kiste füllt sich langsam mit Äpfeln.\n\nDu könntest sie essen oder neben der Kiste auslegen.\nAuf dem Holz steht ein Name, den du nicht lesen kannst.";
    else text="Unter den Äpfeln liegt ein Stück Rinde.\n\nDarauf: ein Bach, der kaum fließt.\nEs ist warm. Für Baumrinde ungewöhnlich.";
  } else {
    text=g.flags.finalChoice ? `FULINPACH\n\n${g.flags.finalChoice==="share"?"Die Ernte ist geteilt.":"Der Bach bleibt ungestört."}\n\nDu kannst weiterhin alle Orte besuchen und nach Geheimnissen suchen.` : "Die Apfelkiste steht weiterhin am Rathausplatz.\n\nSie wirkt tiefer als vorher.\nManchmal hörst du darunter einen langsamen Bach.\n\nAuf einem Rindenstück steht: FULINPAH.";
  }
  $("mainStory").textContent=text;
  const a=$("mainActions");a.innerHTML="";
  if(!g.flags.crateInspected)a.appendChild(btn("Loses Brett untersuchen",inspectCrate));
  if(g.unlocks.wrapper && !g.flags.wrapperSeen)a.appendChild(btn("Rindenstück untersuchen",inspectWrapper));
  if(g.flags.wrapperSeen && !g.flags.wrapperChoice){
    a.appendChild(btn("Behalten",()=>wrapperChoice("keep")));
    a.appendChild(btn("In zwei Hälften reißen",()=>wrapperChoice("tear")));
    a.appendChild(btn("Essen",()=>wrapperChoice("eat"),false,"danger"));
  }
  if(g.flags.crow && g.flags.crowFeed<10)a.appendChild(btn(`Krähe mit 5 Äpfeln füttern (${g.flags.crowFeed}/10)`,crowFeed,()=>g.apples<5));
  if(g.flags.ending && !g.flags.finalChoice)a.appendChild(btn("Die zweite Karte entfalten",()=>{g.currentTab="map";render()}));
}

function renderLog(){
  const l=$("log"); if(!l)return;
  l.innerHTML=g.messages.slice(-15).map(m=>{
    let cls=""; if(m.startsWith("[good]"))cls="good"; if(m.startsWith("[bad]"))cls="bad"; if(m.startsWith("[secret]"))cls="secret";
    return `<div class="${cls}">${escapeHtml(m.replace(/^\[(good|bad|secret)\]\s*/,""))}</div>`;
  }).join("");
  l.scrollTop=l.scrollHeight;
}

let shopShowsDoNotBuy=false;
function shopWantsDoNotBuy(){return g.apples>=250||g.flags.doNotBuy}
function renderShop(){
  const s=$("shop"); if(!g.unlocks.shop){s.innerHTML="";return}
  s.innerHTML=`<pre>DER HÄNDLER AM RATHAUSPLATZ\n\n  »Alles regional. Alles nachhaltig.«\n\nEr sagt das, bevor du überhaupt gefragt hast.</pre><div class="bar"></div>`;
  const art=document.createElement("pre");art.className="scene-art";art.setAttribute("role","img");
  showScene(art,"shop","Apfelhändler am Rathausplatz",false);s.prepend(art);
  for(const si of shopItems){
    if(si.id==="doNotBuy"){shopShowsDoNotBuy=shopWantsDoNotBuy();if(!shopShowsDoNotBuy)continue}
    if(!si.repeat && g.shopBought[si.id]) continue;
    const row=document.createElement("div");row.className="item shop-item";
    const it=itemDb[si.id];
    const effect=it && gearSlot(si.id)?` · ${EQUIPMENT_SLOTS.find(s=>s.id===gearSlot(si.id)).label}: ${it.damage?`+${it.damage} Schaden`:""}${it.damage&&it.defense?", ":""}${it.defense?`+${it.defense} Schutz`:""}`:si.id==="seedCollector"?" · erzeugt 0,5 Kerne/s":"";
    row.appendChild(itemGraphic(si.id));
    const body=document.createElement("div");body.className="shop-item-body";
    body.textContent=`${si.label} — ${costText(si.cost)}${effect} `;
    body.appendChild(btn("Kaufen",()=>buy(si),()=>!canAfford(si.cost),si.id==="doNotBuy"?"danger":""));
    row.appendChild(body);s.appendChild(row);
  }
  if(!has("chalk") && g.flags.jenbachWon){
    const row=document.createElement("div");row.className="item shop-item";row.appendChild(itemGraphic("chalk"));
    const body=document.createElement("div");body.className="shop-item-body";body.textContent="Stück Kreide — 25 Apfelkerne ";
    body.appendChild(btn("Kaufen",()=>{if(spend("seeds",25)){addItem("chalk");render()}},()=>g.seeds<25));row.appendChild(body);s.appendChild(row);
  }
}

function renderInventory(){
  const c=$("inventory"); c.innerHTML="";
  const stats=document.createElement("div");stats.className="equipment-stats";
  stats.innerHTML=`<strong>AUSRÜSTUNG</strong><span>LP ${Math.ceil(g.hp)}/${g.maxHp}</span><span>Schaden ${g.damage}</span><span>Schutz ${g.defense}</span>`;
  c.appendChild(stats);
  const layout=document.createElement("div");layout.className="equipment-layout";
  for(const {id,label} of EQUIPMENT_SLOTS){
    const slot=document.createElement("div");slot.className=`equipment-slot${g.equipped[id]?" has-item":""}`;slot.style.gridArea=id;
    const caption=document.createElement("label");caption.htmlFor=`equipment-${id}`;caption.textContent=label;slot.appendChild(caption);
    if(g.equipped[id])slot.appendChild(itemGraphic(g.equipped[id],"slot-art"));
    const select=document.createElement("select");select.id=`equipment-${id}`;select.setAttribute("aria-label",`${label} ausrüsten`);
    const empty=document.createElement("option");empty.value="";empty.textContent="– leer –";select.appendChild(empty);
    for(const itemId of g.inventory.filter(item=>gearSlot(item)===id)){
      const option=document.createElement("option");option.value=itemId;option.textContent=itemDb[itemId].name;select.appendChild(option);
    }
    select.value=g.equipped[id]||"";
    select.onchange=()=>equipSlot(id,select.value);
    slot.appendChild(select);
    const it=itemDb[g.equipped[id]];
    const effect=document.createElement("p");effect.className="slot-effect";
    effect.textContent=it?`${it.damage?`+${it.damage} Schaden`:""}${it.damage&&it.defense?" · ":""}${it.defense?`+${it.defense} Schutz`:""}`:"Noch nichts angelegt";
    slot.appendChild(effect);
    if(it){const desc=document.createElement("p");desc.className="slot-desc";desc.textContent=it.desc;slot.appendChild(desc)}
    if(id==="weapon" && g.equipped.weapon==="rustySword" && g.location==="wall" && !g.flags.wallMarker)
      slot.appendChild(btn("Wegweiser schnitzen",carveMarker));
    layout.appendChild(slot);
  }
  const figure=document.createElement("div");figure.className="equipment-figure";
  const portrait=document.createElement("pre");portrait.textContent=PORTRAIT_ART;figure.appendChild(portrait);
  const figureLabel=document.createElement("span");figureLabel.className="small";figureLabel.textContent="Wanderer am Jenbach";figure.appendChild(figureLabel);
  layout.appendChild(figure);c.appendChild(layout);
  const note=document.createElement("p");note.className="small";
  note.textContent="Wähle pro Platz einen Gegenstand. „– leer –“ legt ihn ab. Angelegte Werte gelten sofort im Kampf.";c.appendChild(note);
  const spare=g.inventory.filter(id=>gearSlot(id) && g.equipped[gearSlot(id)]!==id);
  if(spare.length){
    const spareBag=document.createElement("details");spareBag.className="pouch";
    const summary=document.createElement("summary");summary.textContent=`Weitere Ausrüstung (${spare.length})`;spareBag.appendChild(summary);
    for(const id of spare){const d=document.createElement("div");d.className="pouch-item";
      d.appendChild(itemGraphic(id));const info=document.createElement("div");info.className="pouch-item-text";
      info.innerHTML=`<strong>${escapeHtml(itemDb[id].name)}</strong><br>${escapeHtml(itemDb[id].desc)}`;d.appendChild(info);spareBag.appendChild(d)}
    c.appendChild(spareBag);
  }
  const other=g.inventory.filter(id=>!gearSlot(id));
  if(other.length){
    const pouch=document.createElement("details");pouch.className="pouch";
    const summary=document.createElement("summary");summary.textContent=`Fundstücke und Hinweise (${other.length})`;pouch.appendChild(summary);
    for(const id of other){const d=document.createElement("div");d.className="pouch-item";
      d.appendChild(itemGraphic(id));const info=document.createElement("div");info.className="pouch-item-text";
      info.innerHTML=`<strong>${escapeHtml(itemDb[id].name)}</strong><br>${escapeHtml(itemDb[id].desc)}`;d.appendChild(info);pouch.appendChild(d)}
    c.appendChild(pouch);
  }
}

// Das Relief bleibt reines ASCII und ändert sich nie: einmal zeichnen, dann nur noch die Ortsnummern setzen.
const MAP_WIDTH=114,MAP_HEIGHT=50;
let mapBaseCanvas=null;
function mapPut(canvas,x,y,value){if(y<0||y>=MAP_HEIGHT)return;for(let i=0;i<value.length;i++)if(x+i>0&&x+i<MAP_WIDTH-1)canvas[y][x+i]=value[i]}
function buildMapCanvas(){
  const width=114,height=50,canvas=Array.from({length:height},()=>Array(width).fill(" "));
  const put=(x,y,value)=>mapPut(canvas,x,y,value);
  const route=(points,mark=".")=>{for(let n=1;n<points.length;n++){
    const [ax,ay]=points[n-1],[bx,by]=points[n],steps=Math.max(Math.abs(bx-ax),Math.abs(by-ay));
    for(let k=0;k<=steps;k++){const x=Math.round(ax+(bx-ax)*k/steps),y=Math.round(ay+(by-ay)*k/steps);
      if(x>1&&x<width-2&&y>2&&y<47&&k%3!==1)canvas[y][x]=mark;
    }
  }};
  const peak=(x,y,r)=>{for(let d=0;d<r;d++){
    const span=d*2,inside=d===0?"":(d%2?"^":"#").repeat(span-1);
    put(x-d,y+d,`/${inside}\\`);
  }};
  for(let y=0;y<height;y++){canvas[y][0]="|";canvas[y][width-1]="|"}
  canvas[0]=Array.from(`+${"-".repeat(width-2)}+`);
  canvas[49]=Array.from(`+${"-".repeat(width-2)}+`);
  put(3,1,"F U L I N P A C H     /     BAD FEILNBACH UND DAS JENBACHTAL");
  put(97,1,"N ^  O >");
  put(3,2,"MOOR UND WIESEN");put(82,2,"ROSENHEIMER BECKEN");
  // Zusammenhängende Landformen statt zufälliger Einzelzeichen.
  for(let y=4;y<15;y++)for(let x=78;x<108;x++){
    const edge=Math.floor((y-4)/3);
    if(x>=80-edge&&((x*5+y*3)%7<4))canvas[y][x]=(x+y)%4===0?";":":";
  }
  for(let y=4;y<14;y++)for(let x=3;x<29;x++)if((x*7+y*3)%9<3)canvas[y][x]=".";
  for(let y=11;y<29;y+=4)for(let x=6;x<45;x+=8){
    put(x,y," /o\\ ");put(x,y+1,"  |  ");
  }
  for(let y=13;y<28;y+=4)for(let x=84;x<106;x+=8){put(x,y," /o\\ ");put(x,y+1,"  |  ")}
  for(let y=29;y<46;y++)for(let x=5;x<108;x++){
    if((x*5+y*11)%17<3)canvas[y][x]=y>37?"^":"#";
    if(y%5===0&&x%4===0)canvas[y][x]="_";
  }
  // Talwege: Die alte Bahnachse kommt von Bad Aibling/Au; die Almwege steigen nach Süden.
  route([[9,6],[18,9],[28,16],[43,21]],".");
  route([[46,21],[68,24],[86,17],[99,27]],".");
  route([[47,24],[30,26],[17,32],[22,39]],".");
  route([[67,27],[66,33],[52,40],[53,46]],".");
  route([[66,33],[91,40]],".");
  // Der Jenbach zieht vom Berg nordwärts; der Osterbach bleibt ein eigener westlicher Lauf.
  const jen=[70,70,70,71,71,70,70,70,69,69,69,68,68,68,68,69,69,69,69,70,70,70,69,69,68,68,67,67,66,66,66,65,65,64,64,63,63,62,62,61,61,60,60,59,59,58,58];
  for(let y=3;y<48;y++)put(jen[y]-1,y,"{~~}");
  const oster=[21,20,19,18,18,19,21,22,24,26,28,30,31,32,33,35,37,39];
  for(let i=0;i<oster.length;i++)put(oster[i],11+i,"~");
  // Ein paar größere, zusammenhängende Baumgruppen und Höhenlinien.
  for(const [x,y] of [[10,32],[31,34],[77,31],[101,33],[37,38],[82,37]]){
    put(x,y," /\\ /\\ ");put(x,y+1," || || ");
  }
  peak(28,37,5);peak(54,42,5);peak(91,38,6);
  // Dorf und Ortsteile mit Straßen, Häusern, Kirche und Brücken.
  put(11,5," /\\ ");put(11,6," |[]|  AU / TAXA");
  put(27,15," /--\\");put(27,16," |__|  BAHNHOF");
  put(44,16," /\\     /\\      /\\");put(44,17,"|[]|   |[]|    |[]|");
  put(43,18,"======= BAD FEILNBACH =======");
  put(43,19," /\\     /\\      /+\\");put(43,20," RATHAUS      KIRCHE");
  put(71,22,"========== BRUECKE ==========");
  put(82,18," /\\  /\\");put(82,19,"|[]||[]|  WOHNHAEUSER");
  put(86,15,"WIECHS  /\\");
  put(97,26,"LITZLDORF");
  put(20,25,"SPIELPLATZ");put(15,30,"BIBERBURG");
  put(67,25,"JENBACH");put(62,32,"JENBACHTAL");
  put(18,38,"TREGLER ALM");put(51,39,"WIRTSALM");
  put(85,39,"FARRENPOINT");put(42,45,"WENDELSTEIN");
  put(82,6,"STERNTALER FILZE");
  put(3,47,"o Obstbaum  : Filz  # Wald  ^ Gipfel  ~ Bach  . Weg  [##] Reiseziel");
  put(3,48,"Norden oben / Westen links     Nummer anklicken oder Ziel unten waehlen     Lage angenaehert");
  return canvas;
}
function renderMap(){
  const m=$("map"); if(!g.unlocks.map){m.innerHTML="";return}
  m.innerHTML="";
  const heading=document.createElement("p");heading.className="map-intro";
  heading.textContent=g.flags.ending?"WELTKARTE · Der Weg über die alten Wiesen ist aufgedeckt.":"WELTKARTE · Wähle eine Ortsnummer direkt in der Landschaft.";
  m.appendChild(heading);
  const scrollHint=document.createElement("p");scrollHint.className="scroll-hint";
  scrollHint.textContent="Die Karte ist breiter als der Bildschirm und lässt sich seitlich scrollen.";
  m.appendChild(scrollHint);
  const scroll=document.createElement("div");scroll.className="map-scroll";
  const terrain=document.createElement("div");terrain.className="terrain-map";
  const mapArt=document.createElement("pre");mapArt.className="map-art";
  mapArt.setAttribute("aria-label","ASCII-Übersicht mit Norden oben: Au im Nordwesten, Sterntaler Filze im Nordosten, Bad Feilnbach in der Mitte und Jenbachtal und Berge im Süden. Die nummerierten Orte sind direkt anwählbar.");
  const markers=document.createElement("div");markers.id="mapButtons";markers.className="map-markers";
  // Nord oben, Ost rechts. Die Positionen zeigen die Lage zueinander, nicht einen Wanderweg.
  const places=[
    {id:"rathaus",name:"Rathausplatz",col:44,row:21},
    {id:"kirche",name:"Herz-Jesu-Kirche",col:59,row:21},
    {id:"filze",name:"Sterntaler Filze",col:86,row:8},
    {id:"bahnhof",name:"Ehemaliger Bahnhof",col:28,row:17},
    {id:"jenbach",name:g.water.oster.stage==="solved"&&g.flags.jenbachWon&&g.water.flood.stage!=="solved"?"Jenbach · Hochwasser":"Jenbachparadies",col:68,row:26},
    {id:"osterbach",name:"Wasserspielplatz Am Osterbach",col:27,row:26},
    {id:"biberdamm",name:"Biberburg",col:17,row:32,locked:g.water.oster.stage==="new"},
    ...(g.water.oster.stage==="solved"&&g.flags.jenbachWon?[{id:"siedlung",name:"Wohnhäuser am Jenbach",col:82,row:21,locked:g.water.flood.stage==="new"}]:[]),
    {id:"wall",name:"Unteres Jenbachtal",col:66,row:33,locked:!g.flags.jenbachWon},
    {id:"tregler",name:"Tregler Alm",col:22,row:39,locked:!g.flags.jenbachWon},
    {id:"wirtsalm",name:"Wirtsalm",col:52,row:40,locked:!g.flags.wallPassed}
  ];
  if(g.flags.ending)places.push(
    {id:"markt",name:"Apfelmarkt",col:46,row:24},
    {id:"wiechs",name:"Wiechs",col:88,row:17},
    {id:"au",name:"Au / Taxakapelle",col:15,row:7},
    {id:"litzldorf",name:"Litzldorfer Wasserfall",col:99,row:28},
    {id:"farrenpoint",name:"Farrenpoint",col:91,row:40,locked:!g.flags.springHeard},
    {id:"wendelstein",name:"Wendelstein",col:53,row:46,locked:!has("hikingStick")},
    {id:"fulinpach",name:"Fulinpach",col:72,row:44,locked:!g.flags.mannlGift||!g.flags.boxOpened}
  );
  if(!mapBaseCanvas)mapBaseCanvas=buildMapCanvas();
  const canvas=mapBaseCanvas.map(row=>row.slice());
  // Die Ortspunkte sind echte Inline-Schaltflächen und verdecken keine ASCII-Zeichen.
  const byNumber=new Map();
  places.forEach((place,index)=>{place.number=String(index+1).padStart(2,"0");const tag=`[${place.number}]`;mapPut(canvas,place.col,place.row,tag);byNumber.set(place.number,place)});
  const rows=canvas.map(row=>row.join("").trimEnd());
  for(let y=0;y<rows.length;y++){
    if(y)mapArt.appendChild(document.createTextNode("\n"));
    const re=/\[(\d{2})\]/g;let match,last=0;
    while((match=re.exec(rows[y]))){
      mapArt.appendChild(document.createTextNode(rows[y].slice(last,match.index)));
      const place=byNumber.get(match[1]);
      if(place){
        const point=document.createElement("button");point.type="button";point.className=`map-point${g.location===place.id?" current":""}`;
        point.textContent=match[0];point.title=place.locked?`${place.name} · noch gesperrt`:place.name;
        point.setAttribute("aria-label",point.title);point.disabled=Boolean(place.locked);
        point.onclick=()=>travel(place.id);mapArt.appendChild(point);
      }else mapArt.appendChild(document.createTextNode(match[0]));
      last=re.lastIndex;
    }
    mapArt.appendChild(document.createTextNode(rows[y].slice(last)));
  }
  terrain.appendChild(mapArt);
  for(const place of places){
    const pending=ENCOUNTERS.some(scene=>scene.place===place.id&&!g.encounters[scene.id]);
    const marker=btn(`[${place.number}] ${place.name}${pending?" · Erkundung":""}`,()=>travel(place.id),Boolean(place.locked));
    const complete=["osterbach","biberdamm"].includes(place.id)&&g.water.oster.stage==="solved"||["jenbach","siedlung"].includes(place.id)&&g.water.flood.stage==="solved";
    marker.className=`map-marker${g.location===place.id?" current":""}${complete?" completed":""}${pending?" encounter":""}`;
    marker.title=place.locked?`${place.name} · noch gesperrt`:pending?`${place.name} · Erkundung offen`:complete?`${place.name} · Quest abgeschlossen`:place.name;
    if(g.location===place.id)marker.setAttribute("aria-current","location");
    markers.appendChild(marker);
  }
  scroll.appendChild(terrain);m.appendChild(scroll);m.appendChild(markers);
  const hint=document.createElement("p");hint.className="map-legend";
  hint.textContent="Klicke die Nummer in der ASCII-Karte oder wähle den Ort darunter. [@] aktueller Ort | [?] Erkundung offen | [+] anwählbar | [X] Quest abgeschlossen | [#] gesperrt. Ortslage angenähert.";
  m.appendChild(hint);
}

function renderJournal(){
  const c=$("journal");c.innerHTML="<h2>Questbuch</h2><p class=\"small\">Dein nächster Schritt und deine bisherigen Entscheidungen. Abgeschlossene Geschichten stehen darunter.</p>";
  const archive=document.createElement("section");archive.className="questbox";
  const archiveTitle=document.createElement("h2");archiveTitle.textContent="Ortschronik Bad Feilnbach";archive.appendChild(archiveTitle);
  const archiveProgress=document.createElement("p");archiveProgress.textContent=`Gelesene und verstandene Seiten: erster Weg ${chronicleCount(1)}/4, zweiter Weg ${chronicleCount(2)}/4. Für jede große Weggabelung genügen zwei Seiten des jeweiligen Abschnitts.`;archive.appendChild(archiveProgress);
  for(const phase of [1,2]){
    if(phase===2&&!g.flags.ending)continue;
    const chapter=document.createElement("h3");chapter.textContent=phase===1?"Der alte Ort":"Die Wege der Gemeinde";archive.appendChild(chapter);
    for(const entry of CHRONICLE.filter(x=>x.phase===phase)){
      const found=g.chronicle.visited.includes(entry.place),solved=g.chronicle.solved.includes(entry.id);
      const page=document.createElement("details");page.className="chronicle";
      if(chronicleOpen===entry.id)page.open=true;
      const summary=document.createElement("summary");summary.textContent=`${solved?"[X]":found?"[+]":"[?]"} ${entry.date} · ${entry.title}`;page.appendChild(summary);
      if(!found){const notice=document.createElement("p");notice.textContent=`Suche die Chronikseite am Ort: ${SCENE_LABELS[entry.place]}.`;page.appendChild(notice)}
      else{
        for(const paragraph of entry.paragraphs){const body=document.createElement("p");body.textContent=paragraph;page.appendChild(body)}
        const source=document.createElement("a");source.className="source";source.href=entry.url;source.target="_blank";source.rel="noopener noreferrer";source.textContent=`Quelle: ${entry.source}`;page.appendChild(source);
        const question=document.createElement("p");question.textContent=entry.question;page.appendChild(question);
        if(solved){const result=document.createElement("p");result.className="answer";result.textContent=`Im Wegbuch: ${entry.answers[entry.correct]}`;page.appendChild(result)}
        else{const feedback=document.createElement("p");feedback.className="answer";feedback.setAttribute("role","status");
          entry.answers.forEach((answer,index)=>page.appendChild(btn(answer,()=>solveChronicle(entry.id,index,feedback))));page.appendChild(feedback)}
      }
      archive.appendChild(page);
    }
  }
  c.appendChild(archive);
  const entries=journalEntries();
  function card(entry){
    const li=document.createElement("li");li.className=`journal-card ${entry.done?"completed":"active"}`;
    const title=document.createElement("h3");title.textContent=entry.title;li.appendChild(title);
    const status=document.createElement("div");status.className="journal-status";status.textContent=entry.done?"[X] ABGESCHLOSSEN":`${entry.group.toUpperCase()} · OFFEN`;li.appendChild(status);
    const step=document.createElement("p");step.textContent=entry.step;li.appendChild(step);
    if(entry.decision){const choice=document.createElement("p");choice.className="journal-choice";choice.textContent=entry.decision;li.appendChild(choice)}
    li.appendChild(btn(entry.done?"Ort erneut besuchen":"Zum nächsten Schritt",()=>journalGo(entry)));
    return li;
  }
  const open=entries.filter(e=>!e.done);
  for(const group of ["Hauptgeschichte","Wasser","Wegbuch","Nebenweg"]){
    const groupEntries=open.filter(e=>e.group===group);if(!groupEntries.length)continue;
    const heading=document.createElement("h3");heading.textContent=group;c.appendChild(heading);
    const list=document.createElement("ul");list.className="journal-list";
    for(const entry of groupEntries)list.appendChild(card(entry));c.appendChild(list);
  }
  if(!open.length){const done=document.createElement("p");done.textContent="Alle bekannten Geschichten sind abgeschlossen.";c.appendChild(done)}
  const completed=entries.filter(e=>e.done);
  if(completed.length){const history=document.createElement("details");history.className="history";
    const summary=document.createElement("summary");summary.textContent=`Abgeschlossen (${completed.length})`;history.appendChild(summary);
    const list=document.createElement("ul");list.className="journal-list";for(const entry of completed)list.appendChild(card(entry));history.appendChild(list);c.appendChild(history)}
  const memories=LORE_THREADS.filter(thread=>g.lore.opened[thread.id]);
  if(memories.length){const history=document.createElement("details");history.className="history";
    const summary=document.createElement("summary");summary.textContent=`Wegbuch nachlesen (${memories.length}/6)`;history.appendChild(summary);
    for(const thread of memories){const page=document.createElement("section");page.className="lore-card";
      const title=document.createElement("h3");title.textContent=thread.title;page.appendChild(title);
      const body=document.createElement("p");body.textContent=thread.story[g.lore.opened[thread.id]];page.appendChild(body);
      const choice=g.lore.choices[thread.id];if(choice){const answer=document.createElement("p");answer.textContent=thread.choices[choice-1]?.text||"Die Spur bleibt bei dir.";page.appendChild(answer)}
      history.appendChild(page)}c.appendChild(history)}
}

// Kampfansicht: einmal aufbauen, danach im Spieltakt nur Zahlen, Balken und Treffer nachführen.
let combatView=null;
function healthBar(value,max){return `[${"#".repeat(Math.round(Math.max(0,value)/max*20)).padEnd(20,".")}]`}
function combatStatusText(e){
  return `DU                           ${e.name}\nLP ${Math.ceil(g.hp)}/${g.maxHp}                     LP ${Math.max(0,Math.ceil(g.combat.enemyHp))}/${e.maxHp}\n${healthBar(g.hp,g.maxHp)}      ${healthBar(g.combat.enemyHp,e.maxHp)}\n\nDeine Waffe greift automatisch an. Du kannst zusätzlich gezielt angreifen.`;
}
function renderCombat(q){
  const e=enemies[g.combat.id];
  const duel=document.createElement("div");duel.className="battle-view";
  const hero=document.createElement("div");hero.className="battle-avatar";hero.setAttribute("role","img");hero.setAttribute("aria-label","Dein Wanderer");
  hero.textContent=HERO_ART;duel.appendChild(hero);
  const versus=document.createElement("span");versus.className="battle-versus";versus.textContent="GEGEN";duel.appendChild(versus);
  const enemyPortrait=enemyGraphic(g.combat.id,e.name);duel.appendChild(enemyPortrait);q.appendChild(duel);
  const status=document.createElement("pre");q.appendChild(status);
  const blade=g.equipped.weapon==="rustySword";
  const strikeButton=btn("",strike,()=>Date.now()<(g.combat?.nextStrike||0));q.appendChild(strikeButton);
  const hint=document.createElement("p");hint.className="small";
  hint.textContent=`Automatische Angriffe: ${g.damage} Schaden je Treffer. ${blade?"Der gezielte Schnitt verursacht zusätzlich Schaden und ist alle 3,2 Sekunden möglich.":"Im Inventar kannst du eine andere Waffe ausrüsten."}`;
  q.appendChild(hint);
  q.appendChild(btn("Zum Rathausplatz fliehen",()=>{g.combat=null;g.hp=Math.max(1,g.hp);g.location="rathaus";say("Du fliehst. Taktischer Rückzug ist Flucht mit besserem Marketing.");render()}));
  combatView={hero,enemyPortrait,status,strikeButton,blade};
  updateCombatView(Date.now());
}
function updateCombatView(now){
  if(!g.combat||!combatView||!combatView.status.isConnected)return;
  const e=enemies[g.combat.id],v=combatView;
  v.status.textContent=combatStatusText(e);
  v.hero.classList.toggle("hurt",now-(g.combat.lastHurt||0)<450);
  v.enemyPortrait.classList.toggle("hit",now-(g.combat.lastHit||0)<450);
  const ready=now>=(g.combat.nextStrike||0);
  const label=ready?(v.blade?"Mit Obstmesser gezielt schneiden":"Gezielt angreifen"):"Nächster gezielter Angriff gleich";
  if(v.strikeButton.textContent!==label)v.strikeButton.textContent=label;
}

function renderQuests(){
  const sceneKey=currentSceneKey();
  const hint=$("questHint"),entries=journalEntries(),atPlace=entries.filter(e=>e.place===g.location);
  const current=atPlace.find(e=>!e.done)||atPlace[0]||(["osterbach","biberdamm"].includes(g.location)?entries.find(e=>e.id==="oster"):g.location==="siedlung"?entries.find(e=>e.id==="hochwasser"):null);
  hint.textContent=g.combat?"Nächster Schritt: Besiege den Gegner oder ziehe dich zum Rathausplatz zurück.":current?`${current.done?"Entschieden":"Nächster Schritt"} · ${current.step}${current.decision?` ${current.decision}`:""}`:"";
  hint.style.display=hint.textContent?"block":"none";
  const locationArt=$("locationArt"),sceneChanged=locationArt.textContent!==SCENES[sceneKey];
  showScene(locationArt,SCENES[sceneKey]?sceneKey:"rathaus",SCENE_LABELS[sceneKey]||SCENE_LABELS.rathaus);
  renderQuestHotspots();
  renderLorePanel();
  renderEncounterPanel();
  if(sceneChanged && (sceneKey==="endingShare"||sceneKey==="endingRest"))locationArt.className="scene-art ending-scene";
  const q=$("quests"); q.innerHTML="";
  if(g.combat){renderCombat(q);return;}

  if(g.location==="rathaus"){
    q.innerHTML=`<pre>RATHAUSPLATZ\n\nHier begann alles.\nDie Kiste wartet.\nDas Rathaus ebenfalls, aber auf andere Dinge.</pre>`;
    return;
  }

  if(g.location==="osterbach"){
    const w=g.water.oster;
    const outcome={fachstelle:"Ein kontrollierter Ablauf führt wieder Wasser in die Holzrinnen. Die Biberburg bleibt erhalten.",versorgung:"Eine neue Zuleitung speist die Holzrinnen. Am natürlichen Bach wurde nichts verändert.",gemeinschaft:"Die Nachbarschaft betreut gemeinsam mit der Gemeinde die Wasserversorgung der Holzrinnen."};
    q.innerHTML=`<pre>WASSERSPIELPLATZ AM OSTERBACH\n\nZwischen Holzrinnen und Kies liegt ein Apfelkern. ${w.stage==="solved"?"Die Kinder können wieder an den Holzrinnen spielen.":"Die Holzrinnen sind trocken; die Kinder warten mit nassen Schuhen auf Wasser, das nicht kommt."}\n\n${w.stage==="solved"?outcome[w.solution]||"Das Wasser fließt wieder durch die Holzrinnen.":w.stage==="new"?"Schlammspuren führen oberhalb des Platzes weiter. Wo bleibt das Wasser?":"Frische Nagespuren führen bachaufwärts zur Biberburg."}</pre>`;
    if(w.stage==="new")q.appendChild(btn("Spuren am trockenen Bach verfolgen",inspectOster));
    if(w.stage==="trail")q.appendChild(btn("Zur Biberburg gehen",()=>travel("biberdamm")));
    return;
  }
  if(g.location==="biberdamm"){
    const w=g.water.oster;
    const outcome={fachstelle:"Eine Fachperson beobachtet den kontrollierten Ablauf. Die Biberfamilie bleibt zu Hause.",versorgung:"Das Wasser für die Spielrinnen kommt über eine andere Zuleitung. Der Damm bleibt unberührt.",gemeinschaft:"Die Nachbarschaft kümmert sich um die alternative Versorgung. Der Damm bleibt unberührt."};
    q.innerHTML=`<pre>BIBERBURG AM OSTERBACH\n\nOberhalb des Spielplatzes staut ein Biberdamm den Bach. Hinter den Zweigen schwimmt eine Biberfamilie. Ihr Zuhause abzureißen wäre die falsche Abkürzung.\n\n${w.stage==="trail"?"Untersuche erst, wohin das Wasser fließt.":w.stage==="solved"?outcome[w.solution]||"Die Biberfamilie bleibt, und die Spielrinnen führen wieder Wasser.":"Drei Lösungen sind möglich. Alle lassen die Biberburg unberührt; die Ressourcen dienen den beteiligten Helfern."}</pre>`;
    if(w.stage==="trail")q.appendChild(btn("Biberdamm und Abfluss ansehen",inspectDam));
    if(w.stage==="assessed"){
      q.appendChild(btn(`Fachstelle: kontrollierter Ablauf (${osterCosts().fachstelle} Kerne)`,()=>solveOster("fachstelle"),()=>g.seeds<osterCosts().fachstelle));
      q.appendChild(btn("Spielplatz-Zuleitung verlegen (35 Äpfel)",()=>solveOster("versorgung"),()=>g.apples<35));
      q.appendChild(btn(`Mit der Gemeinde neue Versorgung bauen (${osterCosts().gemeinschaft} Äpfel, 5 Kerne)`,()=>solveOster("gemeinschaft"),()=>g.apples<osterCosts().gemeinschaft||g.seeds<5));
    }return;
  }
  if(g.location==="kirche"){
    q.innerHTML=`<pre>PFARRKIRCHE HERZ JESU\n\nDie Kirche steht ruhig da.\nKeine Gegner. Kein Händler. Kein Questmarker.\n\nUngewöhnlich verdächtig.</pre>`;
    q.appendChild(btn(g.flags.candleLit?"Die Kerze brennt":"Eine Kerze anzünden",()=>lightCandle(),g.flags.candleLit));
    q.appendChild(btn("Still sitzen und durchatmen",()=>lightCandle(true),g.flags.candleLit));
    return;
  }

  if(g.location==="filze"){
    q.innerHTML=`<pre>STERNTALER FILZE\n\nDer Bohlenweg führt durch das Moor.\nEin Moorfrosch sitzt auf einem Pfosten und beobachtet dich mit der Ruhe eines Wesens, das nie eine Steuererklärung machen musste.\n\nDie Sterntaler Filze bewahrt ein altes Hochmoor. Moorvorkommen der Gegend waren seit etwa 1900 Grundlage für Kureinrichtungen. 1973 wurde Feilnbach zum Bad erhoben.\n\nNeben dem Frosch liegt etwas Kleines aus Holz.${g.flags.ending?"\n\nSpäter siehst du ein Irrlicht. Bleib auf dem Bohlenweg.":""}</pre>`;
    q.appendChild(btn(g.flags.filzeSecret?"Der Frosch schweigt":"Dem Moorfrosch 40 Äpfel anbieten",filzeExplore,()=>g.flags.filzeSecret||g.apples<40));
    {const cost=g.chronicle.solved.includes("moor1900")||g.encounters.filze==="frog"?5:15;q.appendChild(btn(`Im Moos suchen (${cost} Kerne)`,filzeExploreQuiet,()=>g.flags.filzeSecret||g.seeds<cost))}
    if(g.flags.ending){q.appendChild(btn("Dem Irrlicht auf dem Bohlenweg begegnen",catchLight,!g.flags.springHeard||g.flags.moorLight));
      q.appendChild(btn("Laterne für das Irrlicht besorgen (20 Kerne)",craftMoorLight,()=>!g.flags.springHeard||g.flags.moorLight||g.seeds<20));}
    return;
  }

  if(g.location==="bahnhof"){
    q.innerHTML=`<pre>EHEMALIGER BAHNHOF\n\nVon 1897 bis 1973 fuhr die Lokalbahn zwischen Bad Aibling und Feilnbach. Im Jahr der Stilllegung wurde Feilnbach zum Bad erhoben. Teile der ehemaligen Bahntrasse sind heute Radweg.\n\nAm früheren Bahnhofsort steckt eine alte Fahrkarte zwischen zwei verwitterten Schwellen.</pre>`;
    q.appendChild(btn(g.flags.bahnhofFound?"Nichts mehr zu finden":"Zwischen den Schwellen suchen",findFahrkarte,g.flags.bahnhofFound));
    return;
  }

  if(g.location==="jenbach"){
    if(g.flags.jenbachWon&&g.water.oster.stage==="solved"){
      const f=g.water.flood;
      const outcome={treibholz:"Die Einsatzkräfte haben die Brücke freigehalten; der Bach fließt wieder ab.",rueckhalt:"Auf der vorgesehenen Wiese wurde Wasser zurückgehalten; die Häuser bleiben trocken.",hausschutz:"Die Eingänge sind gesichert; das Wasser zieht ohne Schaden vorbei."};
      q.innerHTML=`<pre>JENBACH · REGEN ÜBER DEM TAL\n\n${f.stage==="solved"?"Die Pegelmarke ist wieder gut zu sehen.":"Nach starkem Regen trägt der Jenbach Treibholz. Die Pegelmarke an der Brücke verschwindet fast im Wasser."} Unterhalb stehen Wohnhäuser.\n\n${f.stage==="new"?"Prüfe die Lage, bevor du entscheidest.":f.stage==="observed"?"Die Häuser sind gefährdet. Warnung hat Vorrang: Geh zur Siedlung und sprich mit den Menschen oder der Gemeinde.":f.stage==="warned"?`Die Menschen wurden ${f.warning==="gemeinde"?"durch die Gemeinde":"von Tür zu Tür"} gewarnt. Jetzt können Einsatzkräfte die Häuser schützen.`:outcome[f.solution]||"Die Wohnhäuser blieben trocken."}</pre>`;
      if(f.stage==="new")q.appendChild(btn("Pegel und Brücke beobachten",inspectRain));
      if(f.stage==="observed")q.appendChild(btn("Zu den Wohnhäusern gehen",()=>travel("siedlung")));
      if(f.stage==="warned"){
        q.appendChild(btn("Einsatzkräfte am Treibholz unterstützen (30 Äpfel)",()=>solveFlood("treibholz"),()=>g.apples<30));
        q.appendChild(btn("Rückhaltefläche aktivieren (20 Äpfel, 15 Kerne)",()=>solveFlood("rueckhalt"),()=>g.apples<20||g.seeds<15));
        q.appendChild(btn("Hausschutz organisieren (65 Äpfel)",()=>solveFlood("hausschutz"),()=>g.apples<65));
      }return;
    }
    if(g.flags.jenbachWon) q.innerHTML=`<pre>JENBACHPARADIES\n\nDer Bach rauscht.\nDie Ratten sind weg.\nEin Weg führt weiter ins untere Jenbachtal.\n\nDu findest es beunruhigend, wie schnell sich Gewalt als Navigation etabliert hat.</pre>`;
    else {
      q.innerHTML=`<pre>JENBACHPARADIES\n\nEtwas raschelt am Wasser. Es trägt eine Krone.\n\nDu kannst die Ratten bekämpfen oder sie mit 35 Äpfeln vom Weg locken.</pre>`;
      q.appendChild(btn("Bachrattenkönig bekämpfen",()=>{startCombat("bachratte");render()}));
      q.appendChild(btn("Ratten mit 35 Äpfeln weglocken",resolveRatPeacefully,()=>g.apples<35));
    }
    return;
  }

  if(g.location==="siedlung"){
    const f=g.water.flood;
    q.innerHTML=`<pre>WOHNHÄUSER AM JENBACH\n\n${f.stage==="solved"?"Vor den Häusern ist das Wasser zurückgegangen. Die Bewohner sind wieder da.":"Im Erdgeschoss brennt noch Licht. Die Nachbarn haben den steigenden Bach gesehen, doch nicht alle wissen, ob sie bleiben können."}\n\n${f.stage==="observed"?"Du kannst von Tür zu Tür gehen oder die Einsatzkräfte für eine koordinierte Warnung einschalten.":f.stage==="warned"?`Die gefährdeten Bewohner wurden ${f.warning==="gemeinde"?"durch Gemeinde und Einsatzkräfte":"mit den Nachbarn von Tür zu Tür"} gewarnt. Am Jenbach muss nun der Abfluss gesichert werden.`:`Dank ${f.solution==="treibholz"?"freier Brücke":f.solution==="rueckhalt"?"Rückhalt auf der Wiese":"gesicherter Eingänge"} blieben die Häuser trocken. Beim nächsten Regen achten alle gemeinsam auf amtliche Warnungen.`}</pre>`;
    if(f.stage==="observed"){
      q.appendChild(btn("Mit Nachbarn von Tür zu Tür warnen",()=>warnHomes("nachbarn")));
      q.appendChild(btn("Gemeinde und Einsatzkräfte informieren",()=>warnHomes("gemeinde")));
    }
    if(f.stage==="warned")q.appendChild(btn("Zurück zur Jenbachbrücke",()=>travel("jenbach")));
    return;
  }

  if(g.location==="wall"){
    if(!g.flags.wallPassed){
      q.innerHTML=`<pre>UNTERES JENBACHTAL\n\n############################################\n############################################\n############################################\n\nEine Mauer versperrt den Weg.\nZwischen ihren Steinen wachsen zwei kleine Apfelbäume. Jemand hat eine Kreidelinie gezogen, aber vor einer Tür aufgehört.\n\nDu versuchst, entschlossen auszusehen. Die Mauer bleibt sachlich.</pre>`;
      const d=document.createElement("div");d.className="questbox";
      d.appendChild(btn(has("chalk")?"Eine Tür auf die Mauer zeichnen":"Mauer schlagen",()=>has("chalk")?drawDoor():say("Die Mauer nimmt 0 Schaden. Deine Hand nimmt die Kritik persönlich.","bad")));
      if(has("rustySword")&&!g.flags.wallMarker)d.appendChild(btn("Mit Obstmesser Wegweiser schnitzen",carveMarker));
      {const apples=g.encounters.bahnhof==="route"?5:20;d.appendChild(btn(`Ortskundige nach einem Umweg fragen (${apples} Äpfel, 10 Kerne)`,bypassWall,()=>g.apples<apples||g.seeds<10))}
      q.appendChild(d);
    } else {
      q.innerHTML=g.flags.wallRoute==="path"?`<pre>UNTERES JENBACHTAL\n\nDer ortskundige Pfad führt um die Mauer herum.\nDie Mauer bleibt stehen und ist damit weiterhin das Problem der Kartografie.</pre>`:`<pre>UNTERES JENBACHTAL\n\nIn der Mauer ist jetzt eine handgezeichnete Tür.\nSie funktioniert.\n\nArchitekten hassen diesen Trick.</pre>`;
    }
    return;
  }

  if(g.location==="tregler"){
    q.innerHTML=`<pre>TREGLER ALM\n\nDu erreichst die Alm.\nDie Aussicht über Bad Feilnbach ist ausgezeichnet.\n\nAuf einem Tisch liegt eine Brotzeit mit einem Zettel:\n\n  »Für denjenigen, der glaubt, Äpfel seien eine Mahlzeit.«</pre>`;
    q.appendChild(btn(g.flags.treglerReward?"Brotzeit bereits gegessen":"Brotzeit nehmen",takeBrotzeit,g.flags.treglerReward));
    q.appendChild(btn("Brotzeit teilen und Most mitnehmen",packBrotzeit,g.flags.treglerReward));
    return;
  }

  if(g.location==="wirtsalm"){
    if(g.flags.wirtsalmWon) q.innerHTML=`<pre>WIRTSALM / OBERES JENBACHTAL\n\nRuhe. Berge. Luft.\nKeine Schmalznudel bewegt sich selbstständig.\n\nEin guter Tag.</pre>`;
    else {
      q.innerHTML=`<pre>WIRTSALM / OBERES JENBACHTAL\n\nVor dir bebt etwas Rundes. Es riecht nach Fettgebäck und Zorn.\n\nDu kannst kämpfen oder ihn mit einer früheren Tregler Brotzeit und 45 Äpfeln beruhigen.</pre>`;
      q.appendChild(btn("Schmalznudel-Golem bekämpfen",()=>{startCombat("golem");render()}));
      q.appendChild(btn("Golem mit Brotzeit ablenken (45 Äpfel)",resolveGolemPeacefully,()=>!g.flags.treglerReward||g.apples<45));
    }
    return;
  }

  if(g.location==="markt"){
    q.innerHTML="<pre>APFELMARKT AM RATHAUSPLATZ\n\nZwischen den alten Apfelsorten zeigt dir die Händlerin eine lose Seite aus der Marktchronik. Der Apfelmarkt begann 1992; diese Seite blickt viel weiter zurück.\n\n1992 steht ordentlich am Rand. Darunter: FULINPAH, 980.\n\nDu kannst die Chronik kaufen oder beim Sortieren der Kerne mithelfen.</pre>";
    q.appendChild(btn("Chronik erwerben (120 Äpfel)",collectLedger,()=>g.flags.marketLedger||g.apples<120));
    {const cost=g.chronicle.solved.includes("apfel1992")?15:35;q.appendChild(btn(`Beim Sortieren helfen (${cost} Kerne)`,borrowLedger,()=>g.flags.marketLedger||g.seeds<cost))}return;
  }
  if(g.location==="wiechs"){
    q.innerHTML="<pre>STREUOBSTWIESEN BEI WIECHS\n\nDie Bäume tragen viele Sorten. Einer hat seinen Namen verloren.\n\nSortiere 20 Apfelkerne nach der Chronik oder vergleiche eine eigene Ernte der alten Sorte. Der Baum wird sich vielleicht erinnern.</pre>";
    q.appendChild(btn("Kerne sortieren (20)",learnVariety,()=>!g.flags.marketLedger||g.flags.orchardSong||g.seeds<20));
    q.appendChild(btn("Eigene alte Ernte vergleichen",learnVarietyFromTree,!g.flags.marketLedger||g.flags.orchardSong||!g.flags.oldHarvest));return;
  }
  if(g.location==="au"){
    q.innerHTML="<pre>AU / TAXAKAPELLE\n\nDie Taxakapelle geht auf ein Gelübde Balthasar Fuetterers von 1647 zurück. Der Name Taxa kommt vom bairischen „Daxn” für Fichten- und Tannenzweige, die früher um das Kirchlein standen.\n\nDein Versprechen ist bescheidener: Gib eine Ernte weiter, statt alles selbst zu essen.\n\nDie Kapelle bleibt still. Das ist ihr gutes Recht.</pre>";
    q.appendChild(btn("50 Äpfel für andere zurücklegen",keepVow,()=>g.flags.vowKept||g.apples<50));
    q.appendChild(btn("20 Kerne für neue Bäume stiften",keepSeedVow,()=>g.flags.vowKept||g.seeds<20));return;
  }
  if(g.location==="litzldorf"){
    q.innerHTML="<pre>LITZLDORFER WASSERFALL\n\nDas Wasser fällt schnell. Das Rindenzeichen erzählt aber von einem langsamen Bach.\n\nHör auf die Pausen zwischen den Tropfen. Dafür brauchst du ein gehaltenes Versprechen und den Namen einer alten Sorte.</pre>";
    q.appendChild(btn("Auf die Pausen hören",hearSpring,g.flags.springHeard||!g.flags.vowKept||!g.flags.orchardSong));
    q.appendChild(btn("Chronik und Wasserlauf vergleichen",readSpring,g.flags.springHeard||!g.flags.vowKept||!g.flags.orchardSong||!has("ledger")));return;
  }
  if(g.location==="farrenpoint"){
    q.innerHTML="<pre>FARRENPOINT\n\nUnter dir liegen die Orte deiner Reise. Vor dir liegt der Wendelstein.\n\nZwischen den Steinen steckt ein Wanderstock. Keine schlechte Waffe gegen einen Feind, der Äpfel für Inventar hält.</pre>";
    q.appendChild(btn("Wanderstock nehmen",takeStick,has("hikingStick")));
    q.appendChild(btn("Wanderstock aus Fallholz schnitzen (10 Kerne)",craftStick,()=>has("hikingStick")||!has("rustySword")||g.seeds<10));return;
  }
  if(g.location==="wendelstein"){
    q.innerHTML="<pre>WENDELSTEIN\n\nAm Wendelstein tauchen die Männlein zwischen zwei Steinen auf. Mit Gelübde, Klang der Quelle und Moorlicht hören sie dir zu. Ohne Moorlicht kannst du ihnen stattdessen eine Ernte anbieten.\n\nEines fragt: »Hast du etwas geteilt?« Das andere: »Hast du etwas stehen lassen?«</pre>";
    q.appendChild(btn("Die Männlein um Hilfe bitten",meetMannl,g.flags.mannlGift||!g.flags.moorLight||!g.flags.springHeard||!g.flags.vowKept));
    q.appendChild(btn("Mit den Männlein 90 Äpfel teilen",tradeMannl,()=>g.flags.mannlGift||!g.flags.springHeard||!g.flags.vowKept||g.apples<90));return;
  }
  if(g.location==="fulinpach"){
    q.innerHTML=g.flags.finalWon ? "<pre>FULINPACH · DER LANGSAME BACH\n\nAuf einer Rindenlasche steht Fulinpah, eine frühe Schreibweise des Ortsnamens um 980. Später begegnet auch Fulinpach. Der alte Name bezeichnet einen langsam fließenden Bach. Unter der Apfelkiste wird aus dem Namen eine Stimme.\n\nNeben dem Pflücker liegen deine sechs Spuren. Ein Name, der blieb. Holz, das das Moor bewahrte. Wasser, das seinen Weg suchte. Ein Baum, ein Versprechen und Stimmen vom Berg.\n\nDie Stimme fragt: Was soll mit der Ernte geschehen?</pre>" : "<pre>FULINPACH · DER LANGSAME BACH\n\nUnter den Wurzeln stapeln sich Körbe voller Äpfel. Auf jedem steht ein Sortenname; manche sind so alt, dass die Tinte kaum noch trägt.\n\nDer letzte Pflücker hat sie gesammelt, damit niemand einen Namen vergisst. Jetzt bewacht er die Ernte und lässt niemanden mehr hinein. Dein Wegbuch liegt offen in deiner Hand.</pre>";
    if(g.flags.finalWon && !g.flags.finalChoice){
      q.appendChild(btn("Die Ernte teilen",()=>decideFate("share")));
      q.appendChild(btn("Den Bach in Ruhe lassen",()=>decideFate("rest")));
    }else if(g.flags.finalChoice){
      const p=document.createElement("p");p.className="good";p.textContent=g.flags.finalChoice==="share"?"ENDE: DIE GETEILTE ERNTE":"ENDE: DER BACH BLEIBT";q.appendChild(p);
    }else {
    if(loreCount(2)<3||chronicleCount(2)<2){const p=document.createElement("p");p.className="quest-hint";p.textContent=`Zum Abschluss fehlen ${Math.max(0,3-loreCount(2))} Wegbuch-Spuren und ${Math.max(0,2-chronicleCount(2))} Seiten der Ortschronik. Die Chronik öffnest du im Questbuch.`;q.appendChild(p)}
    q.appendChild(btn("Dem Pflücker entgegentreten",enterFinal,loreCount(2)<3||chronicleCount(2)<2));
    q.appendChild(btn("Mit dem Pflücker verhandeln (120 Äpfel, 8 Rindenzeichen)",bargainPicker,()=>loreCount(2)<3||chronicleCount(2)<2||g.apples<120||g.bark<8));
    }
    return;
  }

  q.innerHTML="<pre>Keine aktive Quest.\n\nEntweder Frieden oder schlechtes Projektmanagement.</pre>";
}

function renderBox(){
  const b=$("box"); if(!g.unlocks.box){b.innerHTML="";return}
  b.innerHTML="";
  const art=document.createElement("pre");art.className="scene-art";art.setAttribute("role","img");
  showScene(art,g.flags.boxOpened?"boxOpen":"boxClosed","Geheimnis in der Apfelkiste am Rathausplatz");b.appendChild(art);
  if(!g.flags.boxOpened)boxHasAnimated=false;
  else if(g.currentTab==="box"&&!boxHasAnimated){art.className="scene-art box-opening";boxHasAnimated=true;}
  const description=document.createElement("pre");description.textContent=`DIE APFELKISTE\n\nRindenzeichen am Rand: ${g.bark}/8\nStandort: Rathausplatz, Bad Feilnbach\n`;b.appendChild(description);
  const p=document.createElement("p");p.textContent="Flüstere der Kiste etwas zu. Es heißt, Höflichkeit hilft. Weitere Rindenzeichen finden Krähen und merkwürdige Händler.";b.appendChild(p);
  const inp=document.createElement("input");inp.type="text";inp.placeholder="flüstern...";b.appendChild(inp);b.appendChild(document.createTextNode(" "));
  b.appendChild(btn("Flüstern",()=>{whisper(inp.value);inp.value=""}));
  if(g.flags.boxOpened){const s=document.createElement("pre");s.className="secret";s.textContent="\nDie innere Lasche ist offen.\nEs gibt keinen Boden.\nNur eine Treppe nach unten.";b.appendChild(s)}
  if(g.flags.wirtsalmWon && !g.flags.boxOpened){
    const clue=document.createElement("p");clue.className="secret";clue.textContent="Auf der inneren Lasche stehen zwei Wörter: »Öffne dich«. Ob die Kiste zuhört?";b.appendChild(clue);
  }
  if(g.flags.wirtsalmWon && g.flags.boxOpened && !g.flags.ending){
    const p=document.createElement("p");p.textContent=`Für die Treppe brauchst du acht Rindenzeichen (${Math.floor(g.bark)}/8), drei Wegbuch-Spuren (${loreCount(1)}/3) aus Name, Moor und Wasserlauf sowie zwei Seiten der Ortschronik (${chronicleCount(1)}/2) im Questbuch.`;b.appendChild(p);
    b.appendChild(btn("Hinabsteigen",()=>{finishSlice();if(g.flags.ending)g.currentTab="main";render()},()=>g.bark<8||loreCount(1)<3||chronicleCount(1)<2));
  }
  if(g.flags.ending){const s=document.createElement("p");s.textContent="Auf der zweiten Karte wartet ein Weg über Apfelmarkt, Au, Wiechs, Litzldorf und den Wendelstein. Das Moorlicht zeigt dir später die letzte Abzweigung.";b.appendChild(s);}
}

function renderSave(){
  const s=$("save");
  s.innerHTML="<pre>AUTOSAVE: AKTIV\nDer Spielstand liegt in diesem Browser. Mit einer JSON-Datei kannst du ihn sichern und auf einem anderen Gerät wieder laden.\n</pre>";
  s.appendChild(btn("Jetzt speichern",()=>{saveGame();say("Spiel gespeichert. Zukunfts-Du trägt ab jetzt die Verantwortung.","good");render()}));
  s.appendChild(btn("Spielstand als JSON herunterladen",exportSaveJson));
  const fileLabel=document.createElement("label");fileLabel.htmlFor="importJson";fileLabel.textContent="JSON-Spielstand auswählen: ";
  fileLabel.style.display="block";fileLabel.style.marginTop="14px";s.appendChild(fileLabel);
  const filePicker=document.createElement("input");filePicker.type="file";filePicker.id="importJson";filePicker.accept=".json,application/json";
  s.appendChild(filePicker);s.appendChild(document.createElement("br"));
  const status=document.createElement("p");status.setAttribute("role","status");status.className="small";
  status.textContent="Der Import ersetzt den aktuellen Spielstand in diesem Browser.";
  s.appendChild(btn("JSON-Datei importieren",async()=>{
    try{await importSaveJson(filePicker.files?.[0]);}
    catch(e){status.className="bad";status.textContent=e instanceof SyntaxError?"Die Datei enthält kein gültiges JSON.":e.message||"Der Spielstand konnte nicht geladen werden.";}
  }));s.appendChild(status);
  const legacy=document.createElement("details");legacy.className="pouch";
  const summary=document.createElement("summary");summary.textContent="Früheren Text-Spielstand übernehmen";legacy.appendChild(summary);
  const out=document.createElement("textarea");out.id="saveText";out.placeholder="Hier einen alten Exportcode einfügen.";legacy.appendChild(out);
  legacy.appendChild(btn("Alten Textcode importieren",()=>{
    try{const raw=out.value.trim();const data=raw.startsWith("{")?JSON.parse(raw):JSON.parse(decodeURIComponent(escape(atob(raw))));importSaveData(data)}
    catch(e){status.className="bad";status.textContent="Dieser Textcode ist kein gültiger Spielstand.";}
  }));
  s.appendChild(legacy);
  s.appendChild(btn("Alles zurücksetzen",()=>{if(confirm("Wirklich den kompletten Spielstand löschen? Die Äpfel werden sich nicht an dich erinnern.")){g=fresh();saveGame();render()}},false,"danger"));
  const st=document.createElement("pre");st.textContent=`\nTode: ${g.stats.deaths}\nBesiegte Gegner: ${g.stats.enemies}\nGefundene Geheimnisse: ${g.stats.secrets}\n`;s.appendChild(st);

}

function escapeHtml(str){return String(str).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}

function keepButtonFocus(update){
  const active=document.activeElement;
  const root=active?.tagName==="BUTTON"?active.closest("#tabs, #topActions, .panel.active"):null;
  if(!root){update();return}
  const label=active.textContent;
  const index=[...root.querySelectorAll("button")].filter(button=>button.textContent===label).indexOf(active);
  update();
  if(index<0||root.classList.contains("panel")&&!root.classList.contains("active"))return;
  const replacement=[...root.querySelectorAll("button")].filter(button=>button.textContent===label)[index];
  if(replacement&&!replacement.disabled)replacement.focus({preventScroll:true});
}
function render(){
  keepButtonFocus(()=>{
    updateUnlocks(); recomputeStats(); renderResources();renderTopActions();renderTabs();renderPanels();renderNotice();renderLog();
  });
}

