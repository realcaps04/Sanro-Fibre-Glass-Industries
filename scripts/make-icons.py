from pathlib import Path
from PIL import Image

assets = Path(
    r"C:\Users\ASUS\.cursor\projects\c-Users-ASUS-OneDrive-Documents-1-coding-Sanro-fibre-glass-industries\assets"
)
public = Path(__file__).resolve().parents[1] / "public"
icons = public / "icons"
icons.mkdir(exist_ok=True)

icon = Image.open(assets / "app-icon-door.png").convert("RGBA")
side = min(icon.size)
left = (icon.width - side) // 2
top = (icon.height - side) // 2
icon = icon.crop((left, top, left + side, top + side))

targets = [
    (512, icons / "icon-512.png"),
    (192, icons / "icon-192.png"),
    (180, icons / "apple-touch-icon.png"),
    (64, public / "favicon.png"),
]
for size, dest in targets:
    out = icon.resize((size, size), Image.Resampling.LANCZOS)
    out.save(dest, format="PNG", optimize=True)
    print(dest.name, dest.stat().st_size)

splash = Image.open(assets / "splash-door.png").convert("RGB")
splash.thumbnail((1080, 1920), Image.Resampling.LANCZOS)
splash.save(public / "splash.png", format="PNG", optimize=True)
print("splash", splash.size, (public / "splash.png").stat().st_size)
