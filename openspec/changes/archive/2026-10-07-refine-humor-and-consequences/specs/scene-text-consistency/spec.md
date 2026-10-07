# Spec Delta

## Purpose

Defines what scene texts, journal steps and the merchant may say in each quest state, so that
no text describes a finished quest as open and each place keeps its own voice.

## ADDED Requirements

### Requirement: Finished quests read as finished

A scene text, arrival line, hotspot label or journal step SHALL NOT describe a quest as open,
offer its options, or name its enemy as present once the quest is finished.

#### Scenario: Wall after passing
- **WHEN** the wall has been passed by any route
- **THEN** the wall scene offers no door drawing or detour buttons and describes the passage

#### Scenario: Journal step after completion
- **WHEN** any journal entry is marked done
- **THEN** its step text is in the past tense or states the outcome

### Requirement: Merchant reacts to the player's state

The Händler SHALL show one line above the offer that depends on the player's state (first
visit, items bought, "NICHT KAUFEN" bought, ending reached, Goldener Apfel owned). The line
SHALL change when the state changes.

#### Scenario: After "NICHT KAUFEN"
- **WHEN** the player bought the item labelled NICHT KAUFEN and opens the shop
- **THEN** the merchant line refers to it

### Requirement: Each place has a distinct voice

Each place's scene text SHALL follow its voice note from the design, and no two places SHALL
share a scene paragraph.

#### Scenario: Duplicate scan
- **WHEN** all scene texts are compared
- **THEN** no paragraph appears at two places

### Requirement: No meta notices about what is real

Game texts SHALL NOT tell the player which elements are real or invented. The chronicle keeps
its source lines.

#### Scenario: Text scan
- **WHEN** all texts in story.js, game.js and ui.js are scanned for "real", "erfunden", "fiktiv", "im Spiel"
- **THEN** no in-game message contains such a notice
