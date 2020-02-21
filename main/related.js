const api = require('./common-api-init');
const fs = require('fs');
const Promise = require('bluebird');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';
const dbName = 'app_data';
const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let storedApps = new Set();
let relatedArray = new Set();
let totalStored = 0;
let debug = false;

async function getRelatedApps(pkg) {
    return api.login()
        .then(() => api.related(pkg))
        .then(res => {
            relatedArray = Object.values(res['0'].child)
                .map(value => value.docid)
                .filter(appId => !storedApps.has(appId));
            const random_period = Math.floor(25000 + Math.random() * Math.floor(5000));
            return Promise.map(relatedArray, appId => Promise.delay(random_period, getInfo(appId)), {
                concurrency: 1
            });
        });
}

const storeInfo = function (db, info, callback) {
    const collection = db.collection('apps');
    info = JSON.stringify(info);
    info = JSON.parse(info);
    collection.insertOne(info, function (err, result) {
        assert.equal(err, null);
        console.log("Inserted " + result.result.n + " into the collection");
        totalStored++;
        callback(result);
    });
};

function downloadToFile(pkg, vc) {
    return api.details(pkg).then(function (res) {
        return vc || res.details.appDetails.versionCode;
    })
        .then(function (versionCode) {
            var fStream = fs.createWriteStream(pkg + '.apk');
            return api.download(pkg, versionCode).then(function (res) {
                res.pipe(fStream);
            });
        });
}

function getInfo(pkg, vc) {
    return api.login()
        .then(function () {
            const db = client.db(dbName);
            api.details(pkg).then(function (res) {
                return res.details.appDetails.versionCode;
            })
                .then(function (versionCode) {
                    if (vc) {
                        return api.downloadInfo(pkg, vc);
                    } else {
                        return api.downloadInfo(pkg, versionCode);
                    }
                })
                .then(function (info) {

                    api.details(pkg).then(function (res) {
                        res.serverLogsCookie = undefined;
                        let versionCode = res.details.appDetails.versionCode;
                        /* DOWNLOADS THE .APK FILE */
                        if (debug === false) {
                            let fileStream = fs.createWriteStream(pkg + '.apk');
                            api.download(pkg, versionCode).then(function (res) {
                                res.pipe(fileStream);
                            });
                        }
                        let finalObject = Object.assign({}, res, info);
                        storedApps = storedApps.add(pkg);
                        //console.log(JSON.stringify(finalObject, null, 4));
                        storeInfo(db, finalObject, function () {
                            console.log("Inserted info about \x1b[0m" + pkg + "\x1b[0m | TOTAL = \x1b[0m" + totalStored + "\x1b[0m");
                        })
                    });
                });
        });
}

client.connect(function (err) {
    assert.equal(null, err);
    console.log("CONNECTED");
});

async function main() {
    await getRelatedApps(process.argv[2]);
    process.exit(0);
}

main();