const { assert } = require('chai')
const zip = require('lodash.zip')

const { assertThrows, generateString } = require('waves-test-util')
const { TEST_USER1, TEST_USER2,
        TEST_USER1_UPDATE, TEST_USER2_UPDATE } = require('waves-test-data')

const { MAX_STRING_LENGTH } = require('../models')

const TEST_USERS = [TEST_USER1, TEST_USER2]
const TEST_USER_UPDATES = [TEST_USER1_UPDATE, TEST_USER2_UPDATE]

module.exports = getStorage => {
  describe('User methods', async () => {
    it('Initial fields cannot be empty', async () => {
      const user = TEST_USER1
      await testFieldsNotEmpty(getStorage, user)
    })

    it('Initial fields have max length', async () => {
      const user = TEST_USER1
      await testFieldsMaxLength(getStorage, user)
    })

    it('Failed attempts were not added to database', async () => {
      const { idp, idpId } = TEST_USER1
      const user = await getStorage().getUserInternal(idp, idpId)
      assert.isNull(user)
    })

    it('Create users', async () => {
      for (const testUser of TEST_USERS) {
        const { idp, idpId, email, name } = testUser
        const user = await getStorage().getUser(idp, idpId, email, name)
        for (const attr in testUser) {
          assert.strictEqual(user[attr], testUser[attr])
        }
      }
    })

    it('Get users', async () => {
      for (const testUser of TEST_USERS) {
        const { idp, idpId } = testUser
        const user = await getStorage().getUserInternal(idp, idpId)
        for (const attr in testUser) {
          assert.strictEqual(user[attr], testUser[attr])
        }
      }
    })

    it('Updated fields cannot be empty', async () => {
      const user = {...TEST_USER1, ...TEST_USER1_UPDATE}
      await testFieldsNotEmpty(getStorage, user)
    })

    it('Updated Fields have max length', async () => {
      const user = {...TEST_USER1, ...TEST_USER1_UPDATE}
      await testFieldsMaxLength(getStorage, user)
    })

    it('Failed update attempts do not affect db', async () => {
      for (const testUser of TEST_USERS) {
        const { idp, idpId } = testUser
        const user = await getStorage().getUserInternal(idp, idpId)
        for (const attr in testUser) {
          assert.strictEqual(user[attr], testUser[attr])
        }
      }
    })

    it('Update users', async () => {
      /* Update test objects */
      for (const [testUser, testUserUpdate] of zip(TEST_USERS, TEST_USER_UPDATES)) {
        Object.assign(testUser, testUserUpdate)
        const { idp, idpId, email, name } = testUser
        const user = await getStorage().getUser(idp, idpId, email, name)
        for (const attr in testUser) {
          assert.strictEqual(user[attr], testUser[attr])
        }
      }
    })

    it('Get updated users', async () => {
      for (const [testUser, testUserUpdate] of zip(TEST_USERS, TEST_USER_UPDATES)) {
        const { idp, idpId } = testUser
        const user = await getStorage().getUserInternal(idp, idpId)
        for (const attr in testUser) {
          assert.strictEqual(user[attr], testUser[attr])
        }
        for (const attr in testUserUpdate) {
          assert.strictEqual(user[attr], testUserUpdate[attr])
        }
      }
    })

  })
}

async function testFieldsNotEmpty(getStorage, user) {
  for (const attr in user) {
    for (const emptyVal of [null, undefined, '']) {
      const msg = `ValidationError: ${attr}: user ${attr} is required`
      await testUserCreateInvalidValue(
        getStorage, user, attr, emptyVal, msg)
    }
  }
}

async function testFieldsMaxLength(getStorage, user) {
  for (const attr in user) {
    const overVal = generateString(MAX_STRING_LENGTH + 1)
    const msg = (
      `ValidationError: ${attr}: ` +
      `Path \`${attr}\` (\`${overVal}\`) ` +
      `is longer than the maximum ` +
      `allowed length (${MAX_STRING_LENGTH}).`)

    await testUserCreateInvalidValue(
      getStorage, user, attr, overVal, msg)
  }
}

async function testUserCreateInvalidValue(getStorage, user, attr, val, msg) {
  const userCopy = {...user}
  userCopy[attr] = val
  const {idp, idpId, email, name } = userCopy
  const args = [idp, idpId, email, name]
  await assertThrows('getUser', getStorage().getUser, args, msg)
}

