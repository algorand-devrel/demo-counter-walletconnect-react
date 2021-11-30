import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import {
  Card, CardContent, Typography, Tooltip, TextField,
  CardHeader,
  CardFooter,
  IconButton,
  DialogContent,
  DialogHeader,
  Dialog,
  Button,
} from "@material-ui/core";

import { FileCopy, Close } from "@material-ui/icons";
import algoLogo from "../assets/images/algo.png";

import { AccountBalance } from "@material-ui/icons";
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "algorand-walletconnect-qrcode-modal";
import { formatJsonRpcRequest } from "@json-rpc-tools/utils";

const styles = (theme) => ({
  addressField: {
    minWidth: "50%",
    width: "50%",
    verticalAlign: "middle",
  },
  addressInput: {
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.6em",
    },
  },
  addressInputDark: {
    color: '#fff',
    borderColor: '#ffff',
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.6em",
    },
  },
  mainDiv: {
    marginTop: "50px",
    margin: 20,
  },
  balance: {
    display: "inline",
  },
  algoImg: {
    width: 30,
    display: "inline",
  },
});
class AlgoWalletInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wallet: "...",
      label: "Active Wallet Name",

      amount: 0,
      dataURL: algoLogo,
      showOptIn: false,
      assetsCreate: [],
      walletOK: true,



      assetsCreated: [],
      assetsHeld: [],
      trxPayment: [],
      trxTransfer: [],
    };

    this.algoWallet = null;
    this.fetchWalletInfo = this.fetchWalletInfo.bind(this);

    this.walletConnect = this.walletConnect.bind(this);
  }
componentDidUpdate(prevProps){
  if (prevProps.wallet !== this.props.wallet){
    this.setState({wallet:  this.props.wallet})
  }
}



  async walletConnect() {
    const that = this;
    try {
      // Create a connector
      this.connector = new WalletConnect({
        bridge: "https://bridge.walletconnect.org", // Required
        qrcodeModal: QRCodeModal,
      });

      // Check if connection is already established
      if (!this.connector.connected) {
        // create new session
        this.connector.createSession();
      }

      // Subscribe to connection events
      this.connector.on("connect", (error, payload) => {
        if (error) {
          throw error;
        }

        // Get provided accounts
        const { accounts } = payload.params[0];
      
        that.setState({ wallet: accounts[0].address }, () => {
        that.fetchWalletInfo();
      });
      });

      this.connector.on("session_update", (error, payload) => {
        if (error) {
          throw error;
        }

        // Get updated accounts 
        const { accounts } = payload.params[0];
      
        that.setState({ wallet: accounts[0].address }, () => {
        that.fetchWalletInfo();
      });
      });

      this.connector.on("disconnect", (error, payload) => {
        if (error) {
          throw error;
        }
      });
      
    } catch (err) {
      console.error(err);
    }
  }
  fetchWalletInfo() {
    const { wallet } = this.state;
    const that = this;
    const url = `https://testnet.algoexplorerapi.io/v2/accounts/${wallet}`;
    const urlTrx = `https://testnet.algoexplorerapi.io/idx2/v2/accounts/${wallet}/transactions?limit=10`;
    window
      .fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          if (data.address === wallet) {
            that.setState({
              assetsHeld: data.assets,
              assetsCreated: data["created-assets"],
              balance: data.amount / 1000000,
              heldAssetsBalance: data.assets.length,
              createdAssetsBalance: data["created-assets"].length,
            });
            that.props.setBalance(data.amount / 1000000)
          }
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    window
      .fetch(urlTrx, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          if (data.transactions) {
            this.setState({
              trxPayment: data.transactions.filter(
                (trx) => !!trx["payment-transaction"]
              ),
              trxTransfer: data.transactions.filter(
                (trx) => !!trx["asset-transfer-transaction"]
              ),
            });
          }
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  render() {
    const { wallet, walletOK, balance, } = this.state;
    const { classes, walletConnectionMode } = this.props;
    const that = this;
    return (
      <div className={classes.mainDiv}>

        <TextField
          id="wallet"
          label="Active Wallet"
          variant="outlined"
          value={wallet}
          className={classes.addressField}
          margin="normal"
          onChange={(event) => {
            this.setState({ wallet: event.target.value }, () => {
              this.fetchWalletInfo();
            });
          }}
          InputProps={{
            classes: {
              input: classes.addressInput,
            },
            endAdornment: (
              <>
                <Tooltip title="Copy wallet address">
                  <IconButton
                    onClick={() => {
                      var copyText = document.getElementById("wallet");
                      copyText.select();

                      document.execCommand("copy");
                      alert("Copied the wallet address: " + copyText.value);
                    }}
                    edge="end"
                  >
                    <FileCopy />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Get Algorand wallet">
                  <IconButton
                    id="algo-connect-button"
                    onClick={() => {
                      console.log('Going for wallet connect...')
                      this.walletConnect();
                      
                    }}
                    edge="end"
                  >
                    {walletOK ? (
                      <img
                        width={32}
                        height={32}
                        style={{
                          backgroundColor: "#ddf4dd",
                          padding: 5,
                          borderRadius: 50,
                        }}
                        src={algoLogo}
                      />
                    ) : (
                      <img
                        width={32}
                        height={32}
                        style={{
                          padding: 5,
                          borderRadius: 50,
                        }}
                        src={algoLogo}
                      />
                    )}
                  </IconButton>
                </Tooltip>
              </>
            ),
          }}
        />
      </div>
    );
  }
}
AlgoWalletInput.propTypes = {
  classes: PropTypes.objectOf(PropTypes.string).isRequired,
  setBalance: PropTypes.func.isRequired,
  walletConnectionMode: PropTypes.string.isRequired,
  wallet: PropTypes.string.isRequired,
};
export default withStyles(styles)(AlgoWalletInput);
