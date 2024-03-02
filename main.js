const { Web3 } = require("web3")
var mysql = require("mysql")

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "eventbridge",
})

const provider = "https://lb.drpc.org/ogrpc?network=sepolia&dkey=7034393fe1b6d6b06b2ebcb0bdbe9a909ff434f83185bdef3697a72bc06b6cab" //api key
const web3Provider = new Web3.providers.HttpProvider(provider)
const web3 = new Web3(web3Provider)

const ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: true, internalType: "address", name: "spender", type: "address" },
      { indexed: false, internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      { indexed: false, internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  { inputs: [], name: "decimals", outputs: [{ internalType: "uint8", name: "", type: "uint8" }], stateMutability: "view", type: "function" },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "subtractedValue", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "addedValue", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { inputs: [], name: "name", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "symbol", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalSupply", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
]

const DB = {
  connect: () => {
    try {
      con.connect((err) => {
        if (err) throw err
        return "connected!"
      })
    } catch (error) {
      console.error(error)
    }
  },
  insert: (name, data) => {
    try {
      var sql = `INSERT INTO event (name, data) VALUES ('${name}','${data}')`
      con.query(sql, (err, result) => {
        if (err) throw err
        console.log("Result: " + JSON.stringify(result))
      })
    } catch (error) {
      console.error(error)
    }
  },
}

const getEvents = async () => {
  const myContract = new web3.eth.Contract(ABI, `0x7f11f79DEA8CE904ed0249a23930f2e59b43a385`) //usd token

  web3.eth.getBlockNumber().then(async (latestBlockNumber) => {
    console.log("Latest Ethereum Block is ", latestBlockNumber)

    for (let i = 5375757; i < latestBlockNumber; i + 1000) {
       await myContract.getPastEvents("Transfer", {
        filter: {},
        fromBlock: i,
        toBlock: "latest",
        topics: ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"],
      }).then(function (events) {
        events.map((item) => {
          console.log(item.blockHash)
          DB.insert(
            `${item.event}`,
            `${JSON.stringify({
              address: `${item.address}`,
              blockHash: `${item.blockHash}`,
              blockNumber: `${item.blockNumber}`,
              event: `${item.event}`,
              logIndex: `${item.logIndex}`,
            })}`
          )
        })
      })

      console.log(`i => ${i}`)
    }
    console.log(`Finish`)
  })
}

/**
 * main
 */
async function main() {
  DB.connect()
  getEvents()
}

// Start
main()
