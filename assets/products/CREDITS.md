# Product image credits

_Updated Oct 19, 2026. The composite mud-flap images and the AI "studio" shots were replaced with real CC0 photos, using the same filenames and sizes. The old files are in `_retired/` (and `../_retired/` for the homepage hero and flap close-up). Nothing was deleted._

Every image is a real photograph. There are **no AI images and no compositing**: no products or logos are pasted onto anything.
Edits: crop, a light contrast grade, a soft vignette, light sharpening, and a resize to 1600/1200/600. Some files also had other companies' names, plates or stickers removed with a feathered inpaint or same-photo patch and matched grain (see the notes below).
Where a license requires it, attribution appears in the site footer ("Photo credits", `index.html`). The CC BY-SA files are adapted, so our cropped versions are also offered under CC BY-SA 3.0.

| Files | Source | Author | License |
|---|---|---|---|
| mud-flaps-{1600,1200,600}.jpg, mud-flaps-detail1-{1600,1200,600}.jpg, collection-banner-2400x800.jpg, ../hero-2400.jpg, ../hero-1280.jpg | https://commons.wikimedia.org/wiki/File:Grain_hopper_trailer_Timpte_02.jpg | Wikideas1 | CC0 1.0, https://creativecommons.org/publicdomain/zero/1.0/ |
| mud-flaps-detail2-{1600,1200,600}.jpg, air-brake-coils-studio-{1600,1200,600}.jpg, ../flap-closeup.jpg | https://commons.wikimedia.org/wiki/File:Old_silver_colored_Volvo_truck.JPG | Alf van Beem | CC0 1.0 |
| led-marker-lights-studio-{1600,1200,600}.jpg (bumper with amber marker lights) | https://commons.wikimedia.org/wiki/File:Peterbilt_379.JPG | Impale | CC0 1.0 |
| ratchet-straps-studio-{1600,1200,600}.jpg (two linked strap hooks) | https://commons.wikimedia.org/wiki/File:Hooks_of_a_tie_down_strap_hooked_together.jpg | HobbyAstronaut | CC0 1.0 |
| ratchet-straps-{1600,1200,600}.jpg | https://commons.wikimedia.org/wiki/File:Spanngurt.jpg | HobbyAstronaut | CC0 1.0 |
| led-marker-lights-{1600,1200,600}.jpg | https://www.flickr.com/photos/98027690@N00/2644008029 ("Teardrop marker light") | dwstucke | CC BY 2.0, https://creativecommons.org/licenses/by/2.0/ (**credited in the site footer**) |
| led-marker-lights-detail1-*.jpg | https://www.flickr.com/photos/98027690@N00/2626906332 ("new marker light") | dwstucke | CC BY 2.0 (**credited in the site footer**) |
| led-marker-lights-detail2-*.jpg (crop of tractor rear lights) | https://commons.wikimedia.org/wiki/File:Ryder_Freightliner_Columbia_pic3.jpg | MobiusDaXter | CC BY-SA 3.0, https://creativecommons.org/licenses/by-sa/3.0/ (**credited in the site footer**) |
| air-brake-coils-{1600,1200,600}.jpg (crop) | https://commons.wikimedia.org/wiki/File:Ryder_Freightliner_Columbia_pic3.jpg | MobiusDaXter | CC BY-SA 3.0 (**credited in the site footer**) |
| gladhands-{1600,1200,600}.jpg (tight crop of the original, 1340 px square at (2200,8054)-(3650,9504), light shadow lift), gladhands-detail1-{1600,1200,600}.jpg (the earlier wider crop) | https://commons.wikimedia.org/wiki/File:Atlas_Soldiers_Conduct_Vehicle_Recovery_Operation_(8949833).jpg (original: https://www.dvidshub.net/image/8949833, VIRIN 250321-A-OT885-2944) | U.S. Army photo by Sgt. James Lefty Larimer | Public domain (PD-USGov-Military-Army). No endorsement by the U.S. Army or DoD is implied. |

Site footer credit line (now in `index.html`):
"Photo credits: Wikideas1, Alf van Beem, Impale and HobbyAstronaut (CC0, via Wikimedia Commons); "Teardrop marker light" and "new marker light" by dwstucke (CC BY 2.0); "Ryder Freightliner Columbia pic3" by MobiusDaXter (CC BY-SA 3.0; our crops are shared under the same license); U.S. Army photo by Sgt. James Lefty Larimer (public domain). Photos are cropped and edited, and they're illustrative: no endorsement is implied." Each title and license is linked.

## Edit notes for the new files
- **Grain hopper trailer (Timpte 02):**
  - **Removed:** the dealer name and graphic on both mud flaps (rebuilt from the flap's own rubber), the licence plate and the trailer maker's decal on the bumper, two inspection stickers, a white label, and a red unit number. These were patched from clean areas of the same photo, level-matched, feathered, with grain kept.
  - **Cropped out:** the maker's badge at the top of the rear frame and a small corner decal. Every crop starts below y=1360 of the original.
  - **Crops (original pixels):**
    - mud-flaps: (330,1360)-(1500,2530)
    - detail1: (650,1650)-(1530,2530)
    - banner: (0,1700)-(2490,2530)
    - hero: (200,1360)-(1955,2530)
  - Upscale to 1600 px: 1.37× for mud-flaps, 1.82× for detail1.
- **Volvo tractor (Alf van Beem):**
  - **Removed:** the maker's name moulded into the left rear flap (rebuilt from the flap's own rubber, with matched grain).
  - **Crops:**
    - detail2: (1250,1800)-(2850,3400), native 1600 px
    - flap-closeup: (1250,2250)-(2850,3310)
    - air-brake-coils-studio: (1460,1100)-(2160,1800). This is a 2.29× upscale, so it's a little soft at 1600 px.
  - **Kept out of every crop:** the museum's other trucks and trailers with company lettering, and a speed-limit disc. The tyre sidewall's moulded maker text is faint and black-on-black, and was left as is.
  - The coiled lines in the coils shot have no couplings (gladhands) in frame.
- **Peterbilt 379:** the grille badge was removed and the plate rebuilt blank (the same clean file as the Instagram set). Crop (1420,860)-(2380,1820).
- **Strap hooks:** no edits apart from the crop (1539,0)-(3069,1530) and the grade.
- **Gladhands** were left unchanged, as an existing real PD photo. No new gladhand image was added.
- Build script: `brand/instagram/realphoto-2026-10-19/_src/site_assets.py`. The cleaned masters and masks are in that `_src/clean` and `_src/masks` folder.

## Retired (in `_retired/`, not deleted)
- `mud-flaps-*`, `mud-flaps-detail1/2-*`, `collection-banner-2400x800.jpg`, and `../_retired/hero-2400.jpg`, `hero-1280.jpg`, `flap-closeup.jpg`: Fleet United logo flaps composited onto "Highway 5" (Carlos ZGZ, CC0).
- `led-marker-lights-studio-*`, `ratchet-straps-studio-*`, `air-brake-coils-studio-*`: AI-generated (Higgsfield) studio shots.

## Shop branch notes (Oct 19, 2026)
- `gladhands-*` is now a tighter crop taken from the full-resolution Commons original so the coupling heads, seals and red/blue grips fill more of the tile. The earlier, wider crop is kept as `gladhands-detail1-*` (second gallery photo).
- `air-brake-coils-studio-*` is not used on the shop: the black coils in that photo can't be confirmed as air lines (black coils are often the electrical cord), so it stays off the listing until checked.
- No `_retired/` or AI-generated files are in this repo.
