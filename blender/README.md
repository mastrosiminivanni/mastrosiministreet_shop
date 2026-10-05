# Il furgone 3D (Blender)

> Oggi il sito usa la **foto vera** del furgone con le ruote che girano (`scripts/prepare-van-photo.mjs`,
> `scripts/make-wheels.mjs`). Il modello qui sotto è solo uno strumento: se in `public/models/van.glb`
> c'è un modello 3D, il sito lo usa al posto della foto (es. un modello professionale con la livrea applicata).

Il modello in `public/models/van.glb` è generato da script, quindi si può rigenerare e modificare.

## Rigenerare

```bash
export PATH=$HOME/.local/node/bin:$PATH
node blender/livery/render-livery.mjs        # texture della livrea (logo, pennellate oro, scritta)
~/Applications/Blender.app/Contents/MacOS/Blender -b --python blender/build_van.py -- --render
```

Escono: `public/models/van.glb` (usato dal sito), `blender/furgone.blend` (da aprire in Blender) e
`blender/render/furgone-render.png` (render fotografico con sfondo trasparente).

## Cosa modificare e dove

- **Forma del furgone**: `PROFILE` in `build_van.py` (sagoma laterale in metri) e, con gli stessi numeri,
  in `livery/render-livery.mjs`. Ruote: `AXLES`, `WHEEL_R`.
- **Livrea**: posizione di logo, scritta e pennellate in `livery/render-livery.mjs` (coordinate in metri).
- **A mano in Blender**: apri `furgone.blend`, modifica, poi *File → Export → glTF 2.0 (.glb)* su
  `public/models/van.glb`, selezionando solo l'oggetto "Furgone" e i suoi figli.

## Regole per il sito

- Le ruote devono restare oggetti separati con nome che inizia per `Ruota_` e l'origine al centro:
  il sito le fa girare in base allo spazio percorso.
- Il muso punta verso +X, le ruote poggiano a quota 0, il retro è a x = 0.
- Se `van.glb` manca, il sito mostra la foto del furgone (`public/brand/furgone.webp`).
