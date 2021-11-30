import algosdk from "algosdk";
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "algorand-walletconnect-qrcode-modal";

import React, { Component } from "react";
import { formatJsonRpcRequest } from "@json-rpc-tools/utils";

import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";

import AlgoWalletInput from "./components/AlgoWalletInput";
import Digit from "./components/Digit";
import algoLogo from "./assets/images/algo.png";
import algorandLogoWhite from "./assets/images/algorand_full_logo_white.png";
import algorandLogo from "./assets/images/algorand_full_logo_black.svg";
import walletConnectLogo from "./assets/images/walletconnect-banner.png";
import decipherLogo from "./assets/images/decipher-logo.jpg";
import { store } from "react-notifications-component";

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
      to: 'GD64YIY3TWGDMCNPP553DZPPR6LDUSFQOIJVFDPPXWEG3FVOJCCDBBHU5A',
      amount: Number(10000),
      note: note,
      closeRemainderTo: undefined,
      revocationTarget: undefined,
    });
    const txns = [txn0, txn1]
    algosdk.assignGroupID(txns)

    const txnsToSign = txns.map(txn => {
        const encodedTxn = Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString("base64");
    return {
        txn: encodedTxn,
        message: 'Description of transaction being signed',
        };
    });      

    const requestParams = [txnsToSign];
    const request = formatJsonRpcRequest("algo_signTxn", requestParams);


    const result = await this.connector.sendCustomRequest(request);
//    const result: Array<string | null> = await this.connector.sendCustomRequest(request);
    const decodedResult = result.map(element => {
        return element ? new Uint8Array(Buffer.from(element, "base64")) : null;
    });
//    rawSignedTxn = result.map(element => {
//      return element ? new Uint8Array(Buffer.from(element, "base64")) : null;
//    });
    sentTxn = await algodClient.sendRawTransaction(decodedResult).do();
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

        <Grid container>
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

        <AlgoWalletInput setBalance={(bal) => that.setState({ balance: Number(bal) })} walletConnectionMode="walletConnect" wallet={wallet} />

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
          {isConnectedToWallet ? `Disconnect Wallet` : `Connect Wallet`}
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
          id="optin-btn"
          variant="outlined"
          onClick={this.appCallOptin}
          className={
            classes.exampleBtn
          }
        >
          OptIn to dApp
        </Button>
        <Button
          id="pay-increment-btn"
          variant="outlined"
          onClick={this.appCallPaidIncrement}
          className={
            classes.exampleBtn
          }
        >
          Call & Pay to Increment
        </Button>

      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default withStyles(styles)(App);
