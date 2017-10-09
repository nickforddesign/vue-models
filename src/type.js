import _get from 'lodash.get'

export default class Type {
  constructor(value, key) {
    this.value = undefined
    if (key) this.key = key
    const val = this.getValue(value)
    if (val) this.set(val)
    return this
  }
  set(value) {
    this.in(value)
    return this
  }
  valueOf() {
    return this.out()
  }
  getValue(value) {
    return this.key
      ? _get(value, this.key) || value
      : value
  }
  in(value) {
    this.value = value
    return this
  }
  out() {
    return this.value
  }
  encode() {
    // encode data for mongodb
    let output
    const value = this.valueOf()
    // only use mongo encoding if both mongo key and value are set
    if (this.key && value) {
      output = {}
      output[this.key] = value
    } else {
      output = value
    }
    return output
  }
}
