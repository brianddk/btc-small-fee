# btc-small-fee

```
LTC: LQjSwZLigtgqHA3rE14yeRNbNNY2r3tXcA
```
A simple nodejs program to generate a report showing some fee calculatiosn on the latest (*n*) confirmed blocks.  The intent is to understand why miners seem to *randomly* allow some very low fee transactions into the block.

## Getting Started

You'll need a desktop system with command console.  I'm using nodejs version **5.11.0** so if your using a later version, I recommend installing **nvm** to run other versions in parallel.

### Prerequisites

Ensure that you are running nodejs version 5.11.0

```
node -v
```

If you have `nvm` installed you can activate version 5.11.0

```
nvm use 5.11.0
```

### Installing

Obtain the repository using git

```
git clone https://github.com/brianddk/btc-small-fee.git
```

Once you are on a good nodejs version, a simple `npm install` will suffice

```
npm install
```

This should be all that is required and you can no generate a report.

### Running

To run the report simply run `node btc-small-fee.js`

```
node btc-small-fee.js
```

Another method will be to generate the html file with the overloaded `npm test` (**hack**)

```
npm test
chrome btc-small-fee.html
```

The report simply prints to the console.

## Built With

* [Node.js](https://nodejs.org/en/) - The NodeJS language runtime
* [npm](https://www.npmjs.com/) - NodeJS package manager
* [nvm-windows](https://github.com/coreybutler/nvm-windows) - nvm for Windows, but there are many releases for other OSes too.

## Contributing

Just issue a PR on github.

## Issues

Just submit an issue on github.

## Authors

* **brianddk** - *Initial work* - [Github](https://github.com/brianddk) - Tips [LTC]: LQjSwZLigtgqHA3rE14yeRNbNNY2r3tXcA

## License

This project is licensed under the [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) License.

## Acknowledgments

* Thanks to [blockchain.info](https://blockchain.info/) for providing an API
* Thanks to [PonyFoo](https://ponyfoo.com/) for their [browserify walkthrough](https://ponyfoo.com/articles/a-gentle-browserify-walkthrough)
* Might need [CORS for Chrome](https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi?hl=en)
