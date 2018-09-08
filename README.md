# sample-voting
Example Voting Đapp using Ganache

## Directory Structure
- voting.sol: Simple voting Contract with 2 method have not implement
- other files: UI of ĐApp

## Tools for Solidity Development
- Ganache: https://truffleframework.com/ganache
- Google Chrome: https://www.google.com/chrome/
- MetaMask (Extension for Chrome and other browsers): https://metamask.io/
- Remix IDE (for coding Solidity): https://remix.ethereum.org/

## Front-end (Web Client)
- You can serve this folder with any kind of web server
- If you have installed one web server, such as: XAMPP, WAMP,... Just use it
- If you haven't got one, try using `http-server`

#### Install http-server (Simple Web Server for static web)
```
npm install -g http-server
```
#### Create a web server using http-server
```
http-server
```

## Practice
- Serve the static web client in your localhost (use http-server or other methods)
- Connect MetaMask Ganache (and import account to Metamask by one of private keys in Ganache)
- Use remix to code: https://remix.ethereum.org/
- Select `Injected Web3` for `Environment` of Remix (to connect Remix -> MetaMask -> Ganache)
- Code & Deploy in Remix
- Get the contract address and paste to web client in first step to test and enjoy your beautiful works
