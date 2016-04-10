//更具传入的对象构建query（以&作为分割）字符串返回
function buildQuery(searchObj) {
	var query = '';
	for(var o in searchObj) {
		query += o + '=' + searchObj[o] + '&';
	}
	return encodeURIComponent(query.slice(0, -1));
};
/*
* params 为一个对象，具有如下属性
* @url 请求的url路径
* @method: 请示的方式，默认为get
* @contentType: 发送数据的数据类型，json，form，upload具有如下映射关系 暂时不支持
    {
        json: 'application/json;charset=UTF-8' 默认
        form: application/x-www-form-urlencoded, 普通表单
        upload: multipart/form-data 上传文件表单
    }
* @data: 需要发送的数据
*/
//通用的请求数据函数
function fetchData(params) {
    var url, hasSearch, isGet, data, options;
    isGet = !params.method || params.method.toLowerCase() !== 'post';
    hasSearch = params.url.indexOf('?') !== -1;
    data = params.data || {};
    url = params.url + (isGet && (hasSearch && '&' || '?') + buildQuery(data)) || '';
    options = isGet ? null : {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify(data)
    };
	return new Promise(function(resolve, reject) {
		fetch(url, options)
	    .then(function(res) {
			if(res.ok) return res.json();
			reject({ errcode: res.status, errmsg: res.statusText })
		})
		.then(function(json) {
			if(typeof json.ret === 'undefined') return resolve(json);
			json.ret ? resolve(json.data) : reject(json);
		})
	    .catch(function(err) { reject({ errmsg: err, errcode: 500})});
	});
};

export default fetchData;