from pyteal import *

def approval_program():

   handle_creation = Seq([
       App.globalPut(Bytes("Count"), Int(0)),
       Return(Int(1))
   ])
   handle_optin = Return(Int(0))     
   handle_closeout = Return(Int(0))
   handle_updateapp = Return(Int(1)) 
   handle_deleteapp = Return(Int(1)) 

   scratchCount = ScratchVar(TealType.uint64)

   handle_noop = Seq([
       scratchCount.store(App.globalGet(Bytes("Count"))),
       App.globalPut(Bytes("Count"), scratchCount.load() + Int(1)),
       Return(Int(1))
   ])
   
   program = Cond(
       [Txn.application_id() == Int(0), handle_creation],
       [Txn.on_completion() == OnComplete.OptIn, handle_optin],
       [Txn.on_completion() == OnComplete.CloseOut, handle_closeout],
       [Txn.on_completion() == OnComplete.UpdateApplication, handle_updateapp],
       [Txn.on_completion() == OnComplete.DeleteApplication, handle_deleteapp],
       [Txn.on_completion() == OnComplete.NoOp, handle_noop]
   )
   return compileTeal(program, Mode.Application, version=5)

   # Key points:
   # - Use ScratchVar() to store and load values
