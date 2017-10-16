
import * as Proteus from "wire-webapp-proteus"
import * as CBOR from 'wire-webapp-cbor'
const sodium = require("libsodium-wrappers")



// const idpair = Proteus.keys.IdentityKeyPair.new()
// const idpairhex = sodium.to_hex(new Uint8Array(idpair.serialise()))

// console.log("idpair", idpairhex)



const idpairhexFrom = "a3000101a1005840d95e61a439addc20da9122d3d509f9e63fd052f899797da8d105c46d1e7d0acd4c42c8ef908f9f0fa270478c2ea27d012d5ed148ea77e7448aaba917e25a44f602a100a10058204c42c8ef908f9f0fa270478c2ea27d012d5ed148ea77e7448aaba917e25a44f6"

const idpair = Proteus.keys.IdentityKeyPair.deserialise(sodium.from_hex(idpairhexFrom).buffer)

const {
  public_key,
  secret_key,
} = idpair



const msg = "hellooo"
const sig = secret_key.sign(msg)

console.log("pubkey", public_key.fingerprint())

console.log("secret_key length", secret_key.sec_edward.length)
console.log("secret_key length", secret_key.sec_curve.length)

console.log("sig", sodium.to_hex(sig))

console.log("verify", public_key.public_key.verify(sig, msg))

console.log("verify", public_key.public_key.verify(sig, msg + msg))
