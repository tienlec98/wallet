import { STANDARD, Wallet } from './types'
import { privateKeyToAddress, convertPrivateKey, publicKeyToAddress, generateMasterKey } from './services'
import { generateParam } from './common'

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
}
