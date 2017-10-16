* PreKeyBundle
  * two constructors. sign and unsinged
  * when is unsigned prekey bundle useful?
    * probably for talking to somebody you don't know yet
* SessionTag
  * random 16 bytes
* rachet occurs when receiving a new message.

* when are prekeys deleted from store?
  * session_cleanup
    * session_save
    * session_update
  * somebody must call `pk_store.remove(prekey_id)` to queue it for removal upon session save. Don't see it in cryptobox though.
  * oic. it's actually in Session.init_from_message. upon receiving a message, `pk_store.remove(prekey_id)` is called.
  * relevant code
  * mark prekey for delete: https://github.com/wireapp/proteus.js/blob/e3b237862c2a0e733670b12b25427d69cdde5312/src/proteus/session/Session.js#L143-L150
  * actual delete in session cleanup
    * https://github.com/wireapp/wire-webapp-cryptobox/blob/e9bcc389554035da59c8a15d34e2c79e4a4d9481/src/main/ts/Cryptobox.ts#L277

* github.com/wireapp/wire-webapp-core has an example how everything is wired together, including posting, getting prekeys. encrypting & sending messages.

# prekey lifecycle

* Once a session is created from prekey, it is saved, keyed with session id (a string).
  * This session no longer needs the prekey for future messages.
* Typically, assuming the server coordinates s.t. PreKey is used once only.
  * After session is open, will delete PreKey for the receiver.

In an alternate design I might allow the same prekey be used. theoretically i override: store.delete_prekey(preKeyId)jj

* set `minimumAmountOfPreKeys` to 0
  * disables refill_prekeys
* set last resort prekey with id `Proteus.keys.PreKey.MAX_PREKEY_ID`
* custom store that ignores `store.delete_prekey`

Reusing prekey is probably a terrible idea. What if attacker could repeatedly try with the same prekey?
  * i mean there's the lastresort key... I could exhuast prekeys and attack last resort key if that's a problem.


```
alice_identity_pair.secret_key.shared_secret(bob_pkbundle.public_key),
bob_prekey.secret_key.shared_secret(alice_ident.public_key),
```

probably ok? prekey is ec25519 pair. solving it is cryptographically hard.

the whole point of it is for Bob to delete the private prekey after a suitable time. the security of the protocol doesn't depend on a prekey not being reused.

```
// Alice
const master_key = ArrayUtil.concatenate_array_buffers([
  alice_identity_pair.secret_key.shared_secret(bob_pkbundle.public_key),
  alice_base.secret_key.shared_secret(bob_pkbundle.identity_key.public_key),
  alice_base.secret_key.shared_secret(bob_pkbundle.public_key),
]);

const derived_secrets = DerivedSecrets.kdf_without_salt(master_key, 'handshake');

// Bob
const master_key = ArrayUtil.concatenate_array_buffers([
  bob_prekey.secret_key.shared_secret(alice_ident.public_key),
  bob_ident.secret_key.shared_secret(alice_base),
  bob_prekey.secret_key.shared_secret(alice_base),
]);

const derived_secrets = DerivedSecrets.kdf_without_salt(master_key, 'handshake');
```

## prekeys management

goal is to use a different prekey each day

* prekey id is unix day.
* bob publishes prekey schedule
* bob checks for new sessions, then deletes oudated prekeys.
  * prekey expired if > 6 hours.
* alice chooses the prekey of the day to open a new conversation.