# story-consequences Specification

## Purpose
Defines which player decisions the game remembers and how each one shows up again later in
story text, costs or rewards.

## Requirements

### Requirement: Every major decision has a later response

Each water-quest decision (Osterbach solution, flood warning, flood protection), each route
decision (rats, wall, Golem) and each Wegbuch choice SHALL cause at least one later response
that the player can notice: a changed text, a changed cost, or a one-time reward.

#### Scenario: Osterbach solved via the Fachstelle
- **WHEN** the player chose the Fachstelle at the Biberburg and later reaches the flood's protection step
- **THEN** the Rückhalt option costs fewer seeds than otherwise and its text names the Fachstelle

#### Scenario: Rats lured away
- **WHEN** the player lured the rats away and later visits the Apfelmarkt for the first time
- **THEN** the rats appear in the Markt text and a small amount of apples is taken once

#### Scenario: Wegbuch choice on the moor
- **WHEN** the player chose to leave the moor wood in place
- **THEN** the Irrlicht follows without a lantern

### Requirement: Responses never block progress

A consequence MAY change a cost or a text but SHALL NOT make any quest unsolvable or remove an
existing route.

#### Scenario: Discount only
- **WHEN** any decision was taken
- **THEN** every quest still has at least the routes it had before, at equal or lower cost
