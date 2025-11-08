import sys
input = sys.stdin.readline
A, B = map(int,input().split())

A_list = set(map(int, input().split()))
B_list = set(map(int, input().split()))

C = A_list & B_list

print(len(A_list) + len(B_list) - 2*len(C))