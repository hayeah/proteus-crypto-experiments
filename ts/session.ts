import * as Proteus from "wire-webapp-proteus"
const sodium = require("libsodium-wrappers")

class TestStore extends Proteus.session.PreKeyStore {
  constructor(public prekeys: Proteus.keys.PreKey[]) {
    super();
    // this._prekeys = prekeys;
  }

  async get_prekey(prekey_id: number) {
    return this.prekeys[prekey_id];

    // return new Promise((resolve, reject) => {
    //   resolve();
    // });
  }

  async remove(prekey_id: number) {
    delete this.prekeys[prekey_id];
    return prekey_id;
    // return new Promise((resolve, reject) => {

    //   resolve();
    // });
  }
}

async function test() {
  const [alice_ident, bob_ident] = [0, 1].map(
    () => Proteus.keys.IdentityKeyPair.new()
  );

  const [alice_store, bob_store] = [0, 1].map(
    () => new TestStore(Proteus.keys.PreKey.generate_prekeys(0, 10))
  );

  const bob_prekey = bob_store.prekeys[0];

  // const bob_bundle = Proteus.keys.PreKeyBundle.new(bob_ident.public_key, bob_prekey);

  // Bob signs a PreKeyBundle, and put it somewhere.
  // note: type error because type definition bug
  const bob_bundle = Proteus.keys.PreKeyBundle.signed(bob_ident, bob_prekey);

  console.log("prekey verify:", bob_bundle.verify());

  // Alice creates a session from bob's signed prekey bundle.
  const alice = await Proteus.session.Session.init_from_prekey(alice_ident, bob_bundle);
  const alice_msg1 = await alice.encrypt("Hi Bob 1");
  const alice_msg2 = await alice.encrypt("Hi Bob 2");

  // console.log("env1", alice_msg1.serialise());
  // console.log("env2", alice_msg2.serialise());

  console.log("bob_hello_msg", alice_msg1)
  console.log("bob_msg2", alice_msg2)

  // pretty lenient about message ordering
  const msgtuple = await Proteus.session.Session.init_from_message(bob_ident, bob_store, alice_msg2);
  // const msgtuple = await Proteus.session.Session.init_from_message(bob_ident, bob_store, alice_msg1);
  // console.log("msgtuple",msgtuple);
  const [bob, dalice_msg2] = msgtuple;

  // const dbob_msg2 = await bob.decrypt(bob_store, bob_msg2)

  // const dbob_msg3 = await bob.decrypt(bob_store, bob_msg2)
  // const msgtuple2 = await Proteus.session.Session.init_from_message(bob_ident, bob_store, bob_msg2);

  console.log("bob rcv:", sodium.to_string(dalice_msg2));

  const bob_msg1 = await bob.encrypt("Hi Alice 1");
  const bob_msg2 = await bob.encrypt("Hi Alice 2");

  const dbob_msg2 = await alice.decrypt(alice_store, bob_msg2);
  const dbob_msg1 = await alice.decrypt(alice_store, bob_msg1);

  console.log("alice rcv:", sodium.to_string(dbob_msg1));
  console.log("alice rcv:", sodium.to_string(dbob_msg2));

  const alice_msg3 = await alice.encrypt("Hi Bob 3");
  const alice_msg4 = await alice.encrypt("Hi Bob 4");
  console.log("alice_msg3", alice_msg3.message);

  const dalice_msg1 = await bob.decrypt(bob_store, alice_msg1)
  const dalice_msg3 = await bob.decrypt(bob_store, alice_msg3)
  const dalice_msg4 = await bob.decrypt(bob_store, alice_msg4)

  console.log("bob rcv:", sodium.to_string(dalice_msg4));
  console.log("bob rcv:", sodium.to_string(dalice_msg3));
  console.log("bob rcv:", sodium.to_string(dalice_msg1));


  // console.log("bob rcv:", sodium.to_string(dbob_msg2));
  // console.log("bob rcv:", sodium.to_string(dbob_msg3));

}

test().then(r => {
  console.log(r);
}).catch(err => {
  console.log("err", err);
});

