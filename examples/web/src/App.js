import zacs from '@nozbe/zacs'
import React from 'react';
import './App.css';

const AppRoot = zacs.view('App')
const Header = zacs.styled('header', 'App-header')
const Link = zacs.styled('a', 'App-link')

function App() {
  return (
    <AppRoot>
      <Header>
        <p>
          Hello to zacs demo - edit <code>src/App.js</code> and save to reload.
        </p>
        <Link href="https://github.com/Nozbe/zacs"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn ZACS
        </Link>
      </Header>
    </AppRoot>
  );
}

export default App;
