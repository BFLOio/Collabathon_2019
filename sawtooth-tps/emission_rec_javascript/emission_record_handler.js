'use strict'

const { TransactionHandler } = require('./sawtooth-sdk/processor/handler')
const {
  InvalidTransaction,
  InternalError
} = require('./sawtooth-sdk/processor/exceptions')

const MAX_NAME_LENGTH = 20

const crypto = require('crypto')
const cbor = require('cbor')

const _hash = (x) =>
  crypto.createHash('sha512').update(x).digest('hex').toLowerCase()

const EMSSIONS_KEY_FAMILY = 'emissions'
const EMSSIONS_KEY_NAMESPACE = _hash(EMSSIONS_KEY_FAMILY).substring(0, 6)

const _decodeCbor = (buffer) =>
  new Promise((resolve, reject) =>
    cbor.decodeFirst(buffer, (err, obj) => (err ? reject(err) : resolve(obj)))
  )

const _toInternalError = (err) => {
  let message = (err.message) ? err.message : err
  throw new InternalError(message)
}

const _setEntry = (context, address, stateValue) => {
  let entries = {
    [address]: cbor.encode(stateValue)
  }
  return context.setState(entries)
}

const _applySet = (context, address, name, value) => (possibleAddressValues) => {
  let stateValueRep = possibleAddressValues[address]

  let stateValue
  if (stateValueRep && stateValueRep.length > 0) {
    stateValue = cbor.decodeFirstSync(stateValueRep)
    let stateName = stateValue[name]
    if (stateName) {
      throw new InvalidTransaction(
        `Verb is "set" but Name already in state, Name: ${name} Value: ${stateName}`
      )
    }
  }

  // 'set' passes checks so store it in the state
  if (!stateValue) {
    stateValue = {}
  }

  stateValue[name] = value

  return _setEntry(context, address, stateValue)
}

const _applyOperator = (verb, op) => (context, address, name, value) => (possibleAddressValues) => {
  let stateValueRep = possibleAddressValues[address]
  if (!stateValueRep || stateValueRep.length === 0) {
    throw new InvalidTransaction(`Verb is ${verb} but Name is not in state`)
  }

  let stateValue = cbor.decodeFirstSync(stateValueRep)
  if (stateValue[name] === null || stateValue[name] === undefined) {
    throw new InvalidTransaction(`Verb is ${verb} but Name is not in state`)
  }

  const result = op(stateValue[name], value)

  stateValue[name] = result
  return _setEntry(context, address, stateValue)
}


class EmissionsKeyHandler extends TransactionHandler {
  constructor() {
    super(EMSSIONS_KEY_FAMILY, ['1.0'], [EMSSIONS_KEY_NAMESPACE])
  }

  apply(transactionProcessRequest, context) {
    return _decodeCbor(transactionProcessRequest.payload)
      .catch(_toInternalError)
      .then((update) => {
        //
        // Validate the update
        let name = update.Name
        if (!name) {
          throw new InvalidTransaction('Name is required')
        }

        if (name.length > MAX_NAME_LENGTH) {
          throw new InvalidTransaction(
            `Name must be a string of no more than ${MAX_NAME_LENGTH} characters`
          )
        }

        let verb = update.Verb
        if (!verb) {
          throw new InvalidTransaction('Verb is required')
        }

        let value = update.Value
        if (value === null || value === undefined) {
          throw new InvalidTransaction('Value is required')
        }

        let parsed = parseInt(value)
        if (parsed !== value || parsed < MIN_VALUE || parsed > MAX_VALUE) {
          throw new InvalidTransaction(
            `Value must be an integer ` +
            `no less than ${MIN_VALUE} and ` +
            `no greater than ${MAX_VALUE}`)
        }

        value = parsed

        // Determine the action to apply based on the verb
        let actionFn
        if (verb === 'set') {
          actionFn = _applySet
        } else if (verb === 'dec') {
          actionFn = _applyDec
        } else if (verb === 'inc') {
          actionFn = _applyInc
        } else {
          throw new InvalidTransaction(`Verb must be set, inc, dec not ${verb}`)
        }

        let address = EMISSIONS_KEY_NAMESPACE + _hash(name).slice(-64)

        // Get the current state, for the key's address:
        let getPromise = context.getState([address])

        // Apply the action to the promise's result:
        let actionPromise = getPromise.then(
          actionFn(context, address, name, value)
        )

        // Validate that the action promise results in the correctly set address:
        return actionPromise.then(addresses => {
          if (addresses.length === 0) {
            throw new InternalError('State Error!')
          }
          console.log(`Verb: ${verb} Name: ${name} Value: ${value}`)
        })
      })
  }
}

module.exports = EmissionsKeyHandler
