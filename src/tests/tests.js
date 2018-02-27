export default (Vue, Model, User) => {
  describe('VueModel basics', () => {
    it('should have access to static schema method', () => {
      expect(Model.schema())
        .toBeInstanceOf(Object)
    })

    const model = new User({
      id: '123'
    })
    it('should properly set id', () => {
      expect(model.id)
        .toBe('123')
    })

    it('should fetch a model', () => {
      expect.assertions(1)
      return model.fetch()
        .then((res) => {
          expect(model.full_name)
            .toBe('Taco Cat')
        })
    })

    it('should be fetching the url :name/:id', () => {
      expect(global.fetch.mock.calls[global.fetchCount - 1][0])
        .toBe('users/123')
    })

    it('should have updated url based on the model data', () => {
      expect(model.url)
        .toBe('tenants/593af5eae4e0554e76b71f8a')
    })

    it('should resolve toJSON', () => {
      expect(model.toJSON())
        .toBeInstanceOf(Object)
    })

    it('should resolve decode', () => {
      expect(model.decode())
        .toBeInstanceOf(Object)
    })

    it('should resolve schema', () => {
      expect(model.schema())
        .toBeInstanceOf(Object)
    })

    it('should destroy a model', () => {
      expect(model.destroy())
        .toBeInstanceOf(Promise)
    })
  })

  const data = {
    _id: {
      $oid: '586e6d75b7a7bc5c852c60a5'
    },
    created: {
      $date: '2016-12-16T00:00:00.000Z'
    },
    updated: '2016-12-16T00:00:00.000Z',
    role: 'admin',
    first_name: 'Tony',
    last_name: 'Tiger',
    email: 'tonytiger@gmail.com',
    notifications: {
      alarm: {
        $date: '2016-12-16T00:00:00.000Z'
      },
      test: {
        one: {
          $date: '2016-12-16T00:00:00.000Z'
        },
        two: {
          three: {
            $date: '2016-12-16T00:00:00.000Z'
          }
        }
      }
    },
    things: [
      {
        id: {
          $oid: '42356d75b7a7bc5c52c11a90'
        },
        created: {
          $date: '2016-12-16T00:00:00.000Z'
        }
      },
      {
        id: {
          $oid: '09a11c25c5cb7a7b57d65324"'
        },
        created: {
          $date: '2016-12-16T00:00:00.000Z'
        }
      }
    ],
    friends: [{
      $oid: '5919d19ce4e0552c25c68e1b'
    }, {
      $oid: '590c8a72e4e0553b1cc2827a'
    }, {
      $oid: '5914688de4e0556b1dcf29d3'
    }]
  }

  describe('Extended JSON - in', () => {
    const user = new User(data)
    it('should decode extended json ISODate', () => {
      expect(user.created)
        .toBe('2016-12-16T00:00:00.000Z')
    })

    it('should handle regular ISODates', () => {
      expect(user.updated)
        .toBe('2016-12-16T00:00:00.000Z')
    })

    it('should handle nested extended json', () => {
      expect(user.notifications.alarm)
        .toBe('2016-12-16T00:00:00.000Z')
    })

    it('should handle very nested extended json', () => {
      expect(user.notifications.test.two.three)
        .toBe('2016-12-16T00:00:00.000Z')
    })

    it('should process object arrays with extended json properties', () => {
      expect(user.things[0].id)
        .toBe('42356d75b7a7bc5c52c11a90')
    })

    it('should process typed arrays of ObjectIds', () => {
      let all_strings = true
      for (let friend of user.friends) {
        if (typeof friend !== 'string') {
          all_strings = false
        }
      }
      expect(all_strings)
        .toBe(true)
    })
  })

  describe('Extended JSON - out', () => {
    const user = new User(data)
    const encoded = user.encode()
    it('should reencode ObjectIds back to ObjectIds with an underscore', () => {
      expect(encoded._id)
        .toEqual({
          $oid: '586e6d75b7a7bc5c852c60a5'
        })
    })

    it('should convert ISODate strings back into ISODates', () => {
      expect(encoded.created)
        .toEqual({
          $date: '2016-12-16T00:00:00.000Z'
        })
    })

    it('should convert properties in object arrays', () => {
      expect(encoded.things[0].id)
        .toEqual({
          $oid: '42356d75b7a7bc5c52c11a90'
        })
    })
  })

  const test_component = new Vue({
    models: {
      user() {
        return new User()
      }
    },
    methods: {
      fetch() {
        return this.$user.fetch()
      }
    }
  })

  describe('VueModel binding', () => {
    it('should correctly bind models to vue instance', () => {
      expect(test_component.$user.first_name)
        .toBe('')
    })

    it('should correctly fetch model data', () => {
      expect.assertions(1)
      return test_component.$user.fetch()
        .then(() => {
          expect(test_component.$user.full_name)
            .toBe('Taco Cat')
        })
        .catch(err => {
          console.warn({err})
        })
    })

    it('should correctly save new model data with consume: false', () => {
      expect.assertions(1)
      return test_component.$user.save({
        first_name: 'Robot',
        last_name: 'Obor'
      }, {
        consume: false
      })
      .then((res) => {
        expect(test_component.$user.full_name)
          .toBe('Robot Obor')
      })
    })

    it('should correctly save new model data with consume: true', () => {
      expect.assertions(1)
      return test_component.$user.save({
        first_name: 'Robot',
        last_name: 'Obor'
      })
      .then((res) => {
        expect(test_component.$user.full_name)
          .toBe('Taco Cat')
      })
    })

    it('should correctly save diff model data during save', () => {
      expect.assertions(1)
      test_component.$user.set({
        first_name: 'Robot',
        last_name: 'Obor'
      })

      return test_component.$user.save({
        first_name: 'Robot',
        last_name: 'Obor',
        email: 'test@gmail.com'
      }, {
        diff: true
      })
      .then((res) => {
        expect(global.fetch.mock.calls[global.fetchCount - 1][1].body)
          .toEqual(JSON.stringify({
            email: 'test@gmail.com'
          }))
      })
    })

    it('should correctly save model data with diff: false', () => {
      expect.assertions(1)
      test_component.$user.set({
        first_name: 'Robot',
        last_name: 'Obor'
      })

      return test_component.$user.save({
        first_name: 'Robot',
        last_name: 'Obor'
      }, {
        diff: false
      })
      .then((res) => {
        expect(global.fetch.mock.calls[global.fetchCount - 1][1].body)
          .toEqual(JSON.stringify({
            first_name: 'Robot',
            last_name: 'Obor'
          }))
      })
    })

    it('should reset models on destroy', () => {
      test_component.$destroy()
      expect(test_component.$user.first_name)
        .toBe('')
    })
  })

  describe('VueModels - custom urls - function', () => {
    const user = new User(null, {
      url() {
        return 'testtesttest'
      }
    })
    it('should fetch via the custom url function', () => {
      expect.assertions(1)
      return user.fetch()
        .then(() => {
          expect(global.fetch.mock.calls[global.fetchCount - 1][0])
            .toBe('testtesttest')
        })
    })

    it('should save via the custom url function', () => {
      expect.assertions(1)
      return user.save({
        test: true
      })
        .then(() => {
          expect(global.fetch.mock.calls[global.fetchCount - 1][0])
            .toBe('testtesttest')
        })
    })
  })

  describe('VueModels - custom urls - property', () => {
    const user = new User(null, {
      url: 'testproperty'
    })
    it('should fetch via the custom url function', () => {
      expect.assertions(1)
      return user.fetch()
        .then(() => {
          expect(global.fetch.mock.calls[global.fetchCount - 1][0])
            .toBe('testproperty')
        })
    })
  })

  describe('VueModels - save with query', () => {
    it('should save with a query string', () => {
      const user = new User()
      expect.assertions(1)
      return user.save({ test: true }, {
        query: {
          save: false
        }
      })
      .then(() => {
        expect(global.fetch.mock.calls[global.fetchCount - 1][0])
          .toBe('users?save=false')
      })
    })

    it('should save with multiple query strings', () => {
      const user = new User()
      expect.assertions(1)
      return user.save({ test: true }, {
        query: {
          save: false,
          test: true
        }
      })
      .then(() => {
        expect(global.fetch.mock.calls[global.fetchCount - 1][0])
          .toBe('users?save=false&test=true')
      })
    })
  })
}
