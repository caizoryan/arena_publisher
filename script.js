import { Q5 as p5 } from "./lib/q5/q5.js"
import { Scale } from "./scale.js"
import { process_property, reduceprops } from "./processor.js"

let viewport = 1
let text_block = (props) => new TextFrame(props)

/** 
@typedef {{
	margin: {
		top: Unit,
		bottom: Unit,
		inside: Unit,
		outside: Unit,
	}

	columns: number,
	columnSize?: number,
	gutter: Unit,
	hanglines: Unit[]

	width: Unit,
	height: Unit,
	top: Unit,
	left: Unit

}} GridProps
*/
class Structure {
	/**
	@param {[GridProps, GridProps]} props
	@param {Scale} s
	*/
	constructor(props) {
		this.verso = Object.assign({
			width: page_width,
			height: page_height,
			top: s.em(0),
			left: s.em(0),
			background: "#eee",

			hanglines: [s.em(1)],

			margin: {
				top: s.em(.5),
				bottom: s.em(.5),
				inside: s.em(1),
				outside: s.em(2),
			},

			columns: 5,
			gutter: s.em(.25),

		}, props[0])
		console.log(this.verso)
		this.recto = Object.assign({
			width: page_width,
			height: page_height,
			top: this.verso.top,
			left: s.add(this.verso.width, this.verso.left),
			background: "#eee",

			hanglines: [s.em(1)],
			margin: {
				top: s.em(.5),
				bottom: s.em(.5),
				inside: s.em(1),
				outside: s.em(2),
			},

			columns: 5,
			gutter: s.em(.25),
		}, props[1])
	}

	verso_hanglines() { return this.verso.hanglines ? this.verso_hanglines : [] }
	recto_hanglines() { return this.recto.hanglines ? this.recto_hanglines : [] }

	/**@returns {{x:Unit, y:Unit, w:Unit, h: Unit}[]}*/
	// recto_columns() {
	// 	/**@type {{x:Unit, y:Unit, w:Unit, h: Unit}[]}*/
	// 	const cols = []

	// 	for (let i = 0; i < this.recto.columns; i++) {
	// 		const y = this.recto.margin.top
	// 		const w = this.column_width_recto()

	// 		// outside + gutters + size
	// 		const x = s.px_raw(this.recto.margin.inside.px + i * this.recto.gutter.px + i * this.column_width_recto().px);
	// 		const h = s.px_raw(this.recto.height.px - (this.recto.margin.top.px + this.recto.margin.bottom.px))

	// 		cols.push({ x, y, w, h })
	// 	}

	// 	return cols
	// }
	recto_columns() {
		/**@type {{x:Unit, y:Unit, w:Unit, h: Unit}[]}*/
		const cols = []

		for (let i = 0; i < this.recto.columns; i++) {
			const y = this.recto.margin.top
			const w = this.column_width_recto()

			// outside + gutters + size
			const x = s.px_raw(this.spine().x.px + this.recto.margin.inside.px + (i * this.recto.gutter.px) + (i * this.column_width_recto().px));
			const h = s.px_raw(this.recto.height.px - (this.recto.margin.top.px + this.recto.margin.bottom.px))

			cols.push({ x, y, w, h })
		}

		return cols
	}

	/**@returns {{x:Unit, y:Unit, w:Unit, h: Unit}[]}*/
	verso_columns() {
		/**@type {{x:Unit, y:Unit, w:Unit, h: Unit}[]}*/
		const cols = []

		for (let i = 0; i < this.verso.columns; i++) {
			const y = this.verso.margin.top
			const w = this.column_width_verso()

			// outside + gutters + size
			const x = s.px_raw(this.verso.margin.outside.px + i * this.verso.gutter.px + i * this.column_width_verso().px);
			const h = s.px_raw(this.verso.height.px - (this.verso.margin.top.px + this.verso.margin.bottom.px))

			cols.push({ x, y, w, h })
		}

		return cols
	}

	columns() { return [this.verso_columns(), this.recto_columns()] }

	updateVersoColumnCount() {
		let w = this.verso.width.px - (this.verso.margin.inside.px + this.verso.margin.outside.px);
		let x = this.verso.margin.outside.px
		let c = 0
		while (x < w) {
			c++
			x += this.verso.columnSize.px
			if (x > w) c--
		}
		this.verso.columns = c
	}
	updateRectoColumnCount() {
		let w = this.recto.width.px - (this.recto.margin.inside.px + this.recto.margin.outside.px);
		let x = this.recto.margin.outside.px
		let c = 0
		while (x < w) {
			c++
			x += this.recto.columnSize.px
			if (x > w) c--
		}
		this.recto.columns = c
	}

	/**@returns {Unit}*/
	column_width_verso(n = 1) {
		if (this.verso.columnSize != undefined) {
			this.updateVersoColumnCount()
			return s.add(
				s.mul(this.verso.columnSize, n),
				s.mul(this.verso.gutter, n - 1))
		}

		let w = this.verso.width.px - (this.verso.margin.inside.px + this.verso.margin.outside.px);
		let g = (n - 1) * this.verso.gutter.px
		let ret = s.px_raw(((w - (this.verso.gutter.px * (this.verso.columns - 1))) / this.verso.columns) * n + g);
		return ret
	}

	column_width_recto(n = 1) {
		if (this.recto.columnSize != undefined) {
			this.updateRectoColumnCount()

			return s.add(
				s.mul(this.recto.columnSize, n),
				s.mul(this.recto.gutter, n - 1))
		}

		// TODO: make for recto/verso
		let w = this.recto.width.px - (this.recto.margin.inside.px + this.recto.margin.outside.px);
		let g = (n - 1) * this.recto.gutter.px
		// console.log("w", w)
		let ret = s.px_raw(((w - (this.recto.gutter.px * (this.recto.columns - 1))) / this.recto.columns) * n + g);
		// console.log("ret", ret)
		return ret
	}

	/**@returns {{x: Unit, y: Unit}}*/
	spine() {
		// TODO: make use of where spine is...
		return {
			x: s.px_raw(this.verso.width.px),
			y: s.px_raw(this.verso.height.px / 2)
		}
	}

}

// TODO: Rename this, to like board, canvas,context or smth, paper doesnt make sense...
class Canvas {
	/**
	 * @param {{width: Unit, height: Unit}} size 
	 * @param {Scale} s 
	 * @param {p5} p 
	 * @param {Element} el 
	 * */
	constructor(p, s, el, size, print = false) {
		this.setup(p, s, el)
		this.size = size
		this.scale = s
		this.p5 = p
		this.print = print
	}

	setup(p, s, el) {
		p.preload = () => {}

		p.setup = () => {
			p.createCanvas(this.size.width.px, this.size.height.px);
			el.style.transform = "scale(" + (1 / s.scale) * viewport + ")"
		};

		p.draw = () => {
			p.background(200);
			p.noFill();
			p.noLoop()
		};
	}
}

/**
@typedef Drawable
@property {(p: p5, props: SpreadProps) => void} draw
*/
class Spread {
	/**
	@param {Structure} grid 
	@param {Scale} [scale=new Scale()] 
	@param {Drawable[]} [contents=[]] 
	*/
	constructor(grid, scale = new Scale(), contents = []) {
		/**@type Scale*/
		this.s = scale
		/**@type Structure*/
		this.structure = grid
		/**@type Drawable[]*/
		this.contents = contents
	}

	draw_grid(p) {
		// if needing to create canvas as well
		let recto = this.structure.recto_columns()
		let verso = this.structure.verso_columns()

		p.fill(0)
		p.textSize(this.s.point(9).px)
		p.textFont("monospace")
		p.textWeight(600)
		// p.text("[ PAGE " + (no[0]) + " ]",
		// 	this.structure.verso_columns()[0].x.px,
		// 	this.structure.recto_columns()[3].y.px)
		// p.text("[ PAGE " + (no[1]) + " ]",
		// 	this.structure.recto_columns()[7].x.px,
		// 	this.structure.recto_columns()[3].y.px)

		p.noFill()
		p.stroke(200, 0, 250)
		p.strokeWeight(.2)

		recto.forEach((col) => { p.rect(col.x.px, col.y.px, col.w.px, col.h.px) })
		verso.forEach((col) => { p.rect(col.x.px, col.y.px, col.w.px, col.h.px) })

		p.stroke(0, 0, 255)
		p.strokeWeight(.2)

		// this.structure.recto_hanglines().forEach(y => {
		// 	p.line(0, y.px, p.width, y.px)
		// })
		// this.structure.verso_hanglines().forEach(y => {
		// 	p.line(0, y.px, p.width, y.px)
		// })
	}


	draw(p) {
		this.contents.forEach(d => d.draw(p, this.props()))
	}

	/**@returns {SpreadProps}*/
	props() {
		return {
			scale: this.s,
			structure: this.structure
		}
	}
}

class TextFrame {
	/**
	 * @param {ParagraphProps} props 
	 * */
	constructor(props) {
		this.text = props.text
		this.props = props
	}

	draw(p, prop) {
		draw_paragraph(p, { text: this.text, font_size: s.point(7), ...this.props }, prop.structure)
	}
}

/**
@param {string} text
@param {Unit} length
@param {Unit} x
@param {Unit} y
@param {LineHooks=} hooks
@param {ParentState} state
@param {p5} p
@returns {{leading: number, text: string}} 

Takes text and length, and returns overflowed text.
TODO: Return amount to skip/add or smth + text...
*/
function draw_line(p, text, x, y, length, state, hooks) {
	if (text.charAt(0) == `\n`) {
		if (text.charAt(1) == `\n`) {
			return { text: text.slice(2), leading: 1.1 }
		}

		return { text: text.slice(1), leading: .4 }
	}

	let break_ratio = 1
	let lines = text.split(`\n`)
	let words = lines.shift().split(" ")
	let tagged = ""
	let tag

	let end_lines = `\n` + lines.join(`\n`)

	let skip = false

	/**@type LineState*/
	let line_state = {
		space_size: p.textWidth(" "),
		hyphen_leftover: "",
		horizontal_pos: 0,
		word_count: 0,
	}

	let try_hyphenation = (word) => {
		if (word.includes("-")) return false

		let hyphenated
		if (funky_hyphens) {
			hyphenated = word.split("")
		} else {
			hyphenated = hyphenateSync(word, {
				hyphenChar: "---((---))---"
			}).split("---((---))---")
		}


		// try to put first of hyphenated in...
		/**@type {number[]}*/
		let sizes = hyphenated.map(e => p.textWidth(e))
		let already = line_state.horizontal_pos
		//let lexeme = hyphenated.shift()
		let condition = () => {
			let cur_size = sizes
				.slice(0, count + 1)
				.reduce((sum, a) => sum += a, 0)
			return already + cur_size < length.px
		}

		let count = 0
		while (condition()) { count++ }

		//let word_len = p.textWidth(lexeme)

		if (count == 0) return false
		else {
			let remainder = hyphenated.slice(count).join("")
			let word = hyphenated.slice(0, count).join("")
			let _fill = p.ctx.fillStyle
			//
			if (color_hyphens) p.fill(p.color("red"))
			p.text(word + "-", x.px + line_state.horizontal_pos, y.px)
			p.fill(_fill)
			return remainder
		}

		return false
	}

	const props = () => ({
		paragraph_state: state.paragraph_state,
		line_state: line_state,
		paragraph: state.paragraph,
		p: p,
	})

	words.forEach(word => {
		if (skip) return
		let word_len = p.textWidth(word)

		// let tag = tag_hooks[word.toLowerCase()]
		// if (tag) {
		// 	p.noStroke();
		// 	p.textSize(state.paragraph.font_size.px)
		// 	p.textFont(state.paragraph.font_family)
		// 	p.textWeight(state.paragraph.font_weight)
		// 	p.fill(state.paragraph.color)
		// 	p.textStyle(p.NORMAL)

		// 	if (tag.color) p.fill(tag.color)
		// 	if (tag.leading) { p.textLeading(tag.leading.px) }
		// 	if (tag.break_ratio) { break_ratio = tag.break_ratio }
		// 	if (tag.font_size) p.textSize(tag.font_size.px)
		// 	if (tag.font_weight) p.textWeight(tag.font_weight)
		// 	if (tag.font_family) p.textFont(tag.font_family)
		// 	if (tag.font_style) p.textStyle(p[tag.font_style])

		// 	tagged = word + " "
		// 	line_state.space_size = p.textWidth(" "),
		// 		line_state.word_count++
		// 	// words.shift()
		// 	return
		// }

		//if (typeof hooks?.beforeWord == "function") hooks?.beforeWord(props())
		if (line_state.horizontal_pos + word_len > length.px) {
			// try hyphenation...
			if (!state.paragraph.hyphenate) {
				skip = true
				return
			}

			let _leftover = try_hyphenation(word)
			if (_leftover) {
				line_state.hyphen_leftover = _leftover
				line_state.word_count++
			}
			skip = true
			return
		}

		let _fill = p.ctx.fillStyle
		if (word.includes(`\n`)) {
			p.fill(p.color("red"))
		}

		word = word.replace("//", "/ ")

		p.text(word, x.px + line_state.horizontal_pos, y.px)
		p.fill(_fill)
		line_state.horizontal_pos += word_len
		line_state.horizontal_pos += line_state.space_size
		line_state.word_count++
	})

	p.opacity(1)
	words = words.slice(line_state.word_count).join(" ")


	let t = line_state.hyphen_leftover ? line_state.hyphen_leftover + " " + words + end_lines : words + end_lines
	if (words.length > 0) t = tagged + t

	return { text: t, leading: 1 }
}

/**
@param {ParagraphProps} paragraph
@param {p5} p
@param {Grid} grid 

@description takes text and length, and returns overflowed text.
*/
function draw_paragraph(p, paragraph, grid) {
	const is_fn = fn => typeof fn == "function"

	//@ts-ignore
	if (paragraph.x && is_fn(paragraph.x)) paragraph.x = paragraph.x(grid)
	//@ts-ignore
	if (paragraph.y && is_fn(paragraph.y)) paragraph.y = paragraph.y(grid)
	//@ts-ignore
	if (paragraph.length && is_fn(paragraph.length)) paragraph.length = paragraph.length(grid)
	//@ts-ignore
	if (paragraph.height && is_fn(paragraph.height)) paragraph.height = paragraph.height(grid)

	/**@type Paragraph*/
	let _paragraph = Object.assign({
		text: "",
		font_family: "monospace",
		font_weight: 300,
		x: { px: 10 },
		y: { px: 10 },
		height: { px: 100 },
		length: { px: 100 },
		leading: { px: 12 },
		rotation: 0,
		color: p.color("black"),
		stroke: p.color("black"),
		font_size: { px: 14 },
		rect: false,
		hooks: {},
		hyphenate: false
	}, paragraph)


	p.textSize(_paragraph.font_size.px)
	p.textFont(_paragraph.font_family)
	p.textWeight(_paragraph.font_weight)

	/**@type ParagraphState*/
	let paragraph_state = {
		vertical_pos: _paragraph.y.px + p.textLeading(),
		word_count: 0,
	}

	// _paragraph.rotation=0

	if (_paragraph.rotation != 0) {
		p.push()
		p.translate(_paragraph.x.px, _paragraph.y.px)
		p.angleMode(p.DEGREES)
		p.rotate(_paragraph.rotation)
		paragraph_state.vertical_pos = p.textLeading()
		_paragraph.x = { px: 0 }
		_paragraph.y = { px: 0 }
	}

	if (_paragraph.rect) {
		p.noFill();
		p.strokeWeight(.5)
		p.stroke(_paragraph.stroke);
		p.rect(_paragraph.x.px, _paragraph.y.px, _paragraph.length.px, _paragraph.height.px);
	}

	p.noStroke();
	p.fill(_paragraph.color)
	let start_length = _paragraph.text.length

	while (
		// text is there
		_paragraph.text.length > 0

		// vertical pos hasnt exited bounding box
		&& paragraph_state.vertical_pos < _paragraph.y.px + _paragraph.height.px
	) {

		// reset every iter
		p.noStroke();
		p.textSize(_paragraph.font_size.px)
		p.textFont(_paragraph.font_family)
		p.textWeight(_paragraph.font_weight)
		p.fill(_paragraph.color)
		p.textStyle(p.NORMAL)



		paragraph_state.word_count = start_length - _paragraph.text.length


		let { text, leading } = draw_line(
			p,
			_paragraph.text,
			_paragraph.x,
			{ px: paragraph_state.vertical_pos },
			_paragraph.length,
			{
				paragraph: _paragraph,
				paragraph_state
			},
			_paragraph.hooks
		)

		_paragraph.text = text
		paragraph_state.vertical_pos += p.textLeading() * leading
		//leading.px
		//
		//
	}

	if (_paragraph.rotation != 0) {
		p.pop()
	}

	// OVERFLOW MARKER
	if (_paragraph.text.length > 0) {
		// draw red rectangle
		p.noFill();
		p.strokeWeight(2)
		p.stroke("red");
		let xx = _paragraph.x.px + _paragraph.length.px - 10
		let yy = _paragraph.y.px + _paragraph.height.px - 10
		p.text("X", xx + 10, yy + 10)
		p.rect(xx, yy, 20, 20);
	}
	return _paragraph.text
}

// there will be a spread

// a scale for sizing

// a grid for locating items

// a data structure from which spread will be rendered

// a book for doing imposition

// init p5
let el = document.querySelector(".q5")
let p = new p5('instance', el);
let s = new Scale()

let page_width = s.inch(11)
let page_height = s.inch(8.5)

let canvas = new Canvas(p, s, el, { width: page_width, height: page_height })
let grid = new Structure([{ width: s.div(page_width, 2), margin: { top: s.em(1), inside: s.em(1), outside: s.em(1), bottom: s.em(1), } }, {
	width: s.div(page_width, 2)
}])

let slug = 'notes-conditions-of-visuality'

fetch('https://api.are.na/v2/channels/notes-conditions-of-visuality')
	.then(res => res.json())
	.then(res => { init(res) })


let frame = arr => {
	if (arr[0] == "TextBlock") return text_block(reduceprops(arr.slice(1)))
	if (arr[0] == "TextFrame") return new TextFrame(reduceprops(arr.slice(1)))
}

let frames = arr => arr.map(frame)
let data

let renderframeui = (items) => {
	let box = document.createElement('div')
	// box.onclick = (e) => { current_box = items }
	// box.onmouseleave = () => { current_box = null }

	box.classList.add('box')
	ui.appendChild(box)

	items.forEach(
		(item, i) => {
			if (i == 0) return
			let property = document.createElement('div')
			property.onclick = (e) => {
				
				if (e.metaKey) {
					property.setAttribute('activated', 'true')
					buffer.push(item)
				}
			}
			// property.onmouseenter = () => {
			// 	buffer = item
			// }
			// property.onmouseleave = () => {
			// 	property.setAttribute('activated', 'false')
			// 	buffer = null
			// }
			property.classList.add('property')

			let key = document.createElement('span')
			key.classList.add('key')
			key.innerText += item[0] + ' : '

			property.appendChild(key)

			if (Array.isArray(item[1])) {
				let key = item[1][0]
				if (
					key == 'em'
					|| key == 'point'
					|| key == 'inch'
					|| key == 'hangline_verso'
					|| key == 'column_width_verso'
					|| key == 'hangline_recto'
					|| key == 'column_width_recto'
					|| key == 'recto'
					|| key == 'verso'
				) {
					let unit = document.createElement('span')
					unit.innerText = '(' + key + ')'
					unit.classList.add('unit')

					let input = document.createElement('input')
					input.value = item[1][1]
					input.onkeydown = (e) => {
						if (e.key == 'ArrowRight') { e.stopPropagation() }
						if (e.key == 'ArrowLeft') { e.stopPropagation() }
						if (e.key == 'ArrowUp') {
							e.stopPropagation()
							item[1][1] += increment
							input.value = item[1][1]
							render()
						}
						if (e.key == 'ArrowDown') {
							e.stopPropagation()
							item[1][1] -= increment
							input.value = item[1][1]
							render()
						}

						if (e.key == 'Enter') {
							e.stopPropagation()
							e.preventDefault()
							let lastvalue = item[1][1]
							let newvalue = parseFloat(e.target.value)
							if (newvalue == NaN) newvalue = lastvalue
							item[1][1] = newvalue
							input.value = item[1][1]
							render()
						}
					}

					property.appendChild(input)
					property.appendChild(unit)
				}


				else if (key == 'css') {
					let css_box = document.createElement('div')
					if (Array.isArray(item[1][1])) item[1][1].forEach((el) => {
						let p = document.createElement('p')
						let key = document.createElement('span')
						let input = document.createElement('input')
						key.innerText = el[0]
						input.value = el[1]

						input.onkeydown = (e) => {
							if (e.key == 'ArrowRight') { e.stopPropagation() }
							if (e.key == 'ArrowLeft') { e.stopPropagation() }
							if (e.key == 'Enter') {
								e.stopPropagation()
								e.preventDefault()
								let value = e.target.value
								el[1] = value
								render()
							}
						}

						p.appendChild(key)
						p.appendChild(input)
						css_box.appendChild(p)
					})

					property.appendChild(css_box)
				}

			}
			else if (
				typeof item[1] == 'number'||
				typeof item[1] == 'string'
			) {

				let input = document.createElement('input')
				input.value = item[1]
				input.onkeydown = (e) => {
					if (e.key == 'ArrowRight') { e.stopPropagation() }
					if (e.key == 'ArrowLeft') { e.stopPropagation() }
					if (e.key == 'Enter') {
						e.stopPropagation()
						e.preventDefault()
						let newvalue = e.target.value
						item[1] = newvalue
						console.log(item[1])
						input.value = item[1]
						refresh_redraw_pages()
					}
				}

				property.appendChild(input)

			}

			box.appendChild(property)
		})
}

let ui = document.createElement('div')
ui.classList.add('ui')
document.body.appendChild(ui)

let updateui = () => {
	ui.innerHTML = ''
	if (Array.isArray(data)) data.forEach(renderframeui)
	let btn = document.createElement('button')
	btn.innerText = 'save'
	btn.onclick = () => {render()}
	// save()

	ui.appendChild(btn)
}

let render = () => {
	p.background(200)
	let contents = () => frames([
			['TextFrame',
				["text", "Hello world"],
				["x", ["verso", 2, "x"]],
				["y", ["em", 4]]],
			...data
		])

	let spread = new Spread(grid, s, contents())
	spread.draw(p)
	spread.draw_grid(p)
}

let init = (channel) => {
	data = channel.contents
		.slice(0, 4)
		.map((b, i) =>
			['TextBlock',
				['text', b.content],
				['font_family', 'sans-serif'],
				["x", ["verso", 0, 'x']],
				["y", ["em", i * 12 + 2]],
				['height', ['em', 12]],
				['length', ['em', 18]],
			])

	render()
	updateui()
}

