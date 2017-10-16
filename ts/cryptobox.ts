import * as Box from "wire-webapp-cryptobox";
import * as Proteus from "wire-webapp-proteus";

async function test() {
  const alice_id = Proteus.keys.IdentityKeyPair.new();
  const bob_id = Proteus.keys.IdentityKeyPair.new();



  const store = new Box.store.Cache();

  // This is optional. Otheriwse box would create a new identity on init().
  store.save_identity(alice_id)

  const abox = new Box.Cryptobox(store, 0);

  // setup last resort prekey
  // setup identity
  // fill prekeys
  await abox.init();

  const prekeys = await store.load_prekeys();
  console.log("prekeys", prekeys)

  const session_id = "alice & bob"

  
  // abox.encrypt(session_id,)

}

test().then(r => {
  console.log(r);
}).catch(err => {
  console.log("err", err);
});

