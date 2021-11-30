import base64
from algosdk.v2client import algod
from algosdk.future import transaction
from algosdk import mnemonic
from algosdk import account

# define application index
app_id=int(open("./app.id").read())

# define receiver as TestNet dispenser address
receiver="GD64YIY3TWGDMCNPP553DZPPR6LDUSFQOIJVFDPPXWEG3FVOJCCDBBHU5A"

# define amount to call app
amount=1

# user declared account mnemonics
creator_mnemonic = "castle advance settle disagree quiz canvas tree taxi token tiger keep heart inner south warm pair situate wise garlic across exist bag near ability wire"
# ensuer this account is funded using TestNet dispenser: https://dispenser.testnet.aws.algodev.network/

# user declared algod connection parameters. 
# Node must have EnableDeveloperAPI set to true in its config
algod_address = "http://localhost:4001"
algod_token = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

# helper function that converts a mnemonic passphrase into a private signing key
def get_private_key_from_mnemonic(mn) :
    private_key = mnemonic.to_private_key(mn)
    return private_key

# helper function that waits for a given txid to be confirmed by the network
def wait_for_confirmation(client, transaction_id, timeout):
    """
    Wait until the transaction is confirmed or rejected, or until 'timeout'
    number of rounds have passed.
    Args:
        transaction_id (str): the transaction to wait for
        timeout (int): maximum number of rounds to wait    
    Returns:
        dict: pending transaction information, or throws an error if the transaction
            is not confirmed or rejected in the next timeout rounds
    """
    start_round = client.status()["last-round"] + 1
    current_round = start_round

    while current_round < start_round + timeout:
        try:
            pending_txn = client.pending_transaction_info(transaction_id)
        except Exception:
            return 
        if pending_txn.get("confirmed-round", 0) > 0:
            return pending_txn
        elif pending_txn["pool-error"]:  
            raise Exception(
                'pool error: {}'.format(pending_txn["pool-error"]))
        client.status_after_block(current_round)                   
        current_round += 1
    raise Exception(
        'pending tx not found in timeout rounds, timeout value = : {}'.format(timeout))

# helper function that formats global state for printing
def format_state(state):
    formatted = {}
    for item in state:
        key = item['key']
        value = item['value']
        formatted_key = base64.b64decode(key).decode('utf-8')
        if value['type'] == 1:
            # byte string
            if formatted_key == 'voted':
                formatted_value = base64.b64decode(value['bytes']).decode('utf-8')
            else:
                formatted_value = value['bytes']
            formatted[formatted_key] = formatted_value
        else:
            # integer
            formatted[formatted_key] = value['uint']
    return formatted

# helper function to read app global state
def read_global_state(client, addr, app_id):
    results = client.account_info(addr)
    apps_created = results['created-apps']
    for app in apps_created:
        if app['id'] == app_id:
            return format_state(app['params']['global-state'])
    return {}
    
# call application
def call_app(client, private_key, index, app_args) : 
    # declare sender
    sender = account.address_from_private_key(private_key)

    # get node suggested parameters
    params = client.suggested_params()

    # create unsigned transactions
    app_call_txn = transaction.ApplicationNoOpTxn(sender, params, index, None)
    pay_txn = transaction.PaymentTxn(sender, params, receiver, amount)

    # get group id and assign it to transactions
    gid = transaction.calculate_group_id([app_call_txn, pay_txn])
    app_call_txn.group = gid
    pay_txn.group = gid

    # sign transactions
    signed_app_call_tnx = app_call_txn.sign(private_key)
    signed_pay_txn = pay_txn.sign(private_key)
    tx_id = signed_app_call_tnx.transaction.get_txid()

    # send transactions
    client.send_transactions([signed_app_call_tnx, signed_pay_txn])

    # await confirmation
    wait_for_confirmation(client, tx_id, 5)

    print("Application call successful")
    
def main() :
    # initialize an algodClient
    algod_client = algod.AlgodClient(algod_token, algod_address)

    # define private keys
    creator_private_key = get_private_key_from_mnemonic(creator_mnemonic)

    print("--------------------------------------------")
    print("Calling Counter Application ({})......".format(app_id))
    call_app(algod_client, creator_private_key, app_id, None)

    # read global state of application
    print("Global state:", read_global_state(algod_client, account.address_from_private_key(creator_private_key), app_id))

main()