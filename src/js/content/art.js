"use strict";
/* =====================================================================
   GRAFIKEN (ASCII-Zeichnungen und Ortsnamen)
   Hier kannst du die Bilder des Spiels ändern. Jede Zeichnung ist ein
   Text zwischen den Backtick-Zeichen (`...`) oder Anführungszeichen.
   Achtung: Ein Backslash "\" muss in Texten mit Anführungszeichen
   doppelt geschrieben werden ("\\"), in Backtick-Texten (String.raw)
   nicht.
   ===================================================================== */

// Schauplätze. Der Schlüssel (z. B. "kirche") wird im Code benutzt.
const SCENES = {
  main: "                 .-------------------------.\n                 |      F U L I N P A C H  |\n                 '-------------------------'\n\n                         ,--./,-.\n                       / #      \\\n                      |          |\n                       \\        /\n                        /)    (\\\n                 .-----'  '--'  '-----.\n                 |                      |\n                 |   EINE APFELKISTE   |\n                 |______________________|\n                    ||              ||\n            ~ ~ ~ ~ || ~ ~ ~ ~ ~ ~ || ~ ~ ~ ~ ~",
  rathaus: "                           .-.\n                           |o|\n                      .----| |----.\n                      |  _  _  _  |\n                      | |_|[ ]|_| |\n                  .---|  _  _  _  |---.\n                  | _ | |_|[ ]|_| | _ |\n                  ||_||    / \\    ||_||\n           _______||_||___/___\\___||_||__________\n                /\\                .--------.\n               /  \\               |  (@)   |\n              /_/\\_\\              |  (@)   |\n             _|_||_|_             '--------'\n            /        \\              ||  ||\n            RATHAUSPLATZ       DIE APFELKISTE",
  kirche: "                            +\n                            |\n                           /_\\\n                          /___\\\n                         /  o  \\\n                        /_______\\\n                        |  | |  |\n           _____________|  | |  |____________\n          /    .--.     |  | |  |   .--.     \\\n         /    ( +  )    |  | |  |  (  + )     \\\n        /______(__)_____|__|_|__|___(__)______\\\n        |                                  _   |\n        |      .--.           .--.        ( )  |\n        |      |[]|           |[]|         |   |\n        |______|__|___________|__|_________|___|\n           PFARRKIRCHE HERZ JESU  -  STILLE",
  filze: "           .         .                   .       .\n                 .         *         .\n            ,       .                       .\n           /|\\  /|\\        .          /|\\  /|\\\n            |    |         __          |    |\n        ~~~~|~~~~|~~~~~~__(  )__~~~~~~|~~~~|~~~~\n          ~    ~     ~~   (..  )   ~~    ~     ~\n         . .   .        ~  \\__/  ~      . .   .\n                 ________          ________\n          ______/________\\________/________\\______\n                ||    ||            ||    ||\n             ___||____||____________||____||___\n            /  BOHLENWEG  -  STERNTALER FILZE \\\n           /_____________________________________\\",
  jenbach: "                /\\                           /\\\n               /  \\     .--.                /  \\\n              / || \\   /    \\              / || \\\n             /  ||  \\_/      \\_           /  ||  \\\n           ________________         ________________\n          /_______________/|_______|\\_______________\\\n           |   |    |   |  |       |   |    |   |\n           |___|____|___|__|_______|___|____|___|\n              \\                      /\n           ~~~~\\~~~~~  JENBACH  ~~~/~~~~~~~~~~~~\n          ~~  ~ \\ ~  ~~  ~   ~~  ~ /   ~ ~ ~~  ~\n          ~  ~  ~\\    ~~     ~~   /~~    ~ ~  ~\n                   /\\_/\\\n                  ( o o )  ?\n                   > ^ <",
  osterbach: String.raw`            .------------------------.
            | WASSERSPIELPLATZ       |
            '------------------------'
              __          __
             /  \  o   o /  \      HOLZRINNEN
            |    |  \_/  |    |     _______
            |____|       |____|    /_____ /|
               |    ___     |     /_____ / |
             __|___/   \____|____/_____ /__|
           ~ ~ ~                . . . . .
                 KEIN WASSER`,
  osterFachstelle: String.raw`       .------------------------.
       | WASSERSPIELPLATZ       |
       '------------------------'
               .--.   FACHSTELLE
             __|  |__  __
            |  HOLZRINNEN  |~~~
            |______________|~~~~
             ~~~~~   ~~~~~~
             SANFT GEREGELT`,
  osterVersorgung: String.raw`      .------------------------.
       | WASSERSPIELPLATZ       |
       '------------------------'
                 ZULEITUNG
              ____|____
             /  HOLZRINNEN \~~~
            /______________ \~~~~
              ~~~     ~~~~~~
               WASSER SPIELT`,
  osterGemeinschaft: String.raw`    .------------------------.
       | WASSERSPIELPLATZ       |
       '------------------------'
          o    o   NACHBARN   o
           \__/  ____  \__/
            |   |    |  |  ~~~
           / \__|____|_/ \ ~~~~
             ~~~~~~~~~~~~~~
              GEMEINSAM`,
  biberdamm: String.raw`             /\          /\
            /  \________/  \      OSTERBACH
           /                \
          |   /////////      |     .-"-.
          |  // ZWEIGE //    |    / o o \
          | ////_____////    |   |   V   |
          |__________________|    \_===_/
               ~~~~~  ~~~~~       /| |\
            ~~~~~       ~~~~~     /_| |_\
              EIN DAMM, EIN ZUHAUSE`,
  jenbachRain: String.raw`            .  .   .  .  .  .  .
             \ | / \ | / \ | /
           __\|/___\|/___\|/____
          |    PEGEL AM JENBACH  |
          |______________________|
          ~~~ ~~~~~~ ~~~~~~~~ ~~~~~~~
          ~~~~  ____ BRUECKE ____ ~~~
          ~~~~~|    |______|    |~~~~~
                 WASSER STEIGT`,
  jenbachSafe: String.raw`                  .   .   .
               ________________
              |  JENBACH  [X]  |
              |_________________|
              ~~~~~~ ~~~~~~ ~~~~~~
                 /\      /\
                /  \    /  \
                HAEUSER SIND SICHER`,
  jenbachClear: String.raw`        . . .       . . .
           ____________________
          |  BRUECKE AM BACH  |
          |___________________|
           ~~~~~~  ~~~~~~~~
            ABFLUSS FREI
           /\          /\
         HAEUSER BLEIBEN TROCKEN`,
  jenbachRetain: String.raw`       . . .       . . .
           /\             /\
          /  \  RUECKHALT /  \
          ~~~~\~~~~~~~~~~/~~~~
          /        WIESE      \
         /_____________________\
           HAEUSER BLEIBEN TROCKEN`,
  jenbachProtect: String.raw`        . . .        . . .
           /\     /\      /\
          /  \   /  \    /  \
          |[]|   |[]|    |[]|
          |__|___|__|____|__|
          [   ZUGAENGE SICHER ]
          ~~~~~~~~~~~~~~~~~~~~~
           HAEUSER BLEIBEN TROCKEN`,
  siedlungSafe: String.raw`         .-.    .-.    .-.
           /   \  /   \  /   \
          /_____\/_____\/_____\
          | [] || [] || [] |
          |  _ ||  _ ||  _ |
          |_|_|||_|_|||_|_||
          .  .  .  .  .  .  .
             ALLE SIND SICHER`,
  wallPath: String.raw`          ################################
          ######## DIE MAUER ########
          ################################
          ######                    ######
          ######    -------->       ######
          ######   /                ######
          ######  /     EIN UMWEEG  ######
                /    .  .  .  .
               /___________________`,
  siedlung: String.raw`             .-.    .-.    .-.
            /   \  /   \  /   \
           /_____\/_____\/_____\
           | [] || [] || [] |
           |  _ ||  _ ||  _ |
           | | ||| | ||| | ||
           |_|_|||_|_|||_|_||
          ~~~~~~~~~~~~~~~~~~~~~~~
             WOHNHAEUSER AM JENBACH`,
  wall: "            ##########################################\n            #   #     #    #   #    #      #    #  #\n            ##########################################\n            #      #    #    #     #  #   #      #  #\n            ##########################################\n            #  #    #      #    #   #      #  #     #\n            ##########################################\n            #    #     #  #    #    #   #     #   #  #\n            ##########################################\n            #   #     #    #   #    #      #    #  #\n            ##########################################\n                     UNTERES JENBACHTAL\n             EINE MAUER, DIE ES NICHT GEBEN SOLLTE",
  wallOpen: "            ##########################################\n            #   #     #    #   #    #      #    #  #\n            ###############.--------.################\n            #      #    #  |        |   #  #      # #\n            ###############|   ?    |################\n            #  #    #      |        |   #      #  # #\n            ###############|        |################\n            #    #     #  #|        | #   #     #   #\n            ###############|        |################\n            #   #     #    #|        |#      #    #  #\n            ###############|________|################\n                     MIT KREIDE GEMALT.\n                    DIE TUER FUNKTIONIERT.",
  tregler: "                         /\\          /\\\n                    /\\  /  \\    /\\  /  \\\n                   /  \\/    \\__/  \\/    \\\n                  /                         \\\n             ____/___________________________\\____\n                .----------------------------.\n               /______________________________\\\n                |  []    []     []    []     |\n                |                           |\n                |_______   TREGLER   _______|\n                       |     ALM     |\n                       |_____________|\n                     _______________\n                    |  BROTZEIT  :) |\n                    '---------------'",
  wirtsalm: "                      /\\    /\\        /\\\n                     /  \\  /  \\  /\\  /  \\\n             /\\     /    \\/    \\/  \\/    \\\n            /  \\___/                      \\__\n                   .---------------------.\n                  /_______________________\\\n                  |   []     WIRTS    [] |\n                  |           ALM         |\n                  |_______.--------.______|\n                          /  .--.  \\\n                         |  ( oo )  |\n                         |   ----   |    !\n                          \\________/\n           OBERES JENBACHTAL - ETWAS RUNDES ATMET",
  markt: "             .--.      .--.      .--.       .--.\n            / @  \\    /  @ \\    / @  \\     /  @ \\\n            \\____/    \\____/    \\____/     \\____/\n           .---------------------------------------.\n           |      FEILNBACHER  APFELMARKT         |\n           '---------------------------------------'\n              /~~~~~~~\\           /~~~~~~~\\\n             /  (@)(@) \\         /  (@)(@) \\\n            /___________\\       /___________\\\n            | ALTE      |       |  MOST     |\n            | SORTEN    |       | UND KERNE |\n            |__|_____|__|       |__|_____|__|\n                []   []             []   []\n             .--------------------------.\n             | CHRONIK: 1992 / 980 ?   |\n             '--------------------------'",
  wiechs: "           .     .                      .       .\n             _(@)_       _(@)_       _(@)_\n            (@)@(@)     (@)@(@)     (@)@(@)\n           (@)(@)(@)   (@)(@)(@)   (@)(@)(@)\n             \\ | /       \\ | /       \\ | /\n              \\|/         \\|/         \\|/\n               |           |           |\n               |           |           |\n           ____|___________|___________|______\n                .---.       .---.      .---.\n               /  ?  \\     / @ @ \\    / @ @ \\\n               \\______/     \\_____/    \\_____/\n              EINE SORTE OHNE NAMEN\n                STREUOBSTWIESEN BEI WIECHS",
  au: "                            +\n                            |\n                         .--+--.\n                        /   |   \\\n                  _____/_________\\_____\n                 /                    /|\n                /____________________/ |\n                |      TAXAKAPELLE   | |\n                |     .--------.     | |\n                |     |   /\\   |     | /\n                |_____|__/__\\__|_____|/\n           _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _\n          ~   ~  A U B A C H  ~  ~   ~  ~\n              ~    ~     ~       ~     ~\n                   AU - EIN GELUEBDE",
  litzldorf: "              .-------------------.\n              |  LITZLDORF        |\n              '-------------------'\n                       ____________\n                 _____/           /|\n             ___/                / |\n            /                   /  |\n           /   ___________     /   |\n          /___/           \\___/    |\n                           ||      |\n                           ||      |\n                          \\||/     |\n                           \\/      |\n                          /\\/\\     |\n                        ~~~~~~~~   |\n                      ~~~~~~~~~~~~ /\n                WASSERFALL - HOER DIE PAUSEN",
  farrenpoint: "                             .\n                            /|\\\n                           / | \\\n                      /\\  /  |  \\      /\\\n             /\\      /  \\/   |   \\    /  \\\n            /  \\  /\\/        |    \\__/    \\\n           /    \\/           |             \\\n          /                  / \\             \\\n         /      .--.       _/   \\_            \\\n        /_______|__|______/_______\\____________\\\n                   |            |\n                   |            |\n            _____ /              \\ _____\n          _/   _/    TAL UND MOOR   \\_   \\_\n         /___ /______________________\\ ___\\\n                     FARRENPOINT",
  wendelstein: "                           /\\    +\n                          /  \\   |\n                         /_[]_\\  |\n                        /|    |\\ |\n                   /\\  /_|____|_\\|  /\\\n                  /  \\/  | [] |  \\ /  \\\n             /\\  /        |____|   \\   \\ /\\\n            /  \\/                   \\   V  \\\n           /        WENDELSTEIN      \\      \\\n          /___________________________\\______\\\n                    __          __\n                   /..\\        /..\\\n                  ( oo )      ( oo )\n                  /|__|\\      /|__|\\\n                   /  \\        /  \\\n            DIE MAENNLEIN HOEREN ZU.",
  fulinpach: "           .--.   _     _       _     _      .--.\n          /    \\_/ \\___/ \\_____/ \\___/ \\____/    \\\n         /       \\      WURZELN IM DUNKELN      /\n        /   .--------- APFELKISTE ---------.   /\n       /    |   (@)       (@)        (@)    |  /\n       \\    |_______________________________|  \\\n        \\      \\       /       \\       /       /\n         \\      \\_____/         \\_____/       /\n          \\                               __/\n           \\___________    _____________/\n                     /    \\\n             ~ ~ ~  /      \\   ~ ~ ~ ~ ~\n           ~  ~    / FULINPACH \\   ~ ~  ~ ~\n              ~   /_____________\\  ~    ~\n                 EIN BACH, DER WARTET",
  shop: "            /-------------------------------\\\n           /      MARKT AM RATHAUSPLATZ      \\\n          /___________________________________\\\n          |      (@)      (@)      (@)        |\n          |       ____________________        |\n          |      /                    \\       |\n          |      |    .--------.      |       |\n          |      |   (  o  o  )       |       |\n          |      |    \\  __  /        |       |\n          |      |    /|    |\\        |       |\n          |      |   / |____| \\       |       |\n          |______|_____/  \\___________|_______|\n          |  KERNE  |  KREIDE  |  NICHT KAUFEN |\n          '------------------------------------'",
  boxClosed: String.raw`                   .----------------------------.
                  /  F U L I N P A H  ?     /|
                 /-------------------------/ |
                |  (@)    (@)     (@)      |  |
                |                         |  |
                |   .-----------------.   |  |
                |   |  EIN BACH RUFT  |   |  |
                |   '-----------------'   | /
                |_________________________|/
                   ||                 ||
                ~~~||~~~~~  ?  ~~~~~~~||~~~`,
  boxOpen: String.raw`                   .----------------------------.
                  /  F U L I N P A H      /|
                 /-------------------------/ |
                |  (@)    (@)     (@)      |  |
                |       .-----------.     |  |
                |       |   \   /   |     |  |
                |       |    \ /    |     |  |
                |       |     V     |     | /
                |_______|     :     |_____|/
                        |    :::    |
                ~~~~~~~~|___:::____|~~~~~~~~`,
  endingShare: String.raw`           (@)     (@)     (@)     (@)
          (@@@)   (@@@)   (@@@)   (@@@)
            |       |       |       |
          __|_______|_______|_______|___
         /  AEPFEL FUER ALLE WIESEN    \
        /_______________________________\
            \   \   \   \   \   \
             \   \   \   \   \   \
          ~ ~ ~ ~ F U L I N P A C H ~ ~ ~ ~
                 DIE GETEILTE ERNTE`,
  endingRest: String.raw`           .              .              .
             /\             /\             /\
            /  \           /  \           /  \
             ||             ||             ||
          ___||_____________||_____________||___
                    .------------.
                    |  DIE KISTE |   . . .
                    '------------'
             ~  ~    ~   ~     ~   ~    ~
          ~ ~ ~ ~ F U L I N P A C H ~ ~ ~ ~
                  DER BACH BLEIBT`,
  bahnhof: String.raw`               .------------------------.
               |  EHEMALIGER BAHNHOF    |
               '------------------------'
                 .  .  .  .  .  .  .
              __________________________
             /   RADWEG AUF DER TRASSE / 
            /__________________________/
               .  .  .  .  .  .  .
                BAD AIBLING - FEILNBACH
                    1897 - 1973`,
};

// Lesbare Namen der Schauplätze (für Vorlesefunktion und Hinweise).
const SCENE_LABELS={
  rathaus:"Rathausplatz mit Apfelkiste", kirche:"Pfarrkirche Herz Jesu",
  filze:"Sterntaler Filze mit Bohlenweg und Moorfrosch", jenbach:"Brücke über dem Jenbach",
  bahnhof:"Ehemaliger Bahnhofsort der Lokalbahn",
  osterbach:"Wasserspielplatz Am Osterbach",osterFachstelle:"Wasser am Spielplatz: kontrollierter Ablauf",osterVersorgung:"Wasser am Spielplatz: neue Zuleitung",osterGemeinschaft:"Wasser am Spielplatz: Hilfe der Nachbarschaft",biberdamm:"Biberburg am Osterbach",jenbachRain:"Jenbach bei starkem Regen",jenbachSafe:"Jenbach nach dem Hochwasser",jenbachClear:"Jenbach: Brücke frei",jenbachRetain:"Jenbach: Rückhalt an der Wiese",jenbachProtect:"Jenbach: gesicherte Wohnhäuser",siedlung:"Wohnhäuser am Jenbach",siedlungSafe:"Wohnhäuser am Jenbach nach der Warnung",
  wall:"Versperrter Weg im Jenbachtal",wallOpen:"Mauer mit gezeichneter Tür",wallPath:"Umweg um die Mauer",
  tregler:"Tregler Alm und Bergpanorama",wirtsalm:"Wirtsalm und Schmalznudel-Golem",
  markt:"Apfelmarkt mit Ständen",wiechs:"Streuobstwiesen bei Wiechs",
  au:"Taxakapelle am Aubach",litzldorf:"Litzldorfer Wasserfall",
  farrenpoint:"Bergpanorama vom Farrenpoint",wendelstein:"Wendelstein mit sagenhaften Männlein",
  fulinpach:"Apfelkiste über dem langsamen Bach",
  endingShare:"Die Äpfel werden auf die Streuobstwiesen verteilt",
  endingRest:"Fulinpach fließt ungestört weiter"
};

// Kleine Bilder der Gegenstände.
const ITEM_ART = {
  wrapper:String.raw`  /~~~\
 /  ?  \
|  ???  |
 \_._._/`,
  spoon:String.raw`   ___
  (   )
   \_/
    ||
    ||
    /'`,
  rustySword:String.raw`      /\
     /##\
    /##/
 --[==]--
    //
   //`,
  ratCrown:String.raw`  /\  /\
 /  \/  \
| o  o  |
|=======|`,
  linenVest:String.raw` /\    /\
|  \__/  |
|  |  |  |
|__|__|__|`,
  pickerGloves:String.raw` |||   |||
(   ) (   )
|   | |   |
 \_/   \_/`,
  hikingBoots:String.raw`|\     |\
| \__  | \__
|____\ |____\
======== ====`,
  chalk:String.raw`    /##/
   /##/
  /##/
 /__/
  \/`,
  tooth:String.raw`  __  __
 /  \/  \
|        |
 \  /\  /
  \/  \/`,
  kurkarte:String.raw`+---------+
| KUR  01 |
|  [ X ]  |
+---------+`,
  hollowApple:String.raw`   /\
  /  \
 (  __  )
 ( |??| )
  \____/`,
  moorfrog:String.raw`  o    o
 (.)__(.)
 /  __  \
(  (__)  )
 \/    \/`,
  brotzeit:String.raw`  .----.
 / BROT \
|  ___  | /\
 \_____/ /__\ `,
  ledger:String.raw`+--------+
| CHRONIK|
| = = =  |
| = = =  |
+--------+`,
  variety:String.raw`   (o)
  /|\
 (o| o)
   |  
  / \ `,
  vow:String.raw`  ______
 / WORT/|
/_____/ |
|  XX | /
|_____|/`,
  spring:String.raw`  ~  ~  ~
 ~  ~  ~ 
  \ | /  
   \|/   
 ~~~~~~~~`,
  lantern:String.raw`   ___
  /___\
  |(*)|
  |___|
   | |`,
  hikingStick:String.raw`   __
  /  \
  |  /
  | /
  |/
  |`,
  mannlgift:String.raw`  .-^-.
 / * * \
|   O   |
 \  _  /
  '---'`,
  seedCollector:String.raw`  o  o
+------+ 
| KERN |
| o oo |
+------+`,
  map:String.raw`+-------+
| /\/\  |
| ~~~ X |
| . . . |
+-------+`,
  insurance:String.raw`  _____
 /  +  \
|  / \  |
 \_____/`,
  doNotBuy:String.raw`  ______
 / X  X \
|  ?  ?  |
| [____] |
+--------+`,
  fahrkarte:String.raw`+-------+
|BAHN   |
| No 07 |
|_ _ _ _|
+-------+`,
  goldenApple:String.raw`    ,
   /|
 .-$$$-.
( $ ST $ )
 '-$$$-'`,
  appleADay:String.raw`  (o)(o)(o)
  (o)980(o)
  (o)(o)(o)
   a day...`
};

// Symbole in der Ressourcenzeile oben.
const RESOURCE_ART={apples:"(o)",seeds:"..:",cider:"[M]",bark:"[R]",hp:"<+>"};

// Gegner im Kampf.
const ENEMY_ART={
  bachratte:String.raw`  /\  /\
 /  \/  \
(  o  o  )
 \  ^^  /
  /====\
 /_/  \_\ `,
  golem:String.raw`  .------.
 /  ()  \\
|  o  o  |
|   __   |
 \  ==== /
 /\____/\ `,
  picker:String.raw`   _____
  /_____\
  | o o |
 /|  -  |\
/_|_____v_\
  /  \ `
};

// Der Wanderer im Kampf.
const HERO_ART=String.raw`   ___
  /___\
  (o o)
 /|===|\
  /   \
 _|   |_`;

// Der Wanderer im Inventar.
const PORTRAIT_ART="  .-.  \n (o o) \n /|_|\\ \n  / \\  \n /   \\ ";

// Die Streuobstwiese (Hintergrund der drei Pflanzplätze).
const FARM_ART=String.raw`+--------------------- FULINPACH / STREUOBSTWIESE --------------------------+
|          .             .                          .                   .    |
|     /\  / \  /\    /\ /\           /\  /\   /\   /\     /\  /\  /\      |
|    /  \/   \/  \  /  V  \    /\    /  \/  \ /  \ /  \   /  \/  \/  \     |
| . . . . . . . . . . . . . . /  \ . . . . . . . . . . . . . . . . . . . . .  |
|       /###\                            /###\                     /###\    |
|      /#####\                          /#####\                   /#####\   |
|         ||                               ||                         ||     |
|    .  . || .  .   .   .   .  .  .  .  .  || .  .  .   .   .  .  .   ||    |
|  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  |
|     .     .     .      .      .     .     .     .     .      .      .      |
|__________________________________________________________________________|`;
