export interface generateWalletOption {
    isPrivateKey?: boolean,
    standard: string
}

export type Bufferkey = Buffer | Uint8Array

export interface Wallet {
    name?: string
    address: string
    privateKey?: string
    mnemonic?: string
    publicKey?: string
}

export type Options = {
    algo?: string,
    SS58?: number
}

export type ALGORITHM = 'hd' | 'nacl' | 'polkadot'
export type STANDARD = 'old' | 'mid' | 'new'

export type MasterSeed = {
    publicKey: Bufferkey 
    privateKey?: Bufferkey,
    masterPublickey?: string
}