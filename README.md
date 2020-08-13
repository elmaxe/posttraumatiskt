# Posttraumatiskt
Webbskrapande app för arbetsskadade brevbärare

## Vad är detta?
Posttraumatiskt är en app där brevbärare får testa hur arbetsskadade de är. Man fyller i postnummer och sedan kommer alla personer och deras adresser upp. Man ska sedan gissa vilken person som tillhör vilken adress eller vice versa.

## Hur fungerar det?
Servern skrapar hitta.se efter personer och adresser på det postnummer du fyller i. Detta kan ta någon minut, därför cachar servern datan i några veckor.

## Varför?
Brevbärare lär sig koppla otroligt många namn till deras adresser och tvärtom. Detta gjordes därför som ett kul litet minispel.

## Installering

### Development
1. Klona repo
2. Kör `npm install` och `npm start` både i `/client` och `/server`

Frontend på `localhost:3000` och backend på `localhost:8100`
