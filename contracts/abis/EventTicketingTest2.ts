export const EventTicketingTestAbi = {"abi":[
    {
      "type": "constructor",
      "inputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "buy",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "eventInfo",
      "inputs": [],
      "outputs": [
        { "name": "name", "type": "string", "internalType": "string" },
        { "name": "url", "type": "string", "internalType": "string" },
        { "name": "time", "type": "uint256", "internalType": "uint256" },
        { "name": "location", "type": "string", "internalType": "string" },
        { "name": "photo", "type": "string", "internalType": "string" },
        { "name": "n_tickets", "type": "uint256", "internalType": "uint256" },
        { "name": "n_tickets_sold", "type": "uint256", "internalType": "uint256" },
        { "name": "price", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getEventInfo",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "tuple",
          "internalType": "struct EventTicketingTest1.EventInfo",
          "components": [
            { "name": "name", "type": "string", "internalType": "string" },
            { "name": "url", "type": "string", "internalType": "string" },
            { "name": "time", "type": "uint256", "internalType": "uint256" },
            { "name": "location", "type": "string", "internalType": "string" },
            { "name": "photo", "type": "string", "internalType": "string" },
            { "name": "n_tickets", "type": "uint256", "internalType": "uint256" },
            { "name": "n_tickets_sold", "type": "uint256", "internalType": "uint256" },
            { "name": "price", "type": "uint256", "internalType": "uint256" }
          ]
        }
      ],
      "stateMutability": "view"
    }
  ]} as const 