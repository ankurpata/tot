var express = require('express');
var router = express.Router();

var Promise = require("bluebird");
import Metascraper from 'metascraper';

//var request = require('request');
//var request = Promise.promisify(require("request"));
var request = Promise.promisifyAll(require('request'), {multiArgs: true});

var cheerioAdv = require('cheerio-advanced-selectors')
var cheerio = require('cheerio');
cheerio = cheerioAdv.wrap(cheerio)

//var cheerio = Promise.promisify(require("cheerio"));

//var db = require('../config/db.js');
var dbModel = require('../models/crawler');
var commonApis = require('../constants/common');

router.get('/hello', (req, res) => {
    res.json("helloss scrapper");
    console.log('Hello Api');
});

var BreakException = {};
router.get('/getCW', (req, res) => {

    var allMake = [];
    var allModel = [];
    var allVariant = [];

    try {
        request('https://www.carwale.com/new/', function (err, resp, html) {
            if (!err) {
                var $ = cheerio.load(html);
                $('.brand-type-container li').each(function (i, elm) {
//                    console.log('l1');
                    var makeUrl = "https://www.carwale.com" + $("a", this).attr('href');
                    request(makeUrl, function (err, resp, html) {
                        if (!err) {
                            var $ = cheerio.load(html);

                            $('a.font18').each(function (i, elm) {
//                                console.log('l2');

                                var modelUrl = "https://www.carwale.com" + $(this).attr('href');
//                                console.log(modelUrl);

                                request(modelUrl, function (err, resp, html) {
                                    if (!err) {
                                        var m$ = cheerio.load(html);
                                        m$('td.variant__name-cell').each(function (i, elm) {
//                                            console.log('l3');
                                            var variant_url = "https://www.carwale.com" + m$("a", this).attr('href');
//                                            console.log(variant_url);
                                            request("https://www.carwale.com" + m$("a", this).attr('href'), function (err, resp, html) {
                                                if (!err) {
                                                    var v$ = cheerio.load(html);
                                                    var data = {};
                                                    //extract and save data in db.
                                                    data['model_url'] = modelUrl;
                                                    data['make_url'] = makeUrl;
                                                    data['variant_url'] = variant_url;
                                                    data['domain'] = 'carwale';
                                                    data['domain_unique_id'] = 2;
                                                    data['make'] = v$('ul.breadcrumb li:nth-child(2)').text().replace(/[\n\t\r›]/g, "").trim();
                                                    data['model'] = v$('ul.breadcrumb li:nth-child(3)').text().replace(/[\n\t\r›]/g, "").trim();
                                                    data['variant'] = v$('ul.breadcrumb li:nth-child(4)').text().replace(/[\n\t\r›]/g, "").trim();
                                                    data['img_url'] = v$('div.gallery-wrapper  div.jcarousel ul li:nth-child(1)').find('img').attr('src');
                                                    data['price'] = v$('div#divModelDesc  div.leftfloat div.textBlock span.font24.text-black.margin-right5').text().replace(/[\n\t\r›₹]/g, "").trim();
                                                    data['price'] = commonApis.getFormatNo(data['price']);
                                                    var otherArray = [];
                                                    v$('table#tbOverview tbody tr').each(function (i, elm) {
                                                        var tpc = v$("td", this).first().text().replace(/[\n\t\r]/g, "").trim();
                                                        if (tpc === 'Fuel Type') {
                                                            data['fuel_type'] = v$("td", this).last().text().replace(/[\n\t\r›]/g, "").trim();
                                                        } else if (tpc === 'Transmission Type') {
                                                            data['transmission_type'] = v$("td", this).last().text().replace(/[\n\t\r›]/g, "").trim();
                                                        } else if (tpc == 'Seating Capacity') {
                                                            data['seating_capacity'] = v$("td", this).last().text().replace(/[\n\t\r›]/g, "").trim();
                                                        } else if (tpc == 'Displacement') {
                                                            data['displacement'] = v$("td", this).last().text().replace(/[\n\t\r›]/g, "").trim();
                                                        } else if (tpc == 'No of gears') {
                                                            data['no_of_gears'] = v$("td", this).last().text().replace(/[\n\t\r›]/g, "").trim();
                                                        } else {
                                                            if (v$("td", this).last().text().replace(/[\n\t\r›]/g, "").trim() != '' &&
                                                                    v$("td", this).last().text().replace(/[\n\t\r›]/g, "").trim() != 'No' &&
                                                                    v$("td", this).last().text().replace(/[\n\t\r›]/g, "").trim() != 'NA') {
                                                                otherArray[tpc] = v$("td", this).last().text().replace(/[\n\t\r›]/g, "").trim();
                                                            }
                                                        }
//                                                        data[v$("td", this).first().text().replace(/[\n\t\r]/g, "").trim()] = v$("td", this).last().text().replace(/[\n\t\r›]/g, "").trim();
                                                    })

                                                    v$('table.specs').each(function (i, elm) {
                                                        v$("tr[itemmasterid]", this).each(function (i, elm) {
                                                            if (v$("td", this).last().text().replace(/[\n\t\r›]/g, "").trim() != '' &&
                                                                    v$("td", this).last().text().replace(/[\n\t\r›]/g, "").trim() != 'No' &&
                                                                    v$("td", this).last().text().replace(/[\n\t\r›]/g, "").trim() != 'NA') {
                                                                otherArray[v$("td", this).first().text().replace(/[\n\t\r]/g, "").trim()] = v$("td", this).last().text().replace(/[\n\t\r›]/g, "").trim();
                                                            }
                                                        })
                                                    })

                                                    v$('table.specs.features').each(function (i, elm) {
                                                        var b = true;
                                                        v$("tr", this).each(function (i, elm) {
                                                            if (!b) {
                                                                if (v$("td", this).last().text().replace(/[\n\t\r›]/g, "").trim() != '' &&
                                                                        v$("td", this).last().text().replace(/[\n\t\r›]/g, "").trim() != 'No' &&
                                                                        v$("td", this).last().text().replace(/[\n\t\r›]/g, "").trim() != 'NA') {
                                                                    otherArray[v$("td", this).first().text().replace(/[\n\t\r]/g, "").trim()] = v$("td", this).last().text().replace(/[\n\t\r›]/g, "").trim();
                                                                }
                                                            }
                                                            if (b) {
                                                                b = false;
                                                            }
                                                        })
                                                    })
                                                    data['color'] = '';
                                                    v$('#tabColours ul.ul-horz ul.ul-horz li').each(function (i, elm) {
                                                        data['color'] = data['color'] + ", " + v$("div.colorName", this).text().replace(/[\n\t\r]/g, "").trim();
                                                    });

                                                    var dbData = {};
                                                    data['others'] = '';
                                                    for (var key in otherArray) {
                                                        data['others'] += '"' + key + ":" + otherArray[key] + '", ';
//                                                        if (key in commonApis.scrapperFieldMapping) {
//                                                            dbData[commonApis.scrapperFieldMapping[key]] = data[key];
//                                                        }
                                                    }
//                                                    data['others'] = data['others'].substring(0, 9999);
                                                    //save data in mysql db
                                                    dbModel.saveCWData(data);
//                                                    throw BreakException;
                                                }
                                            });


                                        });
                                    } else {
                                        console.log('error')
                                    }
                                });
                            });
                        }
                    });
                });
//                 throw BreakException;
            }
        });
    } catch (e) {
        if (e !== BreakException)
            throw e;
    }

});



router.get('/getCD', (req, res) => {
    try {
        request.getAsync('https://www.cardekho.com/newcars').spread(function (response, body) {
            var makeUrls = [];
            var $ = cheerio.load(body);
            $('tr#brandsDiv td').each(function (i, elm) {
                makeUrls.push($("a", elm).attr('href'));
            });
            return makeUrls;
        }).then((makeUrls) => {
            return Promise.each(makeUrls, function (elem) {

                console.log(elem);
                var makeUrl = elem;
                return request.getAsync(elem).spread(function (response, body) {
                    var modelUrls = [];
                    var m$ = cheerio.load(body);
                    m$('a.modeltext').each(function (i, elm) {
                        modelUrls.push(m$(this).attr('href'));
                    });
                    return modelUrls;
                }).then((modelUrls) => {
                    return Promise.each(modelUrls, function (elem) {
                        var modelUrl = elem;
                        console.log(modelUrl);

                        return request.getAsync(elem).spread(function (response, body) {
                            var variantUrls = [];
                            var ml$ = cheerio.load(body);
                            ml$('a.crdtext').each(function (i, elm) {
                                variantUrls.push(ml$(this).attr('href'));
                            });
                            return variantUrls;
                        }).then((variantUrls) => {
                            return Promise.each(variantUrls, function (elem) {
//                                return console.log(elem);

                                return request.getAsync(elem).spread(function (response, body) {
                                    var v$ = cheerio.load(body);
                                    var data = {};
                                    var otherArray = [];
                                    //extract and save data in db.
                                    data['model_url'] = modelUrl;
                                    data['make_url'] = makeUrl;
                                    data['variant_url'] = elem;
                                    data['domain'] = 'cardekho';
                                    data['domain_unique_id'] = 5;
                                    data['make'] = v$('div.breadcrumbs div.mainbox.widthbreadcum span a:eq(2)').text().replace(/[\n\t\r›]/g, "").trim();
                                    data['model'] = v$('div.breadcrumbs div.mainbox.widthbreadcum span a:eq(3)').text().replace(/[\n\t\r›]/g, "").trim();
                                    data['variant'] = v$('div.breadcrumbs div.mainbox.widthbreadcum span.last span').text().replace(/[\n\t\r›]/g, "").trim();
                                    data['img_url'] = v$('div#cd-intro.mainblock div.rightpanel div.imghold a').find('img').attr('src');
                                    data['price'] = v$('div#cd-intro.mainblock div.leftpanel div.pricehold div.priceleft span:eq(2)').text().replace(/[\n\t\r›*]/g, "").trim();
                                    data['price'] = commonApis.getFormatNo(data['price']);

                                    var colorLink = v$('div#tabsection.tabsection div.modelnewtab div#modeltab.modeltab div ul li[title=Colors] a').attr('href').trim();
                                    return request.getAsync(colorLink).spread(function (response, body) {
                                        var color$ = cheerio.load(body);
                                        var colorStr = color$('#slider2').text().replace(/\s\s+/g, ', ');
                                        return colorStr;
                                    }).then((colorStr) => {
                                        data['color'] = colorStr;
                                    }).then(() => {
                                        var specsLink = v$('div#tabsection.tabsection div.modelnewtab div#modeltab.modeltab div ul li[title=Specs] a').attr('href').trim();
                                        return request.getAsync(specsLink).spread(function (response, body) {
                                            var specs$ = cheerio.load(body);
                                            specs$('div.comparewrap table.specinner').each(function (i, elm) {
                                                specs$("tbody.compcontent.comparetable.width100 tr", this).each(function (i, elm) {
                                                    specs$('td:eq(0)', this).children().remove();
                                                    var tld = specs$('td:eq(0)', this).text().replace(/[\n\t\r]/g, "").trim();
                                                    if (tld === 'Fuel Type') {
                                                        data['fuel_type'] = specs$('td:eq(1)', this).text().replace(/[\n\t\r›]/g, "").trim();
                                                    } else if (tld === 'Transmission Type') {
                                                        data['transmission_type'] = specs$('td:eq(1)', this).text().replace(/[\n\t\r›]/g, "").trim();
                                                    } else if (tld === 'Transmission Type') {
                                                        data['transmission_type'] = specs$('td:eq(1)', this).text().replace(/[\n\t\r›]/g, "").trim();
                                                    } else if (tld === 'Seating Capacity') {
                                                        data['seating_capacity'] = specs$('td:eq(1)', this).text().replace(/[\n\t\r›]/g, "").trim();
                                                    } else if (tld === 'Engine Displacement(cc)') {
                                                        data['displacement'] = specs$('td:eq(1)', this).text().replace(/[\n\t\r›]/g, "").trim();
                                                    } else if (tld === 'Gear box') {
                                                        data['no_of_gears'] = specs$('td:eq(1)', this).text().replace(/[\n\t\r›]/g, "").trim();
                                                    } else {
                                                        if (specs$('td:eq(1)', this).text().replace(/[\n\t\r›]/g, "").trim() != '' &&
                                                                specs$('td:eq(1)', this).text().replace(/[\n\t\r›]/g, "").trim() != 'No' &&
                                                                specs$('td:eq(1)', this).text().replace(/[\n\t\r›]/g, "").trim() != '-' &&
                                                                specs$('td:eq(1)', this).text().replace(/[\n\t\r›]/g, "").trim() != 'NA') {
                                                            otherArray[tld] = specs$('td:eq(1)', this).text().replace(/[\n\t\r›]/g, "").trim();
                                                        }
                                                    }
//                                                    data[specs$('td:eq(0)', this).text().replace(/[\n\t\r]/g, "").trim()] = specs$('td:eq(1)', this).text().replace(/[\n\t\r›]/g, "").trim();
                                                });
                                            });
                                        }).then(() => {
//                                            console.log(data);
                                            var featuresLink = v$('div#tabsection.tabsection div.modelnewtab div#modeltab.modeltab div ul li[title=Features] a').attr('href').trim();
                                            return request.getAsync(featuresLink).spread(function (response, body) {
                                                var featuresLink$ = cheerio.load(body);
                                                featuresLink$('div.comparewrap div.specinner div').each(function (i, elm) {
                                                    featuresLink$("div.compcontent ul li", this).each(function (i, elm) {
                                                        var lp = featuresLink$('div.compareleft.textalignunset', this).text().replace(/[\n\t\r›]/g, "").trim();
                                                        if (featuresLink$('div.compareright div.W50Percent span', this).hasClass('comparerighticon')) {
                                                            otherArray[lp] = 'Yes';
                                                        }
//                                                        data[featuresLink$('td:eq(0)', this).text().replace(/[\n\t\r]/g, "").trim()] = featuresLink$('td:eq(1)', this).text().replace(/[\n\t\r›]/g, "").trim();
                                                    });
                                                });
                                            });
                                            throw BreakException;
                                        }).then(() => {
//                                            console.log(data, '+++++Data+++++');
//                                            console.log(otherArray, '+++++OtherArray+++++');
                                            var dbData = {};
                                            data['others'] = '';
                                            for (var key in otherArray) {
                                                data['others'] += '"' + key + ":" + otherArray[key] + '", ';
                                            }

                                            data['popularity'] = Math.floor(Math.random() * 30);
                                            //save data in mysql db
                                            dbModel.saveCWData(data);
                                        });
                                    });

//                                    return data;
                                });

                            });
                        });
                    });

                });
            });
        }
        );
    } catch (e) {
        if (e !== BreakException)
            throw e;
    }
});

var extractHostname = (url) => {
    var hostname;
    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    } else {
        hostname = url.split('/')[0];
    }
    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];
    return hostname;
};

var extractRootDomain = (url) => {
    var domain = extractHostname(url),
            splitArr = domain.split('.'),
            arrLen = splitArr.length;
    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        if (splitArr[arrLen - 1].length == 2 && splitArr[arrLen - 1].length == 2) {
            domain = splitArr[arrLen - 3] + '.' + domain;
        }
    }
    return domain;
}

var fetchCity = (page) => {

}

var removeLastDirectoryPartOf = (the_url) => {
    if (the_url[the_url.length - 1] == '/') {
        var the_arr = the_url.split('/');
        the_arr.pop();
        return(the_arr.join('/'));
    } else {
        return the_url;
    }
}
router.get('/fetch', (req, res) => {
    console.log(req.query.q, 'fetch');
    if (req.query.q) {
        var taleInfo = {};
        req.query.q = removeLastDirectoryPartOf(req.query.q.split(/[?#]/)[0]);
        Metascraper
                .scrapeUrl(req.query.q)
                .then((metadata) => {
                    console.log(metadata);
                    var a = req.query.q.split("/");
                    var domain = a[2].replace("www.", "");
                    taleInfo['description'] = metadata['description'].replace(/[^a-zA-Z0-9 ]/g, " ").trim();
                    taleInfo['img_url'] = metadata['image'];
                    taleInfo['title'] = metadata['title'].replace(/[^a-zA-Z0-9 ]/g, " ").trim();
                    taleInfo['url'] = req.query.q;
                    taleInfo['domain'] = domain;
                    taleInfo['city'] = (req.query.city ? req.query.city : "");
                    taleInfo['category'] = (req.query.cat ? req.query.cat : "travel");
                    request(req.query.q, function (err, resp, html) {
                        taleInfo['others'] = "";
                        if (html) {
                            taleInfo['others'] = html.replace(/[^a-zA-Z ]/g, "");
                        }
                        dbModel.saveTale(taleInfo);
                        console.log('saved');
                        res.json({status: 'true'});
                    });

                });
    } else {
        res.json({status: 'false'});
    }

});


function delay(t) {
    return new Promise(function (resolve) {
        setTimeout(resolve, t)
    });
}

router.get('/mmt', (req, res) => {
    var taleInfo = {};
    var i = 226;
    var blg = '';
    var arr = [];
    while (i < 278) {
        arr.push(i);
        i++;
    }
    try {
        return Promise.each(arr, function (elemi) {
            console.log(elemi);
            var url = "https://www.makemytrip.com/blog/search/site/%2A?page=" + elemi;
            return request.getAsync(url, {
                Cookie: "COOKIE=" + 'cookietrip',
                Origin: 'https://www.makemytrip.com/blog/taj-mahal-replicas',
                "X-Requested-With": 'XMLHttpRequest',
                Referer: 'https://www.makemytrip.com/blog/taj-mahal-replicas'
            }).spread(function (response, body) {
                var modelUrls = [];
                var $ = cheerio.load(body);
                $('p.search_blog_title a').each(function (i, elm) {
                    modelUrls.push($(this).attr('href'));
                });
                return modelUrls;
            }).timeout(10000).then((variantUrls) => {
                console.log(variantUrls);
                return Promise.each(variantUrls, function (elemV) {
                    return delay(10000).then(function () {

                        console.log(elemV, 'elemV');
                        if (elemV.indexOf("makemytrip.com") == -1) {
                            elemV = "https://www.makemytrip.com" + elemV;
                        }
//                    elemV = 'https://www.makemytrip.com/blog/the-rocky-road-to-dublin';
                        return Metascraper
                                .scrapeUrl(elemV).then((metadata) => {
                            console.log(metadata);
                            var a = elemV.split("/");
                            var domain = a[2].replace("www.", "");
                            taleInfo['description'] = metadata['description'] ? metadata['description'].replace(/[^a-zA-Z0-9 ]/g, " ").trim() : "";
                            taleInfo['img_url'] = metadata['image'];
                            taleInfo['title'] = metadata['title'] ? metadata['title'].replace(/[^a-zA-Z0-9 ]/g, " ").trim() : "";
                            taleInfo['url'] = elemV;
                            taleInfo['domain'] = domain;
                            taleInfo['city'] = "All";
                            taleInfo['category'] = "travel";
                            console.log(taleInfo['title'], 'title');
                            return request.getAsync(elemV).spread(function (response, bodyN) {
                                var b$ = cheerio.load(bodyN);
                                taleInfo['city'] = b$('#destination').val() ? b$('#destination').val().trim() : "All";
                                taleInfo['category'] = b$('#omn_category').val() ? b$('#omn_category').val().trim() : "travel";
                                console.log(b$('#destination').val(), 'cityyy');
//                                    throw BreakException;
                                taleInfo['others'] = bodyN.replace(/[^a-zA-Z ]/g, "");
                                if (taleInfo['title'] && taleInfo['description'] && taleInfo['img_url']) {
                                    console.log('saved');
//                                    console.log(taleInfo);
                                    dbModel.saveTale(taleInfo);
//                                    throw BreakException;
                                }
//                                return res.json({status: 'true'});
                            });

                        });
//                    throw BreakException;
                    });
                }).then(() => {
                    return delay(5000).then(function () {
                        console.log('************************Added Delay*********************');
                    });
                });
            }).catch(Promise.TimeoutError, function (e) {
                console.log("could not read file within 100ms");
            });
        });

    } catch (e) {
        if (e !== BreakException) {
//            throw e;
            console.log(e);
        }
    }


});

//https://www.yatrablog.com/wp-json/posts?filter[posts_per_page]=10&filter[offset]=4&page=67
router.get('/yatra', (req, res) => {
    var taleInfo = {};
    var i = 1;
    var arr = [];
    while (i < 67) {
        arr.push(i);
        i++;
    }
    try {
        return Promise.each(arr, function (elemi) {
            console.log(elemi);
            var url = "https://www.yatrablog.com/wp-json/posts?filter[posts_per_page]=10&page=" + elemi;
            return request.getAsync(url, {
                Cookie: "COOKIE=" + 'cookietrip',
                Origin: 'https://www.yatrablog.com/',
                "X-Requested-With": 'XMLHttpRequest',
                Referer: 'https://www.yatrablog.com/'
            }).spread(function (response, body) {
//                console.log(JSON.parse(body));
                return JSON.parse(body);
            }).then((variantUrls) => {
                return Promise.each(variantUrls, function (elemV) {
                    return delay(1000).then(function () {

                        taleInfo['title'] = elemV['title'].replace(/<(?:.|\n)*?>/gm, '');
                        taleInfo['url'] = elemV['link'];
                        taleInfo['others'] = elemV['content'].replace(/<(?:.|\n)*?>/gm, '').replace(/[^a-zA-Z ]/g, "");
                        ;
                        taleInfo['city'] = elemV['destination'] ? elemV['destination'] : "All";
                        taleInfo['domain'] = 'yatrablog.com';
                        taleInfo['description'] = elemV['excerpt'].replace(/<(?:.|\n)*?>/gm, '');
                        taleInfo['category'] = (elemV['terms']['category'].length > 0) ? elemV['terms']['category'][0]['name'] : "travel";
                        if (elemV['featured_image']) {
                            taleInfo['img_url'] = elemV['featured_image']['guid'];
                        }
                        if (!taleInfo['img_url']) {
                            taleInfo['img_url'] = elemV['featured_image']['source'];
                        }
                        console.log(taleInfo);
                        if (taleInfo['title'] && taleInfo['description'] && taleInfo['img_url']) {
                            console.log('saved');
                            dbModel.saveTale(taleInfo);
                        }
                    });
                }).then(() => {
                    return delay(5000).then(function () {
                        console.log('************************Added Delay*********************');
                    });
                });
            }).catch(Promise.TimeoutError, function (e) {
                console.log("could not read file within 100ms");
            });
        });

    } catch (e) {
        if (e !== BreakException) {
            console.log(e);
        }
    }

});


//https://www.tripadvisor.com/blog/api/posts/?locale=en&paged=1&posts_per_page=20
router.get('/trpadv', (req, res) => {
    var taleInfo = {};
    var i = 1;
    var arr = [];
    while (i < 31) {
        arr.push(i);
        i++;
    }
    try {
        return Promise.each(arr, function (elemi) {
            console.log(elemi);
            var url = "https://www.tripadvisor.com/blog/api/posts/?locale=en&posts_per_page=20&paged=" + elemi;
            return request.getAsync(url, {
                Cookie: "COOKIE=" + 'cookietrip',
                Origin: 'https://www.tripadvisor.com/',
                "X-Requested-With": 'XMLHttpRequest',
                Referer: 'https://www.tripadvisor.com/'
            }).spread(function (response, body) {
                var jBody = JSON.parse(body);
                return jBody['data']['posts'];
            }).then((variantUrls) => {
                return Promise.each(variantUrls, function (elemV) {
                    return delay(1000).then(function () {

                        taleInfo['title'] = elemV['title'].replace(/<(?:.|\n)*?>/gm, '');
                        taleInfo['url'] = elemV['link'];
                        taleInfo['img_url'] = elemV['images']['lg'];
                        taleInfo['category'] = (elemV['category']) ? elemV['category'][0]['name'] : "travel";
                        taleInfo['domain'] = 'tripadvisor.com';

                        taleInfo['city'] = "All";

                        return Metascraper
                                .scrapeUrl(elemV['link']).then((metadata) => {
                            taleInfo['description'] = metadata['description'] ? metadata['description'].replace(/[^a-zA-Z0-9 ]/g, " ").trim() : "";
                            return request.getAsync(elemV['link']).spread(function (response, bodyN) {
                                var b$ = cheerio.load(bodyN);
                                taleInfo['city'] = "All";
                                console.log(taleInfo);
                                taleInfo['others'] = bodyN.replace(/[^a-zA-Z ]/g, "");
                                if (taleInfo['title'] && taleInfo['description'] && taleInfo['img_url']) {
                                    console.log('saved');
                                    dbModel.saveTale(taleInfo);
//                                    throw BreakException;
                                }
                            });

                        });

                    });
                }).then(() => {
                    return delay(5000).then(function () {
                        console.log('************************Added Delay*********************');
                    });
                });
            }).catch(Promise.TimeoutError, function (e) {
                console.log("could not read file within 100ms");
            });
        });

    } catch (e) {
        if (e !== BreakException) {
            console.log(e);
        }
    }

});


//http://www.thrillophilia.com/blog/?paged_section=1
router.get('/thrilo', (req, res) => {
    var taleInfo = {};
    var i = 1;
    var arr = [];
    while (i < 110) {
        arr.push(i);
        i++;
    }
    try {
        return Promise.each(arr, function (elemi) {
            console.log(elemi);
            var url = "http://www.thrillophilia.com/blog/?paged_section=" + elemi;
            return request.getAsync(url, {
                Cookie: "COOKIE=" + 'cookietrip',
                Origin: 'https://www.thrillophilia.com/',
                "X-Requested-With": 'XMLHttpRequest',
                Referer: 'https://www.thrillophilia.com/'
            }).spread(function (response, body) {
//                jQuery('h2.title a')
                var modelUrls = [];
                var $ = cheerio.load(body);
                $('h2.title a').each(function (i, elm) {
                    modelUrls.push($(this).attr('href'));
                });
                return modelUrls;
            }).then((variantUrls) => {
                return Promise.each(variantUrls, function (elemV) {
                    return delay(1000).then(function () {

                        return Metascraper
                                .scrapeUrl(elemV).then((metadata) => {
                                    taleInfo['description'] = metadata['description'];
                                    taleInfo['img_url'] = metadata['image'];
                                    taleInfo['url'] = elemV;
                                    taleInfo['title'] = metadata['title'];
                                    taleInfo['domain'] = 'thrillophilia.com';

                                    taleInfo['description'] = metadata['description'] ? metadata['description'].replace(/[^a-zA-Z0-9 ]/g, " ").trim() : "";
                                    return request.getAsync(elemV).spread(function (response, bodyN) {
                                        var b$ = cheerio.load(bodyN);
                                        taleInfo['city'] = "All";
                                        taleInfo['category']  = b$('div.slidecaption .col-md-8 .badge a:first').text();
                                        taleInfo['city']  = b$('div.slidecaption .col-md-8 .badge a:last').text();
                                        taleInfo['others'] = bodyN.replace(/[^a-zA-Z ]/g, "").substring(0,65500);
                                        if (taleInfo['title'] && taleInfo['description'] && taleInfo['img_url']) {
                                            console.log('saved');
                                            dbModel.saveTale(taleInfo);
//                                            throw BreakException;
                                        }
                                    });

                        });

                    });
                }).then(() => {
                    return delay(5000).then(function () {
                        console.log('************************Added Delay*********************');
                    });
                });
            }).catch(Promise.TimeoutError, function (e) {
                console.log("could not read file within 100ms");
            });
        });

    } catch (e) {
        if (e !== BreakException) {
            console.log(e);
        }
    }

});

//https://www.nomadicmatt.com/travel-blog/page/2/
router.get('/nomadiac', (req, res) => {
    var taleInfo = {};
    var i = 1;
    var arr = [];
    while (i < 142) {
        arr.push(i);
        i++;
    }
    try {
        return Promise.each(arr, function (elemi) {
            console.log(elemi);
            var url = "https://www.nomadicmatt.com/travel-blog/page/" + elemi;
            return request.getAsync(url, {
                Cookie: "COOKIE=" + 'cookietrip',
                Origin: 'https://www.nomadicmatt.com',
                "X-Requested-With": 'XMLHttpRequest',
                Referer: 'https://www.nomadicmatt.com/'
            }).spread(function (response, body) {
//                jQuery('h2.title a')
                var modelUrls = [];
                var $ = cheerio.load(body);
                $('h2.entry-title a').each(function (i, elm) {
                    modelUrls.push($(this).attr('href'));
                });
                return modelUrls;
            }).then((variantUrls) => {
                return Promise.each(variantUrls, function (elemV) {
                    return delay(1000).then(function () {
                        return Metascraper
                                .scrapeUrl(elemV).then((metadata) => {
                                    taleInfo['description'] = metadata['description'];
                                    taleInfo['img_url'] = metadata['image'];
                                    taleInfo['url'] = elemV;
                                    taleInfo['title'] = metadata['title'];
                                    taleInfo['domain'] = 'nomadicmatt.com';
//                                    throw BreakException;
                                    taleInfo['description'] = metadata['description'] ? metadata['description'].replace(/[^a-zA-Z0-9 ]/g, " ").trim() : "";
                                    return request.getAsync(elemV).spread(function (response, bodyN) {
                                        var b$ = cheerio.load(bodyN);
                                        taleInfo['city'] = "All";
//                                        taleInfo['category']  = b$('div.slidecaption .col-md-8 .badge a:first').text();
                                        taleInfo['category']  = 'Travel';
//                                        taleInfo['city']  = b$('div.slidecaption .col-md-8 .badge a:last').text();
                                        taleInfo['others'] = bodyN.replace(/[^a-zA-Z ]/g, "").substring(0,65500);
                                        if (taleInfo['title'] && taleInfo['description'] && taleInfo['img_url']) {
                                            console.log('saved');
                                            console.log(taleInfo);
                                            dbModel.saveTale(taleInfo);
//                                            throw BreakException;
                                        }
                                    });

                        });

                    });
                }).then(() => {
                    return delay(5000).then(function () {
                        console.log('************************Added Delay*********************');
                    });
                });
            }).catch(Promise.TimeoutError, function (e) {
                console.log("could not read file within 100ms");
            });
        });

    } catch (e) {
        if (e !== BreakException) {
            console.log(e);
        }
    }

});

//http://traveltriangle.com/blog/
router.get('/traveltriangle', (req, res) => {
    var taleInfo = {};
    var i = 2;
    var arr = [];
    while (i < 140) {
        arr.push(i);
        i++;
    }
    try {
        return Promise.each(arr, function (elemi) {
            console.log(elemi);
            var url = "http://traveltriangle.com/blog/page/" + elemi;
            return request.getAsync(url, {
                Cookie: "COOKIE=" + 'cookietrip',
                Origin: 'http://www.traveltriangle.com/blog/',
                "X-Requested-With": 'XMLHttpRequest',
                Referer: 'http://www.traveltriangle.com/blog'
            }).spread(function (response, body) {
//                jQuery('h2.title a')
                var modelUrls = [];
                var $ = cheerio.load(body);
                $('h3.blog-title a').each(function (i, elm) {
                    modelUrls.push($(this).attr('href'));
                });
                return modelUrls;
            }).then((variantUrls) => {
                return Promise.each(variantUrls, function (elemV) {
                    return delay(1000).then(function () {
                        return Metascraper
                                .scrapeUrl(elemV).then((metadata) => {
                                    taleInfo['description'] = metadata['description'];
                                    taleInfo['img_url'] = metadata['image'];
                                    taleInfo['url'] = elemV;
                                    taleInfo['title'] = metadata['title'];
                                    taleInfo['domain'] = 'traveltriangle.com';
//                                    throw BreakException;
                                    taleInfo['description'] = metadata['description'] ? metadata['description'].replace(/[^a-zA-Z0-9 ]/g, " ").trim() : "";
                                    taleInfo['title'] = metadata['title'] ? metadata['title'].replace(/[^a-zA-Z0-9 ]/g, " ").trim() : "";
                                    return request.getAsync(elemV).spread(function (response, bodyN) {
                                        var b$ = cheerio.load(bodyN);
                                        taleInfo['city'] = "All";
//                                        taleInfo['category']  = b$('div.slidecaption .col-md-8 .badge a:first').text();
                                        taleInfo['category']  = 'Travel';
//                                        taleInfo['city']  = b$('div.slidecaption .col-md-8 .badge a:last').text();
                                        taleInfo['others'] = bodyN.replace(/[^a-zA-Z ]/g, "").substring(0,65500);
                                        if (taleInfo['title'] && taleInfo['description'] && taleInfo['img_url']) {
                                            console.log('saved');
                                            console.log(taleInfo);
                                            dbModel.saveTale(taleInfo);
//                                            throw BreakException;
                                        }
                                    });

                        });

                    });
                }).then(() => {
                    return delay(5000).then(function () {
                        console.log('************************Added Delay*********************');
                    });
                });
            }).catch(Promise.TimeoutError, function (e) {
                console.log("could not read file within 100ms");
            });
        });

    } catch (e) {
        if (e !== BreakException) {
            console.log(e);
        }
    }

});

module.exports = router;
