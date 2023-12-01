import { STANDARD, Wallet } from './types'
import { privateKeyToAddress, convertPrivateKey, publicKeyToAddress, generateMasterKey } from './services'
import { generateParam } from './common'
const bip39 = require('@coin98/bip39')


export default class Cryptography {
  singleChain = async (chain: string, sMnemonic: string, standard: STANDARD, isPrivateKey: boolean = false ): Promise<Wallet> => {
    if (isPrivateKey) {
      const address = await privateKeyToAddress(sMnemonic, chain, standard)
      return {
        address: address,
        privateKey: sMnemonic
      }
    }

    let mnemonic = sMnemonic
    if (!sMnemonic) {
      mnemonic = await this.genSeedPhrase()
    }

    const {algo, path} = generateParam(chain, standard)

    let masterSeed = await generateMasterKey(algo, mnemonic,  path)
  
    const privateKey = masterSeed.privateKey ? convertPrivateKey(masterSeed.privateKey, chain) : ''

    let address

    address = await publicKeyToAddress(masterSeed.publicKey, chain, standard)

    const wallet = {
      address: address,
      privateKey: privateKey,
      chain: chain,
      mnemonic: mnemonic,
      publicKeyBuffer: masterSeed.publicKey,
      privateKeyBuffer: masterSeed.privateKey
    }
    return wallet
  }
  genSeedPhrase = async (bytes: number = 128): Promise<string> => {
    const mnemonic = await bip39.generateMnemonic(bytes)
    return mnemonic
  }
}
