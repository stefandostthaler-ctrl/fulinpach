# quest-status Specification

## Purpose
Defines what the scene hint ("Nächster Schritt" / "Entschieden") and the arrival message show
at a place where more than one quest takes place.

## Requirements

### Requirement: Scene hint follows the newest quest at a place

At a place with several quests, the scene hint SHALL show the first unfinished quest that
belongs to that place. If all are finished, it SHALL show the most recently added finished
quest, not the oldest. A quest MAY belong to more than one place while it is running.

#### Scenario: Flood observed, player at the bridge
- **WHEN** the flood has been observed but the houses are not warned yet, and the player is at the Jenbach bridge
- **THEN** the hint tells the player to warn the houses first
- **AND** it does not mention how the rats were dealt with

#### Scenario: Flood solved
- **WHEN** the flood quest is solved and the player is at the Jenbach bridge
- **THEN** the hint says the houses stayed dry and names the chosen protection
- **AND** it does not mention how the rats were dealt with

#### Scenario: Before the flood
- **WHEN** the rats are gone and the Osterbach is not solved yet
- **THEN** the hint at the bridge still shows the rat decision

### Requirement: Separate journal entries stay separate

The quest journal SHALL keep the rat decision and the flood decision as two entries, each with
its own recorded decision.

#### Scenario: Journal after both quests
- **WHEN** both the rat quest and the flood quest are finished
- **THEN** the journal lists "Die Brücke am Jenbach" with the rat decision and "Steigendes Wasser am Jenbach" with warning and protection

### Requirement: Arrival message matches the current state

The message shown on arriving at the Jenbach bridge SHALL describe the flood state once the
flood quest has started, and the flood outcome once it is solved.

#### Scenario: Arriving after the flood
- **WHEN** the player travels to the bridge after solving the flood
- **THEN** the arrival message talks about the bridge and the houses, not about the rats
