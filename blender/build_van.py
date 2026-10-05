"""
Furgone Mastrosimini Street Shop: modello 3D generato in Blender da script.

Esegui dalla cartella del progetto:
  node blender/livery/render-livery.mjs            # texture della livrea (solo se le hai cambiate)
  ~/Applications/Blender.app/Contents/MacOS/Blender -b --python blender/build_van.py -- --render

Produce:
  public/models/van.glb              -> caricato dal sito (le ruote sono nodi "Ruota_*" che il sito fa girare)
  blender/furgone.blend              -> da aprire in Blender per modificarlo a mano
  blender/render/furgone-render.png  -> (con --render) render fotografico, sfondo trasparente

Unità: metri. X = lunghezza (muso verso +X), Y = larghezza (lato passeggero verso -Y), Z = altezza.
Forme ispirate a un furgone tetto alto generico; nessun marchio di terzi.
"""

import math
import os
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
LIVERY = os.path.join(HERE, "livery")
OUT_GLB = os.path.join(REPO, "public", "models", "van.glb")
OUT_BLEND = os.path.join(HERE, "furgone.blend")
OUT_RENDER = os.path.join(HERE, "render", "furgone-render.png")

ARGS = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
DO_RENDER = "--render" in ARGS

# --- Dimensioni (le stesse di blender/livery/render-livery.mjs) ---
L = 5.92
HW = 1.0  # metà larghezza alla base
TOP = 2.70
BOTTOM = 0.38
# Sagoma laterale (x, z): retro, tetto alto, cappello sopra la cabina, parabrezza, cofano, frontale.
PROFILE = [
    (0.00, 0.40), (0.00, 2.62), (0.08, 2.70), (4.05, 2.70), (4.32, 2.62), (4.45, 2.45), (4.48, 2.20),
    (5.18, 1.32), (5.82, 1.08), (5.92, 0.95), (5.92, 0.40),
]
AXLES = (1.30, 4.95)
WHEEL_R = 0.36
WHEEL_Y = 0.86
ARCH_R = 0.47
ARCH_Z = 0.40
TUMBLE_FROM = 1.45  # sopra questa quota le fiancate rientrano verso il tetto
TUMBLE = 0.075      # rientro massimo (frazione della larghezza)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


# ---------- utilità ----------
def material(name, color, rough=0.5, metal=0.0, emission=None, strength=0.0, coat=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1.0)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    p.inputs["Coat Weight"].default_value = coat
    if emission:
        p.inputs["Emission Color"].default_value = (*emission, 1.0)
        p.inputs["Emission Strength"].default_value = strength
    return m


def livery_material(name, prefix):
    """Albedo + mappa ORM (G = ruvidità, B = metallo): l'oro esce metallico, il nero opaco."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
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


def link(ob, parent=None):
    scene.collection.objects.link(ob)
    if parent:
        ob.parent = parent
    return ob


def mesh_object(name, bm, mats, parent=None, location=(0, 0, 0)):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for m in mats:
        me.materials.append(m)
    ob = bpy.data.objects.new(name, me)
    ob.location = location
    return link(ob, parent)


def box(name, center, size, mat, parent, bevel=0.0):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector(size), verts=bm.verts)
    ob = mesh_object(name, bm, [mat], parent, center)
    if bevel:
        mod = ob.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 3
    return ob


def apply_modifiers(ob):
    bpy.context.view_layer.objects.active = ob
    for mod in list(ob.modifiers):
        bpy.ops.object.modifier_apply(modifier=mod.name)


def lathe(name, profile_ry, mat, parent, segments=48):
    """Solido di rotazione attorno all'asse Y (profilo in coppie raggio, y)."""
    bm = bmesh.new()
    verts = [bm.verts.new((r, y, 0.0)) for r, y in profile_ry]
    edges = [bm.edges.new((verts[i], verts[i + 1])) for i in range(len(verts) - 1)]
    bmesh.ops.spin(bm, geom=verts + edges, cent=(0, 0, 0), axis=(0, 1, 0),
                   angle=2 * math.pi, steps=segments, use_merge=True)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    ob = mesh_object(name, bm, [mat], parent)
    ob.data.shade_smooth()
    return ob


# ---------- materiali ----------
M_BODY = material("Carrozzeria", (0.006, 0.006, 0.006), rough=0.55)
M_PLASTIC = material("Plastica", (0.03, 0.03, 0.032), rough=0.8)
M_GLASS = material("Vetro", (0.008, 0.01, 0.013), rough=0.04, metal=0.3, coat=1.0)
M_CHROME = material("Cromo", (0.75, 0.75, 0.78), rough=0.18, metal=1.0)
M_HEAD = material("Fari", (0.85, 0.85, 0.8), rough=0.1, emission=(1.0, 0.95, 0.85), strength=2.0)
M_TAIL = material("Stop", (0.55, 0.02, 0.02), rough=0.25, emission=(0.9, 0.05, 0.03), strength=0.6)
M_TAIL_W = material("Retromarcia", (0.8, 0.8, 0.8), rough=0.2)
M_TYRE = material("Gomma", (0.018, 0.018, 0.018), rough=0.9)
M_RIM = material("Cerchio", (0.62, 0.63, 0.65), rough=0.35, metal=0.9)
M_HOLE = material("Foro", (0.01, 0.01, 0.01), rough=0.9)
M_LIV_R = livery_material("Livrea_destra", "lato-destro")
M_LIV_L = livery_material("Livrea_sinistra", "lato-sinistro")
M_LIV_B = livery_material("Livrea_retro", "retro")

root = link(bpy.data.objects.new("Furgone", None))

# ---------- carrozzeria: sagoma estrusa ----------
bm = bmesh.new()
a = [bm.verts.new((x, -HW, z)) for x, z in PROFILE]
b = [bm.verts.new((x, HW, z)) for x, z in PROFILE]
bm.faces.new(a)
bm.faces.new(list(reversed(b)))
for i in range(len(PROFILE)):
    j = (i + 1) % len(PROFILE)
    bm.faces.new((a[i], a[j], b[j], b[i]))
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

# Tagli orizzontali, poi le fiancate rientrano dolcemente verso il tetto.
for zc in (TUMBLE_FROM, 1.75, 2.0, 2.2, 2.4, 2.55):
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    bmesh.ops.bisect_plane(bm, geom=geom, plane_co=(0, 0, zc), plane_no=(0, 0, 1))
for v in bm.verts:
    if v.co.z > TUMBLE_FROM:
        t = (v.co.z - TUMBLE_FROM) / (TOP - TUMBLE_FROM)
        v.co.y *= 1 - TUMBLE * t ** 1.6
body = mesh_object("Carrozzeria", bm, [M_BODY, M_LIV_R, M_LIV_L, M_LIV_B, M_GLASS], root)

# Passaruota: tagli solo verso l'esterno (all'interno resta la parete del vano ruota).
for x in AXLES:
    for side in (-1, 1):
        bpy.ops.mesh.primitive_cylinder_add(
            radius=ARCH_R, depth=0.6, vertices=64,
            location=(x, side * (HW - 0.12), ARCH_Z), rotation=(math.pi / 2, 0, 0),
        )
        cutter = bpy.context.active_object
        mod = body.modifiers.new("Arco", "BOOLEAN")
        mod.operation = "DIFFERENCE"
        mod.solver = "EXACT"
        mod.object = cutter
        apply_modifiers(body)
        bpy.data.objects.remove(cutter, do_unlink=True)

bev = body.modifiers.new("Bevel", "BEVEL")
bev.width = 0.09
bev.segments = 5
bev.limit_method = "ANGLE"
bev.angle_limit = math.radians(40)
apply_modifiers(body)

# Materiali e UV per faccia: fiancate e retro prendono la livrea (proiezione piana), il parabrezza è vetro.
bm = bmesh.new()
bm.from_mesh(body.data)
uv = bm.loops.layers.uv.verify()
for f in bm.faces:
    n = f.normal
    c = f.calc_center_median()
    if n.y < -0.6:
        idx = 1
    elif n.y > 0.6:
        idx = 2
    elif n.x < -0.6:
        idx = 3
    elif n.x > 0.6 and n.z > 0.4 and c.z > 1.36 and c.x > 4.5:
        idx = 4
    else:
        idx = 0
    f.material_index = idx
    for loop in f.loops:
        x, y, z = loop.vert.co
        v = (z - BOTTOM) / (TOP - BOTTOM)
        u = {1: x / L, 2: 1 - x / L, 3: (HW - y) / (2 * HW)}.get(idx, x / L)
        loop[uv].uv = (u, v)
bm.to_mesh(body.data)
bm.free()
body.data.shade_smooth()
body.data.set_sharp_from_angle(angle=math.radians(30))

# ---------- frontale ----------
box("Paraurti_ant", (5.95, 0, 0.50), (0.18, 2.04, 0.26), M_PLASTIC, root, bevel=0.04)
box("Griglia", (5.935, 0, 0.80), (0.03, 0.95, 0.24), M_PLASTIC, root)
for i, z in enumerate((0.73, 0.80, 0.87)):
    box(f"Griglia_lista_{i}", (5.955, 0, z), (0.015, 0.92, 0.018), M_CHROME, root)
for s in (-1, 1):
    box(f"Faro_{s}", (5.86, s * 0.70, 1.0), (0.14, 0.40, 0.15), M_HEAD, root, bevel=0.02)
    box(f"Specchio_braccio_{s}", (4.85, s * 1.05, 1.72), (0.05, 0.16, 0.04), M_PLASTIC, root)
    box(f"Specchio_{s}", (4.85, s * 1.17, 1.70), (0.09, 0.09, 0.30), M_PLASTIC, root, bevel=0.025)
    box(f"Maniglia_{s}", (4.12, s * (HW + 0.004), 1.36), (0.18, 0.02, 0.04), M_PLASTIC, root)

# ---------- retro ----------
box("Paraurti_post", (-0.06, 0, 0.47), (0.16, 2.04, 0.18), M_PLASTIC, root, bevel=0.03)
box("Pedana", (-0.17, 0, 0.42), (0.22, 1.4, 0.06), M_PLASTIC, root, bevel=0.01)
for s in (-1, 1):
    box(f"Stop_{s}", (-0.012, s * 0.88, 1.12), (0.04, 0.15, 0.56), M_TAIL, root, bevel=0.01)
    box(f"Retro_{s}", (-0.013, s * 0.88, 0.80), (0.042, 0.15, 0.10), M_TAIL_W, root)

# porta scorrevole (lato passeggero): binario dietro la porta e maniglia
box("Binario_porta", (2.25, -HW - 0.004, 1.05), (0.95, 0.014, 0.025), M_CHROME, root)
box("Maniglia_scorrevole", (2.9, -HW - 0.004, 1.36), (0.18, 0.02, 0.04), M_PLASTIC, root)

# ---------- ruote: nodi "Ruota_*" con l'origine al centro; il sito le fa girare sul loro asse ----------
TYRE = [(0.235, -0.115), (0.30, -0.12), (0.34, -0.11), (0.358, -0.08), (0.362, 0.0),
        (0.358, 0.08), (0.34, 0.11), (0.30, 0.12), (0.235, 0.115)]


def wheel(name, x, s):
    """s = -1 lato destro (-Y), +1 lato sinistro."""
    w = link(bpy.data.objects.new(name, None), root)
    w.location = (x, s * WHEEL_Y, WHEEL_R)
    lathe(f"{name}_gomma", TYRE, M_TYRE, w)
    rim = [(0.236, -s * 0.10), (0.236, s * 0.095), (0.205, s * 0.105), (0.13, s * 0.08),
           (0.10, s * 0.11), (0.05, s * 0.118), (0.0, s * 0.118)]
    lathe(f"{name}_cerchio", rim, M_RIM, w)
    # fori del cerchio: rendono visibile la rotazione
    bm = bmesh.new()
    for k in range(6):
        ang = k * math.pi / 3
        ret = bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=0.028, radius2=0.028, depth=0.02)
        vs = ret["verts"]
        bmesh.ops.rotate(bm, verts=vs, cent=(0, 0, 0), matrix=Matrix.Rotation(math.pi / 2, 3, "X"))
        bmesh.ops.translate(bm, verts=vs, vec=(0.165 * math.cos(ang), s * 0.088, 0.165 * math.sin(ang)))
    mesh_object(f"{name}_fori", bm, [M_HOLE], w)


for x, tag in ((AXLES[0], "P"), (AXLES[1], "A")):
    wheel(f"Ruota_{tag}D", x, -1)
    wheel(f"Ruota_{tag}S", x, 1)

# ---------- export GLB ----------
bpy.ops.object.select_all(action="DESELECT")
for ob in [root, *root.children_recursive]:
    ob.select_set(True)
os.makedirs(os.path.dirname(OUT_GLB), exist_ok=True)
gltf = dict(filepath=OUT_GLB, export_format="GLB", use_selection=True, export_apply=True, export_yup=True)
try:
    bpy.ops.export_scene.gltf(**gltf, export_image_format="WEBP", export_image_quality=82)
except TypeError:
    bpy.ops.export_scene.gltf(**gltf)
print("GLB:", OUT_GLB, os.path.getsize(OUT_GLB) // 1024, "KB")

# ---------- set per il render (non esportato) ----------
target = link(bpy.data.objects.new("Mira", None))
target.location = (2.9, 0, 1.25)


def aim(ob):
    c = ob.constraints.new("TRACK_TO")
    c.target = target
    c.track_axis = "TRACK_NEGATIVE_Z"
    c.up_axis = "UP_Y"


cam = link(bpy.data.objects.new("Camera", bpy.data.cameras.new("Camera")))
cam.location = (-3.2, -8.4, 2.3)
cam.data.lens = 42
aim(cam)
scene.camera = cam


def area(name, loc, energy, size, color=(1, 1, 1)):
    lt = bpy.data.lights.new(name, "AREA")
    lt.energy = energy
    lt.size = size
    lt.color = color
    ob = link(bpy.data.objects.new(name, lt))
    ob.location = loc
    aim(ob)


area("Chiave", (1.0, -7.0, 6.0), 2200, 6, (1.0, 0.95, 0.88))
area("Contorno_oro", (7.5, 4.0, 3.5), 1500, 4, (1.0, 0.72, 0.36))
area("Riempimento", (-6.0, -1.5, 3.0), 600, 4)
area("Cielo", (3.0, 0.0, 8.0), 900, 9)

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
