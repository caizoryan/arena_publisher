export let isNode = (el) => el && el.nodeName && el.nodeType
/** @returns {HTMLElement} */
export let dom = (tag, ...contents) => {
	let el = "div"
	let classes = []
	let id = ""
	if (Array.isArray(tag) && contents.length == 0) return dom(...tag.concat(contents))

	let parseclass = ((str) => {
		let identifiers = str.split(/([\.#]?[^\s#.]+)/).map(e => e.trim()).filter(e => e != "")

		if (!(/^\.|#/.test(identifiers[0]))) {
			el = identifiers[0]
			identifiers.shift()
		}

		identifiers.forEach(i => {
			if (i[0] == ".") classes.push(i.slice(1))
			if (i[0] == "#") id = i.slice(1)
		})
	})(tag)

	let doc = document.createElement(el)

	classes.forEach((c) => doc.classList.add(c))
	id ? doc.id = id : null

	contents.forEach((e) => {
		if (typeof e == 'string') doc.innerText += e
		else if (Array.isArray(e)) doc.appendChild(dom(...e))
		else if (isNode(e)) doc.appendChild(e)
		else if (typeof e == 'object') Object.entries(e).map(([k, v]) => doc[k] = v)
	})

	return doc
}
