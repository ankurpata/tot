var db = require('../config/db.js');
var commonApis = require('../constants/common');

//
//if (!db) {
//    db.connect(function (err) {
//        if (!err) {
//            console.log("Database is connectedd.");
//        } else {
//            console.log("Error connecting databases.");
//        }
//    });
//}

var getWhat = () => {
//    var what = ['make', 'model', 'max(color) as maxColor ', 'sum(popularity) as popSum', 'GROUP_CONCAT( DISTINCT make_url) as make_url', 'GROUP_CONCAT( DISTINCT model_url) as model_url',
//        'max(img_url) as img_url', 'GROUP_CONCAT( DISTINCT domain) as domain',
//        'GROUP_CONCAT( DISTINCT domain_unique_id) as domain_unique_id', 'round(AVG(price)) as price',
//        'GROUP_CONCAT("name:", variant,";url:", variant_url, ";transmission_type:", transmission_type, ";fuel_type:" , fuel_type, ";displacement:" , displacement, ";price:" , price) as variant_details '];
    var what = ['*'];
    var retWhat = "";

    if (what) {
        retWhat += what.map(function (elem) {
            return elem;
        }).join(", ");
    }
    return retWhat;
};

var getClause = (arr, type) => {
    if (type === 'others' || type === 'title' || type === 'description' || type === 'domain') {
        console.log(arr);
        var clause = " ( " + arr.map(function (elem) {
            return type + " like '%" + elem.trim() + "%'";
        }).join(" OR ") + " ) ";
        return clause;
    }
    var clause = arr.map(function (elem) {
        return elem.trim();
    }).join("' , '");
    var rclause = '';
    if (arr.length > 1) {
        rclause = type + " IN ('" + clause + "')";
    } else {
        rclause = type + "= '" + arr[0] + "'";
    }
    return rclause;
};

var getWhereStr = (data) => {
    var where = [];
    var retWhere = "";
    var whereTmp = [];
    if (data['title'] || data['description'] || data['others']) {
        var whereMake = [];
        if (data['title']) {
            whereMake.push(getClause(data['title'], 'title'));
        }
        if (data['description']) {
            whereMake.push(getClause(data['description'], 'description'));
        }
        if (data['others']) {
            whereMake.push(getClause(data['others'], 'others'));
        }
//        if (whereMake) {
//            whereTmp.push(" ( " + whereMake.map(function (elem) {
//                return elem;
//            }).join(" OR ") + " ) ");
//        }
    }
    if (data['city']) {
        where.push(getClause(data['city'], 'city'));
    }
    if (data['category']) {
        where.push(getClause(data['category'], 'category'));
    }
    if (data['domain']) {
        where.push(getClause(data['domain'], 'domain'));
    }
    if (data['url']) {
        where.push(getClause(data['url'], 'url'));
    }
    
    
    if (where.length > 0) {
        retWhere += "WHERE " + where.map(function (elem) {
            return elem;
        }).join(" AND ");
    }
    
    if (data['others']) {
        if(retWhere){
            retWhere = retWhere + ' OR ' +  whereMake[0]; 
        }else{
            retWhere = "WHERE " + whereMake[0];
        }
    }

//    console.log(retWhere, 'retWhere');
    return retWhere;
};


var getH1 = (urlStr) => {
    var h1 = 'Travel. Food. Fashion.';
    if (urlStr && urlStr != 'newcars' && urlStr != '#') {
        h1 = urlStr.replace(/-/g, " ");
    }
    return commonApis.titleCase(h1);
}
var getDesc = (urlStr) => {
    var h1 = 'New Cars in India';
    if (urlStr && urlStr != 'newcars' && urlStr != '#') {
        h1 = urlStr.replace(/-/g, " ");
    }
    return commonApis.titleCase(h1);
}
   /**
     * Shuffles array in place. ES6 version
     * @param {Array} a items An array containing the items.
     */
var shuffle = (a) => {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
    }
var getQuery = (what, where, pageNo, domainIds) => {
//    if(!domainIds){
//        domainIds = [1, 2, 3, 4, 5, 6];
//    }
//    if (!where) {
//        where = " WHERE ";
//    } else {
//        where += ' AND ';
//    }
//    var sql = domainIds.map(function (elem) {
//        return "(SELECT " + what + " FROM nc_cars " + where + ' domain_unique_id = ' + elem + " GROUP BY make, model ORDER BY popSum DESC LIMIT " + (pageNo * 4) + ', 8' + " )";
//    }).join(" UNION ALL ");

    var sql = "SELECT " + what + " FROM tale_lists " + where + " ORDER BY id DESC LIMIT " + (pageNo * 9) + ', 9';
    console.log(sql, '---sqll--');
    return sql;
};
var searchCars = (data, res, callback) => {
    var where = getWhereStr(data);
    var what = getWhat();
//    console.log(getQuery(what, where, data['pageNo']), " : Query");

    db.query(getQuery(what, where, data['pageNo'],  null), function (err, result, fields) {
        if (err) {
            throw err;
        }

        var response = {};
        response.carlist = result;
        console.log(data, 'resultttt');
        db.query("SELECT count(id) as total_count from tale_lists " + where, function (err, result2, fields) {
            if (err) {
                throw err;
            }
            var numRows = result2[0].total_count;
            var heading = {};
            heading.h1Text = getH1(data['urlStr']);
            heading.h2Text = commonApis.getIndianFormat(numRows) + " interesting tales found for you.";
            heading.metaTags = {
                title: getH1(data['urlStr']) + " | Best Travel Blogs | Curated Tales",
                //            canonical: "new Canonical dynamic",
                description: (result.length ? commonApis.getTime() + ' - ' + commonApis.getIndianFormat(numRows) +
                        " tales found. One Station for best travel blogs."
                        : commonApis.getTime() + " - " + "No listings found for " + getH1(data['urlStr'])),
                keywords: getH1(data['urlStr']) + ", best tales, stories, blogs, vlogs, iternary, ",
            };

            response.heading = heading;
            var guideTmpArr = [];
            guideTmpArr.push({id: 'bangkok', label: 'Bangkok', type: 'city'},
                    {id: 'goa', label: 'goa', type: 'city'},
                    {id: 'thailand', label: 'thailand', type: 'city'},
                    {id: 'dubai', label: 'dubai', type: 'city'},
                    {id: 'maldives', label: 'maldives', type: 'city'},
                    {id: 'paris', label: 'paris', type: 'city'},
                    {id: 'indonesia', label: 'Indonesia', type: 'city'},
                    {id: 'jaipur', label: 'jaipur', type: 'city'},
                    {id: 'india', label: 'India', type: 'city'},
                    {id: 'europe', label: 'europe', type: 'city'},
                    {id: 'thrillophilia', label: 'Thrillophilia', type: 'domain'},
                    {id: 'tripadvisor', label: 'tripadvisor', type: 'domain'},
                    {id: 'makemytrip', label: 'MakeMyTrip', type: 'domain'},
                    {id: 'yatra', label: 'Yatra', type: 'domain'},
                    {id: 'ixigo', label: 'Ixigo', type: 'domain'},
                    {id: 'thomasCook', label: 'ThomasCook', type: 'domain'},
                    {id: 'food', label: 'food', type: 'category'},
                    {id: 'fashion', label: 'fashion', type: 'category'},
                    {id: 'travel', label: 'travel', type: 'category'},
                  
            );
            shuffle(guideTmpArr);
            response.guideTmpArr = guideTmpArr;
            callback(response);
        });

    });
};

function saveContactUs(data) {
    console.log(data, 'datadatadatadata')
//    var data = {};
//    data['info'] = "asdfasf";
        var query = db.query('INSERT INTO tot_queries SET ?', data,

            function (err, result) {
                if (err) {
                    console.log(result, 'sqls---');
                    console.log(this.sql, 'sql---');
                    console.log(err.code, err.sqlMessage);
                } else {
                    console.log("Something else happened", err, result, data.variant_url)
                }
            });

}


var suggestTales = (data, res, callback) => {
    var where = getWhereStr(data);
    var what = getWhat();
        var response = {};
       
        db.query("SELECT DISTINCT city as label, 'city' as type FROM `tale_lists` WHERE city like '%" + data + "%'  \n\
             UNION SELECT DISTINCT category  as label, 'category' as type FROM `tale_lists` WHERE category like '%" + data + "%' \n\
             UNION SELECT DISTINCT domain as label , 'domain' as type FROM `tale_lists` WHERE domain like '%" + data + "%' limit 3  ", function (err, result, fields) {
            console.log(result, 'result');
            if(result){
                for(var i=0;i<result.length;i++){
                    result[i].id = result[i].label;
                    console.log(result[i]);
                }
            }else{
                result= [];
            }
            callback(result);
        });

};

// Functions which will be available to external callers
exports.suggestTales = suggestTales;
exports.saveContactUs = saveContactUs;

// Functions which will be available to external callers
exports.searchCars = searchCars;


