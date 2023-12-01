const { publicKeyCreate } = require('secp256k1')
const createKeccakHash = require('keccak')
import Web3 from 'web3';
import nacl from "tweetnacl"
import { CHAIN_DATA, CHAIN_ID } from '../constants';
import { b58cdecode, prefix } from 'sotez'
import base58 from "bs58"
import { decodeBase58 } from '../common';
import { publicKeyToAddress } from './publicKeyToAddress';
const Tron = require('tronweb')
const crypto_1 = require("@cosmjs/crypto");


const privateKeyToAddressEVM = (privateKey: string) => {
    const privateKeyString = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey
    const privateKeyBuffer = Buffer.from(privateKeyString, 'hex')
    const publicKey = Buffer.from(publicKeyCreate(privateKeyBuffer, false)).slice(1)
    const hash = createKeccakHash('keccak256').update(publicKey).digest()
    return Web3.utils.toChecksumAddress(hash.slice(-20).toString('hex'))
}

const privateKeyToAddressCosmos = async (privateKey: string, chain: string, standard: string) => {
    const privateKeyBuffer = Buffer.from(privateKey, 'hex')
    const uncompressed = (await crypto_1.Secp256k1.makeKeypair(privateKeyBuffer)).pubkey;
    const publicKey= crypto_1.Secp256k1.compressPubkey(uncompressed)

    const address = publicKeyToAddress(publicKey,chain,standard)
    return address
}

const genarateMasterSeedfromPrivateKey = (privateKey: Uint8Array, chain: string) => {
    if ([CHAIN_ID.aptos, CHAIN_ID.aptosDev, CHAIN_ID.aptosLabs, CHAIN_ID.sui].includes(chain)) return nacl.sign.keyPair.fromSeed(privateKey)
    if (chain === CHAIN_ID.conflux) return { publicKey: publicKeyCreate(privateKey, false) }
    const masterSeed = nacl.sign.keyPair.fromSecretKey(privateKey)
    return masterSeed
}

const privateKeyToBuffer = (privateKey: string, chain: string) => {
    if ([CHAIN_ID.algorand, CHAIN_ID.casper, CHAIN_ID.elrond, CHAIN_ID.ton, CHAIN_ID.solana].includes(chain)) return decodeBase58(privateKey)
    if ([CHAIN_ID.aptos, CHAIN_ID.aptosDev, CHAIN_ID.aptosLabs, CHAIN_ID.sui].includes(chain)) return Buffer.from(privateKey.slice(2), 'hex')
    if (CHAIN_ID.tezos === chain) return b58cdecode(privateKey, prefix.edsk as Uint8Array)
    if (CHAIN_ID.near === chain) return base58.decode(privateKey.slice(8))
    if (CHAIN_ID.conflux === chain) return Buffer.from(privateKey.slice(2), 'hex')
    return Buffer.from(privateKey, 'hex')
}

export const privateKeyToAddress = (privateKey: string, chain: string, standard: string) => {
    if (CHAIN_DATA[chain].isWeb3 || chain === CHAIN_ID.theta) {
        return privateKeyToAddressEVM(privateKey)
    }
    if (CHAIN_DATA[chain].isCosmos) {
        return privateKeyToAddressCosmos(privateKey, chain, standard)
    }
    if (CHAIN_ID.tron === chain) return Tron.address.fromPrivateKey(privateKey);
    const privateKeyBuffer = privateKeyToBuffer(privateKey, chain)
    const masterSeed = genarateMasterSeedfromPrivateKey(privateKeyBuffer as Uint8Array, chain)
    const address = publicKeyToAddress(masterSeed.publicKey, chain, standard)
    return address
}