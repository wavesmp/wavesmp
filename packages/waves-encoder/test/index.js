const { assert } = require('chai')

const Encoder = require('..')

describe('Encoder', () => {
  const encoder = new Encoder()
  describe('#encode(), #decode()', () => {
    it('should encode and decode an integer type', () => {
      const payload = 5
      const encoded = encoder.encode(payload)
      assert.typeOf(encoded, 'string')
      const decoded = encoder.decode(encoded)
      assert.strictEqual(payload, decoded)
    })

    it('should encode and decode a string type', () => {
      const payload = 'hello'
      const encoded = encoder.encode(payload)
      assert.typeOf(encoded, 'string')
      const decoded = encoder.decode(encoded)
      assert.strictEqual(payload, decoded)
    })

    it('should encode and decode a list type', () => {
      const payload = ['hello', 'good', 'morning']
      const encoded = encoder.encode(payload)
      assert.typeOf(encoded, 'string')
      const decoded = encoder.decode(encoded)
      assert.deepEqual(payload, decoded)
    })

    it('should encode and decode an object type', () => {
      const payload = {
        int: 2,
        string: 'foo',
        obj: { nested: 'obj' },
        arr: ['foo', 'bar', { nestedarrobj: 'obj' }]
      }
      const encoded = encoder.encode(payload)
      assert.typeOf(encoded, 'string')
      const decoded = encoder.decode(encoded)
      assert.deepEqual(payload, decoded)
    })
  })
})
