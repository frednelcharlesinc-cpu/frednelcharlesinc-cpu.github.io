#!/usr/bin/env python3
"""Lightweight file claims between the two Emerald Blood chats.
   claim.py take <file...> --who A|B [--min 45]   claim.py release <file...> --who A|B   claim.py list"""
import json, os, sys, time, fcntl
P = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.claims.json')
args = sys.argv[1:]; who = args[args.index('--who') + 1] if '--who' in args else '?'
mins = float(args[args.index('--min') + 1]) if '--min' in args else 45
files = [a for i, a in enumerate(args[1:], 1) if not a.startswith('--') and args[i - 1] not in ('--who', '--min')]
with open(P + '.lock', 'w') as lk:
    fcntl.flock(lk, fcntl.LOCK_EX)
    C = json.load(open(P)) if os.path.exists(P) else {}
    now = time.time(); C = {f: c for f, c in C.items() if c['until'] > now}
    cmd = args[0] if args else 'list'
    if cmd == 'take':
        bad = [f for f in files if f in C and C[f]['who'] != who]
        if bad: print('HELD BY THE OTHER CHAT:', ', '.join(f'{f} ({C[f]["who"]}, {int((C[f]["until"] - now) / 60)} min left)' for f in bad)); sys.exit(1)
        for f in files: C[f] = {'who': who, 'until': now + mins * 60}
        print('claimed:', ', '.join(files))
    elif cmd == 'release':
        for f in files:
            if f in C and C[f]['who'] == who: del C[f]
        print('released:', ', '.join(files))
    for f, c in sorted(C.items()): print(f'  {f:40s} {c["who"]}  {int((c["until"] - now) / 60)} min')
    json.dump(C, open(P, 'w'))
