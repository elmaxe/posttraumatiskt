const puppeteer = require('puppeteer')
const fs = require('fs')

exports.MAX_CACHE_AGE = 1000
exports.FILEPATH = 'data/'
exports.FILEEXTENSION = '.data'

exports.scrapeWeb = async (postnummer) => {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    await page.goto(`https://www.hitta.se/sök?vad=${postnummer}&typ=prv`)

    //Get how many people live in the postnummer
    const hits = await page.evaluate(() => {
        const persons = document.getElementsByClassName("result-tab-bar__item-count")
        // return Array.from(persons, x => x.innerHTML)[1].replace(" ", "")
        return Array.from(persons, x => x.innerHTML)[1]
    })

    if (hits === undefined) {
        console.log("NO RESULTS")
        await browser.close()
        return []
    }

    let completeList = []

    //Hitta.se will space separate its numbers. Ex 1 179 instead of 1179
    const loops = Math.ceil(hits.replace(" ", "")/25)

    //Loop through all pages, 25 items per page
    for (let i = 1; i <= loops; i++) {
        console.log(((i/loops)*100).toFixed(2) + "%")
        await page.goto(`https://www.hitta.se/sök?vad=${postnummer}&typ=prv&sida=${i}`, { timeout: 60*1000*10 })
        
        const persons = await page.evaluate(() => {
            const person = document.getElementsByClassName("display-name")
            return Array.from(person, x => x.innerHTML)
        })

        const addresses = await page.evaluate(() => {
            const address = document.getElementsByClassName("address")
            //The split is to remove the postnummer and city after the address
            //Saves many bytes and the information is unnecessary
            return Array.from(address, x => x.innerHTML.split(",")[0])
        })
        
        //Store person and his/her address in an object, put it into an array.
        const pagelist = []
        for (let i = 0; i < persons.length; i++) {
            pagelist[i] = { name: persons[i], address: addresses[i] }
        }

        //Concat to the master list
        completeList = completeList.concat(pagelist)
    }

    await browser.close()

    return completeList
}

exports.randomData = function(postnummer, amount) {
    const contents = JSON.parse(fs.readFileSync(exports.FILEPATH + postnummer + exports.FILEEXTENSION, 'utf8'))

    let results = []
    for (let i = 0; i < amount; i++) {
        results = results.concat(contents[Math.floor(Math.random() * contents.length)])
    }
    return results
}

exports.scrapeAndSave = async function(postnummer, amount) {
    const results = await exports.scrapeWeb(postnummer)

    try {
        fs.unlinkSync(exports.FILEPATH + postnummer + exports.FILEEXTENSION)
    } catch (error) {
    }

    fs.writeFileSync(exports.FILEPATH + postnummer + exports.FILEEXTENSION, JSON.stringify(results), 'utf8')

    let randomized = []
    for (let i = 0; i < amount; i++) {
        randomized = randomized.concat(results[Math.floor(Math.random() * results.length)])
    }

    return randomized
}

exports.getData = async function(postnummer, amount) {
    if (fs.existsSync(exports.FILEPATH + postnummer + exports.FILEEXTENSION)) {
        console.log("EXISTS")
        const {birthtime} = fs.statSync(exports.FILEPATH + postnummer + exports.FILEEXTENSION)

        //Check if data is cached
        //If cache young enough
        if (birthtime.getTime() > Date.now() - exports.MAX_CACHE_AGE) {
            const data = exports.randomData(postnummer, amount)
            console.log("Taking from cache")
            return Promise.resolve(data)
        //Cache is old, scrape from web
        } else {
            console.log("Cache too old, scraping data...")
            return exports.scrapeAndSave(postnummer, amount)
        }
    }
    else {
        console.log("DOESN'T EXIST")
        return exports.scrapeAndSave(postnummer, amount)
    }
}
