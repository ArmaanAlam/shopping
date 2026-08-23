// ShopVoice Application Code

// --- MOCK DATABASE ---
const PRODUCT_CATALOG = [
    { id: 1, name: "Organic Bananas", brand: "Earthbound Farms", price: 1.99, size: "1 bunch", category: "Produce" },
    { id: 2, name: "Avocados", brand: "Hass Organic", price: 1.25, size: "1 pc", category: "Produce" },
    { id: 3, name: "Baby Spinach", brand: "Earthbound Farms", price: 3.29, size: "5 oz", category: "Produce" },
    { id: 4, name: "Whole Milk", brand: "Organic Valley", price: 4.29, size: "2L", category: "Dairy" },
    { id: 5, name: "Cheddar Cheese Block", brand: "Tillamook", price: 5.49, size: "250g", category: "Dairy" },
    { id: 6, name: "Free Range Eggs", brand: "Happy Egg Co.", price: 4.99, size: "1 dozen", category: "Dairy" },
    { id: 7, name: "Greek Yogurt", brand: "Chobani Plain", price: 4.89, size: "500g", category: "Dairy" },
    { id: 8, name: "Sourdough Loaf", brand: "Artisan Bakery", price: 4.50, size: "1 pc", category: "Bakery" },
    { id: 9, name: "Chocolate Chip Cookies", brand: "Tate's Bake Shop", price: 3.99, size: "7 oz", category: "Snacks" },
    { id: 10, name: "Colgate Toothpaste", brand: "Colgate MaxFresh", price: 3.49, size: "6 oz", category: "Personal Care" },
    { id: 11, name: "Sensodyne Toothpaste", brand: "Sensodyne ProNamel", price: 6.99, size: "4 oz", category: "Personal Care" },
    { id: 12, name: "Almond Milk", brand: "Silk Unsweetened", price: 3.89, size: "1L", category: "Dairy" },
    { id: 13, name: "Oat Milk", brand: "Oatly Original", price: 4.79, size: "1L", category: "Dairy" },
    { id: 14, name: "Pasta Sauce", brand: "Rao's Homemade", price: 6.49, size: "24 oz", category: "Pantry" },
    { id: 15, name: "Spaghetti Pasta", brand: "Barilla", price: 1.89, size: "1 lb", category: "Pantry" },
    { id: 16, name: "Organic Peanut Butter", brand: "Justin's Classic", price: 5.49, size: "16 oz", category: "Pantry" },
    { id: 17, name: "Creamy Peanut Butter", brand: "Jif", price: 2.99, size: "16 oz", category: "Pantry" }
];

// --- APP STATE ---
let state = {
    shoppingList: [],
    language: "en-US",
    voiceFeedback: true,
    isListening: false,
    voiceSimulation: false
};

// Initial/default suggestions
const DEFAULT_SUGGESTIONS = [
    { id: "sug_milk", title: "Low on whole milk?", desc: "Usually bought every 7 days.", item: "Whole Milk", quantity: "2L", icon: "lightbulb", badge: "Pattern" },
    { id: "sug_peaches", title: "Peaches are in season", desc: "Local organic farm delivery.", item: "Fresh Peaches", quantity: "1 bag", icon: "eco", badge: "Seasonal" },
    { id: "sug_cookies", title: "Treat yourself?", desc: "Chocolate chip cookies are on sale.", item: "Chocolate Chip Cookies", quantity: "1 pack", icon: "restaurant", badge: "Sale" }
];

// Load settings and shopping list
function loadState() {
    const storedList = localStorage.getItem("shopvoice_list");
    if (storedList) {
        state.shoppingList = JSON.parse(storedList);
    } else {
        // Populate with mock initial items if empty, as per Stitch UI spec
        state.shoppingList = [
            { id: 101, name: "Organic Bananas", category: "Produce", quantity: "1 bunch", checked: false },
            { id: 102, name: "Avocados", category: "Produce", quantity: "4 pcs", checked: false },
            { id: 103, name: "Free Range Eggs", category: "Dairy", quantity: "1 dozen", checked: false },
            { id: 104, name: "Greek Yogurt", category: "Dairy", quantity: "500g", checked: true },
            { id: 105, name: "Sourdough Loaf", category: "Bakery", quantity: "1 pc", checked: false }
        ];
        saveState();
    }

    const storedLang = localStorage.getItem("shopvoice_lang");
    if (storedLang) {
        state.language = storedLang;
        document.getElementById("lang-select").value = storedLang;
    }

    const storedFeedback = localStorage.getItem("shopvoice_feedback");
    if (storedFeedback !== null) {
        state.voiceFeedback = storedFeedback === "true";
        document.getElementById("voice-feedback-toggle").checked = state.voiceFeedback;
    }

    const storedSim = localStorage.getItem("shopvoice_sim");
    if (storedSim !== null) {
        state.voiceSimulation = storedSim === "true";
        document.getElementById("voice-sim-toggle").checked = state.voiceSimulation;
    }
}

function saveState() {
    localStorage.setItem("shopvoice_list", JSON.stringify(state.shoppingList));
    localStorage.setItem("shopvoice_lang", state.language);
    localStorage.setItem("shopvoice_feedback", state.voiceFeedback);
    localStorage.setItem("shopvoice_sim", state.voiceSimulation);
}

// --- CATEGORIZATION ENGINE ---
function getCategory(itemName) {
    const name = itemName.toLowerCase();
    
    // Spanish translation hooks
    if (name.includes("leche") || name.includes("queso") || name.includes("mantequilla") || name.includes("yogur") || name.includes("huevo")) {
        return "Dairy";
    }
    // French translation hooks
    if (name.includes("lait") || name.includes("fromage") || name.includes("beurre") || name.includes("yaourt") || name.includes("oeuf")) {
        return "Dairy";
    }

    // Produce (fruits & vegetables)
    if (name.includes("banana") || name.includes("apple") || name.includes("peach") || name.includes("orange") || 
        name.includes("spinach") || name.includes("avocado") || name.includes("tomato") || name.includes("onion") || 
        name.includes("potato") || name.includes("berry") || name.includes("fruit") || name.includes("vegetable") || 
        name.includes("lettuce") || name.includes("lemon") || name.includes("lime") || name.includes("garlic") ||
        name.includes("plátano") || name.includes("manzana") || name.includes("durazno") || name.includes("aguacate") || // ES
        name.includes("pomme") || name.includes("pêche") || name.includes("avocat")) { // FR
        return "Produce";
    }

    // Dairy & Eggs
    if (name.includes("milk") || name.includes("cheese") || name.includes("butter") || name.includes("yogurt") || 
        name.includes("egg") || name.includes("cream") || name.includes("dairy") || name.includes("margarine")) {
        return "Dairy";
    }

    // Bakery
    if (name.includes("bread") || name.includes("sourdough") || name.includes("loaf") || name.includes("bagel") || 
        name.includes("croissant") || name.includes("bun") || name.includes("bakery") || name.includes("pastry") ||
        name.includes("pan") || name.includes("pain")) {
        return "Bakery";
    }

    // Snacks & Sweets
    if (name.includes("cookie") || name.includes("chip") || name.includes("cracker") || name.includes("chocolate") || 
        name.includes("candy") || name.includes("popcorn") || name.includes("snack") || name.includes("sweet") ||
        name.includes("galleta") || name.includes("biscuit")) {
        return "Snacks";
    }

    // Beverages
    if (name.includes("water") || name.includes("soda") || name.includes("coffee") || name.includes("tea") || 
        name.includes("juice") || name.includes("drink") || name.includes("beer") || name.includes("wine") || 
        name.includes("coke") || name.includes("pepsi") || name.includes("agua") || name.includes("café") ||
        name.includes("eau") || name.includes("café")) {
        return "Beverages";
    }

    // Personal Care & Household
    if (name.includes("toothpaste") || name.includes("soap") || name.includes("shampoo") || name.includes("brush") || 
        name.includes("paper") || name.includes("tissue") || name.includes("deodorant") || name.includes("detergent") ||
        name.includes("dentífrico") || name.includes("dentifrice")) {
        return "Personal Care";
    }

    // Pantry / Baking / Cooking staples
    if (name.includes("pasta") || name.includes("sauce") || name.includes("rice") || name.includes("oil") || 
        name.includes("flour") || name.includes("sugar") || name.includes("salt") || name.includes("beans") || 
        name.includes("canned") || name.includes("peanut butter") || name.includes("spice") || name.includes("vinegar")) {
        return "Pantry";
    }

    return "Miscellaneous";
}

// --- TEXT TO SPEECH (FEEDBACK) ---
function speak(text) {
    if (!state.voiceFeedback) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = state.language;
    utterance.rate = 1.0;
    
    // Select a suitable voice if available
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(state.language.split("-")[0]));
    if (voice) {
        utterance.voice = voice;
    }
    
    window.speechSynthesis.speak(utterance);
}

// --- DYNAMIC SUGGESTIONS GENERATOR ---
function getDynamicSuggestions() {
    let suggestions = [...DEFAULT_SUGGESTIONS];
    const listNames = state.shoppingList.map(item => item.name.toLowerCase());
    
    // 1. Substitutes Suggestions (e.g. user has Whole Milk -> suggest Almond/Oat Milk substitute)
    const hasMilk = listNames.some(name => name.includes("milk") && !name.includes("almond") && !name.includes("oat"));
    if (hasMilk) {
        suggestions.unshift({
            id: "sub_almond",
            title: "Prefer Almond Milk?",
            desc: "Healthy plant-based substitute recommendation.",
            item: "Almond Milk",
            quantity: "1L",
            icon: "swap_horiz",
            badge: "Substitute"
        });
    }

    // 2. Pairings / Recipe Suggestions (e.g. Pasta -> suggest Sauce)
    const hasPasta = listNames.some(name => name.includes("pasta") || name.includes("spaghetti"));
    const hasSauce = listNames.some(name => name.includes("sauce"));
    if (hasPasta && !hasSauce) {
        suggestions.unshift({
            id: "pair_sauce",
            title: "Need Pasta Sauce?",
            desc: "Complete your pasta recipe with tomato marinara.",
            item: "Pasta Sauce",
            quantity: "1 jar",
            icon: "restaurant",
            badge: "Recipe"
        });
    }

    // 3. Coffee pairings
    const hasCoffee = listNames.some(name => name.includes("coffee") || name.includes("café"));
    const hasOatMilk = listNames.some(name => name.includes("oat milk"));
    if (hasCoffee && !hasOatMilk) {
        suggestions.push({
            id: "pair_oat",
            title: "Add Oatly Oat Milk?",
            desc: "Goes perfectly with hot coffee.",
            item: "Oat Milk",
            quantity: "1L",
            icon: "local_cafe",
            badge: "Pairing"
        });
    }

    // Return unique suggestions
    return suggestions.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i).slice(0, 4);
}

// --- VOICE RECOGNITION (SPEECH TO TEXT) ---
let recognition = null;

function initVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn("Speech recognition is not supported in this browser.");
        document.getElementById("mic-hint-bubble").innerText = "Voice not supported in this browser";
        return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = state.language;

    recognition.onstart = () => {
        state.isListening = true;
        updateVoiceUI();
    };

    recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        const displayTranscript = finalTranscript || interimTranscript || "...";
        document.getElementById("voice-transcript").innerText = `"${displayTranscript}"`;
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'network') {
            showToast("Speech network error. Activating Offline Voice Simulator.");
            speak("Voice network offline. Simulator activated.");
            state.voiceSimulation = true;
            document.getElementById("voice-sim-toggle").checked = true;
            saveState();
            openVoiceSimulationPanel();
        } else {
            showToast(`Speech error: ${event.error}`);
        }
        state.isListening = false;
        updateVoiceUI();
    };

    recognition.onend = () => {
        state.isListening = false;
        updateVoiceUI();

        // Process transcription
        const finalVal = document.getElementById("voice-transcript").innerText.replace(/^"|"$/g, '').trim();
        if (finalVal && finalVal !== "...") {
            document.getElementById("voice-status-text").innerText = "Processing...";
            setTimeout(() => {
                parseVoiceCommand(finalVal);
                document.getElementById("voice-status-panel").classList.add("hidden");
            }, 1000);
        } else {
            document.getElementById("voice-status-panel").classList.add("hidden");
        }
    };
}

function openVoiceSimulationPanel() {
    const simPanel = document.getElementById("voice-sim-panel");
    simPanel.classList.remove("hidden");
    const input = document.getElementById("voice-sim-input");
    input.value = "";
    input.focus();
}

function toggleListening() {
    if (state.voiceSimulation) {
        openVoiceSimulationPanel();
        return;
    }

    if (!recognition) {
        initVoice();
        if (!recognition) {
            // Auto fallback if SpeechRecognition class not available at all
            state.voiceSimulation = true;
            document.getElementById("voice-sim-toggle").checked = true;
            saveState();
            openVoiceSimulationPanel();
            return;
        }
    }

    if (state.isListening) {
        recognition.stop();
    } else {
        recognition.lang = state.language;
        // Make sure settings values are in sync
        document.getElementById("voice-transcript").innerText = '"..."';
        document.getElementById("voice-status-panel").classList.remove("hidden");
        document.getElementById("voice-status-text").innerText = "Listening...";
        recognition.start();
    }
}

function updateVoiceUI() {
    const fab = document.getElementById("voice-fab");
    const icon = document.getElementById("mic-icon");
    const hint = document.getElementById("mic-hint-bubble");
    const statusPanel = document.getElementById("voice-status-panel");

    if (state.isListening) {
        fab.classList.add("glow-active", "bg-primary");
        fab.classList.remove("bg-primary-container");
        icon.innerText = "mic_off";
        hint.innerText = "Listening... click to stop";
        statusPanel.classList.remove("hidden");
    } else {
        fab.classList.remove("glow-active", "bg-primary");
        fab.classList.add("bg-primary-container");
        icon.innerText = "mic";
        hint.innerText = "Click to speak";
    }
}

// --- NATURAL LANGUAGE PROCESSING ENGINE (NLP) ---
function parseVoiceCommand(text) {
    const lower = text.toLowerCase().trim();
    console.log(`Analyzing Command: "${lower}"`);

    // --- 1. ENGLISH PARSING ---
    
    // Action: Read shopping list
    if (lower.match(/^(?:read|what is on|show|tell me)\s+(?:my list|shopping list|items)/)) {
        if (state.shoppingList.length === 0) {
            speak("Your shopping list is empty.");
            showToast("Your shopping list is empty");
        } else {
            const listStr = state.shoppingList.map(it => `${it.quantity || "some"} ${it.name}`).join(", ");
            speak(`You have the following items on your list: ${listStr}`);
            showToast("Reading shopping list");
        }
        return;
    }

    // Action: Clear shopping list
    if (lower.match(/^(?:clear|empty|delete)\s+(?:all|everything|my list|shopping list)/)) {
        clearList();
        speak("Cleared your shopping list.");
        showToast("Shopping list cleared");
        return;
    }

    // Action: Remove Item
    const removeMatch = lower.match(/^(?:remove|delete|discard|take off|clear)\s+(.+?)(?:\s+from\s+my\s+list)?$/);
    if (removeMatch) {
        const itemToRemove = removeMatch[1].trim();
        removeItemByName(itemToRemove);
        return;
    }

    // Action: Search and/or Price Filtering
    // e.g., "Find toothpaste under 5 dollars", "Search organic bananas", "show pasta under $10"
    const searchMatch = lower.match(/^(?:find|search|show|look for)\s+(.+?)(?:\s+(?:under|below|less than|for less than)\s+\$?(\d+(?:\.\d+)?)(?:\s+dollars)?)?$/);
    if (searchMatch) {
        const query = searchMatch[1].trim();
        const maxPrice = searchMatch[2] ? parseFloat(searchMatch[2]) : null;
        executeSearch(query, maxPrice);
        return;
    }

    // Action: Add Item (flexible phrases)
    // E.g., "Add 2 bottles of milk", "Get 3 packs of cookies", "I want to buy bread", "Add bananas to my list", "I need water"
    const addMatch = lower.match(/^(?:add|buy|get|need|put|want to buy)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)?\s*(?:packs|packages|bottles|cans|bags|bunches|bunch|pcs|kg|lbs|g|ml|l|items|item|dozen)?\s*(?:of)?\s*(.+?)(?:\s+to\s+my\s+list)?$/);
    if (addMatch) {
        const qtyWord = addMatch[1];
        const fullQtyPhrase = lower.split(addMatch[2])[0].replace(/^(?:add|buy|get|need|put|want to buy)\s*/, '').trim();
        const itemName = addMatch[2].trim();
        
        let qty = "1 item";
        if (qtyWord) {
            qty = fullQtyPhrase || qtyWord;
        }

        // Convert word numbers to digits for standard look
        const wordsToNum = { "one": "1", "two": "2", "three": "3", "four": "4", "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9", "ten": "10" };
        if (wordsToNum[qtyWord]) {
            qty = qty.replace(qtyWord, wordsToNum[qtyWord]);
        }

        addItem(itemName, qty);
        return;
    }

    // --- 2. MULTILINGUAL PARSING (SPANISH) ---
    if (state.language.startsWith("es")) {
        // E.g. "añadir leche", "quiero comprar 3 manzanas", "pon agua"
        const esAdd = lower.match(/^(?:añadir|agregar|poner|comprar|necesito|quiero)\s+(\d+)?\s*(.+?)(?:\s+a\s+mi\s+lista)?$/);
        if (esAdd) {
            const qty = esAdd[1] ? `${esAdd[1]} unidades` : "1 unidad";
            const item = esAdd[2].trim();
            addItem(item, qty);
            return;
        }
        
        // E.g. "quitar leche", "borrar manzanas"
        const esRemove = lower.match(/^(?:quitar|eliminar|borrar|sacar)\s+(.+?)$/);
        if (esRemove) {
            removeItemByName(esRemove[1].trim());
            return;
        }

        // E.g. "buscar dentífrico bajo 5 dólares"
        const esSearch = lower.match(/^(?:buscar|encuentra|mostrar)\s+(.+?)(?:\s+(?:por\s+menos\s+de|bajo|menos\s+de)\s+(\d+(?:\.\d+)?))?$/);
        if (esSearch) {
            const query = esSearch[1].trim();
            const maxPrice = esSearch[2] ? parseFloat(esSearch[2]) : null;
            executeSearch(query, maxPrice);
            return;
        }
    }

    // --- 3. MULTILINGUAL PARSING (FRENCH) ---
    if (state.language.startsWith("fr")) {
        // E.g. "ajouter du lait", "je veux acheter 3 pommes", "mets de l'eau"
        const frAdd = lower.match(/^(?:ajouter|acheter|mettre|besoin|veux)\s+(\d+)?\s*(?:de\s+la|du|des|de\s+l'|d')?\s*(.+?)(?:\s+à\s+ma\s+liste)?$/);
        if (frAdd) {
            const qty = frAdd[1] ? `${frAdd[1]} unités` : "1 unité";
            const item = frAdd[2].trim();
            addItem(item, qty);
            return;
        }
        
        // E.g. "retirer du lait", "supprimer pommes"
        const frRemove = lower.match(/^(?:retirer|supprimer|enlever|effacer)\s+(?:du|de\s+la|des)?\s*(.+?)$/);
        if (frRemove) {
            removeItemByName(frRemove[1].trim());
            return;
        }

        // E.g. "chercher dentifrice sous 5 euros"
        const frSearch = lower.match(/^(?:chercher|trouve|affiche)\s+(.+?)(?:\s+(?:sous|moins\s+de)\s+(\d+(?:\.\d+)?))?$/);
        if (frSearch) {
            const query = frSearch[1].trim();
            const maxPrice = frSearch[2] ? parseFloat(frSearch[2]) : null;
            executeSearch(query, maxPrice);
            return;
        }
    }

    // --- FALLBACK ---
    // If no complex verb is matched, treat the whole phrase as a generic add item command
    addItem(text, "1 item");
}

// --- SHOPPING LIST ACTIONS ---
function addItem(name, quantity) {
    // Capitalize first letter
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    const category = getCategory(formattedName);
    
    // Check if item already exists in shoppingList
    const existing = state.shoppingList.find(it => it.name.toLowerCase() === formattedName.toLowerCase() && !it.checked);
    
    if (existing) {
        existing.quantity = quantity;
        showToast(`Updated ${formattedName} quantity to ${quantity}`);
        speak(`Updated ${formattedName} quantity to ${quantity}`);
    } else {
        const newItem = {
            id: Date.now(),
            name: formattedName,
            category: category,
            quantity: quantity,
            checked: false
        };
        state.shoppingList.push(newItem);
        showToast(`Added ${formattedName} to ${category}`);
        speak(`Added ${formattedName} to ${category}`);
    }
    
    saveState();
    renderShoppingList();
    renderSuggestions();
}

function removeItem(id) {
    const item = state.shoppingList.find(it => it.id === id);
    if (item) {
        state.shoppingList = state.shoppingList.filter(it => it.id !== id);
        showToast(`Removed ${item.name}`);
        speak(`Removed ${item.name}`);
        saveState();
        renderShoppingList();
        renderSuggestions();
    }
}

function removeItemByName(name) {
    const lowerName = name.toLowerCase().trim();
    const matched = state.shoppingList.find(it => it.name.toLowerCase().includes(lowerName) && !it.checked);
    
    if (matched) {
        removeItem(matched.id);
    } else {
        showToast(`Could not find "${name}" to remove`);
        speak(`I couldn't find ${name} on your shopping list.`);
    }
}

function toggleItemChecked(id) {
    const item = state.shoppingList.find(it => it.id === id);
    if (item) {
        item.checked = !item.checked;
        saveState();
        renderShoppingList();
    }
}

function clearList() {
    state.shoppingList = [];
    saveState();
    renderShoppingList();
    renderSuggestions();
}

// --- SEARCH CATALOG ENGINE ---
function executeSearch(query, maxPrice) {
    const lowerQ = query.toLowerCase().trim();
    console.log(`Executing Catalog Search: query="${lowerQ}", maxPrice=${maxPrice}`);

    // Filter product catalog
    let results = PRODUCT_CATALOG.filter(prod => 
        prod.name.toLowerCase().includes(lowerQ) || 
        prod.brand.toLowerCase().includes(lowerQ) ||
        prod.category.toLowerCase().includes(lowerQ)
    );

    // Apply price filter
    if (maxPrice !== null) {
        results = results.filter(prod => prod.price <= maxPrice);
    }

    const resultsSection = document.getElementById("search-results-section");
    const resultsList = document.getElementById("search-results-list");
    resultsList.innerHTML = "";

    if (results.length === 0) {
        resultsList.innerHTML = `<p class="col-span-2 text-on-surface-variant text-sm py-4 italic">No catalog items matching "${query}"${maxPrice ? ` under $${maxPrice}` : ''} found.</p>`;
        speak(`Sorry, I couldn't find any products matching ${query}.`);
    } else {
        results.forEach(prod => {
            const card = document.createElement("div");
            card.className = "bg-surface-container border border-surface-container-highest hover:border-primary rounded-xl p-3 flex justify-between items-center transition-all duration-200";
            card.innerHTML = `
                <div>
                    <h4 class="font-bold text-on-surface text-sm">${prod.name}</h4>
                    <p class="text-xs text-on-surface-variant">${prod.brand} • ${prod.size}</p>
                </div>
                <div class="flex items-center gap-3">
                    <span class="font-label-sm text-label-sm font-bold text-primary">$${prod.price.toFixed(2)}</span>
                    <button class="bg-black hover:bg-primary text-white rounded-full p-1.5 flex items-center justify-center transition-colors shadow-sm active:scale-95 duration-100" title="Add to list">
                        <span class="material-symbols-outlined text-sm">add</span>
                    </button>
                </div>
            `;
            
            // Wire add button
            card.querySelector("button").addEventListener("click", () => {
                addItem(prod.name, prod.size);
            });

            resultsList.appendChild(card);
        });

        const feedbackMsg = `Found ${results.length} products for ${query}${maxPrice ? ` under ${maxPrice} dollars` : ''}.`;
        speak(feedbackMsg);
    }

    resultsSection.classList.remove("hidden");
    
    // Smooth scroll to search results
    resultsSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// --- RENDER FUNCTIONS ---

function renderShoppingList() {
    const listContainer = document.getElementById("shopping-list-container");
    const itemsCount = document.getElementById("items-count");
    listContainer.innerHTML = "";

    if (state.shoppingList.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-12 bg-white border border-surface-container-highest rounded-2xl flex flex-col items-center gap-3">
                <span class="material-symbols-outlined text-outline-variant text-5xl">shopping_cart_checkout</span>
                <p class="text-on-surface-variant font-medium">Your shopping list is empty</p>
                <p class="text-xs text-text-muted">Tap the mic button and say "Add milk" to start your list!</p>
            </div>
        `;
        itemsCount.innerText = "0 items";
        return;
    }

    // Update item total count (exclude checked ones or total?)
    const totalCount = state.shoppingList.length;
    itemsCount.innerText = `${totalCount} item${totalCount !== 1 ? 's' : ''}`;

    // Group items by category
    const categoriesMap = {};
    state.shoppingList.forEach(item => {
        if (!categoriesMap[item.category]) {
            categoriesMap[item.category] = [];
        }
        categoriesMap[item.category].push(item);
    });

    // Render categorized lists
    Object.keys(categoriesMap).sort().forEach(cat => {
        const catSection = document.createElement("div");
        catSection.className = "bg-white border border-surface-container-highest rounded-2xl p-4 shadow-sm flex flex-col gap-4";
        
        // Category Header
        const catIcons = {
            "Produce": "eco",
            "Dairy": "egg_alt",
            "Bakery": "bakery_dining",
            "Pantry": "lunch_dining",
            "Snacks": "cookie",
            "Beverages": "local_cafe",
            "Personal Care": "soap",
            "Miscellaneous": "receipt_long"
        };
        const icon = catIcons[cat] || "receipt_long";

        catSection.innerHTML = `
            <h3 class="font-label-sm text-label-sm uppercase text-on-surface-variant tracking-widest flex items-center gap-2 border-b border-surface-container-low pb-2">
                <span class="material-symbols-outlined text-sm text-primary">${icon}</span> ${cat}
            </h3>
            <div class="flex flex-col gap-3"></div>
        `;

        const itemsBox = catSection.querySelector("div");

        // Render category items
        categoriesMap[cat].forEach(item => {
            const itemRow = document.createElement("div");
            itemRow.className = `border border-surface-container-highest rounded-lg p-3 flex items-center justify-between transition-all duration-200 cursor-pointer group ${item.checked ? 'bg-surface-container-low opacity-60' : 'bg-surface-container-lowest hover:border-on-surface'}`;
            
            itemRow.innerHTML = `
                <div class="flex items-center gap-4 flex-1">
                    <button class="w-6 h-6 rounded-full border-2 ${item.checked ? 'bg-primary border-primary text-white' : 'border-outline-variant group-hover:border-primary'} flex items-center justify-center transition-all duration-200 focus:outline-none">
                        ${item.checked ? '<span class="material-symbols-outlined text-sm font-bold">check</span>' : ''}
                    </button>
                    <span class="font-medium ${item.checked ? 'line-through text-on-surface-variant' : ''}">${item.name}</span>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-on-surface-variant bg-surface-container py-1 px-3 rounded-full text-xs font-semibold ${item.checked ? 'line-through' : ''}">${item.quantity}</span>
                    <button class="delete-btn text-outline-variant hover:text-error transition-colors p-1 flex items-center justify-center rounded-full hover:bg-surface-container" title="Delete item">
                        <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                </div>
            `;

            // Toggle Checked state
            itemRow.querySelector("div.flex-1").addEventListener("click", (e) => {
                e.stopPropagation();
                toggleItemChecked(item.id);
            });

            // Delete item action
            itemRow.querySelector(".delete-btn").addEventListener("click", (e) => {
                e.stopPropagation();
                removeItem(item.id);
            });

            itemsBox.appendChild(itemRow);
        });

        listContainer.appendChild(catSection);
    });
}

function renderSuggestions() {
    const container = document.getElementById("suggestions-carousel");
    container.innerHTML = "";
    
    const activeSuggestions = getDynamicSuggestions();

    activeSuggestions.forEach(sug => {
        const card = document.createElement("div");
        card.className = "snap-start shrink-0 w-64 bg-surface-container-lowest border border-surface-container-highest rounded-xl p-4 flex flex-col gap-3 hover:border-on-surface transition-all duration-200 group cursor-pointer shadow-sm";
        
        card.innerHTML = `
            <div class="flex items-center gap-2 text-primary">
                <span class="material-symbols-outlined text-sm font-bold">${sug.icon}</span>
                <span class="font-label-sm text-label-sm uppercase tracking-wider">${sug.badge}</span>
            </div>
            <div class="flex-1">
                <h3 class="font-bold text-on-surface text-sm">${sug.title}</h3>
                <p class="text-on-surface-variant text-xs mt-1">${sug.desc}</p>
            </div>
            <button class="bg-black text-white hover:bg-primary rounded-full py-2 px-4 w-full font-label-sm text-label-sm flex items-center justify-center gap-2 transition-colors duration-150 active:scale-95">
                <span class="material-symbols-outlined text-sm">add</span> Add to list
            </button>
        `;

        // Click to add
        card.querySelector("button").addEventListener("click", (e) => {
            e.stopPropagation();
            addItem(sug.item, sug.quantity);
        });
        
        card.addEventListener("click", () => {
            addItem(sug.item, sug.quantity);
        });

        container.appendChild(card);
    });
}

// --- UTILITY TOAST ---
let toastTimeout = null;
function showToast(message) {
    const toast = document.getElementById("toast");
    const toastText = document.getElementById("toast-text");

    toastText.innerText = message;
    toast.classList.remove("opacity-0", "pointer-events-none");
    toast.classList.add("opacity-100");

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.add("opacity-0", "pointer-events-none");
        toast.classList.remove("opacity-100");
    }, 3000);
}

// --- SETUP EVENT LISTENERS ---
document.addEventListener("DOMContentLoaded", () => {
    loadState();
    initVoice();

    // Render Initial UI
    renderShoppingList();
    renderSuggestions();

    // Voice FAB Event
    document.getElementById("voice-fab").addEventListener("click", toggleListening);

    // Text Input Form Submission
    document.getElementById("text-input-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("text-input");
        const val = input.value.trim();
        if (val) {
            parseVoiceCommand(val);
            input.value = "";
        }
    });

    // Close voice status panel manually
    document.getElementById("voice-close-panel").addEventListener("click", () => {
        if (state.isListening && recognition) {
            recognition.stop();
        }
        document.getElementById("voice-status-panel").classList.add("hidden");
    });

    // Clear List Button
    document.getElementById("clear-list-btn").addEventListener("click", () => {
        if (confirm("Are you sure you want to clear your shopping list?")) {
            clearList();
            showToast("Cleared shopping list");
        }
    });

    // Close Search Results Button
    document.getElementById("close-search-results").addEventListener("click", () => {
        document.getElementById("search-results-section").classList.add("hidden");
    });

    // Help Modal Open / Close
    const helpModal = document.getElementById("help-modal");
    document.getElementById("help-btn").addEventListener("click", () => {
        helpModal.classList.remove("hidden");
        setTimeout(() => helpModal.classList.remove("opacity-0"), 10);
    });
    document.getElementById("close-help").addEventListener("click", () => {
        helpModal.classList.add("opacity-0");
        setTimeout(() => helpModal.classList.add("hidden"), 300);
    });

    // Settings Modal Open / Close
    const settingsModal = document.getElementById("settings-modal");
    document.getElementById("settings-btn").addEventListener("click", () => {
        settingsModal.classList.remove("hidden");
        setTimeout(() => settingsModal.classList.remove("opacity-0"), 10);
    });
    document.getElementById("close-settings").addEventListener("click", () => {
        settingsModal.classList.add("opacity-0");
        setTimeout(() => settingsModal.classList.add("hidden"), 300);
    });

    // Settings language listener
    document.getElementById("lang-select").addEventListener("change", (e) => {
        state.language = e.target.value;
        saveState();
        showToast(`Language changed to ${e.target.selectedOptions[0].text}`);
    });

    // Voice Feedback Toggle
    document.getElementById("voice-feedback-toggle").addEventListener("change", (e) => {
        state.voiceFeedback = e.target.checked;
        saveState();
        showToast(state.voiceFeedback ? "Voice feedback enabled" : "Voice feedback muted");
    });

    // Test Voice Synthesis
    document.getElementById("test-voice-btn").addEventListener("click", () => {
        if (state.language.startsWith("es")) {
            speak("Hola, soy tu asistente de compras ShopVoice. ¿Qué te gustaría comprar hoy?");
        } else if (state.language.startsWith("fr")) {
            speak("Bonjour, je suis votre assistant d'achat ShopVoice. Qu'aimeriez-vous acheter aujourd'hui?");
        } else {
            speak("Hello! I am your ShopVoice shopping assistant. What would you like to buy today?");
        }
    });

    // Voice Simulation Toggle
    document.getElementById("voice-sim-toggle").addEventListener("change", (e) => {
        state.voiceSimulation = e.target.checked;
        saveState();
        showToast(state.voiceSimulation ? "Voice Simulation enabled" : "Voice Simulation disabled");
        if (!state.voiceSimulation) {
            document.getElementById("voice-sim-panel").classList.add("hidden");
        }
    });

    // Close voice simulation panel
    document.getElementById("voice-sim-close").addEventListener("click", () => {
        document.getElementById("voice-sim-panel").classList.add("hidden");
    });

    // Submit voice simulation
    const submitSim = () => {
        const input = document.getElementById("voice-sim-input");
        const val = input.value.trim();
        if (val) {
            const statusPanel = document.getElementById("voice-status-panel");
            const transcript = document.getElementById("voice-transcript");
            const statusText = document.getElementById("voice-status-text");

            statusPanel.classList.remove("hidden");
            statusText.innerText = "Simulating voice input...";
            transcript.innerText = `"${val}"`;

            document.getElementById("voice-sim-panel").classList.add("hidden");

            setTimeout(() => {
                statusText.innerText = "Processing...";
                setTimeout(() => {
                    parseVoiceCommand(val);
                    statusPanel.classList.add("hidden");
                }, 800);
            }, 800);
        }
    };

    document.getElementById("voice-sim-submit").addEventListener("click", submitSim);
    document.getElementById("voice-sim-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            submitSim();
        }
    });
});
