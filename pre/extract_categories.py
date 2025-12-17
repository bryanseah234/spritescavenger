import json
import re

# --- CONFIGURATION ---
INPUT_FILE = 'slugs_checkpoint.txt'
OUTPUT_FILE = 'sorted_game_data.json'

# --- DEFINITIONS ---

# 1. The Target Categories
CATEGORIES = {
    "Creatures": [],
    "Food & Beverages": [],
    "Tools & Technology": [],
    "Nature": [],
    "Structures": [],
    "Apparel & Accessories": [],
    "Vehicles": [],
    "Art & Culture": [],
    "Mystery Items": [] 
}

# 2. Priority 1: STRICT Matches (Override everything else)
# If a word appears here, it forces the item into this category immediately.
FORCE_MAP = {
    "Food & Beverages": [
        "apple", "banana", "burger", "pizza", "sushi", "cake", "pie", "tart", 
        "cookie", "bread", "toast", "soup", "stew", "salad", "rice", "noodle", 
        "pasta", "meat", "beef", "pork", "chicken", "steak", "sausage", "ham",
        "fish-cooked", "salmon-filet", "sashimi", "taco", "burrito", "nacho",
        "cheese", "butter", "cream", "milk", "egg", "tea", "coffee", "latte",
        "espresso", "juice", "soda", "coke", "pepsi", "wine", "beer", "ale",
        "cocktail", "liquor", "vodka", "whiskey", "potion", "flask-drink",
        "fruit", "berry", "grape", "melon", "lemon", "lime", "orange", "pear",
        "peach", "plum", "cherry", "strawberry", "raspberry", "blueberry",
        "vegetable", "carrot", "corn", "potato", "tomato", "onion", "garlic",
        "pepper-food", "salt", "sugar", "spice", "herb", "sauce", "ketchup",
        "mustard", "mayo", "oil-cooking", "chocolate", "candy", "sweet",
        "gummy", "jelly", "jam", "honey", "syrup", "snack", "chip", "popcorn",
        "cracker", "biscuit", "donut", "muffin", "bagel", "croissant", "waffle",
        "pancake", "ice-cream", "sorbet", "yogurt", "smoothie", "shake"
    ],
    "Tools & Technology": [
        "tool", "hammer", "screw", "wrench", "saw", "drill", "axe", "hatchet",
        "shovel", "rake", "hoe", "pickaxe", "spade", "trowel", "pliers", "clamp",
        "sword", "shield", "dagger", "knife-weapon", "bow-weapon", "arrow",
        "spear", "staff", "wand", "armor", "helmet-combat", "gun", "pistol",
        "rifle", "ammo", "bullet", "bomb", "grenade", "trap", "net", "cage",
        "fishing-rod", "bait", "hook", "phone", "mobile", "cell", "computer",
        "laptop", "tablet", "monitor", "keyboard", "mouse-tech", "camera",
        "lens", "tripod", "radio", "tv", "television", "speaker", "headphone",
        "earbud", "mic", "microphone", "console", "controller", "gameboy",
        "robot", "drone", "cyborg", "android", "battery", "charger", "cable",
        "wire", "plug", "socket", "switch", "bulb", "lamp", "torch", "lantern",
        "flashlight", "fan", "heater", "ac-unit", "fridge", "oven", "stove",
        "microwave", "toaster", "blender", "mixer", "scale", "ruler", "compass",
        "clock", "watch-tech", "calculator", "money", "coin", "cash", "credit",
        "card", "wallet-tech", "key", "lock", "padlock", "soap", "shampoo",
        "lotion", "cream-skin", "perfume", "cologne", "makeup", "lipstick",
        "mascara", "eyeliner", "blush", "powder-face", "nail-polish", "brush",
        "comb", "mirror", "razor", "shaver", "toothbrush", "toothpaste", "floss",
        "towel", "sponge", "broom", "mop", "bucket", "trash", "bin", "recycle",
        "sport", "ball", "bat", "racket", "club", "puck", "skate", "ski",
        "snowboard", "surfboard", "dumbbell", "weight", "gym", "treadmill"
    ],
    "Apparel & Accessories": [
        "shirt", "t-shirt", "tee", "top", "blouse", "sweater", "sweatshirt",
        "hoodie", "jacket", "coat", "vest", "parka", "blazer", "suit", "tuxedo",
        "dress", "gown", "skirt", "pant", "trouser", "jean", "denim", "short",
        "legging", "tigh", "sock", "shoe", "sneaker", "boot", "sandal", "slipper",
        "flip-flop", "heel", "pump", "flat-shoe", "hat", "cap", "beanie", "fedora",
        "beret", "helmet-fashion", "scarf", "glove", "mitten", "belt", "tie",
        "bowtie", "watch-fashion", "jewelry", "ring", "necklace", "bracelet",
        "earring", "piercing", "gem", "diamond", "ruby", "emerald", "sapphire",
        "gold", "silver", "platinum", "purse", "handbag", "backpack", "totebag",
        "luggage", "suitcase", "umbrella", "glasses", "sunglasses", "mask-fashion",
        "costume", "uniform", "bikini", "swimsuit"
    ],
    "Structures": [
        "house", "home", "building", "apartment", "condo", "skyscraper", "tower",
        "castle", "palace", "fort", "bunker", "cabin", "cottage", "shack", "shed",
        "barn", "stable", "garage", "shop", "store", "market", "mall", "office",
        "school", "university", "college", "hospital", "clinic", "pharmacy",
        "station", "airport", "port", "harbor", "bridge", "tunnel", "dam",
        "monument", "statue-large", "fountain", "wall", "fence", "gate", "door",
        "window", "roof", "floor", "ceiling", "stairs", "ladder", "elevator",
        "room", "kitchen", "bedroom", "bathroom", "living-room", "hall", "furniture",
        "chair", "sofa", "couch", "seat", "bench", "stool", "table", "desk",
        "bed", "mattress", "pillow", "blanket", "cabinet", "cupboard", "shelf",
        "bookcase", "drawer", "wardrobe", "closet", "chest-furniture", "fireplace",
        "chimney", "toilet", "sink", "bathtub", "shower"
    ],
    "Vehicles": [
        "car", "auto", "truck", "pickup", "van", "bus", "taxi", "cab", "limo",
        "police-car", "ambulance", "firetruck", "motorcycle", "motorbike", "bike",
        "bicycle", "scooter", "moped", "skateboard", "rollerblade", "train",
        "subway", "metro", "tram", "locomotive", "wagon", "cart", "carriage",
        "boat", "ship", "vessel", "yacht", "ferry", "canoe", "kayak", "raft",
        "sailboat", "submarine", "airplane", "plane", "jet", "helicopter",
        "chopper", "drone-vehicle", "rocket", "spaceship", "ufo", "tire",
        "wheel", "engine", "motor", "steering-wheel"
    ],
    "Nature": [
        "tree", "pine", "oak", "maple", "palm", "plant", "bush", "shrub", "vine",
        "flower", "rose", "lily", "tulip", "daisy", "sunflower", "orchid",
        "cactus", "succulent", "grass", "turf", "leaf", "leaves", "branch",
        "twig", "log", "stump", "wood", "forest", "jungle", "swamp", "mountain",
        "hill", "cliff", "rock", "stone", "boulder", "pebble", "sand", "dirt",
        "soil", "mud", "earth", "ground", "water", "ocean", "sea", "lake",
        "pond", "river", "stream", "creek", "waterfall", "wave", "rain", "storm",
        "cloud", "fog", "mist", "snow", "ice", "hail", "sun", "moon", "star",
        "planet", "galaxy", "fire", "flame", "smoke", "ash", "volcano", "lava",
        "crystal", "gemstone-raw", "mineral", "ore"
    ],
    "Art & Culture": [
        "art", "painting", "drawing", "sketch", "sculpture-small", "statue-small",
        "canvas", "easel", "palette", "paint-tube", "music", "musical", "instrument",
        "guitar", "bass", "violin", "cello", "piano", "keyboard-music", "drum",
        "percussion", "flute", "trumpet", "sax", "horn", "microphone-stage",
        "book", "novel", "textbook", "scroll", "paper", "pen", "pencil", "ink",
        "marker", "crayon", "movie", "film", "cinema", "video", "theater",
        "ticket", "popcorn-movie", "trophy", "award", "medal", "ribbon", "flag",
        "banner", "sign", "symbol", "icon", "cross", "religious", "magic",
        "spell", "rune", "tarot"
    ]
}

# 3. Creatures Priority (Implicit)
# Matches broad animal terms, BUT ONLY if not caught by the FORCE_MAP above.
# This prevents "Hotdog" (Food) from becoming "Dog" (Creature).
CREATURE_KEYWORDS = [
    "animal", "creature", "beast", "monster", "pet", "wild", "zoo", "farm",
    "cat", "feline", "kitten", "dog", "canine", "puppy", "wolf", "fox", "bear",
    "panda", "lion", "tiger", "leopard", "cheetah", "panther", "jaguar",
    "horse", "pony", "donkey", "mule", "zebra", "cow", "cattle", "bull", "calf",
    "pig", "hog", "swine", "boar", "sheep", "lamb", "goat", "deer", "elk",
    "moose", "antelope", "camel", "llama", "alpaca", "giraffe", "elephant",
    "rhino", "hippo", "monkey", "ape", "gorilla", "chimp", "mouse", "rat",
    "hamster", "guinea", "rabbit", "bunny", "hare", "squirrel", "chipmunk",
    "beaver", "otter", "raccoon", "skunk", "badger", "hedgehog", "bat-animal",
    "bird", "avian", "eagle", "hawk", "falcon", "owl", "parrot", "penguin",
    "duck", "goose", "swan", "chicken-animal", "rooster", "hen", "turkey",
    "peacock", "flamingo", "crow", "raven", "pigeon", "dove", "sparrow",
    "robin", "hummingbird", "reptile", "snake", "python", "cobra", "viper",
    "lizard", "gecko", "iguana", "chameleon", "turtle", "tortoise", "crocodile",
    "alligator-animal", "dino", "dinosaur", "trex", "raptor", "dragon",
    "amphibian", "frog", "toad", "salamander", "fish", "shark", "whale",
    "dolphin", "seal", "walrus", "octopus", "squid", "crab", "lobster-animal",
    "shrimp", "jellyfish", "starfish", "insect", "bug", "ant", "bee", "wasp",
    "hornet", "fly", "mosquito", "butterfly", "moth", "beetle", "ladybug",
    "spider", "scorpion", "worm", "snail", "slug"
]

def sort_slugs():
    print(f"📂 Reading {INPUT_FILE}...")
    
    try:
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            slugs = [line.strip() for line in f if line.strip()]
    except FileNotFoundError:
        print(f"❌ Error: {INPUT_FILE} not found. Please create it first.")
        return

    print(f"🔍 Sorting {len(slugs)} items...")
    
    count = 0
    
    for slug in slugs:
        count += 1
        name = slug.lower().replace("-", " ").replace("_", " ")
        assigned = False

        # --- STEP 1: FORCE MAP (The "Waterfall") ---
        # Checks Food, Tools, etc. first to grab things like "Hotdog" or "Mouse (Computer)"
        for category, keywords in FORCE_MAP.items():
            # Check exact word matches to avoid "grape" matching "grapefruit" incorrectly (optional, but safer)
            # using regex for word boundaries
            for kw in keywords:
                # Regex: \b means "word boundary". So "bat" matches "baseball bat" but not "combat".
                if re.search(r'\b' + re.escape(kw) + r'\b', name): 
                    CATEGORIES[category].append(slug)
                    assigned = True
                    break
            if assigned: break
        
        if assigned: continue

        # --- STEP 2: CREATURE CHECK ---
        # If it wasn't food/tool/etc., is it an animal?
        for kw in CREATURE_KEYWORDS:
             if re.search(r'\b' + re.escape(kw) + r'\b', name):
                CATEGORIES["Creatures"].append(slug)
                assigned = True
                break
        
        if assigned: continue

        # --- STEP 3: LOOSE MATCH (The "Safety Net") ---
        # If strict word boundary failed, try loose substring matching 
        # (Be careful here, this is where "pant" finds "pantry")
        
        # We re-run the Force Map but without word boundaries if you want to be aggressive
        # For now, let's dump the rest into Mystery to be safe, 
        # OR you can enable "Aggressive Mode" by uncommenting below:
        
        # for category, keywords in FORCE_MAP.items():
        #     if any(kw in name for kw in keywords):
        #          CATEGORIES[category].append(slug)
        #          assigned = True
        #          break
        
        # --- STEP 4: MYSTERY ---
        CATEGORIES["Mystery Items"].append(slug)

    # --- FINAL WRITE ---
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(CATEGORIES, f, indent=2)

    print("\n✅ Sorting Complete!")
    print("-" * 30)
    for cat, items in CATEGORIES.items():
        print(f"  {cat.ljust(25)}: {len(items)}")
    print("-" * 30)
    print(f"💾 Saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    sort_slugs()