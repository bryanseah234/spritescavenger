import os
import json
import shutil

# --- CONFIGURATION ---
# Where are your icons right now? (Can be a messy folder or nested folders)
SOURCE_DIR = './512' 

# Where do you want the clean folders?
DEST_DIR = './public/icons'

# The Map we just generated
JSON_FILE = 'sorted_game_data.json'

def organize_files():
    # 1. Load the Map
    try:
        with open(JSON_FILE, 'r') as f:
            game_data = json.load(f)
    except FileNotFoundError:
        print(f"❌ Error: {JSON_FILE} not found.")
        return

    # 2. Index the Source Files (Speed Optimization)
    # Instead of searching the hard drive for every single item, 
    # we make a dictionary of { "filename_no_ext": "full_path" } first.
    print(f"🔍 Indexing files in {SOURCE_DIR}...")
    file_index = {}
    
    for root, dirs, files in os.walk(SOURCE_DIR):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg')):
                # Key = "red-apple", Value = "./chaos/food/red-apple.png"
                name_no_ext = os.path.splitext(file)[0]
                file_index[name_no_ext] = os.path.join(root, file)

    print(f"📂 Found {len(file_index)} distinct files.")

    # 3. The Great Migration
    moved_count = 0
    missing_count = 0
    
    # Create Base Dir
    if not os.path.exists(DEST_DIR):
        os.makedirs(DEST_DIR)

    for category, slugs in game_data.items():
        # Create Category Folder (e.g., ./public/icons/Creatures)
        cat_path = os.path.join(DEST_DIR, category)
        if not os.path.exists(cat_path):
            os.makedirs(cat_path)
            
        print(f"Processing {category}...")
        
        for slug in slugs:
            # We look for the slug in our index
            # The slug in JSON might be "red-apple", we match it to "red-apple.png"
            src_path = file_index.get(slug)
            
            if src_path:
                # Get the actual filename extension from the source
                extension = os.path.splitext(src_path)[1]
                dest_path = os.path.join(cat_path, slug + extension)
                
                # Copy the file (Use shutil.move if you want to delete source)
                shutil.copy2(src_path, dest_path)
                moved_count += 1
            else:
                missing_count += 1
                # Optional: print missing files
                # print(f"  ⚠️ Missing: {slug}")

    # 4. Final Report
    print("-" * 30)
    print("✅ MIGRATION COMPLETE")
    print("-" * 30)
    print(f"📦 Files Moved: {moved_count}")
    print(f"👻 Files Missing: {missing_count} (Check JSON vs Filenames)")
    print(f"📂 Output Location: {os.path.abspath(DEST_DIR)}")

if __name__ == "__main__":
    organize_files()