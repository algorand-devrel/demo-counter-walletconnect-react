from pyteal import *

"""Skeleton Application"""

def approval_program():
   program = Return(Int(1))
   return compileTeal(program, Mode.Application, version=5)

def clear_state_program():
   program = Return(Int(1))
   return compileTeal(program, Mode.Application, version=5)

# Key points: 
# - Both approval_program and clear_state_program will return a single value "Int 1" when compiled
# - "Mode.Application" tells the compiler that this is a smart contract (not a smartSig)
# - "version" tells the compiler what version of TEAL to compile with