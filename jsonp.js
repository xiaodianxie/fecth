let type = (function(){
	let class2type = {}
	'Boolean Number String Function Array Date RegExp Object Error Symbol'.split(' ').forEach((v, i) => {
		class2type[`[object ${v}]`] = v.toLowerCase()
	})
	return (val) => class2type[Object.prototype.toString.call(val)]
})()

function createScriptTag(url, id, options) {
	const script = document.createElement('script')
	script.url = url 
	script.id = id
	if(options.error) {
		script.onerror = options.error
	}
	script.setAttribute('type', 'text/javascript')
	document.querySelector('head').appendChild(script)
	return script
}

function rmScriptTagAndCb(id) {
	const script = document.getElementById(id)
	document.querySelector('head').removeChild(script)
	window.id && delete window.id
}

function generateCb() {
	return 'jsonp' + Math.ceil(Math.random() * 10000)
}

function paramPrevHandler(url, params = {}, options = {}) {
	if(type(url) == 'object') {
		params = url.data || {}
		options = url
		url = url.url
	}
	return { url, params, options }
}

function jsonp(...args) {
	let {url, params, options} = paramPrevHandler(...args)


	return new Promise((resolve, reject) => {
		let cb = options.jsonpCallback || generateCb()
		let query = []
		let timer = null
		let scriptTag

		if(options.timeout) {
			timer = setTimeout(() => {
				options.error && options.error()
				options.complete && options.complete()
				rmScriptTagAndCb()
				resolve('timeout')
			}, options.timeout)
		}
		Object.keys(params).forEach((key) => {
			query.push(`${key}=${params[key]}`)
		})
		url += query.length == 0? '?' : `?${query.join('&')}`
		url += `&callback=${cb}`

		window[cb] = function(response){
			timer = null 
			clearTimeout(timer)
			rmScriptTagAndCb(cb)
			options.success && options.success()
			options.complete && options.complete()
			resolve(response)
		}
		script = createScriptTag(url, cb, options)

	})
}

export default jsonp