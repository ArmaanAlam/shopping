# ShopVoice — Voice Command Shopping Assistant

**ShopVoice** is a lightweight, responsive, and voice-activated shopping list assistant featuring a client-side NLP parser, dynamic contextual recommendations, and speech synthesis feedback. 

The application utilizes a professional, high-contrast minimalist interface designed using **Stitch** (aligned with the **Azure Kinetic** design system tokens: Electric Blue accents, crisp typography, and glassmorphic modal sheets). It is built entirely using standard HTML5, CSS (via Tailwind CSS utility presets), and vanilla JavaScript to satisfy the assignment requirement of having zero external build dependencies or heavy framework runtimes.

---

## 🚀 Submission Checklist & Compliance

This repository conforms strictly to the **Assignment Submission Guidelines**:

- [x] **No Unnecessary Modules**: Contains zero `node_modules`, `package.json`, or third-party package configurations. Run-time is completely native.
- [x] **Clean Structure**: No build folders (`dist/`, `.next/`), configurations (`.vscode/`), or environment files (`.env`).
- [x] **Single Page Execution**: The app runs directly by opening `index.html` in a web browser.
- [x] **Main Branch Ready**: Pushed code belongs to the `main` branch.
- [x] **Offline-First Resilience**: Implements an automatic simulation toggle in case the browser's speech-recognition cloud servers are blocked or offline (throwing a `network` error).

---

## 🛠️ Architecture & Tech Stack

- **Core Structure**: HTML5 Semantic markup (`index.html`).
- **Styling**: Tailwind CSS via CDN with customized Azure Kinetic theme extensions (color modes, typography sizes, spacing rhythm, and FAB animations).
- **Application Logic** (`app.js`):
  - **Speech Controller**: Initiates `webkitSpeechRecognition` for translating spoken voice to text, and uses the browser's native `SpeechSynthesis` to deliver audio confirmation alerts.
  - **NLP Parsing Engine**: Translates natural language phrases into data mutations using multi-lingual regular expression matching.
  - **Dynamic Suggestions Engine**: Evaluates current list items and suggests pairings, recipe ingredients, or healthier alternative substitutes (e.g. recommending *Almond Milk* or *Oat Milk* if *Whole Milk* is added).
  - **Mock Product Catalog**: Local dataset representing 17 product items across departments to support speech search queries like `"Find toothpaste under 5 dollars"`.
  - **State Store**: Persists list items and user preferences (language, mute toggle, simulation mode) in browser `localStorage`.

---

## 🎙️ Natural Language Processing (NLP) Command API

The client-side regex engine parses command intent from transcripts. The list below represents supported command templates:

### 1. Adding Items
Supports natural language quantities, units, and item descriptions:
- `"Add 2 liters of whole milk"` $\rightarrow$ Adds `Whole Milk` (Qty: `2L`) under **Dairy**.
- `"I want to buy 3 packages of chocolate cookies"` $\rightarrow$ Adds `Chocolate Chip Cookies` (Qty: `3 packs`) under **Snacks**.
- `"I need 5 avocados"` $\rightarrow$ Adds `Avocados` (Qty: `5 pcs`) under **Produce**.
- `"Add sourdough loaf"` $\rightarrow$ Adds `Sourdough Loaf` (Qty: `1 item`) under **Bakery**.

### 2. Removing Items
Allows removing individual items from the list:
- `"Remove avocados"` $\rightarrow$ Deletes avocados from the list.
- `"Delete milk from my list"` $\rightarrow$ Removes milk.

### 3. Voice-Activated Search & Price Filters
Searches the local product catalog and displays matches inside a dedicated search panel:
- `"Find organic bananas"` $\rightarrow$ Displays organic Hass bananas.
- `"Search toothpaste under 5 dollars"` $\rightarrow$ Finds and displays toothpaste below $5 (e.g. Colgate MaxFresh for $3.49).

### 4. Utility Commands
- `"Read my shopping list"` $\rightarrow$ Assistant speaks aloud all active items on your list.
- `"Clear my shopping list"` $\rightarrow$ Clears all items.

---

## 🌐 Multilingual Voice Commands
You can change the speech language inside the **Voice Settings** menu (gear icon). Supported locales:
- **English (`en-US`)**: *"Add milk"*, *"Remove cookies"*
- **Español (`es-ES`)**: *"Añadir leche"*, *"Quitar galletas"*, *"Buscar dentífrico menos de 5 dólares"*
- **Français (`fr-FR`)**: *"Ajouter du lait"*, *"Retirer biscuits"*, *"Chercher dentifrice sous 5 euros"*

---

## 🔌 Offline Voice Simulation Fallback

Because Chrome and Edge rely on Google and Microsoft cloud servers for `SpeechRecognition` transcription, the API can sometimes throw a `Speech Error: Network` when offline or behind firewalls. 

To ensure the grader can test the NLP commands seamlessly, **ShopVoice** includes an automatic **Offline Voice Simulator**:
- If a `network` error occurs, the simulator automatically toggles on.
- Clicking the Microphone FAB will open a text box right above the button.
- Type any voice command (e.g., `"Add 2 bottles of water"`) and press **Say** to simulate speaking into the microphone.
- You can manually toggle this simulator inside the **Voice Settings** popup.

---

## 🚀 Running the Project

1. Clone or download the files.
2. Open [`index.html`](file:///d:/Semester/Placement%20Placement%202026%20-%202027/Unthinkable/index.html) in Google Chrome or Microsoft Edge.
3. Grant microphone permission.
4. Click the blue microphone button at the bottom center to start speaking (or typing via simulation mode).
