class Encoder {
  encode(msg) {
    return JSON.stringify(msg)
  }

  decode(msg) {
    return JSON.parse(msg)
  }
}

module.exports = Encoder
