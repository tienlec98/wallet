import { ALGO, CHAIN_DATA, CHAIN_ID, STANDARD_KEY } from './../constants/index';
const bip39 = require('@coin98/bip39')
import base58 from "bs58"


export const validateBase58 = (value: string) => /^[A-HJ-NP-Za-km-z1-9]*$/.test(value);

export const validateMnemonic = async (mnemonic: string) => {
    return await bip39.validateMnemonic_Async(mnemonic)
}

export const encodeBase58 = (secretKey: Uint8Array): string => {
    return base58.encode(secretKey)
}

export const decodeBase58 = (secretKey: string): Uint8Array => {
    return base58.decode(secretKey)
}

export const bufferToPrivatekey = () => {

}

export const generateParam = (chain: string, standard: string) => {
    if ([CHAIN_ID.aptos, CHAIN_ID.aptosDev, CHAIN_ID.aptosLabs].includes(chain)) chain = CHAIN_ID.aptos
    if ([CHAIN_ID.archwayMainnet, CHAIN_ID.archway].includes(chain)) chain = CHAIN_ID.archway
    if ([CHAIN_ID.seiMainnet, CHAIN_ID.sei].includes(chain)) chain = CHAIN_ID.sei
    const {path: pathChain, algo} = CHAIN_DATA[chain]
    let masterSeedAlgo
    if (algo) masterSeedAlgo = algo
    else masterSeedAlgo = ALGO.nacl
    if (CHAIN_DATA[chain].isCosmos || CHAIN_DATA[chain].isWeb3) masterSeedAlgo = ALGO.hd

    let path = pathChain

    if (CHAIN_DATA[chain].isWeb3) path = "m/44'/60'/0'/0/0"
    if (CHAIN_DATA[chain].isCosmos) path = `m/44'/${CHAIN_DATA[chain].numPath}'/0'/0/0`
    if (standard === STANDARD_KEY.old) path = `m/44'/${CHAIN_DATA[chain].oldNumPath}'/0'/0/0`
    if (standard === STANDARD_KEY.old && chain === CHAIN_ID.solana) path = undefined
    if (standard === STANDARD_KEY.old && chain === CHAIN_ID.bitcoin) path = 'm'
    if (standard === STANDARD_KEY.mid && chain === CHAIN_ID.bitcoin) path = "m/44'/0'/0'/0/0"

    // const key = `${masterSeedAlgo} ${path || 'm'}`

    return {
        algo: masterSeedAlgo,
        path: path || 'm',
        chain: chain
    }
  }