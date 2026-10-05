"""
Furgone Mastrosimini Street Shop: parte da un modello Sprinter tetto alto (CC-BY 4.0, vedi CREDITS) e lo prepara per il sito.

  1. misura la geometria e scrive blender/livery/geometry.json
       Blender -b --python blender/build_van.py -- --measure
  2. genera le texture della livrea (usa geometry.json)
       node blender/livery/render-livery.mjs
  3. costruisce il modello finale
       Blender -b --python blender/build_van.py -- --render        (--render = anche il render fotografico)

Cosa fa: da pollici a metri, muso verso +X, toglie le stelle del costruttore (nessun marchio di terzi),
fonde ogni ruota in un solo oggetto "Ruota_*" con l'origine al centro (il sito la fa girare),
copre il finestrino laterale destro (nella vostra foto il furgone è cieco), applica la livrea.

Esce: public/models/van.glb, blender/furgone.blend, (con --render) blender/render/furgone-render.png.
Unità: metri. X = lunghezza (muso verso +X), Y = larghezza (lato destro del furgone = -Y), Z = altezza.
"""

import json
import math
import os
import re
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
SRC = os.path.join(REPO, "reference", "sprinter", "source", "Mercedes-Benz Sprinter.blend")
LIVERY = os.path.join(HERE, "livery")
GEOMETRY = os.path.join(LIVERY, "geometry.json")
OUT_GLB = os.path.join(REPO, "public", "models", "van.glb")
OUT_BLEND = os.path.join(HERE, "furgone.blend")
OUT_RENDER = os.path.join(HERE, "render", "furgone-render.png")

ARGS = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
MEASURE = "--measure" in ARGS
DO_RENDER = "--render" in ARGS

INCH = 0.0254
# pollici -> metri, poi ruota di 90° attorno a Z: il muso (-Y nel modello originale) va su +X.
M_FIX = Matrix.Rotation(math.radians(90), 4, "Z") @ Matrix.Scale(INCH, 4)

bpy.ops.wm.open_mainfile(filepath=SRC)
scene = bpy.context.scene


# ---------- utilità ----------
def key_of(o):
    m = re.match(r"Mesh\d+ AM98_001_ambulance_eu_(.+?) (?:Group\d+ )?Model", o.name)
    return m.group(1) if m else o.name


def bounds(objs):
    mn = Vector((1e9,) * 3)
    mx = Vector((-1e9,) * 3)
    for o in objs:
        for v in o.data.vertices:
            for i in range(3):
                mn[i] = min(mn[i], v.co[i])
                mx[i] = max(mx[i], v.co[i])
    return mn, mx


def material(name, color, rough=0.5, metal=0.0, emission=None, strength=0.0, coat=0.0, alpha=1.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1.0)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    p.inputs["Coat Weight"].default_value = coat
    p.inputs["Alpha"].default_value = alpha
    if emission:
        p.inputs["Emission Color"].default_value = (*emission, 1.0)
        p.inputs["Emission Strength"].default_value = strength
    return m


def livery_material(name, prefix):
    """Albedo + mappa ORM (G = ruvidità, B = metallo): l'oro esce metallico, il nero opaco."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    if MEASURE:
        return m
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    col = nt.nodes.new("ShaderNodeTexImage")
    col.image = bpy.data.images.load(os.path.join(LIVERY, f"{prefix}-colore.png"))
    col.interpolation = "Cubic"
    orm = nt.nodes.new("ShaderNodeTexImage")
    orm.image = bpy.data.images.load(os.path.join(LIVERY, f"{prefix}-orm.png"))
    orm.image.colorspace_settings.name = "Non-Color"
    sep = nt.nodes.new("ShaderNodeSeparateColor")
    nt.links.new(col.outputs["Color"], p.inputs["Base Color"])
    nt.links.new(orm.outputs["Color"], sep.inputs["Color"])
    nt.links.new(sep.outputs["Green"], p.inputs["Roughness"])
    nt.links.new(sep.outputs["Blue"], p.inputs["Metallic"])
    return m


def select_only(objs):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]


def join(objs, name):
    select_only(objs)
    bpy.ops.object.join()
    ob = bpy.context.active_object
    ob.name = name
    ob.data.name = name
    return ob


# ---------- 1. normalizza: metri, muso a +X, tolgo le stelle ----------
meshes = [o for o in bpy.data.objects if o.type == "MESH"]
for o in list(meshes):
    if o.name.startswith(("Mesh319 ", "Mesh320 ")):  # stella Mercedes: griglia e portellone
        bpy.data.objects.remove(o, do_unlink=True)
        meshes.remove(o)
for o in meshes:
    if o.data.users > 1:
        o.data = o.data.copy()
    o.data.transform(M_FIX @ o.matrix_world)
    o.parent = None
    o.matrix_world = Matrix.Identity(4)

by_key = {}
for o in meshes:
    by_key.setdefault(key_of(o), []).append(o)

# ---------- ruote: gomma + cerchio + coprimozzo + freno, per posizione ----------
tires = [o for k, v in by_key.items() if k.startswith("tire_fr") for o in v]
wheel_parts = [o for k, v in by_key.items() if re.match(r"(tire|rim|rim_cap|brake)_fr\d*$", k) for o in v]
centers = []
for t in tires:
    mn, mx = bounds([t])
    centers.append(((mn + mx) / 2, (mx.z - mn.z) / 2))
centers.sort(key=lambda c: (c[0].y, -c[0].x))  # lato destro (-Y) prima; muso (+X) prima
wheel_names = ["Ruota_AD", "Ruota_PD", "Ruota_AS", "Ruota_PS"]  # A anteriore, P posteriore, D destra, S sinistra
groups = {n: [] for n in wheel_names}
for o in wheel_parts:
    mn, mx = bounds([o])
    c = (mn + mx) / 2
    best = min(range(4), key=lambda i: (centers[i][0].x - c.x) ** 2 + (centers[i][0].y - c.y) ** 2)
    groups[wheel_names[best]].append(o)

wheel_info = {}
for i, name in enumerate(wheel_names):
    center, radius = centers[i]
    wheel_info[name] = {"x": center.x, "y": center.y, "z": center.z, "r": radius}

# ---------- carrozzeria ----------
paint = [o for k in ("carpaint_frontback", "carpaint_sides") for o in by_key.get(k, [])]
pmn, pmx = bounds(paint)
win = by_key["side_window"][0]
wmn, wmx = bounds([win])
cabwin = bounds(by_key["windows"])
rear_windows = []
for o in by_key["back_window"]:
    rmn, rmx = bounds([o])
    rear_windows.append({"x": rmn.x, "ymin": rmn.y, "ymax": rmx.y, "zmin": rmn.z, "zmax": rmx.z})
geometry = {
    "body": {"xmin": pmn.x, "xmax": pmx.x, "zmin": pmn.z, "zmax": pmx.z, "ymin": pmn.y, "ymax": pmx.y},
    "wheels": wheel_info,
    "cabWindow": {"xmin": cabwin[0].x, "xmax": cabwin[1].x, "zmin": cabwin[0].z, "zmax": cabwin[1].z},
    "rearWindows": rear_windows,
    "slidingWindow": {"xmin": wmn.x, "xmax": wmx.x, "zmin": wmn.z, "zmax": wmx.z, "y": wmn.y},
    "windshield": dict(zip(("min", "max"), [list(v) for v in bounds(by_key["windshield"])])),
}
with open(GEOMETRY, "w") as f:
    json.dump(geometry, f, indent=2)
print("GEOMETRY:", GEOMETRY)
print(json.dumps(geometry, indent=1))
if MEASURE:
    sys.exit(0)

# ---------- materiali ----------
M_PAINT = material("Vernice", (0.006, 0.006, 0.006), rough=0.55)
M_PLASTIC = material("Plastica", (0.03, 0.03, 0.032), rough=0.8)
M_DARK = material("Griglia", (0.012, 0.012, 0.014), rough=0.6)
M_GLASS = material("Vetro", (0.006, 0.008, 0.011), rough=0.04, metal=0.2, coat=1.0)
M_CHROME = material("Cromo", (0.75, 0.75, 0.78), rough=0.18, metal=1.0)
M_HEAD = material("Fari", (0.85, 0.85, 0.8), rough=0.1, emission=(1.0, 0.95, 0.85), strength=1.2)
M_TAIL = material("Stop", (0.32, 0.008, 0.008), rough=0.25, emission=(0.8, 0.03, 0.02), strength=0.2)
M_TYRE = material("Gomma", (0.018, 0.018, 0.018), rough=0.9)
M_RIM = material("Cerchio", (0.62, 0.63, 0.65), rough=0.38, metal=0.9)
M_BRAKE = material("Freno", (0.18, 0.18, 0.19), rough=0.5, metal=0.8)
M_LIV_R = livery_material("Livrea_destra", "lato-destro")
M_LIV_L = livery_material("Livrea_sinistra", "lato-sinistro")
M_LIV_B = livery_material("Livrea_retro", "retro")

MAT_BY_KEY = {
    "black_plastic": M_PLASTIC, "black_metal": M_PLASTIC, "glass_black": M_DARK,
    "chrome": M_CHROME, "chrome_stripes": M_CHROME, "chrome_stripes3": M_CHROME,
    "chrome_squares": M_CHROME, "chrome_squares1": M_CHROME,
    "windows": M_GLASS, "windshield": M_GLASS, "mirror_blinker_glass": M_GLASS,
    "mirror_blinker": M_PLASTIC,
    "headlights_glass": M_HEAD, "headlights_glass1": M_HEAD,
    "taillight_glass": M_TAIL, "taillight_glass1": M_TAIL, "light_red": M_TAIL,
}

root = bpy.data.objects.new("Furgone", None)
scene.collection.objects.link(root)

# ---------- 2. pezzi fissi -> un solo oggetto "Dettagli" ----------
for o in by_key.get("interior", []) + by_key.get("side_window", []) + by_key.get("back_window", []):
    bpy.data.objects.remove(o, do_unlink=True)  # finestrini cancellati: si chiudono con una toppa verniciata
by_key.pop("back_window", None)
fixed = []
for k, v in by_key.items():
    if k in ("carpaint_frontback", "carpaint_sides", "interior", "side_window") or re.match(r"(tire|rim|rim_cap|brake)_fr\d*$", k):
        continue
    for o in v:
        o.data.materials.clear()
        o.data.materials.append(MAT_BY_KEY.get(k, M_PLASTIC))
        fixed.append(o)
details = join(fixed, "Dettagli")
details.parent = root
bpy.ops.object.shade_smooth()
details.data.set_sharp_from_angle(angle=math.radians(35))

# ---------- 3. ruote: un oggetto per ruota, origine al centro ----------
WHEEL_MATS = {"tire": M_TYRE, "rim": M_RIM, "rim_cap": M_RIM, "brake": M_BRAKE}
for name, parts in groups.items():
    for o in parts:
        o.data.materials.clear()
        o.data.materials.append(WHEEL_MATS[re.match(r"(tire|rim_cap|rim|brake)", key_of(o)).group(1)])
    w = join(parts, name)
    w.parent = root
    c = wheel_info[name]
    scene.cursor.location = (c["x"], c["y"], c["z"])
    select_only([w])
    bpy.ops.object.origin_set(type="ORIGIN_CURSOR")
    bpy.ops.object.shade_smooth()
    w.data.set_sharp_from_angle(angle=math.radians(35))

# ---------- 4. carrozzeria con livrea (UV piane per fiancata) ----------
def quad_patch(name, pts):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bm.faces.new([bm.verts.new(v) for v in pts])
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    scene.collection.objects.link(ob)
    return ob


# Il vetro del portellone scorrevole (lato destro) e i due finestrini posteriori non ci sono nella vostra foto:
# li chiudo con una toppa sul piano del vetro, che prende la livrea.
sw = geometry["slidingWindow"]
patches = [quad_patch("Toppa_scorrevole", (
    (sw["xmin"], sw["y"], sw["zmin"]), (sw["xmax"], sw["y"], sw["zmin"]),
    (sw["xmax"], sw["y"], sw["zmax"]), (sw["xmin"], sw["y"], sw["zmax"]),
))]
for i, rw in enumerate(geometry["rearWindows"]):
    patches.append(quad_patch(f"Toppa_retro_{i}", (
        (rw["x"], rw["ymax"], rw["zmin"]), (rw["x"], rw["ymin"], rw["zmin"]),
        (rw["x"], rw["ymin"], rw["zmax"]), (rw["x"], rw["ymax"], rw["zmax"]),
    )))

body = join(paint + patches, "Carrozzeria")
body.parent = root
body.data.materials.clear()
for m in (M_PAINT, M_LIV_R, M_LIV_L, M_LIV_B):
    body.data.materials.append(m)

b = geometry["body"]
bm = bmesh.new()
bm.from_mesh(body.data)
bm.normal_update()
uv = bm.loops.layers.uv.verify()
L = b["xmax"] - b["xmin"]
H = b["zmax"] - b["zmin"]
for f in bm.faces:
    n = f.normal
    if n.y < -0.55:
        slot = 1
    elif n.y > 0.55:
        slot = 2
    elif n.x < -0.55:
        slot = 3
    else:
        slot = 0
    f.material_index = slot
    for loop in f.loops:
        p = loop.vert.co
        v = (p.z - b["zmin"]) / H
        if slot == 1:
            u = (p.x - b["xmin"]) / L  # lato destro: muso a destra
        elif slot == 2:
            u = 1 - (p.x - b["xmin"]) / L  # lato sinistro visto da fuori: muso a sinistra
        elif slot == 3:
            u = (b["ymax"] - p.y) / (b["ymax"] - b["ymin"])  # retro visto da dietro
        else:
            u = 0.0
        loop[uv].uv = (u, v)
bm.to_mesh(body.data)
bm.free()
select_only([body])
bpy.ops.object.shade_smooth()
body.data.set_sharp_from_angle(angle=math.radians(30))

# ---------- export GLB ----------
bpy.ops.object.select_all(action="DESELECT")
for ob in [root, *root.children_recursive]:
    ob.select_set(True)
os.makedirs(os.path.dirname(OUT_GLB), exist_ok=True)
gltf = dict(
    filepath=OUT_GLB, export_format="GLB", use_selection=True, export_apply=True, export_yup=True,
    export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
    export_draco_position_quantization=14, export_draco_normal_quantization=10, export_draco_texcoord_quantization=12,
    export_image_format="WEBP", export_image_quality=80,
)
bpy.ops.export_scene.gltf(**gltf)
print("GLB:", OUT_GLB, os.path.getsize(OUT_GLB) // 1024, "KB")

# ---------- set per il render (non esportato) ----------
target = bpy.data.objects.new("Mira", None)
scene.collection.objects.link(target)
target.location = (0.0, 0.0, 1.2)


def aim(ob):
    c = ob.constraints.new("TRACK_TO")
    c.target = target
    c.track_axis = "TRACK_NEGATIVE_Z"
    c.up_axis = "UP_Y"


cam = bpy.data.objects.new("Camera", bpy.data.cameras.new("Camera"))
scene.collection.objects.link(cam)
cam.location = (-8.0, -8.5, 2.3)
cam.data.lens = 42
aim(cam)
scene.camera = cam


def area(name, loc, energy, size, color=(1, 1, 1)):
    lt = bpy.data.lights.new(name, "AREA")
    lt.energy = energy
    lt.size = size
    lt.color = color
    ob = bpy.data.objects.new(name, lt)
    scene.collection.objects.link(ob)
    ob.location = loc
    aim(ob)


area("Chiave", (-3.0, -8.0, 6.0), 2200, 6, (1.0, 0.95, 0.88))
area("Contorno_oro", (8.0, 5.0, 3.5), 1500, 4, (1.0, 0.72, 0.36))
area("Riempimento", (-9.0, 1.0, 3.0), 600, 4)
area("Cielo", (0.0, 0.0, 8.0), 900, 9)

bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, 0))
floor = bpy.context.active_object
floor.name = "Pavimento"
floor.is_shadow_catcher = True

world = bpy.data.worlds.new("Mondo")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.03, 0.03, 0.032, 1)
scene.world = world

scene.render.engine = "CYCLES"
scene.cycles.samples = 160
scene.cycles.use_denoising = True
scene.render.film_transparent = True
scene.render.resolution_x = 1800
scene.render.resolution_y = 1150
try:
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Punchy"
except TypeError:
    pass
try:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    prefs.get_devices()
    for dev in prefs.devices:
        dev.use = True
    scene.cycles.device = "GPU"
except Exception as e:  # CPU come ripiego
    print("GPU non disponibile:", e)

bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND)
print("BLEND:", OUT_BLEND)

if DO_RENDER:
    os.makedirs(os.path.dirname(OUT_RENDER), exist_ok=True)
    scene.render.filepath = OUT_RENDER
    bpy.ops.render.render(write_still=True)
    print("RENDER:", OUT_RENDER)
