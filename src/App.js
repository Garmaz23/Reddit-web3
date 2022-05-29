/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";
import "./App.css";
import { ConnectButton, Modal } from "web3uikit";
import logo from "./images/logo.png";
import Coin from "./components/Coin.js";
import { abouts } from "./about";
import { useMoralisWeb3Api, useMoralis } from "react-moralis";

const App = () => {
  const [btc, setBtc] = useState(51);
  const [eth, setEth] = useState(60);
  const [usdt, setUsdt] = useState(49);
  const [modalPrice, setModalPrice] = useState();
  const Web3Api = useMoralisWeb3Api();
  const { Moralis, isInitialized } = useMoralis();
  const [visible, setVisible] = useState(false);
  const [modalToken, setModalToken] = useState();

  async function getRatio(tick, setPerc) {
    const Votes = Moralis.Object.extend("Votes");
    const query = new Moralis.Query(Votes);
    query.equalTo("ticker", tick);
    query.descending("createdAt");
    const results = await query.first();
    let up = Number(results.attributes.up);
    let down = Number(results.attributes.down);
    let ratio = Math.round((up / (up + down)) * 100);
    setPerc(ratio);
  }

  useEffect(() => {
    if (isInitialized) {
      getRatio("BTC", setBtc);
      getRatio("ETH", setEth);
      getRatio("USDT", setUsdt);

      async function createLiveQuery(){
        let query = new Moralis.Query('Votes');
        let subscription = await query.subscribe();
        subscription.on('update', (object) => {
          
          if(object.attributes.ticker === "USDT"){
            getRatio("USDT", setUsdt);
          }else if(object.attributes.ticker === "ETH"){
            getRatio("ETH", setEth);
          }else if(object.attributes.ticker === "BTC"){
            getRatio("BTC", setBtc);
          }
  
        });
      }
  
  
      createLiveQuery();



    }
  }, [isInitialized]);

  useEffect(() => {
    async function fetchTokenPrice() {
      const options = {
        address:
          abouts[abouts.findIndex((x) => x.token === modalToken)].address,
      };
      const price = await Web3Api.token.getTokenPrice(options);
      setModalPrice(price.usdPrice.toFixed(2));
    }

    if (modalToken) {
      fetchTokenPrice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalToken]);
  return (
    <>
      <div className="header">
        <div className="logo">
          <img src={logo} alt="logo" height="50px" />
          WEB 3 Reddit
        </div>
        <ConnectButton />
      </div>
      <div className="instructions">Up vote or Down vote these tokens!</div>
      <div className="list">
        <Coin
          perc={btc}
          setPerc={setBtc}
          token={"BTC"}
          setModalToken={setModalToken}
          setVisible={setVisible}
        />
        <Coin
          perc={eth}
          setPerc={setEth}
          token={"ETH"}
          setModalToken={setModalToken}
          setVisible={setVisible}
        />
        <Coin
          perc={usdt}
          setPerc={setUsdt}
          token={"USDT"}
          setModalToken={setModalToken}
          setVisible={setVisible}
        />
      </div>
      <Modal
        isVisible={visible}
        onCloseButtonPressed={() => setVisible(false)}
        hasFooter={false}
        title={modalToken}
      >
        <div>
          <span style={{ color: "black" }}>{`Price:`}</span>
          {modalPrice}$
        </div>

        <div>
          <span style={{ color: "black" }}>{`About`}</span>
        </div>
        <div>
          {modalToken &&
            abouts[abouts.findIndex((x) => x.token === modalToken)].about}
        </div>
      </Modal>
    </>
  );
};

export default App;
