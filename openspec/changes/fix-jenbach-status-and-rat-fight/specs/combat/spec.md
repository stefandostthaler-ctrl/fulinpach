# Spec Delta

## Purpose

Defines how a fight runs in Fulinpach: automatic attacks, the targeted attack, telegraphed
enemy actions the player can answer, fleeing and defeat.

## ADDED Requirements

### Requirement: Telegraphed heavy attack

An enemy MAY have a heavy attack. Before it lands, the fight view SHALL announce it for a
visible wind-up of at least one second, naming the attack. When it lands it SHALL deal the
enemy's normal damage twice (minus defense, at least 1). The Bachrattenkönig SHALL use a heavy
attack every third attack.

#### Scenario: Wind-up is visible
- **WHEN** the Bachrattenkönig prepares his heavy attack
- **THEN** the fight text says that he winds up for "Sprung von der Brücke"
- **AND** the targeted attack button invites the player to strike now

#### Scenario: Heavy attack lands
- **WHEN** the wind-up ends without a targeted attack
- **THEN** the player loses twice the enemy's damage minus defense, at least 1

### Requirement: Targeted attack interrupts the wind-up

A targeted attack during an enemy's wind-up SHALL cancel the heavy attack, deal the targeted
damage plus a stagger bonus, and delay the enemy's next attack. The targeted attack SHALL be
available at the start of every fight and again after its cooldown.

#### Scenario: Interrupt with the knife
- **WHEN** the player owns and has equipped the rusty fruit knife and strikes during the wind-up
- **THEN** the heavy attack does not land
- **AND** the rat takes the targeted damage plus the stagger bonus
- **AND** the rat's next attack is delayed

#### Scenario: Interrupt without a weapon
- **WHEN** the player has no weapon and strikes during the wind-up
- **THEN** the heavy attack does not land but the damage is the smaller unarmed targeted damage

### Requirement: Fight length and both outcomes unchanged

The Bachrattenkönig's HP SHALL stay at 90. Fleeing to the Rathausplatz SHALL remain possible at
any moment; defeat SHALL still return the player to the Rathausplatz with full LP and count a
death.

#### Scenario: Fleeing during wind-up
- **WHEN** the player flees while the rat winds up
- **THEN** the fight ends, no damage lands and the player stands at the Rathausplatz

#### Scenario: Death by heavy attack
- **WHEN** the heavy attack reduces LP to 0 or less
- **THEN** the death counter rises and the player wakes at the Rathausplatz with full LP

### Requirement: Rat rewards are distinct but equivalent

Both rat solutions SHALL grant the crown and two Rindenzeichen. The fight SHALL additionally
yield 15 apples from the rats' hoard; the peaceful route SHALL additionally yield 6 Kerne.

#### Scenario: Victory
- **WHEN** the Bachrattenkönig is defeated
- **THEN** the player receives crown, 2 Rindenzeichen and 15 apples

#### Scenario: Peaceful route
- **WHEN** the player lures the rats away with 35 apples
- **THEN** the player receives crown, 2 Rindenzeichen and 6 Kerne
