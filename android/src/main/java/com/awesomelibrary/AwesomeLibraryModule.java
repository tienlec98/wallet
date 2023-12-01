package com.awesomelibrary;

import androidx.annotation.NonNull;


import android.util.Log;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.common.ArrayUtils;
import com.facebook.react.module.annotations.ReactModule;

import wallet.core.jni.HDVersion;
import wallet.core.jni.HDWallet;
import wallet.core.jni.CoinType;
import wallet.core.jni.PrivateKey;
import wallet.core.jni.PublicKeyType;
import wallet.core.jni.PBKDF2;
import wallet.core.jni.Purpose;

import org.sol4k.tweetnacl.TweetNacl;

import com.sr25519.schnorrkel.sign.ExpansionMode;
import com.sr25519.schnorrkel.sign.KeyPair;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@ReactModule(name = AwesomeLibraryModule.NAME)
public class AwesomeLibraryModule extends ReactContextBaseJavaModule {
  public static final String NAME = "AwesomeLibrary";

  public AwesomeLibraryModule(ReactApplicationContext reactContext) {
    super(reactContext);
    System.loadLibrary("TrustWalletCore");
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }


  // Example method
  // See https://reactnative.dev/docs/native-modules-android

  String convertByteArrayToString(byte[] publicKeyBase64, byte[] privateKeyBase64){
    String publicKeyString = "";
    String privateKeyString = "";
    for (int i = 0; i < publicKeyBase64.length; i++) {
      publicKeyString += String.valueOf(publicKeyBase64[i] & 0xff) + " ";
    }
    for (int i = 0; i < privateKeyBase64.length; i++) {
      privateKeyString += " " + String.valueOf(privateKeyBase64[i] & 0xff);
    }
    return publicKeyString + privateKeyString;
  }

  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put("ENVIRONMENT", "ANDROID");
    return constants;
  }

  @ReactMethod
  public void xpubHd(String mnemonic , String chain, Promise promise) {
    Purpose purpose  =  Purpose.BIP44;
    CoinType coinType = CoinType.ETHEREUM;
    if(chain.equals("doge")){
      purpose = Purpose.BIP44;
      coinType = CoinType.DOGECOIN;
    }
    if(chain.equals("bitcoin")){
      purpose = Purpose.BIP84;
      coinType = CoinType.BITCOIN;
    }
    HDWallet wallet = new HDWallet(mnemonic, "");
    String xpub = wallet.getExtendedPublicKey(purpose, coinType, HDVersion.XPUB);
    promise.resolve(xpub);
  }

  @ReactMethod
  public void hdkey(String mnemonic , String path, Promise promise) {
    HDWallet wallet = new HDWallet(mnemonic, "");
    PrivateKey key = wallet.getKey(CoinType.ETHEREUM , path);
    byte[] publicKeyBase64 = key.getPublicKeyByType(PublicKeyType.SECP256K1).data();
    byte[] privateKeyBase64 = key.data();
    String result = convertByteArrayToString(publicKeyBase64,privateKeyBase64);
    promise.resolve(result);
  }

  @ReactMethod
  public void nacl(String mnemonic , String path, Promise promise) {
    HDWallet wallet = new HDWallet(mnemonic, "");
    byte[] publicKeyBase64;
    byte[] privateKeyBase64;
    if(path.equals("m")){
      byte[] seed = Arrays.copyOfRange(wallet.seed(),0,32);
      TweetNacl.Signature.KeyPair keyPair = TweetNacl.Signature.keyPair_fromSeed(seed);
      publicKeyBase64 = keyPair.getPublicKey();
      privateKeyBase64 = keyPair.getSecretKey();
    }
    else {
      PrivateKey key = wallet.getKey(CoinType.SOLANA , path);
      publicKeyBase64 = key.getPublicKeyEd25519().data();
      byte[] privateKey32Byte = key.data();
      int length = privateKey32Byte.length + publicKeyBase64.length;
      byte[] result = new byte[length];
      System.arraycopy(publicKeyBase64, 0, result, 0, privateKey32Byte.length);
      System.arraycopy(privateKey32Byte, 0, result, privateKey32Byte.length, publicKeyBase64.length);
      privateKeyBase64 = result;
    }
    String result = convertByteArrayToString(publicKeyBase64,privateKeyBase64);
    promise.resolve(result);
  }

  @ReactMethod
  public void polkadot(String mnemonic , String path, Promise promise) {
    byte[] entropy = new HDWallet(mnemonic, "").entropy();
    byte[] salt = new byte[]{109, 110, 101, 109, 111, 110, 105, 99};
    byte[] miniSeed = PBKDF2.hmacSha512(entropy,salt,2048,32);

    KeyPair keyPair = KeyPair.fromSecretSeed(miniSeed, ExpansionMode.Ed25519);
    byte[] privateKey = keyPair.getPrivateKey().getKey();
    byte[] publicKey = keyPair.getPublicKey().toPublicKey();
    String result = convertByteArrayToString(publicKey,privateKey);
    promise.resolve(result);
  }
}
