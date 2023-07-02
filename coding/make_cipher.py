#!/usr/bin/env python3

from random import choices, seed, randrange

seed(2023)

cipher = 's[aq]u2[02]3{[Tekq]U_[Pr]oc[ess_p]racti]ce_p[r_term]p[ral}'

if __name__ == '__main__':
    # { } A*3 a*16 0*4 [ [ [ [ ] ] ] ] _ _ _
    L = '{' * 26 + '}' * 26 + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' * 3 + 'abcdefghijklmnopqrstuvwxyz' * 16 + '0123456789' * 10 + '[' * 104 + ']' * 104 + '_' * 78
    N = 16384
    x = randrange(N)
    with open('cipher.txt', 'w+') as f:
        for i in range(N):
            seg = choices(L, k = 100)
            if i == x:
                j = randrange(100 - len(cipher))
                seg[j : j + len(cipher)] = cipher
            print(''.join(seg), file = f)
