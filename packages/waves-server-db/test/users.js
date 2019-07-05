const { assert } = require('chai')
const zip = require('lodash.zip')

const {
  TEST_USER1,
  TEST_USER2,
  TEST_USER1_UPDATE,
  TEST_USER2_UPDATE
} = require('waves-test-data')

const TEST_USERS = [TEST_USER1, TEST_USER2]
const TEST_USER_UPDATES = [TEST_USER1_UPDATE, TEST_USER2_UPDATE]

module.exports = getStorage => {
  describe('User methods', async () => {
    it('Create users', async () => {
      for (const testUser of TEST_USERS) {
        const { idp, idpId, email, name } = testUser
        await getStorage().createOrUpdateUser(idp, idpId, email, name)
      }
    })

    it('Get users', async () => {
      for (const testUser of TEST_USERS) {
        const { idp, idpId } = testUser
        const user = await getStorage().getUserInternal(idp, idpId)
        assert.deepEqual(user, testUser)
      }
    })

    it('Update users', async () => {
      const combined = zip(TEST_USERS, TEST_USER_UPDATES)
      for (const [testUser, testUserUpdate] of combined) {
        Object.assign(testUser, testUserUpdate)
        const { idp, idpId, email, name } = testUser
        await getStorage().createOrUpdateUser(idp, idpId, email, name)
      }
    })

    it('Get updated users', async () => {
      const combined = zip(TEST_USERS, TEST_USER_UPDATES)
      for (const [testUser, testUserUpdate] of combined) {
        const { idp, idpId } = testUser
        const user = await getStorage().getUserInternal(idp, idpId)
        assert.deepEqual(user, testUser)
        for (const prop in testUserUpdate) {
          assert.strictEqual(user[prop], testUserUpdate[prop])
        }
      }
    })
  })
}
