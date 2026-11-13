# The Emerald Blood animation pool: two standard sheets. Row order and frame counts are fixed.
LIFE = [  # front/back/side views for the overworld + talking
  ('IDLE (front)', [('idle', 4)]),
  ('WALK (front | back)', [('walk_down', 4), ('walk_up', 4)]),
  ('WALK (side, facing right)', [('walk_side', 6)]),
  ('EMOTES', [('em_talk', 1), ('em_nod', 1), ('em_laugh', 1), ('em_angry', 1), ('em_sad', 1), ('em_shock', 1)]),
  ('GESTURES', [('g_point', 1), ('g_wave', 1), ('g_bow', 1), ('g_cross', 1), ('g_kneel', 1), ('g_sit', 1)]),
  ('WORK LOOP', [('work', 4)]),
]
BATTLE = [  # side view, facing right
  ('COMBAT IDLE', [('combat', 4)]),
  ('LIGHT COMBO', [('light', 4)]),
  ('HEAVY / THRUST', [('heavy', 4)]),
  ('SPECIAL', [('special', 4)]),
  ('GUARD | PARRY | DODGE', [('guard', 1), ('parry', 1), ('dodge', 2)]),
  ('HURT | KO | VICTORY', [('hurt', 2), ('ko', 2), ('victory', 2)]),
]
SUB = {'em_talk': 'talk', 'em_nod': 'nod', 'em_laugh': 'laugh', 'em_angry': 'angry', 'em_sad': 'sad', 'em_shock': 'shock',
       'g_point': 'point', 'g_wave': 'wave', 'g_bow': 'bow', 'g_cross': 'arms crossed', 'g_kneel': 'kneel', 'g_sit': 'sit'}

# 12 × 12 sheets (2026-11-11, Chat C): every row is 12 frames. Same order as the prompts in SPRITES.md.
BATTLE12 = [  # people: heroes, rivals, human bosses — side view facing right
  ('STANCE', [('combat', 12)]),
  ('ADVANCE', [('walk', 6), ('run', 6)]),
  ('DRAW', [('draw', 6), ('taunt', 6)]),
  ('COMBO A', [('cmbA', 12)]),
  ('COMBO B', [('cmbB', 12)]),
  ('HEAVY', [('heavy', 12)]),
  ('THRUST / RANGED', [('thrust', 12)]),
  ('SIGNATURE ART', [('special', 12)]),
  ('GUARD & PARRY', [('guard', 3), ('parry', 3), ('pparry', 6)]),
  ('DODGE', [('dodge', 4), ('pdodge', 8)]),
  ('HURT & KO', [('hurt', 4), ('ko', 4), ('rise', 4)]),
  ('JUMP & VICTORY', [('jump', 3), ('land', 3), ('victory', 6)]),
]
MONSTER12 = [  # monsters and monster bosses — side view facing right
  ('IDLE', [('combat', 12)]),
  ('PROWL', [('walk', 6), ('run', 6)]),
  ('LIGHT ATTACK', [('light', 12)]),
  ('COMBO', [('combo', 12)]),
  ('HEAVY ATTACK', [('heavy', 12)]),
  ('LUNGE', [('lunge', 12)]),
  ('SPECIAL', [('special', 12)]),
  ('ROAR / CAST', [('roar', 12)]),
  ('BRACE & DEFLECT', [('guard', 12)]),
  ('EVADE', [('dodge', 12)]),
  ('HURT & KO', [('hurt', 4), ('ko', 8)]),
  ('RAGE', [('enraged', 6), ('desperate', 6)]),
]

# 7 × 7 sheets (2026-11-12, owner: quality over quantity). Row 3 is Ren's DRAW; everyone else draws their own style's OPENER there.
BATTLE7 = [
  ('STANCE', [('combat', 7)]),
  ('ADVANCE', [('run', 7)]),
  ('DRAW / OPENER', [('opener', 7)]),
  ('COMBO', [('combo', 7)]),
  ('SIGNATURE ART', [('special', 7)]),
  ('GUARD & DODGE', [('guard', 3), ('dodge', 4)]),
  ('HURT, KO & VICTORY', [('hurt', 2), ('ko', 3), ('victory', 2)]),
]
MONSTER7 = [
  ('IDLE', [('combat', 7)]),
  ('PROWL', [('run', 7)]),
  ('ATTACK', [('light', 7)]),
  ('HEAVY', [('heavy', 7)]),
  ('SPECIAL', [('special', 7)]),
  ('BRACE & EVADE', [('guard', 3), ('dodge', 4)]),
  ('HURT, KO & RAGE', [('hurt', 2), ('ko', 3), ('enraged', 2)]),
]

# 7 × 7 MOVEMENT sheet (2026-11-12): real walk and run cycles for the overworld. Stored with the life frames.
MOVE7 = [
  ('WALK DOWN', [('walk_down', 7)]),
  ('WALK UP', [('walk_up', 7)]),
  ('WALK SIDE', [('walk_side', 7)]),
  ('RUN DOWN', [('run_down', 7)]),
  ('RUN UP', [('run_up', 7)]),
  ('RUN SIDE', [('run_side', 7)]),
  ('IDLE', [('idle', 3), ('idle_up', 2), ('idle_side', 2)]),
]
