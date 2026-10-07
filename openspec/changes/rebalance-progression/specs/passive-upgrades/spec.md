# Spec Delta

## Purpose

Defines the passive upgrades of the Streuobstwiese: what unlocks each one, what it costs, and
how it raises apples and seeds per second.

## ADDED Requirements

### Requirement: Upgrade list in the Streuobstwiese

The Streuobstwiese tab SHALL show a list of passive upgrades below the plots. Each upgrade
SHALL be in one of three states: locked (shows what unlocks it), available (shows cost and a
buy button) or bought (shows its bonus). Buying SHALL require the cost and SHALL happen at
most once per upgrade.

#### Scenario: Locked upgrade
- **WHEN** the Osterbach is not solved
- **THEN** "Holzrinnen zur Wiese" is listed as locked with the hint that the Osterbach must flow again

#### Scenario: Buying an upgrade
- **WHEN** the Osterbach is solved and the player has 80 apples and 10 seeds and buys "Holzrinnen zur Wiese"
- **THEN** the cost is deducted, the upgrade is marked bought and the apple rate rises by 1 per second

### Requirement: Rates are the sum of all sources

Apples per second SHALL be the base rate plus every bought upgrade's apple bonus plus item
bonuses. Seeds per second SHALL be the base seed rate plus every bought upgrade's seed bonus.
The resource row and offline crediting SHALL use these sums.

#### Scenario: Several sources
- **WHEN** the player has the farm milestone, the Goldener Apfel and the bought upgrades Holzrinnen and Apfelfuhre
- **THEN** the resource row shows +5.5/s apples (1 + 1 + 1 + 1.5 + 1)

### Requirement: Story-bound unlocks

Each upgrade SHALL unlock from a story state: Krähenpost from the crow's chalk secret,
Holzrinnen from the solved Osterbach, Apfelfuhre from the settled rats (either route),
Almwirtschaft from the settled Golem (either route), Sortengarten from the found variety,
Marktstand from the read Marktchronik.

#### Scenario: Either route counts
- **WHEN** the player lured the rats away instead of fighting
- **THEN** "Apfelfuhre über die Brücke" is available

### Requirement: Existing saves keep their rates

Loading a save from an earlier version SHALL keep its apple and seed rates and SHALL mark no
upgrade as bought.

#### Scenario: Old save with farm milestone
- **WHEN** a version 12 save with apple rate 2 is loaded
- **THEN** the base rate stays 2 and all upgrades are unbought
