from bottle import run, get, static_file, response, put
import random
import os
import sys
import time

@get('/patron/:id/libraries')
def get_record(id):
    response_json = """
{
 "h37al": "Pit\u00e4j\u00e4nm\u00e4ki/Sockenbacka",
 "h90al": "It\u00e4keskus/\u00d6stra Centrum",
 "v28al": "L\u00e4nsim\u00e4ki/V\u00e4sterkulla",
 "h20al": "Lauttasaari/Drums\u00f6",
 "zzzzz": "- - - - -",
 "v62al": "Martinlaakso/M\u00e5rtensdal",
 "h25al": "T\u00f6\u00f6l\u00f6/T\u00f6l\u00f6",
 "h82al": "Roihuvuori/Kasberget",
 "h67al": "Palohein\u00e4/Sved\u00e4ngen",
 "e30al": "N\u00f6ykki\u00f6/N\u00f6ykis",
 "v32al": "Kirjastoauto Vantaa/BokbussVanda",
 "e32al": "Kivenlahti/Stensvik",
 "v30al": "Tikkurila aik/Dickursby vux",
 "h75al": "Tapulikaupunki/Stapelstaden",
 "e33al": "Saunalahti/Bastvik",
 "ekpal": "Z Espoon kotipalvelu",
 "h74al": "Suutarila/Skomakarb\u00f6le",
 "h64al": "Oulunkyl\u00e4/\u00c5ggelby",
 "h98al": "Vuosaari/Nordsj\u00f6",
 "e17al": "Haukilahti/G\u00e4ddvik",
 "v30ml": "Tikkurila mus/Dickursby mus",
 "e81al": "Karhusuo/Bj\u00f6rnk\u00e4rr",
 "h56al": "Arabianranta/Arabiastranden",
 "h55al": "Vallila/Vallg\u00e5rd",
 "h19al": "Suomenlinna/Sveaborg",
 "h13al": "Rikhardinkatu/Richardsgatan",
 "h94al": "Kontula/G\u00e5rdsbacka",
 "v60al": "Myyrm\u00e4ki/Myrbacka",
 "e29al": "Z Espoon sairaala ",
 "hsjal": "Z Hangonkadun kuntoutuskeskus",
 "hsfal": "Z Auroran sairaala",
 "hkpal": "Z Hgin kotipalvelu",
 "e02al": "Kirjastoauto Espoo/Bokbuss Esbo",
 "v68al": "P\u00e4hkin\u00e4rinne/Hasselbacken",
 "h72al": "Pukinm\u00e4ki/Bocksbacka",
 "h41al": "Malminkartano/Malmg\u00e5rd",
 "h30ll": "Pikku Huopalahti/Lill Hoplax",
 "v51al": "Pointin kirjasto/Point bibliotek",
 "e76al": "Entresse",
 "h61al": "K\u00e4pyl\u00e4/Kottby",
 "hslal": "Z Kustaankartanon vanhustenkesk.",
 "h89ll": "Sakarinm\u00e4ki/\u00d6stersundom",
 "h40al": "Pohjois-Haaga/Norra Haga",
 "h92al": "Myllypuro/Kvarnb\u00e4cken",
 "h42al": "Kannelm\u00e4ki/Gamlas",
 "h18ll": "Ruoholahti/Gr\u00e4svik",
 "hsval": "Z Kontulan vanhustenkeskus",
 "v48al": "Mikkola",
 "e01al": "Sello",
 "hsral": "Z Riistavuoren vanhustenkeskus",
 "hyaal": "Z Psykiatriakeskus",
 "h10al": "Kirjasto 10/Bibliotek 10",
 "v20al": "Hakunila/H\u00e5kansb\u00f6le",
 "h70al": "Malmi/Malm",
 "v40al": "Koivukyl\u00e4/Bj\u00f6rkby",
 "e10al": "Tapiola/Hagalund",
 "e23al": "Kirjasto Omena/\u00c4ppelbiblioteket",
 "hseal": "Z Laakson sairaala",
 "v30ll": "Tikkurila las/Dickursby barn",
 "e97al": "Kalaj\u00e4rvi/Kalaj\u00e4rvi",
 "h63al": "Maunula/M\u00e5nsas",
 "e73al": "Laaksolahti/Dalsvik",
 "hsmal": "Z Roihuvuoren vanhustenkeskus",
 "e78al": "Kauklahti/K\u00f6klax",
 "h84al": "Laajasalo/Deger\u00f6",
 "h32al": "Etel\u00e4-Haaga/S\u00f6dra Haga",
 "h77al": "Jakom\u00e4ki/Jakobacka",
 "v45al": "Lumon kirjasto/Lumos bibliotek",
 "--": "(Choose a Pickup Location)",
 "e36al": "Soukka/S\u00f6k\u00f6",
 "h33al": "Munkkiniemi/Munksn\u00e4s",
 "hsyal": "Z Lasten sairaala",
 "v37al": "Hiekkaharju/Sandkulla",
 "hspal": "Z Myllypuron sairaala",
 "e14al": "Laajalahti/Bredvik",
 "h02al": "Kirjastoauto Hki/Bokbuss Hfors",
 "h71al": "Viikki/Vik",
 "e71al": "Viherlaakso/Gr\u00f6ndal",
 "h76al": "Puistola/Parkstad",
 "h80al": "Herttoniemi/Herton\u00e4s",
 "k01al": "Kauniainen/Grankulla",
 "hssal": "Z Helsingin laitoskirjastot",
 "h53al": "Kallio/Bergh\u00e4ll"
}"""
    response.add_header("Content-Type", "application/json")
    return response_json

@put('/patron/:id/hold')
def hold_book(id):
    response_json = """
{
 "message": "Hevonen : kasvatus ja hoito / Chris May ; suomentanut Tuulikki Lahti ; [taiteilija: Ursula Dawson]",
 "ok": true
}
    """
    response.add_header("Content-Type", "application/json")
    return response_json

@get('/:name#.+#')
def get_static(name):
    response.add_header("Access-Control-Allow-Origin", "http://localhost:8000")
    response.add_header("Access-Control-Allow-Origin", "http://80.69.164.78:5000")

    return static_file(name, root='.')

if __name__ == '__main__':
    if len(sys.argv) > 1:
        host, port = sys.argv[1].split(':')
    else:
        port = 8000 + random.randint(0, 1000)
        host='localhost'

    run(host=host, port=port, reloader=True)
