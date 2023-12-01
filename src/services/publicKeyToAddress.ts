import { blake2b } from '@noble/hashes/blake2b'
import Web3 from 'web3'
import { Bufferkey } from '../types'

import { PublicToAddress } from '@wallet/publicToAddress'
import { CHAIN_ID, CHAIN_DATA, STANDARD_KEY } from '../constants'
import { encodeBase58 } from '../common'
const { publicKeyConvert } = require('secp256k1')
const createKeccakHash = require('keccak')

import { toBech32 } from '@cosmjs/encoding'
import { rawSecp256k1PubkeyToRawAddress } from '@cosmjs/amino'
import { Network, payments } from 'bitcoinjs-lib'
const Tron = require('tronweb')
const { deriveAddress } = require('xrpl')

const networkBitcoin = {
  messagePrefix: '\u0018Bitcoin Signed Message:\n',
  bech32: 'bc',
  bip32: {
    public: 76067358,
    private: 76066276
  },
  pubKeyHash: 0,
  scriptHash: 5,
  wif: 128
}

const networkBitcoinTestNet = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'tb',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef
}

export const dogecoin = {
  messagePrefix: '\x19Dogecoin Signed Message:\n',
  bip32: {
    public: 0x02facafd,
    private: 0x02fac398
  },
  pubKeyHash: 0x1e,
  scriptHash: 0x16,
  wif: 0x9e
}

const publicKeyToAddressEvm = (publicKey: Uint8Array) => {
  publicKey = Buffer.from(publicKeyConvert(publicKey, false)).slice(1)
  const hash = createKeccakHash('keccak256').update(publicKey).digest()
  return Web3.utils.toChecksumAddress('0x' + hash.slice(-20).toString('hex'))
}

const publicKeyToAddressPolkadot = (publicKey: Uint8Array, ss58: number) => {
  const dataAddtualua = new Uint8Array([83, 83, 53, 56, 80, 82, 69, ss58, ...publicKey])
  const okla = blake2b(dataAddtualua, { dkLen: 64 })
  const result = new Uint8Array([ss58, ...publicKey, okla[0], okla[1]] as number[])
  return encodeBase58(result)
}

const publicKeyToAddressEthSecp256k1 = (publicKey: Uint8Array) => {
  publicKey = Buffer.from(publicKeyConvert(publicKey, false)).slice(1)
  const hash = createKeccakHash('keccak256').update(publicKey).digest().slice(-20)
  return hash
}

export const publicKeyToAddress = (publicKey: Bufferkey, chain: string, standard: string) => {
  const pubToAddress = new PublicToAddress()
  if (CHAIN_DATA[chain].isWeb3 || chain === CHAIN_ID.theta) return publicKeyToAddressEvm(publicKey)
  if (chain === CHAIN_ID.near) return Buffer.from(publicKey).toString('hex')
  if (chain === CHAIN_ID.tron) return Tron.address.fromHex(publicKeyToAddressEvm(publicKey).replace('0x', '41'))
  if (chain === CHAIN_ID.solana) return encodeBase58(publicKey)
  if (CHAIN_DATA[chain].isPolkadot) return publicKeyToAddressPolkadot(publicKey, CHAIN_DATA[chain].SS58)

  if ([CHAIN_ID.evmos, CHAIN_ID.injective].includes(chain)) {
    if (standard === STANDARD_KEY.old) return toBech32(CHAIN_DATA[chain].prefix, rawSecp256k1PubkeyToRawAddress(publicKey))
    return toBech32(CHAIN_DATA[chain].prefix, publicKeyToAddressEthSecp256k1(publicKey))
  }
  if (CHAIN_DATA[chain].isCosmos) return toBech32(CHAIN_DATA[chain].prefix, rawSecp256k1PubkeyToRawAddress(publicKey))

  if (chain === CHAIN_ID.bitcoin) {
    if ([STANDARD_KEY.old, STANDARD_KEY.mid].includes(standard)) return payments.p2pkh({ pubkey: Buffer.from(publicKey), network: networkBitcoin }).address
    return payments.p2wpkh({ pubkey: Buffer.from(publicKey), network: networkBitcoin }).address
  }
  if (chain === CHAIN_ID.doge) return payments.p2pkh({ pubkey: Buffer.from(publicKey), network: dogecoin as Network }).address
  if (chain === CHAIN_ID.xrp) return deriveAddress(Buffer.from(publicKey).toString('hex'))
  if (chain === CHAIN_ID.bitcoinTestNet)
    return payments.p2wpkh({ pubkey: Buffer.from(publicKey), network: networkBitcoinTestNet as Network }).address
  return pubToAddress.encode(chain, publicKey)
}
