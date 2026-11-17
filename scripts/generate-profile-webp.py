from pathlib import Path
from PIL import Image

source = Path("Kalp Shah Profile Photo.png")
output = Path("public/Kalp-Shah-Profile-Photo.webp")
output.parent.mkdir(parents=True, exist_ok=True)

with Image.open(source) as original:
    original_size = original.size
    has_alpha = "A" in original.getbands()
    optimized = original.convert("RGBA" if has_alpha else "RGB")
    options = {"quality": 88, "method": 6}
    if original.info.get("icc_profile"):
        options["icc_profile"] = original.info["icc_profile"]
    if original.info.get("exif"):
        options["exif"] = original.info["exif"]
    optimized.save(output, "WEBP", **options)

with Image.open(output) as verified:
    if verified.size != original_size:
        raise SystemExit("WebP conversion changed the original image dimensions.")
    if verified.format != "WEBP":
        raise SystemExit("Generated profile image is not WebP.")

print(f"Dimensions preserved: {original_size[0]}x{original_size[1]}")
print(f"Original PNG: {source.stat().st_size:,} bytes")
print(f"Optimized WebP: {output.stat().st_size:,} bytes")
