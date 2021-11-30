import React, { Component } from "react";
import PropTypes from "prop-types";

import algosdk from "algosdk";
import { withStyles } from "@material-ui/core/styles";
// import rocket from "./assets/images/rocket.gif"
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import algoLogo from "./assets/images/algo.png";
import algorandLogoWhite from "./assets/images/algorand_full_logo_white.png";
import algorandLogo from "./assets/images/algorand_full_logo_black.svg";

import walletConnectLogo from "./assets/images/walletconnect-banner.png";
import decipherLogo from "./assets/images/decipher-logo.jpg";
import AlgoWalletInput from "./components/AlgoWalletInput";
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "algorand-walletconnect-qrcode-modal";
import { formatJsonRpcRequest } from "@json-rpc-tools/utils";
import Digit from "./components/Digit";
import { store } from "react-notifications-component";
import {
  Paper,
  Dialog,
  DialogContent,
  DialogHeader,
  Switch,
  Avatar,
  CardHeader,
  CardContent,
  CardFooter,
  IconButton,
  Tooltip,
} from "@material-ui/core";
import SmartContracts from "./SmartContracts"
const { appProg, clearProg } = SmartContracts;
const styles = (theme) => ({
  algorandImage: {
    width: "128px",
  },

  exampleBtn: {
    borderRadius: "20px",
    textAligne: "center",
    margin: "10px",
    display: "inline-block",
    backgroundImage: "linear-gradient(90deg,#0f172c,#2f426a)",
    borderColor: "#0d4076",
    color: "#fff",
    "&:hover": {
      backgroundImage: "linear-gradient(90deg,#537bac,#024fa1)",
      color: "#fff",
    },
  },
  card: {
    margin: "10px",
    borderRadius: 10,
    position: "relative",

  },
  cardRoot: {
    height: '100px',
    minHeight: '75px',
    padding: 20,
    backgroundColor: '#dfe2e5',
    fontFamily: 'Roboto'

  },
  app: {
    height: "100vh",
    weight: "100vw",
    overflow: "auto",
    textAlign: "center",
    "&::-webkit-scrollbar": {
      width: "5px",
      height: "5px",
    },
    "&::-webkit-scrollbar-track": {
      boxShadow: "inset 0 0 5px grey",
      borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#726e6e",
      borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "#605c5c",
    },
    scrollbarColor: "#726e6e",
    scrollbarWidth: "thin",
  },
  exampleBtnSelected: {
    borderRadius: "20px",
    textAligne: "center",
    margin: "10px",
    display: "inline-block",
    backgroundColor: "#7493b9",
    borderColor: "#024fa1",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#30608d",
      color: "#fff",
    },
  },
  balance: {
    display: "inline-flex",
    verticalAlign: "middle",
  },
  algoImg: {
    width: 16,
    display: "inline-flex",
    verticalAlign: "middle",
  },
  walletImg: {
    width: 100,
    display: "inline-flex",
    verticalAlign: "middle",
  },
  decipherLogoImg: {
    width: "16%",
    float: "left",
  },
  logoImg: {
    width: "16%",
    float: "right",
    marginTop: '2%',
    [theme.breakpoints.down('xs')]: {
      marginTop: '2%',
      width: "15%",

    }
  }
});

class App extends Component {
  constructor() {
    super();
    this.state = {
      wallet: '',
      balance: 0,
      globalCounter: 0,
      localCounter: 0,
      isWalletConnect: true,
      isConnectedToWallet: false,
      defaultAppId: 47104779,
      basicAppId: 0,
      updatedAppId: 46755651
    };
  
    this.walletConnet = this.walletConnet.bind(this);

    this.fetchWalletInfo = this.fetchWalletInfo.bind(this)
    this.setupSystem = this.setupSystem.bind(this)
    this.fetchApplicationInfo = this.fetchApplicationInfo.bind(this)
    this.waitForConfirmation = this.waitForConfirmation.bind(this)
    this.appCallIncrement = this.appCallIncrement.bind(this)
    this.appCallOptin = this.appCallOptin.bind(this)
    this.appCallPaidIncrement = this.appCallPaidIncrement.bind(this)
  }
 
  fetchWalletInfo() {
    const { wallet } = this.state;
    const that = this;
    const url = `https://testnet.algoexplorerapi.io/v2/accounts/${wallet}`;
    const urlTrx = `https://testnet.algoexplorerapi.io/idx2/v2/accounts/${wallet}/transactions?limit=10`;
    store.addNotification({
      title: "Info",
      message: `Fetching wallet information for wallet: ${wallet}`,
      type: "info",
      insert: "bottom",
      container: "bottom-left",
      animationIn: ["animated", "fadeIn"],
      animationOut: ["animated", "fadeOut"],
      dismiss: {
        duration: 2000,
        onScreen: false,
        pauseOnHover: true,
        showIcon: true,
        waitForAnimation: false,
      },
    });
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

          if (data.address === wallet && data.amount) {
            that.setState({
              balance: data.amount,
            });
            store.addNotification({
              title: "Success",
              message: `Fetched wallet information! Balance is: ${data.amount}`,
              type: "success",
              insert: "bottom",
              container: "bottom-left",
              animationIn: ["animated", "fadeIn"],
              animationOut: ["animated", "fadeOut"],
              dismiss: {
                duration: 6000,
                onScreen: false,
                pauseOnHover: true,
                showIcon: true,
                waitForAnimation: false,
              },
            });

          }
          if (data.address === wallet && data['apps-local-state']) {
            if (data['apps-local-state'][0]) {
              let localCounter = Number(data['apps-local-state'][0]['key-value'][0].value.uint)
              that.setState({
                localCounter: localCounter,
              });
              store.addNotification({
                title: "Success",
                message: `Fetched local state on APP! Local counter is: ${localCounter}`,
                type: "success",
                insert: "bottom",
                container: "bottom-left",
                animationIn: ["animated", "fadeIn"],
                animationOut: ["animated", "fadeOut"],
                dismiss: {
                  duration: 6000,
                  onScreen: false,
                  pauseOnHover: true,
                  showIcon: true,
                  waitForAnimation: false,
                },
              });
            }

          }
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        store.addNotification({
          title: "Error",
          message: `Error fetching wallet for: ${wallet}, Error says: ${error}`,
          type: "danger",
          insert: "bottom",
          container: "bottom-left",
          animationIn: ["animated", "fadeIn"],
          animationOut: ["animated", "fadeOut"],
          dismiss: {
            duration: 4000,
            onScreen: false,
            pauseOnHover: true,
            showIcon: true,
            waitForAnimation: false,
          },
        });
      });
    store.addNotification({
      title: "Info",
      message: `Fetching wallet transactions for wallet: ${wallet}`,
      type: "info",
      insert: "bottom",
      container: "bottom-left",
      animationIn: ["animated", "fadeIn"],
      animationOut: ["animated", "fadeOut"],
      dismiss: {
        duration: 2000,
        onScreen: false,
        pauseOnHover: true,
        showIcon: true,
        waitForAnimation: false,
      },
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
            store.addNotification({
              title: "Success",
              message: `Fetched ${data.transactions.length} transactions!`,
              type: "success",
              insert: "bottom",
              container: "bottom-left",
              animationIn: ["animated", "fadeIn"],
              animationOut: ["animated", "fadeOut"],
              dismiss: {
                duration: 2000,
                onScreen: false,
                pauseOnHover: true,
                showIcon: true,
                waitForAnimation: false,
              },
            });
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
        store.addNotification({
          title: "Error",
          message: `Error fetching transactions for wallet: ${wallet}, Error says: ${error}`,
          type: "danger",
          insert: "bottom",
          container: "bottom-left",
          animationIn: ["animated", "fadeIn"],
          animationOut: ["animated", "fadeOut"],
          dismiss: {
            duration: 4000,
            onScreen: false,
            pauseOnHover: true,
            showIcon: true,
            waitForAnimation: false,
          },
        });
      });
  }

  fetchApplicationInfo() {
    const { basicAppId } = this.state;
    const that = this;
    const url = `https://testnet.algoexplorerapi.io/v2/applications/${basicAppId}`;
    store.addNotification({
      title: "Info",
      message: `Fetching application info for APP: ${basicAppId}`,
      type: "info",
      insert: "bottom",
      container: "bottom-left",
      animationIn: ["animated", "fadeIn"],
      animationOut: ["animated", "fadeOut"],
      dismiss: {
        duration: 2000,
        onScreen: false,
        pauseOnHover: true,
        showIcon: true,
        waitForAnimation: false,
      },
    });
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
          if (Number(data.id) === Number(basicAppId)) {
            let globalCounter = Number(data.params['global-state'][0].value.uint)

            that.setState({
              globalCounter: globalCounter,
            });

          }
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });


  }
  async walletConnet() {
    const that = this;
    if (this.state.isConnectedToWallet) {
      if (this.connector) {
        this.connector.killSession();
        delete this.connector
        this.setState({
          isConnectedToWallet: false, balance: 0, wallet: '...', globalCounter: 0,
          localCounter: 0,
        })
        store.addNotification({
          title: "Warning",
          message: `Disconnecting from WalletConnect!`,
          type: "warning",
          insert: "bottom",
          container: "bottom-left",
          animationIn: ["animated", "fadeIn"],
          animationOut: ["animated", "fadeOut"],
          dismiss: {
            duration: 2000,
            onScreen: false,
            pauseOnHover: true,
            showIcon: true,
            waitForAnimation: false,
          },
        });
      }
    } else {
      if (this.connector) {
        this.connector.killSession();
        delete this.connector


      }
      try {
        store.addNotification({
          title: "Info",
          message: `Connecting to WalletConnect...`,
          type: "info",
          insert: "bottom",
          container: "bottom-left",
          animationIn: ["animated", "fadeIn"],
          animationOut: ["animated", "fadeOut"],
          dismiss: {
            duration: 2000,
            onScreen: false,
            pauseOnHover: true,
            showIcon: true,
            waitForAnimation: false,
          },
        });
        this.connector = new WalletConnect({
          bridge: "https://bridge.walletconnect.org",
          qrcodeModal: QRCodeModal,
        });
        if (!this.connector.connected) {
          this.connector.createSession();
        }
        this.connector.on("connect", (error, payload) => {
          if (error) {
            console.error(error)
            store.addNotification({
              title: "Error",
              message: `Error trying to connect to WalletConnect! Error says: ${error}`,
              type: "danger",
              insert: "bottom",
              container: "bottom-left",
              animationIn: ["animated", "fadeIn"],
              animationOut: ["animated", "fadeOut"],
              dismiss: {
                duration: 6000,
                onScreen: false,
                pauseOnHover: true,
                showIcon: true,
                waitForAnimation: false,
              },
            });
          }
          const { accounts } = payload.params[0];
          let wallet = accounts[0];
          that.setState({ isConnectedToWallet: true, wallet: wallet }, () => {
            store.addNotification({
              title: "Success",
              message: `Connected to WalletConnect! Address: ${wallet}`,
              type: "success",
              insert: "bottom",
              container: "bottom-left",
              animationIn: ["animated", "fadeIn"],
              animationOut: ["animated", "fadeOut"],
              dismiss: {
                duration: 4000,
                onScreen: false,
                pauseOnHover: true,
                showIcon: true,
                waitForAnimation: false,
              },
            });
            that.fetchWalletInfo();
          });
        });

        this.connector.on("session_update", (error, payload) => {
          if (error) {
            throw error;
          }


          const { accounts } = payload.params[0];

          that.setState({ wallet: accounts[0].address }, () => {
            that.fetchWalletInfo();
          });
        });

        this.connector.on("disconnect", (error, payload) => {
          if (error) {
            console.error(error);
            store.addNotification({
              title: "Error",
              message: `Error in disconnection from WalletConnect! Error says: ${error}`,
              type: "danger",
              insert: "bottom",
              container: "bottom-left",
              animationIn: ["animated", "fadeIn"],
              animationOut: ["animated", "fadeOut"],
              dismiss: {
                duration: 7000,
                onScreen: false,
                pauseOnHover: true,
                showIcon: true,
                waitForAnimation: false,
              },
            });
          }
          store.addNotification({
            title: "Disconnected",
            message: `Disconnected OK from WalletConnect!`,
            type: "success",
            insert: "bottom",
            container: "bottom-left",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
              duration: 4000,
              onScreen: false,
              pauseOnHover: true,
              showIcon: true,
              waitForAnimation: false,
            },
          });
        });

      } catch (err) {
        console.error(err);
        store.addNotification({
          title: "Error",
          message: `WalletConnect Error! Error says: ${err}`,
          type: "danger",
          insert: "bottom",
          container: "bottom-left",
          animationIn: ["animated", "fadeIn"],
          animationOut: ["animated", "fadeOut"],
          dismiss: {
            duration: 7000,
            onScreen: false,
            pauseOnHover: true,
            showIcon: true,
            waitForAnimation: false,
          },
        });
      }
    }

  }


  async setupSystem() {

    store.addNotification({
      title: "Setup",
      message: `Now setting up system...`,
      type: "info",
      insert: "bottom",
      container: "bottom-left",
      animationIn: ["animated", "fadeIn"],
      animationOut: ["animated", "fadeOut"],
      dismiss: {
        duration: 7000,
        onScreen: false,
        pauseOnHover: true,
        showIcon: true,
        waitForAnimation: false,
      },
    });
    let appId = window.prompt(`Please enter the AppID (Default is: ${this.state.defaultAppId} )`);

    const that = this;
    const { basicAppId } = this.state
    if (Number(basicAppId) > 0) {
      store.addNotification({
        title: "Success",
        message: `AppID set to: ${appId}`,
        type: "success",
        insert: "bottom",
        container: "bottom-left",
        animationIn: ["animated", "fadeIn"],
        animationOut: ["animated", "fadeOut"],
        dismiss: {
          duration: 4000,
          onScreen: false,
          pauseOnHover: true,
          showIcon: true,
          waitForAnimation: false,
        },
      });
      this.setState({ basicAppId: appId }, () => {
        that.fetchApplicationInfo()
      })
    } else {
      store.addNotification({
        title: "Warning",
        message: `AppID you entered is not correct! default AppID ${this.state.defaultAppId} is set`,
        type: "warning",
        insert: "bottom",
        container: "bottom-left",
        animationIn: ["animated", "fadeIn"],
        animationOut: ["animated", "fadeOut"],
        dismiss: {
          duration: 4000,
          onScreen: false,
          pauseOnHover: true,
          showIcon: true,
          waitForAnimation: false,
        },
      });

      this.setState({ basicAppId: this.state.defaultAppId }, () => {
        that.fetchApplicationInfo()
      })
    }


  }

  async waitForConfirmation(algodClient, txId) {
    store.addNotification({
      title: "Waiting",
      message: `Waiting on transaction: ${txId}`,
      type: "info",
      insert: "bottom",
      container: "bottom-left",
      animationIn: ["animated", "fadeIn"],
      animationOut: ["animated", "fadeOut"],
      dismiss: {
        duration: 4000,
        onScreen: false,
        pauseOnHover: true,
        showIcon: true,
        waitForAnimation: false,
      },
    });
    let response = await algodClient.status().do();
    let lastround = response["last-round"];
    while (true) {
      const pendingInfo = await algodClient
        .pendingTransactionInformation(txId)
        .do();
      if (
        pendingInfo["confirmed-round"] !== null &&
        pendingInfo["confirmed-round"] > 0
      ) {
        store.addNotification({
          title: "Confirmed",
          message: `Transaction: ${txId}, approved and submitted to Algorand`,
          type: "success",
          insert: "bottom",
          container: "bottom-left",
          animationIn: ["animated", "fadeIn"],
          animationOut: ["animated", "fadeOut"],
          dismiss: {
            duration: 4000,
            onScreen: false,
            pauseOnHover: true,
            showIcon: true,
            waitForAnimation: false,
          },
        });
        console.log(
          "Transaction " +
          txId +
          " confirmed in round " +
          pendingInfo["confirmed-round"]
        );
        break;
      }
      lastround++;
      await algodClient.statusAfterBlock(lastround).do();
    }
  }

  async appCallIncrement() {
    let appId = this.state.basicAppId
    let wallet = this.state.wallet
    store.addNotification({
      title: "Info",
      message: `Now calling App ${appId} for increment call...`,
      type: "info",
      insert: "bottom",
      container: "bottom-left",
      animationIn: ["animated", "fadeIn"],
      animationOut: ["animated", "fadeOut"],
      dismiss: {
        duration: 4000,
        onScreen: false,
        pauseOnHover: true,
        showIcon: true,
        waitForAnimation: false,
      },
    });
    const algodClient = new algosdk.Algodv2(
      "",
      "https://api.testnet.algoexplorer.io",
      ""
    );
    let params = await algodClient.getTransactionParams().do();
    let note = algosdk.encodeObj(
      JSON.stringify({
        system: "AppCounterDemo",
        date: `${new Date()}`,
      })
    );

    let rawSignedTxn, txn0, sentTxn, txId
    txn0 = algosdk.makeApplicationNoOpTxnFromObject({
      suggestedParams: params,
      type: "appl",
      from: wallet,
      to: wallet,
      appOnComplete: 0,
      appIndex: Number(appId),
      note: note,
    });

    const encodedTxn0 = algosdk.encodeUnsignedTransaction(txn0);

    const encodedTxnBuffer0 = Buffer.from(encodedTxn0).toString("base64");

    const requestParams = [[{ txn: encodedTxnBuffer0, message: 'demo app counter increment app txn' }]];
    const request = formatJsonRpcRequest("algo_signTxn", requestParams);
    const result = await this.connector.sendCustomRequest(request);
    rawSignedTxn = result.map(element => {
      return element ? new Uint8Array(Buffer.from(element, "base64")) : null;
    });
    sentTxn = await algodClient.sendRawTransaction(rawSignedTxn).do();
    txId = sentTxn.txId;

    store.addNotification({
      title: "Info",
      message: `Signed transaction using WalletConnect`,
      type: "info",
      insert: "bottom",
      container: "bottom-left",
      animationIn: ["animated", "fadeIn"],
      animationOut: ["animated", "fadeOut"],
      dismiss: {
        duration: 2000,
        onScreen: false,
        pauseOnHover: true,
        showIcon: true,
        waitForAnimation: false,
      },
    });

    await this.waitForConfirmation(algodClient, txId);
    this.fetchApplicationInfo()
  }
  async appCallOptin() {
    let appId = this.state.basicAppId
    let wallet = this.state.wallet

    const algodClient = new algosdk.Algodv2(
      "",
      "https://api.testnet.algoexplorer.io",
      ""
    );
    let params = await algodClient.getTransactionParams().do();
    let note = algosdk.encodeObj(
      JSON.stringify({
        system: "AppCounterDemo",
        date: `${new Date()}`,
      })
    );

    let rawSignedTxn, txn0, sentTxn, txId
    txn0 = algosdk.makeApplicationOptInTxnFromObject({
      suggestedParams: params,
      type: "appl",
      from: wallet,
      appOnComplete: 1,
      appIndex: Number(appId),
      note: note,
    });
    const encodedTxn = algosdk.encodeUnsignedTransaction(txn0);
    const encodedTxnBuffer = Buffer.from(encodedTxn).toString("base64");
    const requestParams = [[{ txn: encodedTxnBuffer, message: 'demo app counter increment' }]];
    const request = formatJsonRpcRequest("algo_signTxn", requestParams);
    const result = await this.connector.sendCustomRequest(request);
    rawSignedTxn = result.map(element => {
      return element ? new Uint8Array(Buffer.from(element, "base64")) : null;
    });
    sentTxn = await algodClient.sendRawTransaction(rawSignedTxn).do();
    txId = sentTxn.txId;

    await this.waitForConfirmation(algodClient, txId);
    this.fetchApplicationInfo()

  }
  async appCallPaidIncrement() {
    let appId = this.state.basicAppId
    let wallet = this.state.wallet
    store.addNotification({
      title: "Info",
      message: `Now calling App ${appId} for increment call...`,
      type: "info",
      insert: "bottom",
      container: "bottom-left",
      animationIn: ["animated", "fadeIn"],
      animationOut: ["animated", "fadeOut"],
      dismiss: {
        duration: 4000,
        onScreen: false,
        pauseOnHover: true,
        showIcon: true,
        waitForAnimation: false,
      },
    });
    const algodClient = new algosdk.Algodv2(
      "",
      "https://api.testnet.algoexplorer.io",
      ""
    );
    let params = await algodClient.getTransactionParams().do();
    let note = algosdk.encodeObj(
      JSON.stringify({
        system: "AppCounterDemo",
        date: `${new Date()}`,
      })
    );

    let rawSignedTxn, txn0, sentTxn, txId, txn1
    txn0 = algosdk.makeApplicationNoOpTxnFromObject({
      suggestedParams: params,
      type: "appl",
      from: wallet,
      to: wallet,
      appOnComplete: 0,
      appIndex: Number(appId),
      note: note,
    });
    txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      suggestedParams: params,
      type: "pay",
      from: wallet,
      to: 'QN7YHZF2HGN666F3XLNPL7474HNK43TZS5HGQZYPARH7S5L7OCYHKYXZUY',
      amount: Number(10000),
      note: note,
      closeRemainderTo: undefined,
      revocationTarget: undefined,
    });
    const encodedTxn0 = algosdk.encodeUnsignedTransaction(txn0);
    const encodedTxn1 = algosdk.encodeUnsignedTransaction(txn1);
    const encodedTxnBuffer0 = Buffer.from(encodedTxn0).toString("base64");
    const encodedTxnBuffer1 = Buffer.from(encodedTxn1).toString("base64");
    const requestParams = [[{ txn: encodedTxnBuffer0, message: 'demo app counter increment app txn' }, { txn: encodedTxnBuffer1, message: 'demo app counter increment payment txn' }]];
    const request = formatJsonRpcRequest("algo_signTxn", requestParams);
    const result = await this.connector.sendCustomRequest(request);
    rawSignedTxn = result.map(element => {
      return element ? new Uint8Array(Buffer.from(element, "base64")) : null;
    });
    sentTxn = await algodClient.sendRawTransaction(rawSignedTxn).do();
    txId = sentTxn.txId;

    store.addNotification({
      title: "Info",
      message: `Signed transaction using WalletConnect`,
      type: "info",
      insert: "bottom",
      container: "bottom-left",
      animationIn: ["animated", "fadeIn"],
      animationOut: ["animated", "fadeOut"],
      dismiss: {
        duration: 2000,
        onScreen: false,
        pauseOnHover: true,
        showIcon: true,
        waitForAnimation: false,
      },
    });

    await this.waitForConfirmation(algodClient, txId);
    this.fetchApplicationInfo()
  }
  render() {
    const that = this;
    const { classes } = this.props;
    const { balance, globalCounter, localCounter, isConnectedToWallet, isWalletConnect, basicAppId, updatedAppId, wallet } = this.state;

    return (
      <div className={classes.app}>
        <div className="App-header">
          <img
            src={decipherLogo}
            width="50%"
            className={classes.decipherLogoImg}
            alt="demo-counter-app-mobile-react"
          />
          <img
            src={algorandLogoWhite}
            width="50%"
            alt="demo-counter-app-mobile-react"
            className={classes.logoImg}
          />
        </div>

        <h2
          style={{
            textAlign: "center",
          }}
          className="App-desc"
        >
          Simple counter demo app
        </h2>

        <br />
        <Grid container>
          <Grid item xs={6} sm={6} md={3}>
            <Card className={classes.card} classes={{ root: classes.cardRoot }}>
              <Typography variant="h5" style={{ fontFamily: 'monospace', display: 'inline-block' }}>
                Balance:
              </Typography>

              <Digit
                nums={`${balance}`}
                color='#537bac'
                unActiveColor='#dfe2e5'
                backgroundColor='#dfe2e5'
                transform
                transformDuration={600}
              />
              <Typography variant="h6" style={{ fontSize: '10px', fontFamily: 'monospace', display: 'inline-block' }}>
                (Micro<img src={algoLogo} className={classes.algoImg} style={{ display: 'inline-block' }} />)
              </Typography>

            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card className={classes.card} classes={{ root: classes.cardRoot }}>
              <Typography variant="h5" style={{ fontFamily: 'monospace', margin: 'auto', display: 'block' }}>
                App id:
              </Typography>
              <Digit
                nums={`${basicAppId}`}
                color='#537bac'
                unActiveColor='#dfe2e5'
                backgroundColor='#dfe2e5'
                transform
                transformDuration={600}
              />

            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card className={classes.card} classes={{ root: classes.cardRoot }}>
              <Typography variant="h5" style={{ fontFamily: 'monospace' }}>
                Global Counter:
              </Typography>
              <Digit
                nums={`${globalCounter}`}
                color='#537bac'
                unActiveColor='#dfe2e5'
                backgroundColor='#dfe2e5'
                transform
                transformDuration={600}
              />

            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card className={classes.card} classes={{ root: classes.cardRoot }}>
              <Typography variant="h5" style={{ fontFamily: 'monospace' }}>
                Local Counter:
              </Typography>
              <Digit
                nums={`${localCounter}`}
                color='#537bac'
                unActiveColor='#dfe2e5'
                backgroundColor='#dfe2e5'
                transform
                transformDuration={600}
              />
            </Card>
          </Grid>
        </Grid>
        <br />
      
        <img src={walletConnectLogo} className={classes.walletImg} />
        <AlgoWalletInput setBalance={(bal) => that.setState({ balance: Number(bal) })} walletConnectionMode="walletConnect" wallet={wallet} />
        <br />

        <Button
          id="wallet-connect"
          variant="outlined"
          onClick={() => {
            that.walletConnet()
          }}
          className={
            classes.exampleBtn
          }
        >
          {isConnectedToWallet ? `Disconnect from WalletConnect` : `Connect using WalletConnect`}
        </Button>
      
        <Button
          id="setup-demo"
          variant="outlined"
          onClick={this.setupSystem}
          className={
            classes.exampleBtn
          }
        >
          Setup demo
        </Button>

        <Button
          id="call-counter-app"
          variant="outlined"
          onClick={this.appCallIncrement}
          className={
            classes.exampleBtn
          }
        >
          Global counter increment
        </Button>
        <Button
          id="optin-btn"
          variant="outlined"
          onClick={this.appCallOptin}
          className={
            classes.exampleBtn
          }
        >
          Opt-in to counter app
        </Button>
        <Button
          id="pay-increment-btn"
          variant="outlined"
          onClick={this.appCallPaidIncrement}
          className={
            classes.exampleBtn
          }
        >
          Pay & increment
        </Button>

        <div style={{ textAlign: "center", zIndex: 5 }}>
          <p style={{ fontSize: "14px" }}>
            <span>&copy; {1900 + new Date().getYear()} </span>
            <span>This is exclusively prepared for Decipher event</span>
          </p>

          <img src={algorandLogo} className={classes.algorandImage} />
          <br />

        </div>
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default withStyles(styles)(App);
