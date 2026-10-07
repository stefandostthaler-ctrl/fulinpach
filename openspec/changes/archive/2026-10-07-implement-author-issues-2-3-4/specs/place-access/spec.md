# Spec Delta

## Purpose

Defines which travel places the player may enter, which story conditions and items unlock
them, and how the game reacts when the player tries to reach a locked place.

## ADDED Requirements

### Requirement: Mountain places require hiking boots

Tregler Alm, Wirtsalm, Farrenpoint and Wendelstein SHALL be locked while the "Jenbachtaler
Wanderstiefel" are not in the player's inventory. This condition applies in addition to each
place's existing story condition. The map, the place list under the map and the journal SHALL
treat such a place as locked, and travelling there SHALL be refused.

#### Scenario: Boots missing, story condition met
- **WHEN** the Bachrattenkönig has been dealt with but the player does not own the Wanderstiefel
- **THEN** the Tregler Alm marker is shown as locked
- **AND** choosing the Tregler Alm from the place list or the journal does not travel there

#### Scenario: Boots bought
- **WHEN** the player buys the Jenbachtaler Wanderstiefel while the Tregler Alm's story condition is met
- **THEN** the Tregler Alm marker becomes available without reloading
- **AND** travelling there works

#### Scenario: Boots owned, story condition missing
- **WHEN** the player owns the Wanderstiefel but has not passed the wall
- **THEN** the Wirtsalm stays locked

### Requirement: Owning the boots is enough

The gate SHALL check that the Wanderstiefel are in the inventory, not that they are equipped.
Items can never leave the inventory, so a player who reached the mountains SHALL never be
locked in or out by changing equipment.

#### Scenario: Boots unequipped at the Wirtsalm
- **WHEN** the player stands at the Wirtsalm and moves the boots out of the FÜSSE slot
- **THEN** the player can still travel to the Tregler Alm and back to the Rathausplatz

### Requirement: No route bypasses the gate

Every way of reaching a place (map marker, place list, journal entry, action buttons inside a
scene, story shortcuts) SHALL go through the same access check, so a locked place can never be
entered.

#### Scenario: Scene button to a locked place
- **WHEN** a scene offers a button that leads to a place the player may not enter yet
- **THEN** pressing it does not change the player's location and shows the reason

### Requirement: Hint when the boots are missing

When the player tries to travel to one of the four mountain places and the only missing
condition is the Wanderstiefel, the game SHALL show a message that names the Wanderstiefel
and the Händler as their source.

#### Scenario: Journal entry for a mountain place
- **WHEN** the player follows the journal entry "Die Wendelstein-Männlein" without owning the boots
- **THEN** the map tab opens
- **AND** a message says the way needs the Jenbachtaler Wanderstiefel from the Händler

### Requirement: Saves that already reached the mountains keep access

A save in which the player has already visited the Tregler Alm, Wirtsalm, Farrenpoint or
Wendelstein SHALL receive the Jenbachtaler Wanderstiefel on load, so the new gate never locks
a player out of places they already reached.

#### Scenario: Old save with Wirtsalm visited
- **WHEN** a save from an earlier version with the Wirtsalm already visited is loaded
- **THEN** the Wanderstiefel are in the inventory
- **AND** the mountain places stay reachable
