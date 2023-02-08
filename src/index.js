import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import "./index.css"
import { CeloProvider } from '@celo/react-celo';
import "@celo/react-celo/lib/styles.css";

ReactDOM.render(
  <CeloProvider
    dapp={{
      name:"Umbrella domains",
      description:"An ENS on the Celo blockchain",
      url: "https://example.com"
    }}
    connectionModal={{
      title: <span>Connect your wallet</span>
    }}
    >
    <StrictMode>
      <App />
    </StrictMode>
  </CeloProvider>,
  document.getElementById("root")
);
