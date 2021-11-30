const clearProg = `
#pragma version 5
int 1
return
`;
const appProg = `
#pragma version 5
txn ApplicationID
bz finerr
txn OnCompletion
int NoOp
==
bnz handle_noop

txn OnCompletion
int OptIn
==
bnz handle_optin

txn OnCompletion
int CloseOut
==
bnz handle_closeout

txn OnCompletion
int UpdateApplication
==
bnz handle_updateapp

txn OnCompletion
int DeleteApplication
==
bnz handle_deleteapp
b finerr

handle_optin:
byte base64 Q291bnQ=
int 0
app_global_put
int 0
byte base64 Q2FsbHM=
int 0
app_local_put
int 1
return

handle_check:
global GroupSize
int 2
==
gtxn 0 TypeEnum
pushint 6
==
&&
gtxn 1 Receiver
addr QN7YHZF2HGN666F3XLNPL7474HNK43TZS5HGQZYPARH7S5L7OCYHKYXZUY 
==
gtxn 1 Amount
int 0
>
&&
bnz handle_noop
b finerr

handle_closeout:
int 0
b end

handle_deleteapp:
addr QN7YHZF2HGN666F3XLNPL7474HNK43TZS5HGQZYPARH7S5L7OCYHKYXZUY
txn Sender
==
b end

handle_updateapp:
addr QN7YHZF2HGN666F3XLNPL7474HNK43TZS5HGQZYPARH7S5L7OCYHKYXZUY
txn Sender
==
b end

handle_noop:
byte base64 Q291bnQ=
app_global_get
store 0
byte base64 Q291bnQ=
load 0
int 1
+
app_global_put
int 0
byte base64 Q2FsbHM=
app_local_get
store 1
int 0
byte base64 Q2FsbHM=
load 1
int 1
+
app_local_put
int 1
b end


finerr:
err
end:
return
`;

const SmartContracts = { appProg, clearProg };

export default SmartContracts