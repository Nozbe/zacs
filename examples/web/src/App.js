import zacs from '@nozbe/zacs'
import React from 'react';
import './App.css';

// Yes, you can inline style names!
const AppRoot = zacs.view('App')
const Header = zacs.styled('header', 'App-header')
const Link = zacs.styled('a', 'App-link')
const Button = zacs.styled('button', 'Button',
  { isToggled: 'Button-toggled' },
  { width: 'width' }
)

function App() {
  const [isToggled, setToggled] = React.useState(false)
  const [width, setWidth] = React.useState(250)
  const clicky = () => {
    setWidth(width + 10)
    setToggled(!isToggled)
  }
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
        <Button isToggled={isToggled} width={width} onClick={clicky}>Click me!</Button>
      </Header>
    </AppRoot>
  );
}

export default App;
