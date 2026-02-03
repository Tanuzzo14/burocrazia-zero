# GUIDAMI Button Feature - User Guide

## Overview
The GUIDAMI button provides context-aware guidance to users across all three stages of the application workflow.

## Behavior by Stage

### Stage 1: Search Bar (Initial Page)
**When:** User is on the first page with no search results
**Action:** Clicking GUIDAMI focuses the search input and activates the keyboard
**Purpose:** Helps users understand they should start by searching for their operation

**Implementation Details:**
- Uses Angular ViewChild to access the search input element
- Focuses the input after a 100ms delay to ensure DOM is ready
- Triggers click event to activate mobile keyboards

### Stage 2: Options Selection
**When:** Search results are displayed but user hasn't selected an option yet
**Action:** Shows a blurred overlay with scroll message
**Message:** "Scorri in basso per selezionare la scelta più adatta a te"
**Purpose:** Guides users to scroll and review all available options

**Implementation Details:**
- Activates GuidaService in options guide mode
- Shows scroll arrow with custom message
- Applies backdrop blur to draw attention to the message

### Stage 3: Booking Form
**When:** User has selected an operation and booking form is visible
**Action:** Activates the guided overlay system
**Behavior:** 
- Highlights the first invalid form field
- Shows contextual help for each field
- Auto-advances to next field when current becomes valid
- Entire page is blurred except the current field being filled

**Implementation Details:**
- Uses existing GuidaService guided overlay system
- Integrates with Angular Reactive Forms validation
- Provides field-specific help text via tooltip

## Technical Architecture

### Components Involved
1. **NavbarComponent**: Contains the GUIDAMI button
2. **AppComponent**: Orchestrates stage detection and guidance activation
3. **GuidaService**: Manages guidance state and provides observables
4. **GuidaOverlayComponent**: Renders the visual overlay and guidance UI

### Key Methods
- `onGuidaClick()`: Detects current stage and triggers appropriate action
- `focusSearchBar()`: Focuses search input (Stage 1)
- `showOptionsScrollGuide()`: Activates options guide (Stage 2)
- `activateGuidedOverlay()`: Starts form guidance (Stage 3)

## User Experience Goals
1. **Progressive Disclosure**: Guide users step-by-step through the process
2. **Context Awareness**: Provide relevant help based on current stage
3. **Non-Intrusive**: Users can dismiss guidance at any time (ESC key or click overlay)
4. **Accessibility**: Full keyboard support and ARIA labels
5. **Mobile-First**: Touch-friendly and works with mobile keyboards

## Future Enhancements
- Add analytics to track which stage users most frequently use GUIDAMI
- Consider adding tooltips on first visit
- Possibly add sound/haptic feedback for mobile users
