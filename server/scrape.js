const puppeteer = require('puppeteer')
const fs = require('fs')

const postnummer = "18591"

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

    const loops = Math.ceil(hits.replace(" ", "")/25)

    //Loop through all pages, 25 items per page
    for (let i = 1; i <= loops; i++) {
        console.log(((i/loops)*100).toFixed(2) + "%")
        await page.goto(`https://www.hitta.se/sök?vad=${postnummer}&typ=prv&sida=${i}`)
        
        const persons = await page.evaluate(() => {
            const person = document.getElementsByClassName("display-name")
            // console.log(person)
            return Array.from(person, x => x.innerHTML)
        })

        // console.log(persons)

        const addresses = await page.evaluate(() => {
            const address = document.getElementsByClassName("address")
            // console.log(address)
            //The split is to remove the postnummer and city after the address
            return Array.from(address, x => x.innerHTML.split(",")[0])
        })

        // console.log(addresses)
        
        //All people on this page
        const pagelist = []
        for (let i = 0; i < persons.length; i++) {
            pagelist[i] = { name: persons[i], address: addresses[i] }
        }
        // console.log(pagelist)
        //Concat to the master list
        completeList = completeList.concat(pagelist)
    }

    console.log(completeList)
    console.log(completeList.length)

    await browser.close()

    return completeList
}

exports.scrapeAndSave = async function(postnummer) {
    exports.scrapeWeb(postnummer).then(res => {
        try {
            fs.unlinkSync(postnummer)
        } catch (error) {
        }

        fs.writeFile(postnummer, JSON.stringify(res), 'utf8', (err) => {
            if (err) {
                return err
            }
            console.log("File saved.")
            return Promise.resolve()
        })
    })
}

exports.randomData = function(postnummer, amount) {
    const contents = JSON.parse(fs.readFileSync(postnummer, 'utf8'))

    let results = []
    for (let i = 0; i < amount; i++) {
        results = results.concat(contents[Math.floor(Math.random() * contents.length)])
    }
    // console.log(results)
    return results
}

exports.getData = async function(postnummer, amount) {
    if (fs.existsSync(postnummer)) {
        console.log("EXISTS")
        const {birthtime} = fs.statSync(postnummer)

        console.log(birthtime > Date.now - 60*60*24*5*1000)
        console.log(birthtime)

        //Check if data is cached
        //If cache young enough
        if (birthtime.getTime() > Date.now() - 60*60*24*5*1000) {
            const data = exports.randomData(postnummer, amount)
            console.log("Taking from cache")
            console.log(data)
            return Promise.resolve(data)
        //Cache is old, scrape from web
        } else {
            console.log("Cache too old, scraping data...")
            await exports.scrapeAndSave(postnummer).then(() => {
                return Promise.resolve(exports.randomData(postnummer, amount))
            })
            .catch(err => console.log)
        }
    }
    else {
        console.log("DOESN'T EXIST")
        await exports.scrapeAndSave(postnummer).then(() => {
            return Promise.resolve(exports.randomData(postnummer, amount))
        })
        .catch(err => console.log)
    }
}
