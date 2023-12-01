import WalletCore
import TweetNacl
import Ed25519HDKeySwift
import Sr25519
import CommonCrypto


@objc(AwesomeLibrary)
class AwesomeLibrary: NSObject {

    @objc(xpubHd:withB:withResolver:withRejecter:)
  func xpubHd(mnemonicString: String, chain: String, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {

      var purpose: Purpose  = Purpose.bip44
      var coinType: CoinType = CoinType.ethereum

      if(chain=="doge"){
          purpose = Purpose.bip44
          coinType = CoinType.dogecoin
      }
      if(chain=="bitcoin"){
          purpose = Purpose.bip84
          coinType = CoinType.bitcoin
      }

      let wallet = HDWallet(mnemonic: mnemonicString, passphrase: "")!
      let xpub = wallet.getExtendedPublicKey(purpose: purpose, coin: coinType , version: HDVersion.xpub)

    resolve(xpub)
  }

  @objc(hdkey:withB:withResolver:withRejecter:)
  func hdkey(mnemonicString: String, path: String, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
    let wallet = HDWallet(mnemonic: mnemonicString, passphrase: "")!
    let key = wallet.getKey(coin: CoinType.ethereum , derivationPath: path)
    let publicKeyBase64 = key.getPublicKeyByType(pubkeyType: PublicKeyType.secp256k1).data.bytes
    let privateKeyBase64 = key.data.bytes
      resolve([publicKeyBase64,privateKeyBase64])
  }

  @objc(nacl:withB:withResolver:withRejecter:)
  func nacl(mnemonicString: String, path: String, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
      let preSeed: Data
      do{
          let seed = HDWallet(mnemonic: mnemonicString, passphrase: "")!.seed
          if(path == "m") {
              preSeed = Data(seed.bytes[0...31])
          } else {
              preSeed = try Ed25519HDKey.derivePath(path, seed: seed.toHexString()).key
          }
          let masterSeed = try NaclSign.KeyPair.keyPair(fromSeed: preSeed)

          let publicKeyBase64 = masterSeed.publicKey.bytes
          let privateKeyBase64 = masterSeed.secretKey.bytes
          resolve([publicKeyBase64,privateKeyBase64])
      } catch {
          resolve(["",""])
      }
  }
    
    
    func PBKDF2_SHA512(input: Array<UInt8>, salt: Array<UInt8>, iterationsCount: UInt32, dkLen: Int) -> Data? {
        var inputData = input.map(Int8.init)
        var saltBytes = salt
        
        var result: [UInt8] = Array<UInt8>(repeating: 0, count: dkLen)
        
        let error = CCKeyDerivationPBKDF(CCPBKDFAlgorithm(kCCPBKDF2),
                                         &inputData,
                                         inputData.count,
                                         &saltBytes,
                                         saltBytes.count,
                                         5,
                                         iterationsCount,
                                         &result,
                                         result.count)
        if error == kCCSuccess {
            return Data(result)
        }
        
        return nil
    }

  @objc(polkadot:withB:withResolver:withRejecter:)
    func polkadot(mnemonicString: String, path: String, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        do{
            let entropy: Array<UInt8> = HDWallet(mnemonic: mnemonicString, passphrase: "")!.entropy.bytes
            let salt: Array<UInt8> = [109, 110, 101, 109, 111, 110, 105, 99]
            let miniSeed = PBKDF2_SHA512(input: entropy, salt: salt, iterationsCount: 2048, dkLen: 32)!
            let sr25519Seed = try Sr25519Seed(raw: Data(miniSeed))
            let publicKey = Sr25519KeyPair(seed: sr25519Seed).publicKey.raw.bytes
            resolve([publicKey,""])
        } catch {
            resolve(["",""])
        }
    }
    }
