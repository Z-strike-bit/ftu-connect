import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import fs from 'fs';

const PROJECT_ID = 'ftu-connect-test';
let testEnv: any;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8')
    }
  });
});

after(async () => {
  await testEnv.cleanup();
});

describe('firestore rules basic', () => {
  it('unauthenticated cannot create thread', async () => {
    const unauth = testEnv.unauthenticatedContext();
    const db = unauth.firestore();
    await assertFails(db.collection('threads').doc('t1').set({ authorUid: 'anon', title: 'x', content: 'y', status: 'published' }));
  });

  it('authenticated user can create own thread', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const db = alice.firestore();
    await assertSucceeds(db.collection('threads').doc('t-alice').set({ authorUid: 'alice', title: 'hello', content: 'body', status: 'published' }));
  });

  it('user cannot update other user thread', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const bob = testEnv.authenticatedContext('bob');
    const dbAlice = alice.firestore();
    await assertSucceeds(dbAlice.collection('threads').doc('t2').set({ authorUid: 'alice', title: 't', content: 'c', status: 'published' }));
    const dbBob = bob.firestore();
    await assertFails(dbBob.collection('threads').doc('t2').update({ title: 'hacked' }));
  });

  it('admin can read moderation_queue', async () => {
    const admin = testEnv.authenticatedContext('admin', { admin: true });
    const db = admin.firestore();
    await assertSucceeds(db.collection('moderation_queue').doc('m1').set({ id: 'm1', type: 'thread', content: 'x' }));
  });

  it('regular user cannot change tier/verifiedCompany on another user profile', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const bob = testEnv.authenticatedContext('bob');

    // Seed users/alice as alice
    const dbAlice = alice.firestore();
    await assertSucceeds(dbAlice.collection('users').doc('alice').set({ uid: 'alice', email: 'a@example.com', tier: 1 }));

    // Bob attempts to update alice's tier -> should fail
    const dbBob = bob.firestore();
    await assertFails(dbBob.collection('users').doc('alice').update({ tier: 2 }));
  });
});
