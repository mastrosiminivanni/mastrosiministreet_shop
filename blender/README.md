# Il furgone 3D (Blender)

`public/models/van.glb` è un modello **Mercedes-Benz Sprinter tetto alto** (CC BY 4.0, vedi `../CREDITS.md`)
preparato da script: scala e orientamento giusti, marchi del costruttore tolti, ruote separate che girano,
livrea Mastrosimini applicata. Se il file manca, il sito mostra la foto del furgone.

## Rigenerare

```bash
export PATH=$HOME/.local/node/bin:$PATH
B=~/Applications/Blender.app/Contents/MacOS/Blender
$B -b --python blender/build_van.py -- --measure     # 1. misure -> blender/livery/geometry.json
node blender/livery/render-livery.mjs                 # 2. texture della livrea (logo, pennellate oro, scritta)
$B -b --python blender/build_van.py -- --render       # 3. modello finale + render fotografico
```

Escono: `public/models/van.glb` (compresso Draco; il decodificatore è in `public/draco/`), `blender/furgone.blend`
(da aprire in Blender per ritoccare a mano) e `blender/render/furgone-render.png` (sfondo trasparente).

## Cosa cambiare e dove

- **Livrea** (posizione di logo, scritta, pennellate oro): `livery/render-livery.mjs`, coordinate in metri sul furgone.
- **Quali parti** si tolgono o si coprono, **materiali**, ruote: `build_van.py`.
- **Modello di partenza**: `reference/sprinter/source/Mercedes-Benz Sprinter.blend`. Per usarne un altro, cambia `SRC` e
  adatta i nomi dei pezzi (gomme, cerchi, vernice) nello script.

## Regole per il sito

- Le ruote sono oggetti separati chiamati `Ruota_*` con l'origine al centro: il sito le fa girare in base allo spazio percorso.
- Muso verso +X, ruote che poggiano a quota 0, unità in metri.
