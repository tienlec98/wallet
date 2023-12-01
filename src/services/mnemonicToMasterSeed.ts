import { NativeModules, Platform } from 'react-native';
import { ALGORITHM } from '../types';

const LINKING_ERROR =
  `The package 'coin98-core-wallet' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const AwesomeLibrary = NativeModules.AwesomeLibrary
  ? NativeModules.AwesomeLibrary
  : new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  );

interface KeyPair {
  privateKey: Uint8Array
  publicKey: Uint8Array
}

type Data = String | number[][]


enum Env {
  android = "ANDROID",
  ios = "IOS"
}

const constant = {
  env: "ENVIRONMENT"
}

const enviroment = AwesomeLibrary.getConstants()

const formatData = (data: Data)=>{
  if(enviroment[constant.env] === Env.android){
    const [publicKeyString, privateKeyString] = (data as String).split('  ')
    const [publicKey, privateKey] = [(publicKeyString as String).split(' '), (privateKeyString as String).split(' ')]
    return {
      privateKey: Uint8Array.from(privateKey.map(item=>parseInt(item))) ,
      publicKey: Uint8Array.from(publicKey.map(item=>parseInt(item)))
    }
  }
  return {
    privateKey: Uint8Array.from(data[1] as number[]),
    publicKey: Uint8Array.from(data[0] as number[])
  }
}


export async function generateMasterKey(type: ALGORITHM, mnemonic: string, path: string): Promise<KeyPair> {
  if (type === 'hd') {
    const masterSeedHd: Data = await AwesomeLibrary.hdkey(mnemonic, path);
    return formatData(masterSeedHd)
  }
  if (type === 'polkadot') {
    const masterSeedPolkadot = await AwesomeLibrary.polkadot(mnemonic, path);
    return formatData(masterSeedPolkadot)
  }
  // nacl
  const masterSeedNacl = await AwesomeLibrary.nacl(mnemonic, path);
  return formatData(masterSeedNacl)
}

export async function generateXpubHd(mnemonic: string, chain: string): Promise<String> {
  const xpub: String = await AwesomeLibrary.xpubHd(mnemonic, chain);
  return xpub
}
