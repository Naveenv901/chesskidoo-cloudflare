import shutil
import os

src_fide = r"D:\MY\ChessKiddo\src\assets\fide.jpeg"
src_iso = r"D:\MY\ChessKiddo\src\assets\iso.jpeg"
dest_dir = r"d:\MY\chessk\assets\img"

try:
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
    
    shutil.copy(src_fide, os.path.join(dest_dir, "fide.jpeg"))
    print(f"Successfully copied {src_fide}")
    
    shutil.copy(src_iso, os.path.join(dest_dir, "iso.jpeg"))
    print(f"Successfully copied {src_iso}")
except Exception as e:
    print(f"Error: {e}")
