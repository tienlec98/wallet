import { b58cencode, prefix } from "sotez"
import { encodeBase58 } from "../common"
import { CHAIN_DATA, CHAIN_ID } from "../constants"

// Uint8Array to string
export const convertPrivateKey = (privateKey: Uint8Array, chain: string) => {
    if([CHAIN_ID.bitcoin, CHAIN_ID.avaxX, CHAIN_ID.doge, CHAIN_ID.polkadot, CHAIN_ID.kusama, CHAIN_ID.xrp].includes(chain)) return ''
    if ([CHAIN_ID.algorand, CHAIN_ID.casper, CHAIN_ID.elrond, CHAIN_ID.ton, CHAIN_ID.solana].includes(chain)) return encodeBase58(privateKey)
    if ([CHAIN_ID.aptos,CHAIN_ID.aptosDev,CHAIN_ID.aptosLabs, CHAIN_ID.sui].includes(chain)) return '0x' + Buffer.from(privateKey.slice(0, 32)).toString('hex')
    if (CHAIN_ID.tezos === chain) return b58cencode(privateKey, prefix.edsk)
    // if ([CHAIN_ID.avaxX].includes(chain)) return Buffer.from(privateKey).toString('hex')
    if (CHAIN_ID.near === chain) return 'ed25519:' + encodeBase58(privateKey)
    if (CHAIN_DATA[chain].isCosmos || [CHAIN_ID.avaxX, CHAIN_ID.tron].includes(chain)) return Buffer.from(privateKey).toString('hex')
    return '0x' + Buffer.from(privateKey).toString('hex')
}