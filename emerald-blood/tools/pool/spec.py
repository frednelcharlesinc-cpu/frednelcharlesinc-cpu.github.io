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
