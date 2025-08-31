# Solitaire Web App Development Plan - Svelte Edition

## **Project Overview**
Build a web-based solitaire game using **Svelte** that supports both classic Klondike solitaire and arbitrary variants through a flexible, object-oriented architecture. The app will be built with generalization in mind from day one to support variants like tarot decks.

## **Technology Stack**
- **Frontend**: Svelte (vanilla JavaScript)
- **Styling**: CSS with Svelte's built-in scoped styling
- **State Management**: Svelte stores and reactive statements
- **Build Tool**: Vite (Svelte's default)
- **Deployment**: Static hosting (Netlify, Vercel, or GitHub Pages)

## **Phase 1: Foundation & Core Game Engine (Weeks 1-2)**

### **User Stories:**
- **US-001**: As a developer, I want a completely parameterized card system so that I can support any deck (standard 52, tarot 78, custom decks)
- **US-002**: As a developer, I want abstract game rule interfaces so that I can implement any solitaire variant without changing core logic
- **US-003**: As a player, I want to see a properly laid out game board so that I understand the game structure regardless of deck type
- **US-004**: As a developer, I want a flexible game state system so that I can track any type of game progression

### **Technical Tasks - Generalization-First:**
- Set up Svelte project with vanilla JavaScript
- Create `DeckConfig` class for deck parameters:
  ```javascript
  class DeckConfig {
    constructor(suits, ranks, wildCards = [], deckSize) {
      this.suits = suits;
      this.ranks = ranks;
      this.wildCards = wildCards;
      this.deckSize = deckSize;
    }
  }
  ```
- Create `Card` class that works with any rank/suit system
- Create `GameRules` base class with methods like:
  ```javascript
  class GameRules {
    isValidMove(card, target) { throw new Error('Must implement'); }
    getValidTargets(card) { throw new Error('Must implement'); }
    checkWinCondition() { throw new Error('Must implement'); }
  }
  ```
- Implement `StandardDeck` and `TarotDeck` as concrete `DeckConfig` implementations
- Create `GameBoard` that dynamically adapts to deck size and game rules

### **Svelte-Specific Implementation:**
- Use Svelte stores for game state management
- Leverage Svelte's reactive statements (`$:`) for automatic UI updates
- Create reusable Svelte components for cards, piles, and game areas
- Use Svelte's built-in transitions for smooth card animations

## **Phase 2: Classic Klondike Implementation (Weeks 3-4)**

### **User Stories:**
- **US-005**: As a player, I want to play classic Klondike so that I can enjoy the familiar game
- **US-006**: As a developer, I want Klondike rules implemented as a concrete `GameRules` class so that I can use it as a template for other variants
- **US-007**: As a player, I want smooth card interactions so that the game feels polished

### **Technical Tasks:**
- Create `KlondikeRules` class extending `GameRules`
- Implement all Klondike-specific logic through the abstract interface
- Add drag-and-drop using Svelte's event handling
- Ensure no hard-coded assumptions about deck size or structure

### **Svelte-Specific Implementation:**
- Use Svelte's `on:click`, `on:dblclick` for card interactions
- Implement drag-and-drop with Svelte's event system
- Use Svelte transitions for card movements
- Create responsive layouts with Svelte's CSS-in-JS approach

## **Phase 3: FreeCell Implementation (Weeks 5-6)**

### **User Stories:**
- **US-008**: As a player, I want to play FreeCell so that I can enjoy a different solitaire variant
- **US-009**: As a developer, I want FreeCell rules implemented to test the generalization of our architecture
- **US-010**: As a player, I want to see how the UI adapts to different game layouts

### **Technical Tasks:**
- Implement `FreeCellRules` class extending `GameRules`
- Create FreeCell-specific game logic (8 tableau piles, 4 free cells, 4 foundation piles)
- Adapt UI layout to handle FreeCell's unique structure
- Ensure all existing game logic works with FreeCell rules

### **Svelte-Specific Implementation:**
- Use Svelte's reactive statements to automatically adjust UI layout
- Implement conditional rendering for different game variants
- Use Svelte stores to manage game rule changes
- Create adaptive CSS grids that respond to different pile counts

## **Phase 4: Tarot Variant Implementation (Weeks 7-8)**

### **User Stories:**
- **US-011**: As a player, I want to play with tarot cards so that I can experience a different deck
- **US-012**: As a developer, I want to easily add new tarot-based variants so that I can explore creative rule sets
- **US-013**: As a player, I want the UI to adapt to different deck sizes so that I can play comfortably regardless of variant

### **Technical Tasks:**
- Implement `TarotDeck` configuration (78 cards, 4 suits + 22 major arcana)
- Create tarot-specific game rules (e.g., major arcana as wild cards)
- Adapt UI layout to handle larger deck sizes
- Ensure all existing game logic works with tarot cards

### **Svelte-Specific Implementation:**
- Use Svelte's reactive statements to automatically adjust UI layout
- Implement conditional rendering for different deck types
- Use Svelte stores to manage deck configuration changes
- Create adaptive CSS grids that respond to deck size

## **Phase 5: User Interface & Gameplay (Weeks 9-10)**

### **User Stories:**
- **US-014**: As a player, I want smooth card animations so that the game feels polished and engaging
- **US-015**: As a player, I want to undo my last move so that I can recover from mistakes
- **US-016**: As a player, I want to start a new game so that I can play multiple rounds
- **US-017**: As a player, I want to see my current score so that I can track my performance

### **Technical Tasks:**
- Implement smooth card animations using Svelte transitions
- Add undo/redo functionality with Svelte stores
- Create new game button and confirmation
- Implement local storage for game persistence
- Add visual feedback for valid/invalid moves

### **Svelte-Specific Implementation:**
- Use Svelte's `transition:slide`, `transition:fade` for card movements
- Implement undo/redo with Svelte store history
- Use Svelte's `bind:checked` for game options
- Leverage Svelte's reactive statements for automatic UI updates

## **Phase 6: Advanced Features & Polish (Weeks 11-12)**

### **User Stories:**
- **US-018**: As a player, I want mouse and keyboard shortcuts so that I can play efficiently
- **US-019**: As a player, I want statistics tracking so that I can see my improvement over time
- **US-020**: As a player, I want accessibility features so that I can play regardless of abilities
- **US-021**: As a player, I want to share my game results so that I can compete with friends

### **Technical Tasks:**
- Implement keyboard navigation and shortcuts, behavior on right-click and double-click
- Add comprehensive statistics tracking
- Implement accessibility features (ARIA labels, keyboard support)
- Add social sharing functionality
- Performance optimization and testing

### **Svelte-Specific Implementation:**
- Use Svelte's `on:keydown` for keyboard shortcuts
- Implement accessibility with Svelte's template syntax
- Use Svelte stores for statistics persistence
- Leverage Svelte's performance optimizations

## **Key Generalization Principles to Follow:**

### **1. No Magic Numbers**
```javascript
// ❌ WRONG - Hard-coded
const TABLEAU_PILES = 7;
const FOUNDATION_PILES = 4;

// ✅ RIGHT - Configurable
const TABLEAU_PILES = gameRules.getTableauPileCount();
const FOUNDATION_PILES = gameRules.getFoundationPileCount();
```

### **2. Abstract Card Properties**
```javascript
// ❌ WRONG - Assumes standard deck
class Card {
  constructor(suit, rank) {
    this.suit = suit;  // 'hearts', 'diamonds', etc.
    this.rank = rank;  // 1, 2, 3, etc.
  }
}

// ✅ RIGHT - Generic
class Card {
  constructor(suit, rank, isWild = false, specialProperties = {}) {
    this.suit = suit;  // Any suit type
    this.rank = rank;  // Any rank type
    this.isWild = isWild;
    this.specialProperties = specialProperties;
  }
}
```

### **3. Flexible Game Rules**
```javascript
// ❌ WRONG - Hard-coded logic
function isValidFoundationMove(card, targetPile) {
  return card.suit === targetPile.suit && 
         card.rank === targetPile.topCard.rank + 1;
}

// ✅ RIGHT - Delegated to rules
function isValidFoundationMove(card, targetPile) {
  return gameRules.isValidFoundationMove(card, targetPile);
}
```

### **4. Dynamic UI Layout**
```javascript
// ❌ WRONG - Fixed layout
const BOARD_GRID = 'repeat(7, 1fr)';

// ✅ RIGHT - Adaptive layout
const BOARD_GRID = `repeat(${gameRules.getTableauPileCount()}, 1fr)`;
```

## **Svelte-Specific File Structure:**
```
src/
├── lib/
│   ├── components/     # Svelte components
│   │   ├── Card.svelte
│   │   ├── Pile.svelte
│   │   ├── GameBoard.svelte
│   │   ├── Stock.svelte
│   │   └── Controls.svelte
│   ├── game/
│   │   ├── core/      # Abstract base classes
│   │   ├── configs/   # Deck configurations
│   │   ├── rules/     # Game rule implementations
│   │   └── variants/  # Specific game variants
│   ├── stores/        # Svelte stores for state
│   └── types/         # Generic type definitions
├── app.html
├── app.css
└── +layout.svelte
```

## **Svelte Stores for State Management:**
```javascript
// gameStore.js
import { writable } from 'svelte/store';

export const gameState = writable({
  currentDeck: null,
  gameRules: null,
  cards: [],
  piles: [],
  score: 0,
  moves: []
});

export const deckConfig = writable({
  suits: [],
  ranks: [],
  deckSize: 0
});
```

## **Success Criteria for Generalization:**
- [ ] Adding a new deck type requires only creating a new `DeckConfig`
- [ ] Adding a new variant requires only implementing `GameRules` interface
- [ ] UI automatically adapts to different deck sizes and structures
- [ ] No hard-coded assumptions about card properties or game rules
- [ ] FreeCell variant works seamlessly with existing game logic
- [ ] Tarot deck works seamlessly with existing game logic
- [ ] Code is easily extensible for future variants
- [ ] All Svelte components are reusable across different variants

## **Game Variant Progression:**
1. **Klondike (Phase 2)** - Classic 52-card solitaire with 7 tableau piles
2. **FreeCell (Phase 3)** - 52-card variant with 8 tableau piles + 4 free cells
3. **Tarot (Phase 4)** - 78-card variant with major arcana as wild cards

## **Next Steps:**
1. ✅ Set up Svelte project with vanilla JavaScript
2. ✅ Create basic project structure
3. ✅ Implement core base classes
4. ✅ Create first Svelte components
5. ✅ Implement Klondike game rules and logic
6. ✅ Create responsive, mobile-friendly UI
7. ✅ **COMPLETED**: Test generalization by implementing FreeCell variant
8. ✅ **COMPLETED**: Major core game parameterization and refactoring
9. 🔄 **NEXT**: Implement tarot deck configuration and rules
10. 🔄 **FUTURE**: Add smooth card animations and transitions
11. 🔄 **FUTURE**: Implement undo/redo functionality
12. 🔄 **FUTURE**: Add local storage for game persistence
13. 🔄 **FUTURE**: Create new game button and confirmation

## **Accomplished So Far (Updated: Current Session)**

### **✅ Phase 1 & 2: Foundation & Klondike Implementation - COMPLETED**

**Core Architecture:**
- ✅ Implemented `Card` class with parameterized deck support
- ✅ Created `DeckConfig` class for flexible deck configurations
- ✅ Built `GameRules` abstract base class with validation methods
- ✅ Implemented `StandardDeck` configuration (52 cards)
- ✅ Created `KlondikeRules` concrete implementation
- ✅ Built `Game` class for game state management
- ✅ Implemented `Pile` class for card collections
- ✅ Set up Svelte stores for reactive state management

**Game Logic:**
- ✅ Complete Klondike solitaire rules implementation
- ✅ Card movement validation (foundation and tableau)
- ✅ Stack movement support (multiple cards at once)
- ✅ Win condition checking
- ✅ Score tracking and move counting
- ✅ Stock/waste pile functionality

**User Interface:**
- ✅ Responsive game board layout
- ✅ Interactive card selection and movement
- ✅ Visual highlighting of valid move targets
- ✅ Debug mode with toggleable features
- ✅ Mobile-responsive design with orientation support
- ✅ Compact layout that fits on screen without scrolling
- ✅ **NEW**: Waste pile splaying with horizontal card layout
- ✅ **NEW**: Distinct styling for horizontal (SH) vs vertical (SV) stacked cards
- ✅ **NEW**: Optimized card typography with 14px rank text

**Key Adaptations Made:**
- **Interaction System**: Initially implemented drag-and-drop, then switched to click-based system for better reliability
- **Card Visibility**: Solved stacked card visibility issues by implementing rank+suit display in upper-left corner
- **Layout Optimization**: Moved section labels to side positions to save vertical space
- **Responsive Design**: Added comprehensive mobile support with portrait/landscape orientation detection
- **Debug Features**: Implemented toggleable debug mode with card indicators and move validation logging
- **Waste Pile Enhancement**: Implemented horizontal splaying for waste pile cards (traditional Klondike style)
- **Card Type Differentiation**: Created distinct visual styles for horizontally splayed (SH) vs vertically stacked (SV) cards

**Technical Challenges Solved:**
- **Move Validation**: Fixed parameter passing issues between base and concrete rule classes
- **UI Reactivity**: Resolved Svelte store update issues by ensuring new object references
- **Stack Movement**: Implemented proper multi-card movement without duplication
- **Layout Overflow**: Fixed tableau card overflow issues with responsive spacing
- **Mobile Optimization**: Created orientation-aware layouts for different device orientations
- **Card Layout Optimization**: Fine-tuned card padding (3px top, 6px sides, 2px bottom) for optimal text display
- **Typography Balance**: Achieved perfect balance between readability (14px rank) and space efficiency

**Current Status:**
- **Klondike Solitaire**: Fully playable with all standard rules
- **UI/UX**: Polished, responsive interface that works on all devices
- **Code Quality**: Clean, extensible architecture ready for new variants
- **Mobile Support**: Optimized for both portrait and landscape orientations
- **Debug Tools**: Comprehensive development and testing features
- **Visual Polish**: Professional card appearance with optimal typography and spacing

### **✅ Phase 3: FreeCell Implementation - COMPLETED**

**FreeCell Game Features:**
- ✅ Implemented `FreeCellRules` class extending `GameRules`
- ✅ Created FreeCell-specific game logic (8 tableau piles, 4 free cells, 4 foundation piles)
- ✅ Adapted UI layout to handle FreeCell's unique structure
- ✅ Implemented free cell move validation and card storage
- ✅ Created horizontal grouping of Foundation and Free Cell areas
- ✅ Added game selection menu with variant switching
- ✅ Implemented return-to-menu functionality

**UI Layout Adaptations:**
- ✅ **NEW**: Game selection menu on welcome screen
- ✅ **NEW**: Dynamic game board rendering based on selected variant
- ✅ **NEW**: Horizontal grouping of Foundation and Free Cells (similar to Stock/Waste in Klondike)
- ✅ **NEW**: Responsive layout adjustments for FreeCell's different pile structure
- ✅ **NEW**: Game-specific status displays (empty free cells, max moveable cards)

**Technical Implementation:**
- ✅ **Game Selection System**: Dynamic menu with `selectedGame` store and `availableGames` array
- ✅ **Variant-Specific Logic**: GameBoard component adapts to different game types via `gameType` prop
- ✅ **Conditional Rendering**: Stock/Waste area only shows for Klondike, Foundation/FreeCell grouping for FreeCell
- ✅ **Responsive Design**: FreeCell layout adapts to different screen sizes with proper spacing

**Key Adaptations Made:**
- **Game Selection**: Added welcome screen with game variant selection
- **Layout Flexibility**: UI automatically adapts to different pile counts and arrangements
- **Component Reusability**: Same Card and Pile components work for both variants
- **State Management**: Game state stores work seamlessly across variants
- **Navigation**: Added return-to-menu button for easy variant switching

**Current Status:**
- **Klondike Solitaire**: Fully playable with all standard rules
- **FreeCell Solitaire**: Fully playable with all standard rules
- **Game Selection**: Seamless switching between variants
- **UI/UX**: Responsive interface that adapts to different game layouts
- **Code Quality**: Clean, extensible architecture proven with multiple variants
- **Mobile Support**: Optimized for both portrait and landscape orientations
- **Debug Tools**: Comprehensive development and testing features

### **✅ Phase 3.5: Core Game Parameterization - COMPLETED**

**Architectural Improvements:**
- ✅ **Pile Creation**: Dynamic pile creation based on Rules configuration
- ✅ **Stock/Waste**: Parameterized behavior for different game variants
- ✅ **Card Flipping**: Customizable flipping rules per pile type
- ✅ **Move Recording**: Configurable move data structure
- ✅ **Variant Detection**: Game-aware functionality based on Rules

**Code Quality Improvements:**
- **Separation of Concerns**: Core Game logic is now completely generic
- **Extensibility**: New variants require only Rules interface implementation
- **Maintainability**: Cleaner, more organized codebase
- **Consistency**: All variants follow the same architectural patterns

**Technical Achievements:**
- **Rules Interface**: Extended base GameRules class with 8 new parameterized methods
- **Game Class**: Refactored core methods to use Rules configuration
- **Variant Support**: Both Klondike and FreeCell work with new parameterized system
- **Future-Proof**: Architecture ready for easy addition of new variants (Tarot, etc.)

**Key Benefits Realized:**
- **Easier Game Variants**: Adding new variants is now much simpler
- **Better Testing**: Rules can be easily mocked and tested independently
- **Cleaner Code**: No more hardcoded game-specific logic in core classes
- **Consistent Patterns**: All variants follow the same architectural approach

### **🔄 Next Phase: Tarot Variant Implementation**
The architecture has been successfully tested with FreeCell and significantly improved through parameterization, confirming that our generalization-first approach works excellently. The next phase will implement:
- 78-card tarot deck configuration
- Major arcana as wild cards or special cards
- Tarot-specific game rules and variants
- UI adaptation to larger deck sizes
- All while reusing existing card, pile, and game infrastructure

**Why Tarot Will Be Easier Now:**
- **Core Game Logic**: Completely generic and ready for any deck size
- **Pile Management**: Dynamic creation based on Rules configuration
- **Card Handling**: No hardcoded assumptions about card properties
- **UI Adaptation**: Responsive design already handles different pile counts
- **Rules Interface**: Clear contract for implementing new variants

This plan ensures that every line of code you write in the early phases will support your tarot variant (and any future variants) without refactoring, while leveraging Svelte's strengths for reactive, performant web applications.

## **Lessons Learned & Best Practices**

### **Card Component Design Insights:**
- **Typography Scaling**: 14px rank text provides optimal readability while maintaining card proportions
- **Padding Optimization**: Asymmetric padding (3px top, 6px sides, 2px bottom) creates perfect balance for corner text
- **Stack Type Differentiation**: Horizontal (SH) vs vertical (SV) card layouts require distinct styling approaches
- **Content Overflow Prevention**: `overflow: hidden` on main card container prevents text spillover

### **Waste Pile Implementation:**
- **Horizontal Splaying**: Traditional Klondike waste pile layout enhances game authenticity
- **Z-Index Management**: Proper layering ensures cards appear in correct draw order
- **Responsive Positioning**: Dynamic left offsets based on card index create natural splayed appearance
- **Performance**: Efficient rendering with `{#each}` blocks and calculated positioning

### **UI/UX Refinements:**
- **Click-Based Interaction**: More reliable than drag-and-drop for complex card games
- **Visual Feedback**: Valid move highlighting improves player experience
- **Debug Mode**: Essential for development and testing, toggleable for production
- **Mobile Optimization**: Orientation-aware layouts provide better mobile experience

### **Svelte-Specific Learnings:**
- **Store Updates**: Always create new object references (`[...array]`) to trigger reactivity
- **Component Props**: Use default values for optional props to prevent undefined errors
- **CSS Scoping**: Svelte's built-in CSS scoping prevents style conflicts
- **Reactive Statements**: `$:` syntax provides automatic UI updates based on store changes

### **Architecture Strengths Confirmed:**
- **Generalization-First Approach**: Core classes easily support different deck types and game variants
- **Separation of Concerns**: Game logic, UI, and state management are cleanly separated
- **Extensibility**: New game variants can be added without modifying existing code
- **Maintainability**: Clear class hierarchy and consistent patterns make code easy to understand and modify

### **Recent Lessons Learned (Stock/Waste Pile Fixes):**

**Store Management Issues:**
- **Problem**: Config store was causing initialization errors and breaking game selection
- **Solution**: Simplified debug controls and removed complex store dependencies
- **Lesson**: Keep store usage simple and avoid circular dependencies during component initialization

**Pile Creation Logic:**
- **Problem**: Waste pile wasn't being created because it starts empty (0 cards)
- **Solution**: Create waste pile whenever stock pile exists (same condition)
- **Lesson**: Pile creation should be based on game mechanics, not initial card counts

**Error Prevention:**
- **Problem**: Missing safety checks caused crashes when piles weren't found
- **Solution**: Added defensive programming with existence checks before pile operations
- **Lesson**: Always validate object existence before calling methods, especially in game logic

**Debug Logging:**
- **Problem**: Difficult to diagnose pile creation and card dealing issues
- **Solution**: Added comprehensive console logging for development and troubleshooting
- **Lesson**: Detailed logging during development saves significant debugging time

**Component Initialization:**
- **Problem**: GameBoard component was trying to initialize before props were properly set
- **Solution**: Added conditional initialization and reactive statements for prop changes
- **Lesson**: Components should gracefully handle missing or undefined props during initialization

### **✅ Current Session: Game Protection & Debug System - COMPLETED**

**Game Protection Features:**
- ✅ **Foundation → Tableau Protection**: Prevented invalid moves in Klondike (cards cannot move from Foundation back to Tableau)
- ✅ **Score Limit Protection**: Added maximum score limits to prevent infinite loops (1000 points for both variants)
- ✅ **Move Validation**: Enhanced `isValidMove()` to check source pile restrictions before target validation
- ✅ **Variant-Specific Rules**: Different movement restrictions for Klondike vs FreeCell

**New Rules Interface Methods:**
```javascript
// Base GameRules class additions
canCardBeMovedFromPile(card, sourcePile, gameState)  // Check if card can leave its pile
getMaximumScore()                                     // Get max score to prevent infinite loops
getCardNotationConfig()                               // Configure debug label display
```

**Rules Implementation Updates:**
- **KlondikeRules**: 
  - `canCardBeMovedFromPile()`: Blocks Foundation → Tableau moves
  - `getMaximumScore()`: Returns 1000 points
  - `getCardNotationConfig()`: Shows S/T labels for debugging
- **FreeCellRules**: 
  - `canCardBeMovedFromPile()`: Allows movement from any pile type
  - `getMaximumScore()`: Returns 1000 points
  - `getCardNotationConfig()`: Shows S/T labels for debugging

**Debug System Improvements:**
- ✅ **Hierarchical Debug Controls**: Main "Debug Info" toggle with nested controls underneath
- ✅ **Card Notation Labels**: S/T indicators (Stacked vs Top) for debugging stacked-pile moves
- ✅ **Score Warning System**: Visual warning (⚠️) when score approaches maximum
- ✅ **Debug-Only Features**: Score limits and warnings only active when debug mode is enabled

**Debug Control Structure:**
```
🐛 Debug Controls
├── Show Debug Info (main toggle)
└── Nested Controls (only visible when Debug Info is enabled):
    ├── Highlight Valid Moves
    ├── Show Solvability Info (FreeCell only)
    └── Show Card Notation
```

**Card Notation System:**
- **S/T Labels**: Red labels showing whether cards are Stacked (S) or Top (T)
- **Variant-Aware**: Uses `gameRules.getCardNotationConfig()` for future extensibility
- **Clean Display**: Only shows essential debugging info (no redundant suit/color labels)
- **Positioning**: Top-right corner with proper sizing (10px font, rounded corners)

**Technical Implementation:**
- **Game Class**: Added `debugMode` property and `setDebugMode()` method
- **Score Validation**: Conditional score limit checks only when `debugMode` is true
- **Component Props**: All Card components now receive `gameRules` for variant-specific behavior
- **Reactive Updates**: Debug mode changes automatically propagate to all components

**Key Benefits:**
- **Game Integrity**: Prevents invalid moves and infinite loops
- **Production Safe**: Score limits only active in debug mode
- **Clean Debugging**: Focused S/T labels without redundant information
- **Variant Flexibility**: Easy to customize debug behavior per game variant
- **Future Extensibility**: Card notation config ready for new variants (Spider, Tarot, etc.)

**Current Status:**
- **Game Protection**: Foundation moves blocked in Klondike, score limits prevent infinite loops
- **Debug System**: Hierarchical controls with focused card notation labels
- **Code Quality**: Clean separation between game logic and debugging features
- **Extensibility**: Ready for easy addition of new variants with custom debug configurations
- **Production Ready**: Debug features can be easily disabled for production builds

### **✅ Current Session: Fortune's Foundation Tarot Variant - COMPLETED**

**Fortune's Foundation Implementation:**
- ✅ **Tarot Deck**: Created `TarotDeck` class (74 cards: 4 suits × 14 + 22 major arcana)
- ✅ **Game Rules**: Implemented `FortunesFoundationRules` class with tarot-specific mechanics
- ✅ **Custom Variant**: "Fortune's Foundation" - unique solitaire variant with tarot cards
- ✅ **UI Adaptation**: Responsive design successfully handles larger deck and different pile counts

**Fortune's Foundation Rules:**
- **Deck**: 74 cards (4 Minor Arcana suits × 14 + 22 Major Arcana)
- **Tableau**: 10 piles, same-suit ascending stacks, face-up dealing
- **Foundations**: 6 piles (4 Minor Arcana + 2 Major Arcana)
- **Minor Arcana**: A-K in 4 suits with distinct colors (red, blue, green, gold)
- **Major Arcana**: 0-21 with oversized numbers, descending pile (21→0)
- **Free Cell**: Single free cell with blocking rule for Minor Arcana foundations
- **Initial Deal**: Pre-seeded aces in foundations, equal-length tableau piles

**Technical Implementation:**
- **Deck Configuration**: `TarotDeck` extends `DeckConfig` with tarot-specific properties
- **Game Rules**: `FortunesFoundationRules` extends `GameRules` with variant-specific logic
- **Card Display**: Enhanced `Card.svelte` with color bars, emoji suits, and contrast-aware text
- **Game Board**: Two-row foundation layout with spreading Major Arcana cards
- **Move Validation**: Complete validation system for all pile types including free cells

**UI/UX Features:**
- **Color-Coded Suits**: Horizontal color bars with contrast-aware rank text
- **Emoji Suit Symbols**: Visual suit indicators for better recognition
- **Two-Row Foundations**: Minor Arcana (top) and Major Arcana (bottom) in separate rows
- **Card Spreading**: Major Arcana foundations spread horizontally like Klondike waste pile
- **Responsive Layout**: Tableau piles fit on single row, foundation areas properly aligned

**Architecture Improvements:**
- **Abstract Method Implementation**: All required abstract methods properly implemented
- **Variant-Specific Validation**: Each variant now has complete control over move validation
- **Stack Movement**: Fixed stack movement validation across all variants
- **Free Cell Support**: Added free cell validation to base class with variant-specific overrides

**Key Achievements:**
- **First Tarot Variant**: Successfully implemented complex tarot-based solitaire
- **Architecture Validation**: Proved generalization-first approach works for complex variants
- **UI Flexibility**: Demonstrated responsive design can handle significantly different layouts
- **Rule Complexity**: Implemented variant with unique mechanics (free cell blocking, dual foundation types)

### **🔧 Recent Bug Fixes & Improvements**

**Free Cell Move Validation (Fixed):**
- **Problem**: Fortune's Foundation free cell moves were failing validation
- **Root Cause**: Base class `isValidMove` was missing `freecell` case
- **Solution**: Made `isValidMove` abstract, implemented in each variant
- **Result**: Free cell moves now work in both FreeCell and Fortune's Foundation

**Klondike Stack Movement (Fixed):**
- **Problem**: Stack movement (S cards) was broken in Klondike
- **Root Cause**: `canCardBeMovedFromPile` was too restrictive (only allowed top cards)
- **Solution**: Modified to allow any face-up tableau card (stack validation happens later)
- **Result**: Stack movement now works properly in Klondike

**Horizontal Suit Notation (Fixed):**
- **Problem**: FreeCell S cards weren't showing horizontal suit notation
- **Root Cause**: CSS for `.rank-suit-horizontal` was identical to vertical notation
- **Solution**: Fixed CSS to use `flex-direction: row` for horizontal display
- **Result**: Stacked cards now show rank and suit side by side for better readability

**Architecture Refactoring:**
- **Moved Validation Logic**: All move validation now handled by variant-specific classes
- **Abstract Base Class**: `GameRules` now properly abstract with clear contracts
- **Variant Independence**: Each variant controls its own validation logic
- **No More Conflicts**: Base class no longer interferes with variant-specific behavior

### **🎯 Current Session: FreeCell T/S/U Notation & Architecture Cleanup - COMPLETED**

**FreeCell T/S/U Debug Notation Implementation:**
- **Goal**: Implement variant-specific card notation for FreeCell to distinguish accessible vs. inaccessible stacked cards
- **Implementation**: Extended the debugging system architecture to support custom notation functions
- **Result**: FreeCell now shows T (Top), S (Stacked/accessible), U (Unaccessible) labels

**Technical Approach:**
- **Extended Debugging System**: Modified `getCardNotationConfig()` to return custom `getNotationLabel` functions
- **Variant-Specific Logic**: FreeCell notation logic contained within `FreeCellRules` class
- **Clean Architecture**: Card component remains generic, calls custom notation when available
- **Fallback Behavior**: Other variants continue to use default S/T notation unchanged

**FreeCell Notation Logic:**
- **T (Top)**: Card at the top of a pile (always accessible)
- **S (Stacked)**: Card that's part of a valid alternating-color descending sequence
- **U (Unaccessible)**: Face-up card that's not part of a valid stack sequence

**Architecture Improvements:**
- **Debug System Extension**: Proved the debugging architecture can handle variant-specific needs
- **Clean Separation**: Notation logic properly contained within variant rules
- **No Component Changes**: Card component remains generic and extensible
- **Consistent Pattern**: Follows the same extension pattern used for other variant-specific features

**Bug Fixes:**
- **Stack Movement**: Fixed FreeCell stack movement by simplifying `canCardBeMovedFromPile`
- **Move Validation**: Corrected logic to check accessibility in selection, validation in move
- **Console Logging**: Eliminated excessive debug output that was cluttering the console

**Key Insights:**
- **Architecture Validation**: The debugging system architecture successfully handles complex variant needs
- **Separation of Concerns**: Selection validation vs. move validation are distinct concerns
- **Extension Pattern**: Variant-specific debugging can be added without modifying core components
- **User Experience**: T/S/U notation provides valuable insight into FreeCell game state

### **🔄 Next Phase: Game Polish & Advanced Features**

**Ready for Implementation:**
- **Core Variants**: Klondike, FreeCell, and Fortune's Foundation all working
- **Architecture**: Fully parameterized and tested with complex variants
- **Game Protection**: Robust move validation and score limiting
- **Debug System**: Comprehensive debugging tools for development
- **UI Flexibility**: Responsive design proven with significantly different layouts

**Immediate Next Steps (Choose One):**

**Option 1: Game Polish & User Experience**
1. **Smooth Animations**: Add Svelte transitions for card movements
2. **Undo/Redo System**: Implement move history with Svelte stores
3. **Local Storage**: Save/restore game state between sessions
4. **Game Statistics**: Track wins, losses, and performance metrics
5. **Keyboard Shortcuts**: Add keyboard navigation and shortcuts

**Option 2: Additional Variants**
1. **Spider Solitaire**: Simpler variant to test different tableau rules
2. **Yukon**: Variant with partial face-down tableau dealing
3. **Canfield**: Variant with different foundation building rules
4. **Custom Variants**: User-defined rule sets

**Option 3: Performance & Testing**
1. **Performance Optimization**: Optimize rendering for larger deck sizes
2. **Comprehensive Testing**: Add test suite for all variants
3. **Accessibility**: Implement ARIA labels and keyboard support
4. **Mobile Optimization**: Improve touch interactions and responsive design

**Recommended Path: Game Polish First**
- **Why**: Core variants are working well, time to improve user experience
- **Benefits**: More polished gameplay, better user retention, easier to test new features
- **Foundation**: Polish features will benefit all current and future variants
- **User Feedback**: Better experience will help identify areas for improvement

**Long-term Vision:**
- **Variant Library**: Collection of 10+ solitaire variants
- **User Customization**: Allow users to create custom variants
- **Multiplayer**: Basic multiplayer functionality for competitive play
- **Mobile App**: PWA with offline support and mobile-optimized UI

## **Build & Deployment Instructions**

### **Development Server Setup**

**Prerequisites:**
- Node.js 18+ installed
- npm or yarn package manager

**Local Development:**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# The app will be available at http://localhost:5173
# Hot reload is enabled for development
```

**Development Commands:**
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run check        # Run Svelte check (if using TypeScript)
npm run lint         # Run ESLint (if configured)
```

**Environment Configuration:**
- Development server runs on port 5173 by default
- Environment variables can be set in `src/lib/config/environment.js`
- Debug mode is enabled by default in development

### **Production Build Process**

**Build Command:**
```bash
npm run build
```

**Build Output:**
- Production files are generated in the `dist/` directory
- Static assets are optimized and minified
- CSS is extracted and optimized
- JavaScript is bundled and tree-shaken

**Build Artifacts:**
```
dist/
├── assets/          # Optimized JS, CSS, and other assets
├── index.html       # Main HTML file
└── favicon.ico      # App icon
```

**Build Optimization:**
- Vite automatically optimizes bundle size
- Unused code is eliminated through tree-shaking
- Assets are compressed and optimized
- CSS is minified and purged of unused styles

### **Production Deployment Options**

#### **Option 1: Static Hosting (Recommended)**

**Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy from dist folder
netlify deploy --dir=dist --prod

# Or connect to Git repository for automatic deployments
netlify deploy --prod
```

**Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from dist folder
vercel --prod

# Or connect to Git repository for automatic deployments
vercel --prod
```

**GitHub Pages:**
```bash
# Add to package.json scripts
"deploy": "npm run build && gh-pages -d dist"

# Install gh-pages package
npm install --save-dev gh-pages

# Deploy
npm run deploy
```

#### **Option 2: Traditional Web Server**

**Apache Configuration:**
```apache
# .htaccess file in dist/ directory
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/solitaire/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable compression
    gzip on;
    gzip_types text/html text/plain text/xml text/css text/javascript application/javascript;
}
```

#### **Option 3: Docker Deployment**

**Dockerfile:**
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  solitaire:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
```

### **Environment-Specific Configuration**

**Development Environment:**
```javascript
// src/lib/config/environment.js
export const config = {
  debugMode: true,
  apiUrl: 'http://localhost:3000',
  enableHotReload: true
};
```

**Production Environment:**
```javascript
// src/lib/config/environment.js
export const config = {
  debugMode: false,
  apiUrl: 'https://api.yourdomain.com',
  enableHotReload: false
};
```

**Environment Variables:**
```bash
# .env.local (development)
VITE_DEBUG_MODE=true
VITE_API_URL=http://localhost:3000

# .env.production
VITE_DEBUG_MODE=false
VITE_API_URL=https://api.yourdomain.com
```

### **Performance Optimization for Production**

**Build Optimizations:**
- Enable gzip compression on web server
- Use CDN for static assets
- Implement browser caching headers
- Optimize images and assets

**Runtime Optimizations:**
- Disable debug mode in production
- Minimize console logging
- Optimize Svelte component rendering
- Use lazy loading for non-critical components

**Caching Strategy:**
```javascript
// Service Worker for offline support
// public/sw.js
const CACHE_NAME = 'solitaire-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/main.js',
  '/assets/main.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});
```

### **Monitoring & Analytics**

**Performance Monitoring:**
- Use Lighthouse for performance audits
- Monitor Core Web Vitals
- Track bundle size and load times
- Monitor user experience metrics

**Error Tracking:**
- Implement error boundary components
- Log errors to external service (Sentry, LogRocket)
- Monitor JavaScript errors in production
- Track user interaction failures

**Analytics Integration:**
```javascript
// Google Analytics 4
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
```

### **Security Considerations**

**Production Security:**
- Disable debug mode and console logging
- Implement Content Security Policy (CSP)
- Use HTTPS in production
- Sanitize user inputs
- Implement rate limiting if adding backend

**CSP Headers:**
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
```

### **Deployment Checklist**

**Pre-Deployment:**
- [ ] Run `npm run build` successfully
- [ ] Test production build locally with `npm run preview`
- [ ] Verify all game variants work correctly
- [ ] Check responsive design on different screen sizes
- [ ] Disable debug mode for production
- [ ] Optimize images and assets
- [ ] Update environment configuration

**Deployment:**
- [ ] Upload files to hosting provider
- [ ] Configure custom domain (if applicable)
- [ ] Set up SSL certificate
- [ ] Configure redirects and routing
- [ ] Test all functionality in production
- [ ] Monitor performance and errors

**Post-Deployment:**
- [ ] Verify all game variants work
- [ ] Test on different devices and browsers
- [ ] Monitor performance metrics
- [ ] Check error logs
- [ ] Gather user feedback
- [ ] Plan next iteration

### **Continuous Deployment Setup**

**GitHub Actions Workflow:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
```

**Automatic Deployment Benefits:**
- Consistent deployment process
- Reduced human error
- Faster iteration cycles
- Easy rollback capabilities
- Automated testing integration

## **Phase 6: Advanced Features & Polish - Mouse and Keyboard Bindings**

### **User Stories:**
- **US-020**: As a player, I want to double-click T cards to move them to foundation piles so that I can quickly complete obvious moves
- **US-021**: As a player, I want to use number keys to select tableau piles so that I can navigate efficiently in games with many piles
- **US-022**: As a player, I want to use the spacebar for auto-completion when the game is solved so that I can finish quickly

### **Technical Tasks - Mouse and Keyboard Bindings:**

#### **1. Double-Click to Foundation (T Cards Only)**
**Function**: `handleCardDoubleClick(event)`
**Location**: After `handleCardClick` function in GameBoard.svelte
**Purpose**: Move T cards (top cards) directly to appropriate foundation piles
**Logic**:
```javascript
function handleCardRightClick(event) {
    event.stopPropagation();
    const { card } = event.detail;
    
    // Only handle T cards (top cards that can be moved)
    if (!card || !game) return;
    
    const sourcePile = game.findCardPile(card);
    if (!sourcePile) return;
    
    // Check if this is a T card (top card of its pile)
    const isTopCard = sourcePile.getTopCard() === card;
    if (!isTopCard) return;
    
    // Find foundation piles that can accept this card
    const foundationPiles = game.piles.filter(p => p.type === 'foundation');
    let targetFoundation = null;
    
    for (const foundation of foundationPiles) {
        if (game.isValidMove(card, foundation)) {
            targetFoundation = foundation;
            break;
        }
    }
    
    if (targetFoundation) {
        // Make the move and update game state
        const moveResult = game.makeMove(card, targetFoundation);
        if (moveResult) {
            selectedCard = null;
            validTargets = [];
            // Update gameState store
        }
    }
}
```

#### **2. Keyboard Tableau Pile Selection**
**Function**: `selectTableauPileByKey(keyNumber)`
**Location**: After `handleCardRightClick` function in GameBoard.svelte
**Purpose**: Select T cards from specific tableau piles using number keys
**Key Mapping**:
- Keys 1-9: Select tableau piles 0-8 (index 0-7)
- Key 0: Select tableau pile 9 (index 9) - 10th pile
- Key Q: Select tableau pile 10 (index 10) - 11th pile
- Key W: Select tableau pile 11 (index 11) - 12th pile
- Key E: Select tableau pile 12 (index 12) - 13th pile
- Key R: Select tableau pile 13 (index 13) - 14th pile

**Logic**:
```javascript
function selectTableauPileByKey(keyNumber) {
    if (!game) return;
    
    // Convert key number to pile index
    let pileIndex;
    if (keyNumber === 0) {
        pileIndex = 9; // 0 key selects 10th pile (index 9)
    } else if (keyNumber >= 1 && keyNumber <= 9) {
        pileIndex = keyNumber - 1; // 1-9 keys select piles 0-8
    } else if (keyNumber === 10) { // Q key
        pileIndex = 9;
    } else if (keyNumber === 11) { // W key
        pileIndex = 10;
    } else if (keyNumber === 12) { // E key
        pileIndex = 11;
    } else if (keyNumber === 13) { // R key
        pileIndex = 12;
    } else {
        return; // Invalid key number
    }
    
    // Find the tableau pile and select its top card
    const tableauPile = game.piles.find(p => p.type === 'tableau' && p.index === pileIndex);
    if (!tableauPile || tableauPile.isEmpty()) return;
    
    const topCard = tableauPile.getTopCard();
    if (!topCard || !topCard.isFaceUp) return;
    
    // Select the top card
    selectedCard = topCard;
    validTargets = game.gameRules.getValidTargets(topCard, game);
}
```

#### **3. Spacebar Auto-Complete**
**Function**: `handleAutoComplete()`
**Location**: After `selectTableauPileByKey` function in GameBoard.svelte
**Purpose**: Automatically move all accessible cards to foundation when game is "solved"
**Trigger Conditions**:
- All stock piles are empty
- All cards in other piles are face-up (accessible)
- No more strategic moves needed

**Logic**:
```javascript
function handleAutoComplete() {
    if (!game) return;
    
    // Check if all cards are accessible (T or S) and no cards are face down or in stock
    const allCardsAccessible = game.piles.every(pile => {
        if (pile.type === 'stock') {
            return pile.isEmpty(); // Stock should be empty
        }
        // All cards in other piles should be face up
        return pile.cards.every(card => card.isFaceUp);
    });
    
    if (!allCardsAccessible) return;
    
    // Iteratively move T cards to foundation until no more moves possible
    let movesMade = 0;
    let hasValidMoves = true;
    
    while (hasValidMoves) {
        hasValidMoves = false;
        
        // Find all T cards that can be moved to foundation
        for (const pile of game.piles) {
            if (pile.type === 'stock' || pile.isEmpty()) continue;
            
            const topCard = pile.getTopCard();
            if (!topCard || !topCard.isFaceUp) continue;
            
            // Check if this card can be moved to any foundation pile
            const foundationPiles = game.piles.filter(p => p.type === 'foundation');
            for (const foundation of foundationPiles) {
                if (game.isValidMove(topCard, foundation)) {
                    const moveResult = game.makeMove(topCard, foundation);
                    if (moveResult) {
                        movesMade++;
                        hasValidMoves = true;
                        // Update gameState store after each move
                        break;
                    }
                }
            }
        }
    }
    
    // Clear selection after auto-complete
    selectedCard = null;
    validTargets = [];
}
```

#### **4. Global Keyboard Event Listener**
**Location**: Inside `onMount` function in GameBoard.svelte
**Purpose**: Capture keyboard events globally for the game
**Event Handling**:
```javascript
onMount(() => {
    // ... existing onMount logic ...
    
    // Add global keyboard event listener
    const handleKeyDown = (event) => {
        // Only handle keyboard shortcuts when game is active and no input fields are focused
        if (!gameStarted || !game || document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
            return;
        }
        
        // Number keys for tableau pile selection
        if (event.key >= '0' && event.key <= '9') {
            event.preventDefault();
            selectTableauPileByKey(parseInt(event.key));
        }
        // Q key for 10th tableau pile (index 9)
        else if (event.key.toLowerCase() === 'q') {
            event.preventDefault();
            selectTableauPileByKey(10);
        }
        // W key for 11th tableau pile (index 10)
        else if (event.key.toLowerCase() === 'w') {
            event.preventDefault();
            selectTableauPileByKey(11);
        }
        // E key for 12th tableau pile (index 11)
        else if (event.key.toLowerCase() === 'e') {
            event.preventDefault();
            selectTableauPileByKey(12);
        }
        // R key for 13th tableau pile (index 12)
        else if (event.key.toLowerCase() === 'r') {
            event.preventDefault();
            selectTableauPileByKey(13);
        }
        // Spacebar for auto-complete
        else if (event.key === ' ') {
            event.preventDefault();
            handleAutoComplete();
        }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup function
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
});
```

#### **5. Wire Up Double-Click Events**
**Location**: Template section in GameBoard.svelte
**Purpose**: Add `on:dblclick={handleCardDoubleClick}` to all Card components
**Components to Update**:
- Foundation pile cards
- Tableau pile cards (all stacked cards)
- Free cell cards
- Waste pile cards

### **Implementation Order:**
1. **Step 1**: Add double-click handler to Card.svelte ✅ (COMPLETED)
2. **Step 2**: Add `handleCardDoubleClick` function to GameBoard.svelte ✅ (COMPLETED)
3. **Step 3**: Add `selectTableauPileByKey` and `handleAutoComplete` functions ✅ (COMPLETED)
4. **Step 4**: Add global keyboard event listener in `onMount` ✅ (COMPLETED)
5. **Step 5**: Wire up `on:dblclick` events to all Card components ✅ (COMPLETED)

### **Testing Strategy:**
- Test double-click on T cards vs S cards
- Test number key selection (1-9, 0, q, w, e, r)
- Test spacebar auto-complete on solved games
- Verify no conflicts with existing click handlers
- Test keyboard shortcuts don't interfere with input fields
- Test win condition display and "Play Again" button functionality
- Test win state persistence across game type changes

This deployment guide ensures your Svelte solitaire app can be easily built, tested, and deployed to production environments while maintaining the high quality and performance standards established during development.

## **Phase 7: Accessibility & Advanced Keyboard Controls (Future)**

### **Current Keyboard Controls Status**
**✅ IMPLEMENTED:**
- **Number keys (0-9)**: Select T card from corresponding tableau pile
- **Q, W, E, R keys**: Select T card from 10th-13th tableau piles (for games with many tableau piles)
- **Spacebar**: Auto-complete when game is solved (moves all accessible cards to foundation)

**✅ IMPLEMENTED:**
- **Double-click on T cards**: Move to appropriate foundation pile (if valid move exists)

### **Accessibility Roadmap - Keyboard Controls**

#### **High Priority (Essential for accessibility)**
1. **Tab Navigation System**
   - **Tab/Shift+Tab**: Navigate between interactive elements (foundations, tableau piles, free cells, stock)
   - **Focus indicators**: Visual focus states for keyboard navigation
   - **Skip links**: Jump to main game areas

2. **Card Selection & Activation**
   - **Arrow keys**: Navigate between cards within a pile when focused
   - **Enter/Space**: Activate selected card (equivalent to left-click)
   - **Escape**: Clear selection, return focus to game board

3. **Game Information & Help**
   - **H key**: Toggle "Help mode" - show valid moves for current selection
   - **I key**: Toggle "Info mode" - show card details, pile counts, game statistics
   - **? key**: Show context-sensitive help for current selection

#### **Medium Priority (Significant improvement)**
1. **Game Actions**
   - **U key**: Undo last move
   - **R key**: Reset/restart current game
   - **N key**: Start new game
   - **F key**: Auto-foundation (move all possible cards to foundation)

2. **Pile Navigation**
   - **A key**: Select first available foundation pile
   - **Z key**: Select last available foundation pile
   - **X key**: Select first available tableau pile
   - **C key**: Select last available tableau pile

3. **Advanced Selection**
   - **Shift + Arrow keys**: Select multiple cards in a stack
   - **Ctrl/Cmd + Arrow keys**: Move selected card(s) to adjacent pile

#### **Lower Priority (Nice to have)**
1. **Visual Accessibility**
   - **L key**: Toggle "Large text mode" - increase card size
   - **B key**: Toggle "High contrast mode" - enhance card visibility
   - **M key**: Toggle "Motion reduction" - disable animations

2. **Game Variant Management**
   - **G key**: Switch between game variants (Klondike, FreeCell, Fortune's Foundation)
   - **F1 key**: Show comprehensive help/controls reference
   - **F2 key**: Show game rules reference

### **Technical Implementation Considerations**

#### **Focus Management Architecture**
- **Focus vs Selection distinction**: 
  - **Focus**: Keyboard navigation target (visual indicator)
  - **Selection**: Game state (card ready for movement)
- **Focus ring styling**: High contrast, visible focus indicators
- **Focus trapping**: Keep focus within game boundaries

#### **Screen Reader Support**
- **ARIA labels**: Descriptive labels for all interactive elements
- **Live regions**: Announce game state changes (moves, wins, errors)
- **Semantic HTML**: Proper heading structure and landmarks
- **State announcements**: "Card selected", "Move invalid", "Game won"

#### **Keyboard Event Handling**
- **Event delegation**: Centralized keyboard event management
- **Modifier key support**: Shift, Ctrl, Cmd combinations
- **Prevent default**: Avoid conflicts with browser shortcuts
- **Accessibility shortcuts**: Don't override assistive technology

### **User Experience Design**

#### **Progressive Enhancement**
- **Mouse users**: Full functionality with existing controls
- **Keyboard users**: Complete game access without mouse
- **Screen reader users**: Full game information and control
- **Motor impairment users**: Alternative input methods supported

#### **Learning Curve**
- **Tooltips**: Show keyboard shortcuts on hover
- **Help overlay**: Comprehensive controls reference (F1)
- **Contextual help**: Show available actions for current selection
- **Tutorial mode**: Guided introduction to keyboard controls

### **Implementation Phases**

#### **Phase 7A: Core Navigation (Weeks 1-2)**
- Tab navigation between game elements
- Arrow key navigation within piles
- Enter/Space activation
- Focus management system

#### **Phase 7B: Game Actions (Weeks 3-4)**
- U, R, N keys for game actions
- A, Z, X, C keys for pile navigation
- H, I, ? keys for help and information

#### **Phase 7C: Advanced Features (Weeks 5-6)**
- Multi-card selection
- Visual accessibility toggles
- Screen reader optimization
- Comprehensive help system

### **Testing & Validation**
- **Keyboard-only testing**: Complete games using only keyboard
- **Screen reader testing**: NVDA, JAWS, VoiceOver compatibility
- **Accessibility audit**: WCAG 2.1 AA compliance
- **User testing**: Players with various accessibility needs

### **Success Metrics**
- **Keyboard accessibility**: 100% game functionality via keyboard
- **Screen reader compatibility**: Full game information accessible
- **Focus management**: Clear, logical tab order
- **User satisfaction**: Positive feedback from accessibility community

This accessibility roadmap will transform the solitaire game from mouse-dependent to fully accessible, making it usable by players with various abilities and preferences while maintaining the polished experience for all users.