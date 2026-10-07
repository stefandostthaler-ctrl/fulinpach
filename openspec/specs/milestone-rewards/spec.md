# milestone-rewards Specification

## Purpose
Defines the items the player receives for reaching story or stat milestones, when they are
granted, and what they do.

## Requirements

### Requirement: Golden apple for finishing the story

When the player makes the final decision at Fulinpach, with either ending, the game SHALL add
the trinket "Goldener Apfel der Stadt" to the inventory exactly once. The item SHALL have its
own ASCII drawing and a description, and SHALL be equippable in the Talisman slot.

#### Scenario: Ending "Die geteilte Ernte"
- **WHEN** the player chooses to share the harvest
- **THEN** the Goldener Apfel der Stadt appears in the inventory with a message

#### Scenario: Ending "Der Bach bleibt"
- **WHEN** the player chooses to leave the creek alone
- **THEN** the Goldener Apfel der Stadt appears in the inventory with a message

#### Scenario: Save that already finished the story
- **WHEN** a save with a final decision but without the Goldener Apfel is loaded
- **THEN** the Goldener Apfel der Stadt is added to the inventory

### Requirement: Golden apple keeps the ending's meaning

The Goldener Apfel's description SHALL name the ending the player chose, and the grant message
SHALL differ between the two endings.

#### Scenario: Description after "Die geteilte Ernte"
- **WHEN** the player chose to share the harvest and opens the inventory
- **THEN** the Goldener Apfel's description refers to the shared harvest

#### Scenario: Description after "Der Bach bleibt"
- **WHEN** the player chose to leave the creek alone and opens the inventory
- **THEN** the Goldener Apfel's description refers to the creek that stayed

### Requirement: Golden apple postgame effect

While the Goldener Apfel der Stadt is in the inventory, the apple income SHALL be one apple per
second higher, and the resource row SHALL show the increased rate.

#### Scenario: Rate after the ending
- **WHEN** the player owns the Goldener Apfel and the base rate is 2 per second
- **THEN** the resource row shows +3.0/s and offline time is credited with 3 per second

### Requirement: "An apple a day…" at 980 LP

When the player's maximum LP reach 980 or more, the game SHALL add the trinket
"An apple a day…" to the inventory exactly once and show a message that links the number to
the year 980. The check SHALL run whenever maximum LP change and when a save is loaded.

#### Scenario: Crossing 980 by insurance
- **WHEN** the player's maximum LP go from 975 to 1000 by buying the Abenteuer-Versicherung
- **THEN** the trinket "An apple a day…" is added once
- **AND** buying again does not add a second one

#### Scenario: Save already above 980
- **WHEN** a save with maximum LP of 980 or more and without the trinket is loaded
- **THEN** the trinket is added

### Requirement: "An apple a day…" makes the player invincible

While "An apple a day…" is in the inventory, enemies SHALL deal no damage to the player in
combat. Combat otherwise continues normally and the player can still win or flee.

#### Scenario: Fight with the trinket
- **WHEN** the player owns "An apple a day…" and fights the Schmalznudel-Golem
- **THEN** the player's LP never decrease during the fight
- **AND** the Golem can still be defeated

#### Scenario: Fight without the trinket
- **WHEN** the player does not own the trinket
- **THEN** enemy attacks reduce LP as before
