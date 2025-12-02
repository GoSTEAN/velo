"use client";
import { useContract } from "@starknet-react/core";
import { Abi } from "starknet";

export const VELO_ABI :Abi = [
  {
    "type": "impl",
    "name": "StarkpayImpl",
    "interface_name": "starkpay_africa::interface::IStarkpay::IStarkpay"
  },
  {
    "type": "enum",
    "name": "core::bool",
    "variants": [
      {
        "name": "False",
        "type": "()"
      },
      {
        "name": "True",
        "type": "()"
      }
    ]
  },
  {
    "type": "struct",
    "name": "core::integer::u256",
    "members": [
      {
        "name": "low",
        "type": "core::integer::u128"
      },
      {
        "name": "high",
        "type": "core::integer::u128"
      }
    ]
  },
  {
    "type": "interface",
    "name": "starkpay_africa::interface::IStarkpay::IStarkpay",
    "items": [
      {
        "type": "function",
        "name": "register",
        "inputs": [
          {
            "name": "addr",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "is_merchant",
            "type": "core::bool"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "create_payment",
        "inputs": [
          {
            "name": "receiver",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "amount",
            "type": "core::integer::u256"
          },
          {
            "name": "token",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "remarks",
            "type": "core::felt252"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "receive_payment",
        "inputs": [
          {
            "name": "payment_amount",
            "type": "core::integer::u256"
          },
          {
            "name": "payment_receiver",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "become_merchant",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "create_sme3",
        "inputs": [
          {
            "name": "recipient1",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "percentage1",
            "type": "core::integer::u8"
          },
          {
            "name": "recipient2",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "percentage2",
            "type": "core::integer::u8"
          },
          {
            "name": "recipient3",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "percentage3",
            "type": "core::integer::u8"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "distribute_sme3_payment",
        "inputs": [
          {
            "name": "total_amount",
            "type": "core::integer::u256"
          },
          {
            "name": "token",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_balance",
        "inputs": [
          {
            "name": "user",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "token",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_user_role",
        "inputs": [
          {
            "name": "user",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u8"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_active_payment_request",
        "inputs": [
          {
            "name": "merchant",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_payment_request",
        "inputs": [
          {
            "name": "request_id",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "(core::starknet::contract_address::ContractAddress, core::integer::u256, core::starknet::contract_address::ContractAddress, core::felt252, core::bool)"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "cancel_payment",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "cancel_sme3",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "create_sme4",
        "inputs": [
          {
            "name": "recipient1",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "percentage1",
            "type": "core::integer::u8"
          },
          {
            "name": "recipient2",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "percentage2",
            "type": "core::integer::u8"
          },
          {
            "name": "recipient3",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "percentage3",
            "type": "core::integer::u8"
          },
          {
            "name": "recipient4",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "percentage4",
            "type": "core::integer::u8"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "cancel_sme4",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "distribute_sme4_payment",
        "inputs": [
          {
            "name": "total_amount",
            "type": "core::integer::u256"
          },
          {
            "name": "token",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "create_sme5",
        "inputs": [
          {
            "name": "recipient1",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "percentage1",
            "type": "core::integer::u8"
          },
          {
            "name": "recipient2",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "percentage2",
            "type": "core::integer::u8"
          },
          {
            "name": "recipient3",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "percentage3",
            "type": "core::integer::u8"
          },
          {
            "name": "recipient4",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "percentage4",
            "type": "core::integer::u8"
          },
          {
            "name": "recipient5",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "percentage5",
            "type": "core::integer::u8"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "cancel_sme5",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "distribute_sme5_payment",
        "inputs": [
          {
            "name": "total_amount",
            "type": "core::integer::u256"
          },
          {
            "name": "token",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_user_active_sme4",
        "inputs": [
          {
            "name": "user",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_user_active_sme5",
        "inputs": [
          {
            "name": "user",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "cancel_sme3_by_id",
        "inputs": [
          {
            "name": "sme_id",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "cancel_sme4_by_id",
        "inputs": [
          {
            "name": "sme_id",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "cancel_sme5_by_id",
        "inputs": [
          {
            "name": "sme_id",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "cancel_sme_by_id",
        "inputs": [
          {
            "name": "sme_id",
            "type": "core::integer::u256"
          },
          {
            "name": "sme_type",
            "type": "core::integer::u8"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "constructor",
    "name": "constructor",
    "inputs": [
      {
        "name": "usdc",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "usdt",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "strk",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "protocol_fee_collector",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "type": "event",
    "name": "starkpay_africa::starkpay::Starkpay::PaymentRequestCreated",
    "kind": "struct",
    "members": [
      {
        "name": "request_id",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "merchant",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "receiver",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "amount",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "token",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "remarks",
        "type": "core::felt252",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "starkpay_africa::starkpay::Starkpay::DepositEvent",
    "kind": "struct",
    "members": [
      {
        "name": "caller",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "amount",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "token",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "starkpay_africa::starkpay::Starkpay::WithdrawalEvent",
    "kind": "struct",
    "members": [
      {
        "name": "user",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "receiver",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "amount",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "token",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "starkpay_africa::starkpay::Starkpay::PaymentReceived",
    "kind": "struct",
    "members": [
      {
        "name": "request_id",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "payer",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "merchant",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "amount",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "net_amount",
        "type": "core::integer::u256",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "starkpay_africa::starkpay::Starkpay::Sme3Created",
    "kind": "struct",
    "members": [
      {
        "name": "sme_id",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "owner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "starkpay_africa::starkpay::Starkpay::Sme3Distributed",
    "kind": "struct",
    "members": [
      {
        "name": "sme_id",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "total_amount",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "token",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "starkpay_africa::starkpay::Starkpay::UserRegistered",
    "kind": "struct",
    "members": [
      {
        "name": "user",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "is_merchant",
        "type": "core::bool",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "starkpay_africa::starkpay::Starkpay::MerchantStatusChanged",
    "kind": "struct",
    "members": [
      {
        "name": "user",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "is_merchant",
        "type": "core::bool",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "starkpay_africa::starkpay::Starkpay::ProtocolFeeCollected",
    "kind": "struct",
    "members": [
      {
        "name": "token",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "amount",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "fee_type",
        "type": "core::felt252",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "starkpay_africa::starkpay::Starkpay::PaymentRequestCancelled",
    "kind": "struct",
    "members": [
      {
        "name": "request_id",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "merchant",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "starkpay_africa::starkpay::Starkpay::Sme3Cancelled",
    "kind": "struct",
    "members": [
      {
        "name": "sme_id",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "owner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "starkpay_africa::starkpay::Starkpay::Sme4Created",
    "kind": "struct",
    "members": [
      {
        "name": "sme_id",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "owner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "starkpay_africa::starkpay::Starkpay::Sme4Distributed",
    "kind": "struct",
    "members": [
      {
        "name": "sme_id",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "total_amount",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "token",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "starkpay_africa::starkpay::Starkpay::Sme4Cancelled",
    "kind": "struct",
    "members": [
      {
        "name": "sme_id",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "owner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "starkpay_africa::starkpay::Starkpay::Sme5Created",
    "kind": "struct",
    "members": [
      {
        "name": "sme_id",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "owner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "starkpay_africa::starkpay::Starkpay::Sme5Distributed",
    "kind": "struct",
    "members": [
      {
        "name": "sme_id",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "total_amount",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "token",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "starkpay_africa::starkpay::Starkpay::Sme5Cancelled",
    "kind": "struct",
    "members": [
      {
        "name": "sme_id",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "owner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "starkpay_africa::starkpay::Starkpay::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "PaymentRequestCreated",
        "type": "starkpay_africa::starkpay::Starkpay::PaymentRequestCreated",
        "kind": "nested"
      },
      {
        "name": "DepositEvent",
        "type": "starkpay_africa::starkpay::Starkpay::DepositEvent",
        "kind": "nested"
      },
      {
        "name": "WithdrawalEvent",
        "type": "starkpay_africa::starkpay::Starkpay::WithdrawalEvent",
        "kind": "nested"
      },
      {
        "name": "PaymentReceived",
        "type": "starkpay_africa::starkpay::Starkpay::PaymentReceived",
        "kind": "nested"
      },
      {
        "name": "Sme3Created",
        "type": "starkpay_africa::starkpay::Starkpay::Sme3Created",
        "kind": "nested"
      },
      {
        "name": "Sme3Distributed",
        "type": "starkpay_africa::starkpay::Starkpay::Sme3Distributed",
        "kind": "nested"
      },
      {
        "name": "UserRegistered",
        "type": "starkpay_africa::starkpay::Starkpay::UserRegistered",
        "kind": "nested"
      },
      {
        "name": "MerchantStatusChanged",
        "type": "starkpay_africa::starkpay::Starkpay::MerchantStatusChanged",
        "kind": "nested"
      },
      {
        "name": "ProtocolFeeCollected",
        "type": "starkpay_africa::starkpay::Starkpay::ProtocolFeeCollected",
        "kind": "nested"
      },
      {
        "name": "PaymentRequestCancelled",
        "type": "starkpay_africa::starkpay::Starkpay::PaymentRequestCancelled",
        "kind": "nested"
      },
      {
        "name": "Sme3Cancelled",
        "type": "starkpay_africa::starkpay::Starkpay::Sme3Cancelled",
        "kind": "nested"
      },
      {
        "name": "Sme4Created",
        "type": "starkpay_africa::starkpay::Starkpay::Sme4Created",
        "kind": "nested"
      },
      {
        "name": "Sme4Distributed",
        "type": "starkpay_africa::starkpay::Starkpay::Sme4Distributed",
        "kind": "nested"
      },
      {
        "name": "Sme4Cancelled",
        "type": "starkpay_africa::starkpay::Starkpay::Sme4Cancelled",
        "kind": "nested"
      },
      {
        "name": "Sme5Created",
        "type": "starkpay_africa::starkpay::Starkpay::Sme5Created",
        "kind": "nested"
      },
      {
        "name": "Sme5Distributed",
        "type": "starkpay_africa::starkpay::Starkpay::Sme5Distributed",
        "kind": "nested"
      },
      {
        "name": "Sme5Cancelled",
        "type": "starkpay_africa::starkpay::Starkpay::Sme5Cancelled",
        "kind": "nested"
      }
    ]
  }
] as const

export const VELO_CONTRACT_ADDRESS = "0x07bcf72f7388e6c5799f0da3b83a710adb836debee8c5b8a8a8bfab3055b0c26"; 

export function useSwiftContract() {
  const { contract } = useContract({
    abi: VELO_ABI,
    address: VELO_CONTRACT_ADDRESS,
  });
  return contract;
}