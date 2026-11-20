(function () {
  'use strict';

  var DB_NAME = 'teyvat_travels';
  var DB_VERSION = 1;
  var dbPromise = null;

  function openDatabase() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise(function (resolve, reject) {
      var request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = function (event) {
        var db = event.target.result;
        var stores = {
          users: 'id',
          inquiries: 'id',
          favorites: 'id',
          packages: 'id',
          faqs: 'id',
          nations: 'id',
          locations: 'id',
          tips: 'id',
          directorProfile: 'id'
        };

        Object.keys(stores).forEach(function (name) {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, { keyPath: stores[name], autoIncrement: name !== 'directorProfile' });
          }
        });

        var users = event.target.transaction.objectStore('users');
        if (!users.indexNames.contains('email')) users.createIndex('email', 'email', { unique: true });
        var inquiries = event.target.transaction.objectStore('inquiries');
        if (!inquiries.indexNames.contains('createdAt')) inquiries.createIndex('createdAt', 'createdAt');
        var favorites = event.target.transaction.objectStore('favorites');
        if (!favorites.indexNames.contains('userPackage')) favorites.createIndex('userPackage', ['userId', 'packageId'], { unique: true });
      };

      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error); };
    });

    return dbPromise;
  }

  function txStore(storeName, mode) {
    return openDatabase().then(function (db) {
      var tx = db.transaction(storeName, mode);
      return { db: db, tx: tx, store: tx.objectStore(storeName) };
    });
  }

  function requestToPromise(request) {
    return new Promise(function (resolve, reject) {
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error); };
    });
  }

  function seed() {
    return openDatabase().then(function (db) {
      var tx = db.transaction(['users', 'directorProfile', 'faqs', 'packages', 'nations'], 'readwrite');
      var users = tx.objectStore('users');

      return requestToPromise(users.getAll()).then(function (existingUsers) {
        if (!existingUsers.length) {
          users.put({
            id: 1,
            name: 'Charles Paule',
            email: 'johnreylunar02@gmail.com',
            role: 'admin',
            passwordHash: 'ADMIN_PASSWORD_PENDING',
            createdAt: new Date().toISOString()
          });
        }

        var director = tx.objectStore('directorProfile');
        director.get(1).onsuccess = function (event) {
          if (!event.target.result) {
            director.put({
              id: 1,
              name: 'Charles Paule',
              title: 'Managing Director',
              bio: 'Charles Paule leads Skill Issue Inc. with a commitment to making every journey through Teyvat clear, welcoming, and memorable.',
              photoPath: 'assets/img/director.jpg',
              photoAlt: 'Charles Paule, Managing Director'
            });
          }
        };

        var faqs = tx.objectStore('faqs');
        faqs.count().onsuccess = function (event) {
          if (event.target.result === 0) {
            [
              ['Is Teyvat Travels an official service?', 'No. Teyvat Travels is an unofficial fan project by Skill Issue Inc. and is not affiliated with or endorsed by HoYoverse.'],
              ['Can I book a real-world trip through the site?', 'No. Teyvat is a fictional world, and this site is a fan-made guide. It does not sell travel or booking services.'],
              ['Where should I begin exploring?', 'Start with the nation that interests you most in the Packages section, then use its guide to explore local highlights and routes.'],
              ['How can I contact Skill Issue Inc.?', 'Use the inquiry form to contact the team.']
            ].forEach(function (faq, index) {
              faqs.put({ id: index + 1, question: faq[0], answer: faq[1], sortOrder: index + 1, published: true });
            });
          }
        };

        var nations = tx.objectStore('nations');
        nations.count().onsuccess = function (event) {
          if (event.target.result === 0) {
            [
              [1, 'mondstadt', 'Mondstadt', '#82d7bd', 'assets/img/mondstadt.webp'],
              [2, 'liyue', 'Liyue', '#e7bd69', 'assets/img/liyue.jpeg'],
              [3, 'inazuma', 'Inazuma', '#c59bed', 'assets/img/inazuma.webp'],
              [4, 'sumeru', 'Sumeru', '#a6d46c', 'assets/img/sumeru.webp'],
              [5, 'fontaine', 'Fontaine', '#7ed9e7', 'assets/img/fontaine.webp'],
              [6, 'natlan', 'Natlan', '#ff936d', 'assets/img/natlan.webp'],
              [7, 'snezhnaya', 'Snezhnaya', '#a6ddf3', 'assets/img/snezhnaya.webp']
            ].forEach(function (nation) {
              nations.put({ id: nation[0], slug: nation[1], name: nation[2], accentColor: nation[3], imagePath: nation[4] });
            });
          }
        };

        var packages = tx.objectStore('packages');
        packages.count().onsuccess = function (event) {
          if (event.target.result === 0) {
            [
              [1, 1, 'The City of Freedom Expedition', 'Experience the romantic charm of windmills, rolling green hills, and historic stone architecture.', 12500, 3, 2, 'Most popular'],
              [2, 2, 'The Harbor of Stone and Commerce', 'A bustling port city tour blending mountain ranges, folklore, and culinary adventures.', 15000, 4, 3, 'Harbor & heritage'],
              [3, 3, 'The Realm of Eternal Thunder', 'Discover an archipelago of purple foliage, traditional shrines, and coastal views.', 18000, 4, 3, 'Island escape'],
              [4, 4, 'The City of Wisdom & Rainforest Retreat', 'Journey from halls of learning into the rainforest canopy.', 14000, 3, 3, 'Rainforest retreat'],
              [5, 5, 'The Capital of Justice, Steam, and Aquanics', 'Explore art, fashion, clockwork engineering, and waterways.', 20000, 5, 4, 'Arts & innovation'],
              [6, 6, 'The Land of Ash, Hot Springs, and Valor', 'Explore volcanic landscapes, thermal springs, and festivals.', 16500, 4, 3, 'Volcanic adventure'],
              [7, 7, 'The Eternal White Tundra', 'Explore frosted architecture, palaces, chalets, and aurora skies.', 22000, 5, 4, 'Winter expedition']
            ].forEach(function (pkg) {
              packages.put({ id: pkg[0], nationId: pkg[1], title: pkg[2], description: pkg[3], price: pkg[4], days: pkg[5], nights: pkg[6], badge: pkg[7], active: true });
            });
          }
        };

        return new Promise(function (resolve, reject) {
          tx.oncomplete = resolve;
          tx.onerror = function () { reject(tx.error); };
        });
      });
    });
  }

  window.TeyvatDB = {
    open: openDatabase,
    seed: seed,
    getAll: function (storeName) {
      return txStore(storeName, 'readonly').then(function (context) {
        return requestToPromise(context.store.getAll());
      });
    },
    getById: function (storeName, id) {
      return txStore(storeName, 'readonly').then(function (context) {
        return requestToPromise(context.store.get(id));
      });
    },
    put: function (storeName, value) {
      return txStore(storeName, 'readwrite').then(function (context) {
        return requestToPromise(context.store.put(value));
      });
    },
    delete: function (storeName, id) {
      return txStore(storeName, 'readwrite').then(function (context) {
        return requestToPromise(context.store.delete(id));
      });
    },
    findByIndex: function (storeName, indexName, value) {
      return txStore(storeName, 'readonly').then(function (context) {
        var index = context.store.index(indexName);
        return requestToPromise(index.get(value));
      });
    }
  };

  seed().catch(function (error) {
    console.error('IndexedDB setup failed:', error);
  });
})();
