from pyteal import *

def approval_program():

   handle_creation = Seq([
       App.globalPut(Bytes("Count"), Int(0)),
       Approve()
   ])

   handle_optin = Reject()     # Optin not used, so disallowing for now

   handle_closeout = Reject()

   handle_updateapp = Approve() # Allowing updates ONLY for testing

   handle_deleteapp = Approve() # Allowing delete ONLY for testing

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
   # - adding additional handlers
