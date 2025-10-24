import { Q5 as p5 } from "./lib/q5/q5.js"
import { Scale } from "./scale.js"
import { reduceprops } from "./processor.js"
import { dom } from './dom.js'

let viewport = window.innerWidth > 1600 ? 1 : .45
let spread = 0

let host = 'http://localhost:3000/api/'
let a = localStorage.getItem('auth')
let auth = a ? a : ''
// let host = 'https://api.are.na/v2/'
let slug = 'p-presentation-0jxekaemhom'
let dataslug = 'presentation-data'


// ----------------- +x+ --
// Are.na Functions
// ----------------- +x+ --
const add_block = (slug, content, title,) => {
	return fetch(host + "channels/" + slug + "/blocks", {
		headers: {
			"Content-Type": "application/json",
			Authorization: "Bearer " + auth,
		},
		method: "POST",
		body: JSON.stringify({
			content: content,
		}),
	})
		.then((response) => response.json())
		.then((data) => {
			let block_id = data.id;
			// TODO: better way to do this
			// if (title !== "" || title != undefined) return update_block(block_id, { title: title }, slug);
			// else
			return data
		});
};
const getchannel =
	(slug) =>
		fetch(host
			+ 'channels/'
			+ slug
			+ '?per=100&force=true',
			// + '?per=100',
			{
				headers: {
					Authorization: `Bearer ${auth}`,
					cache: "no-store",
					"Cache-Control": "max-age=0, no-cache",
					referrerPolicy: "no-referrer",
				},
			})
			.then((res) => res.json())


// ----------------- +x+ --
// ++ BOOK CLASSES
// ----------------- +x+ --
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

	verso_hanglines() { return this.verso.hanglines ? this.verso.hanglines : [] }
	recto_hanglines() { return this.recto.hanglines ? this.recto.hanglines : [] }

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
			p.background('#eee')
			p.noFill();
			p.noLoop()
		};
	}

	/**@param {Book} book */
	draw_book(book) {
		let p = this.p5
		// p.background(200, 127);

		console.log(book.structure)
		let width = book.structure.verso.width.px + book.structure.recto.width.px
		let height = book.structure?.verso.height
		let left = (this.size.width.px - width) / 2
		let top = (this.size.height.px - height.px) / 2

		let graphic = p.createGraphics(width, height.px)
		graphic.background(255)

		this.draw_crop_marks(book)

		let draw_verso = (graphic, spread) => {
			let color = "white"
			let verso_image = book.verso_image(graphic, spread, color, .5)
			let x = left
			let y = top
			p.image(verso_image, x, y, verso_image.width, verso_image.height)
			p.opacity(.95)
		}

		let draw_recto = (graphic, spread,) => {
			let color = "white"
			let width = book.structure.verso.width.px + book.structure.recto.width.px
			let recto_image = book.recto_image(graphic, spread, color, .5)

			p.image(
				recto_image, left + width / 2, top, recto_image.width, recto_image.height)
			p.opacity(.95)
		}

		draw_verso(graphic, book.current_spread)
		draw_recto(graphic, book.current_spread)
	}

	/**@param {Book} book */
	draw_crop_marks(book, page) {
		let p = this.p5

		let width = book.structure.verso.width.px + book.structure.recto.width.px
		let height = book.structure.verso.height
		let left = (this.size.width.px - width) / 2
		let top = (this.size.height.px - height.px) / 2

		// crop marks
		p.line(left, 0, left, top)
		p.line(0, top, left, top)

		p.line(p.width - left, 0, p.width - left, top)
		p.line(p.width, top, p.width - left, top)

		// center
		p.line(p.width / 2, 0, p.width / 2, top)
		p.line(p.width / 2, p.height, p.width / 2, p.height - top)

		p.line(0, p.height - top, left, p.height - top)
		p.line(left, p.height, left, p.height - top)

		p.line(p.width, p.height - top, p.width - left, p.height - top)
		p.line(p.width - left, p.height, p.width - left, p.height - top)
	}

	/**@param {Book} book */
	draw_saddle(book) {
		let p = this.p5

		if (this.print) {
			p.background(255);
		} else {
			p.background('#eee');
		}
		let width = book.structure.verso.width.px + book.structure.recto.width.px
		let height = book.structure.verso.height

		let graphic = p.createGraphics(width, height.px)
		graphic.background(255)

		book.draw_saddle_view(graphic)
		this.draw_crop_marks(book)

		let left = (this.size.width.px - width) / 2
		let top = (this.size.height.px - height.px) / 2

		p.image(graphic, left, top, width, height.px)
		return graphic
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
		p.stroke(0, 0, 250)
		p.strokeWeight(.5)

		recto.forEach((col) => { p.rect(col.x.px, col.y.px, col.w.px, col.h.px) })
		verso.forEach((col) => { p.rect(col.x.px, col.y.px, col.w.px, col.h.px) })

		p.stroke(0, 0, 255)
		p.strokeWeight(.2)

		// this.structure.recto_hanglines().forEach(y => {
		// 	p.line(0, y.px, p.width, y.px)
		// })
		this.structure.verso_hanglines().forEach(y => {
			p.line(0, y.px, p.width, y.px)
		})
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

class Book {
	/**
	@param {Spread[]} [spreads=[]] 
	@param {{draw_grid: boolean}=} opts
	*/
	constructor(spreads = [], opts = { draw_grid: true }) {
		this.grid = opts.draw_grid
		this.structure = spreads[0] ? spreads[0].props().structure : undefined
		this.current_spread = 0

		/**@type Spread[]*/
		this.spreads = spreads
	}

	before_spine(page_num) {
		let spread = this.pages()
		let is = undefined
		let middle = Math.floor(spread.length / 2)

		spread.forEach((e, i) => {
			e.forEach((pg, side) => {
				if (pg == page_num) {
					if (i == middle) {
						if (side == 0) is = true
						else is = false
					}
					else {
						if (i < middle) is = true
						else is = false
					}
				}
			})
		})

		return is
	}

	saddle_pages() {
		// get pages
		let pages = this.pages()

		//let pages = [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17]]
		if (!Array.isArray(pages)) return

		let last = pages.length - 1
		let pair = (i) => pages[last - i]
		let pairskiplast = (i) => pages[last - i - 1]

		let middle = Math.ceil(last / 2)

		// switch each recto with pair spread recto till middle
		for (let i = 0; i < middle; i++) {
			let f_verso = pages[i][0]
			let p_verso = pair(i)[0]

			pages[i][0] = p_verso
			pair(i)[0] = f_verso
		}

		let pairedup = []

		// pair spreads up with each other
		for (let i = 0; i < middle; i++) {
			pairedup.push(pages[i])
			pairedup.push(pairskiplast(i))
		}

		return pairedup
	}

	page_to_spread(num) {
		return Math.floor(num / 2)
	}

	get_page(num = 1) {
		let spread = this.page_to_spread(num)
		return this.spreads[spread]
	}

	set_spread(spread) {
		let valid = this.validate_spread(spread)
		if (!valid) return
		this.current_spread = spread
	}

	set_page(num) {
		let spread = this.page_to_spread(num)
		this.set_spread(spread)
	}

	validate_spread(spread) {
		if (this.spreads.length <= spread
			|| spread < 0
		) return false
		else return true
	}

	pages() {
		/**@type {[number, number][]}*/
		let arr = []
		let is_odd = (num) => (num % 2) == 1

		// also make sure number of spreads is odd
		// TOD0: if it isn't, add a spread before last page in booklet binding... 
		if (is_odd(this.spreads.length)) {
			this.spreads.forEach((_, i) => {
				let last = i == this.spreads.length - 1
				let first = i == 0
				let num = i * 2
				let recto = last ? 0 : num + 1
				let verso = num
				arr.push([verso, recto])
			})

			return arr
		}
		else {
			console.log("FUCK NOT MULTIPLE OF 4", (this.spreads.length * 2) - 2)
		}
	}

	/**@param {Spread} spread */
	add_spread(spread) {
		this.spreads.push(spread)
	}

	page_image(p, number) {
		let spread = this.page_to_spread(number)
		if (number % 2 == 1) return this.recto_image(p, spread,)
		else return this.verso_image(p, spread)
	}

	/**
	@typedef {p5.Image} Image
	*/
	verso_image(p, number, color = "white", width = .5) {
		let _p = p.createGraphics(p.width, p.height)
		_p.background(color)
		if (this.grid) this.spreads[number].draw_grid(_p, [(number * 2), (number * 2) + 1])
		this.spreads[number].draw(_p)
		if (number == 0) { _p.background('#eee') }
		let img = _p.get(0, 0, _p.width * width, _p.height)

		return img
	}

	recto_image(p, number, color = "white", width = .5) {
		let from = 1 - width
		let _p = p.createGraphics(p.width, p.height)
		_p.background(color)
		if (this.grid) this.spreads[number].draw_grid(_p, [(number * 2), (number * 2) + 1])
		this.spreads[number].draw(_p)
		if (number == this.spreads.length - 1) { _p.background('#eee') }
		let img = _p.get(_p.width * from, 0, _p.width * width, _p.height)

		return img
	}

	draw_saddle_view(p) {
		let saddle = this.saddle_pages()
		if (!saddle) return

		let curr = saddle[this.current_spread]
		this.draw_page_set(p, curr[0], curr[1])
	}

	/**
	@param {Image} img  
	*/
	draw_img(p, img, x = 0, y = 0) {
		p.image(img, x, y, img.width, img.height)
	}


	draw_page_set(p, num1, num2) {
		if (num1) {
			// let offset = book.offsets.filter((e) => e.page == num1)
			// let horizontal_offset = offset.find((e) => e.axis == "horizontal")
			// TODO: update structure

			let spread_num_1 = this.page_to_spread(num1)
			let img = this.verso_image(p, spread_num_1, "white", .5)
			this.draw_img(p, img, 0, 0)
		}

		if (num2) {
			let spread_num_2 = this.page_to_spread(num2)
			let img = this.recto_image(p, spread_num_2, "white", .5)
			let x = 0
			this.draw_img(p, img, p.width / 2 + x, 0)
		}
	}

	seek(page) {
		this.set_page(page)
	}
}

// ----------------- +x+ --
// ++ FRAMES
// ----------------- +x+ --
class ImageFrame {
	constructor(props) {
		this.props = props
		this.image = new Image()
		this.image.src = props.src
	}

	draw(p, prop) {
		if (this.props.hidden == 'true') return
		let x = typeof this.props.x == 'function' ? this.props.x(prop.structure) : this.props.x
		let y = typeof this.props.y == 'function' ? this.props.y(prop.structure) : this.props.y
		// if length/width is given use that to calculate height
		let w = typeof this.props.length == 'function' ? this.props.length(prop.structure) : this.props.length
		let ratio = w.px / this.image.width
		let h = this.image.height * ratio

		if (this.props.opacity != undefined) p.opacity(this.props.opacity)

		let pop = false
		if (this.props.rotation != undefined) {
			p.push()
			pop = true
			p.translate(x.px, y.px)
			p.angleMode(p.DEGREES)
			p.rotate(this.props.rotation)
		}

		if (pop) {
			p.image(this.image, 0, 0, w.px, h)
			p.pop()
		}
		else {
			p.image(this.image, x.px, y.px, w.px, h)
		}
		p.opacity(1)
	}
}

class VideoFrame {
	constructor(props) {
		this.props = props
		// this.image = new Video()
		// this.image.src = props.src
	}

	draw(p, prop) {}
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
		if (this.props.hidden == 'true') return
		draw_paragraph(p, { text: this.text, font_size: s.point(7), ...this.props }, prop.structure)
	}
}


// ----------------- +x+ --
// ++ LINE FUNCTIONS
// ----------------- +x+ --
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

		p.textLeading(_paragraph.leading.px)


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

let display = true
let increment = .5
let count = 0
let el = document.querySelector(".q5")
let p = new p5('instance', el);
let s = new Scale()
let page_width = s.inch(11)
let page_height = s.inch(8.5)
let canvas = new Canvas(p, s, el, { width: page_width, height: page_height })
let grid = new Structure([{
	width: s.inch(5),
	height: s.inch(8),
	hanglines: [
		s.em(3),
		s.em(12),
		s.em(21),
		s.em(30),
	],
	margin: { top: s.em(1), inside: s.em(1), outside: s.em(1), bottom: s.em(1), }
}, {
	width: s.inch(5),
	height: s.inch(8),
	margin: { top: s.em(1), inside: s.em(1), outside: s.em(1), bottom: s.em(1), }
}])
let book = new Book([])

let data
let contents

// ----------------- +x+ --
// ++ Utility functions
// ----------------- +x+ --
let addsheet = () => {
	data.push([])
	data.push([])
	notificationpopup('Added another sheet')
	book.set_spread(book.spreads.length - 1)
	updateui()
	render()
}

let nextpage = () => {
	if (spread > book.spreads.length - 2) return
	spread += 1
	book.current_spread = spread
	presentationindex = 0
	updateui()
	updatebar()
	render()
}

let prevpage = () => {
	if (spread == 0) return
	spread -= 1
	book.current_spread = spread
	presentationindex = 0
	updateui()
	updatebar()
	render()
}

let toggledisplay = () => {
	display = !display
	render()
	updatebar()
}
let togglegrid = () => {
	book.grid = !book.grid
	render()
}

let savelocal = () => { localStorage.setItem('data', JSON.stringify(data)) }
let sync = () => {
	add_block(dataslug, JSON.stringify(data, null, 2))
		.then((res) => {
			notificationpopup('synced with are.na')
		})
}

let findblockids = () => {
	let ids = []
	// go through data
	data.forEach(
		// spreads
		f => f.forEach(

			// items
			d => d.forEach(

				// props (look through each prop to find id prop)
				// can probably cache this....
				a => {
					if (Array.isArray(a) && a[0] == 'id') { ids.push(a[1]) }
				}

			)))

	return ids
}

let findpropertyandset = (prop, value) => {
	// go through data
	data.forEach(
		// spreads
		f => f.forEach(

			// items
			(d, i) => {
				let done = false
				d.forEach(

					// props (look through each prop to find id prop)
					// can probably cache this....
					a => {
						if (Array.isArray(a) && a[0] == 'prop') { a[1] == value; done = true }
					}
				)
				if (!done) d.push([prop, value])
				f[i] = cleandata(d)
			}))
}

let add_block_to_spread = block => {
	console.log(book.current_spread)
	if (block.class == "Text")
		data[book.current_spread].push(cleandata([
			'TextBlock',
			['text', block.content],
			['id', block.id],

			...defaulttextprops,
			['font_family', 'sans-serif'],
			["x", ["verso", 0, 'x']],
			["y", ["em", count++ * 12 + 2]],
			['height', ['em', 12]],
			['length', ['em', 18]],
		]))

	if (block.class == "Attachment"
		&&
		block.attachment.extension == 'mp4'
	) {

		data[book.current_spread].push(['VideoBlock',
			['vidsrc', block.attachment.url],
			['id', block.id],
			['length', ['em', 18]],
		])
	}

	if (block.class == "Image")
		data[book.current_spread].push(['ImageBlock',
			['src', block.image.original.url],
			['id', block.id],
			["x", ["verso", 0, 'x']],
			["y", ["em", count++ * 12 + 2]],
			['length', ['em', 18]],
		])

	updateui()
	render()
}

// ----------------- +x+ --
// ++ Init functions
// ----------------- +x+ --
getchannel(slug)
	.then(res => {
		console.log(res)
		notificationpopup('got blocks from ' + slug.slice(0, 20) + '...')
		init(res)
	})

getchannel(dataslug)
	.then(res => {
		console.log('length ->', res.length)
		if (res.length > 98) notificationpopup('AARYAN CHANNEL LARGER THAN 100, FIX THIS')
		notificationpopup('got datafiles from ' + dataslug)
		let latest_block = res.contents.sort((a, b) => a.position - b.position).pop()
		parseintodata(latest_block.content)

		console.log(data)
		render()
	})


// ----------------- +x+ --
// ++ UI PREP
// ----------------- +x+ --
let ui = dom('.ui')
document.body.appendChild(ui)

let arena_ui_container = dom('.container')
let btn = dom('button.top-right', {
	onclick: () => {
		let is = arena_ui.getAttribute('closed')
		if (is == 'true') {
			arena_ui.setAttribute('closed', 'false')
			btn.innerText = 'hide'
		}

		else {
			arena_ui.setAttribute('closed', 'true')
			btn.innerText = 'show'
		}
	}
}, 'show are.na')
let arena_ui = dom('.arena-ui', btn, arena_ui_container)
arena_ui.setAttribute('closed', 'true')
document.body.appendChild(arena_ui)

let bar = dom('.bar')
document.body.appendChild(bar)

// ----------------- +x+ --
// ++ UI Recipes
// ----------------- +x+ --

// Edit UI
let frame = arr => {
	if (arr[0] == "TextBlock" || arr[0] == "TextFrame") return new TextFrame(reduceprops(arr.slice(1)))
	if (arr[0] == "ImageBlock") return new ImageFrame(reduceprops(arr.slice(1)))
	if (arr[0] == "VideoBlock") return new VideoFrame(reduceprops(arr.slice(1)))
}
let frames = arr => arr.map(frame)
let renderframeui = (items, i) => {
	let collapse = dom(['button', {
		onclick: () => {
			if (box.getAttribute('collapsed') == 'true') {
				box.setAttribute('collapsed', 'false')
				collapse.innerText = 'collapse'
			}
			else {
				box.setAttribute('collapsed', 'true')
				collapse.innerText = 'open'
			}
		}
	}, 'collapse'])

	let del = dom(['button', { onclick: () => { data[book.current_spread].splice(i, 1); render(); updateui() } }, 'delete'])

	let layerdown = dom(['button', {
		onclick: () => {
			if (i != data[book.current_spread].length - 1) {
				let copy = data[book.current_spread][i]
				data[book.current_spread][i] = data[book.current_spread][i + 1]
				data[book.current_spread][i + 1] = copy
				render()
				updateui()
			}
		}
	}, 'v'])
	let layerup = dom(['button', {
		onclick: () => {
			if (i != 0) {
				let copy = data[book.current_spread][i]
				data[book.current_spread][i] = data[book.current_spread][i - 1]
				data[book.current_spread][i - 1] = copy
				render()
				updateui()
			}
		}
	}, '^'])

	let dimensions = dom('.dimensions')
	let propopup = (arr) => {
		console.log(arr)
		let p = [
			['opacity', .8],
			['rotation', 3],
			['hidden', 'true'],
		]

		let d = dom(['.popup',
			['button', { onclick: () => d.remove() }, 'x'],
			...p.map(e =>
				['button', {
					onclick: () => {
						arr.push([...e]);
						updateui()
						render();
					}
				}, e[0]])])

		document.body.appendChild(d)
	}
	let addprop = dom(['button', { onclick: () => { propopup(items) } }, '+'])
	let box = dom('.box', collapse, addprop, layerdown, layerup, del, dimensions)
	ui.appendChild(box)

	items.slice(1).forEach(
		(item, i) => {
			if (presentationmode) {
				if (item[0] == 'text') console.log('text')
				let c = false
				if (item[0] == 'text' || item[0] == 'src' || item[0] == 'vidsrc') c = true
				if (!c) return
			}

			let keylabel = dom(['div.key', item[0]])
			let property = dom('.property', {
				onclick: (e) => {
					if (e.metaKey) {
						property.setAttribute('activated', 'true')
						buffer.push(item)
					}
				}
			}, keylabel)

			let onkeydown = (e) => {
				if (e.key == 'ArrowRight' || e.key == 'ArrowLeft') { e.stopPropagation() }
				if (e.key == 'ArrowUp') {
					e.stopPropagation()
					item[1][1] += increment
					e.target.value = item[1][1]
					render()
				}
				if (e.key == 'ArrowDown') {
					e.stopPropagation()
					item[1][1] -= increment
					e.target.value = item[1][1]
					render()
				}
				if (e.key == 'Enter') {
					e.stopPropagation()
					e.preventDefault()
					let lastvalue = item[1][1]
					let newvalue = parseFloat(e.target.value)
					if (newvalue == NaN) newvalue = lastvalue
					item[1][1] = newvalue
					e.target.value = item[1][1]
					render()
				}
			}

			if (item[0] == 'x' || item[0] == 'y') {

				let key = item[1][0]
				if (
					key == 'em'
					|| key == 'point'
					|| key == 'inch'
					|| key == 'hangline_verso'
					|| key == 'column_width_verso'
					|| key == 'hangline_recto'
					|| key == 'column_width_recto'
				) {
					// let unit = dom('span.unit', '(' + key + ')')
					keylabel.innerText += ' (' + key + ')'
					let input = dom('input', { value: item[1][1], onkeydown: onkeydown, })
					property.appendChild(input)
					// property.appendChild(unit)
				}

				if (key == "recto" || key == 'verso') {
					let unit = dom('span.unit', {
						onclick: (e) => {
							item[1][0] = key == 'recto' ? 'verso' : 'recto'
							key = item[1][0]
							e.target.innerText = item[1][0]
							render()
						}
					}, '(' + key + ')')
					let input = dom('input', { value: item[1][1], onkeydown: onkeydown, })
					property.appendChild(input)
					property.appendChild(unit)
				}

				dimensions.appendChild(property)
				return
			}
			else if (Array.isArray(item[1])) {
				let key = item[1][0]
				if (
					key == 'em'
					|| key == 'point'
					|| key == 'inch'
					|| key == 'hangline_verso'
					|| key == 'column_width_verso'
					|| key == 'hangline_recto'
					|| key == 'column_width_recto'
				) {
					let unit = dom('span.unit', '(' + key + ')')
					let input = dom('input', { value: item[1][1], onkeydown: onkeydown, })
					property.appendChild(input)
					property.appendChild(unit)
				}

				if (key == "recto" || key == 'verso') {
					let unit = dom('span.unit', {
						onclick: (e) => {
							item[1][0] = key == 'recto' ? 'verso' : 'recto'
							key = item[1][0]
							e.target.innerText = item[1][0]
							render()
						}
					}, '(' + key + ')')
					let input = dom('input', { value: item[1][1], onkeydown: onkeydown, })
					property.appendChild(input)
					property.appendChild(unit)
				}

			}
			else if (
				typeof item[1] == 'number' ||
				typeof item[1] == 'string'
			) {

				// Image src
				if (item[0] == 'src') {
					keylabel.innerText = ''
					let img = dom('img.smol', { src: item[1] })
					property.appendChild(img)
				}

				// block id
				else if (item[0] == 'id') {
					property.appendChild(dom('span', item[1] + ''))
				}

				// text item
				else if (item[0] == 'text') {
					let img = dom('textarea', {
						value: item[1],
						onkeydown: (e) => {
							if (e.key == 'ArrowRight') { e.stopPropagation() }
							if (e.key == 'ArrowLeft') { e.stopPropagation() }
							if (e.key == 'Enter' && !e.shiftKey) {
								e.stopPropagation()
								e.preventDefault()
								let newvalue = e.target.value
								item[1] = newvalue
								e.target.value = item[1]
								render()
							}
						}
					})
					property.appendChild(img)
				}

				else {
					let input = dom('input', {
						value: item[1],
						onkeydown: (e) => {
							if (e.key == 'ArrowRight') { e.stopPropagation() }
							if (e.key == 'ArrowLeft') { e.stopPropagation() }
							if (e.key == 'Enter') {
								e.stopPropagation()
								e.preventDefault()
								let newvalue = e.target.value
								item[1] = newvalue
								console.log(item[1])
								input.value = item[1]
								render()
							}
						}
					})
					property.appendChild(input)
				}
			}

			box.appendChild(property)
		})
}

let notificationpopup = (msg) => {
	let d = dom('.notification', {
		style: `
		position: fixed;
		right: -50vw;
		opactiy: 0;
		bottom: 1em;
		transition: 200ms;
	`}, msg)

	document.querySelectorAll('.notification')
		.forEach((e) => {
			let b = parseFloat(e.style.bottom)
			e.style.bottom = (b + 5) + 'em'
		})

	document.body.appendChild(d)

	setTimeout(() => { d.style.right = '1em'; d.style.opacity = 1 }, 5)
	setTimeout(() => { d.style.opacity = 0 }, 5000)
	setTimeout(() => { d.remove() }, 3500)
}

// BAR
let updatebar = () => {
	bar.innerHTML = ''
	let authpopup = () => {
		let aut = ''
		let d = dom(
			'.auth-popup',
			['input', { oninput: (e) => aut = e.target.value, value: auth }],
			['button', {
				onclick: (e) => {
					auth = aut
					localStorage.setItem('auth', auth)
					d.remove()
					setTimeout(() => {
						location.reload()
					}, 500)
				}
			}, 'save'],

			['button', { onclick: (e) => d.remove() }, 'close']
		)

		document.body.appendChild(d)
	}

	let d = dom('.actions',
		['button', { onclick: prevpage }, 'prev'],
		['span', " " + book.current_spread + " / " + (book.spreads.length - 1)],
		['button', { onclick: nextpage }, 'next'],
		['button', { onclick: toggledisplay }, display ? 'saddle view' : 'display view'],

		['button', { onclick: togglegrid }, 'grid'],
		['button', { onclick: savelocal }, 'save'],
		['button', { onclick: sync }, 'sync'],
		['button', { onclick: addsheet }, 'add sheet'],
		['button', { onclick: authpopup }, 'auth'],
	)

	bar.appendChild(d)
}
let updateui = () => {
	let btn = dom('button', {
		onclick: () => {
			let is = ui.getAttribute('closed')
			if (is == 'true') {
				ui.setAttribute('closed', 'false')
				btn.innerText = 'unpin'
			}
			else {
				ui.setAttribute('closed', 'true')
				btn.innerText = 'pin'
			}
		}
	}, 'unpin')

	ui.innerHTML = ''
	ui.appendChild(btn)
	if (Array.isArray(data[book.current_spread])) data[book.current_spread].forEach(renderframeui)
}

// Arena UI
let renderarenaui = (block, foundblocks) => {
	let found = foundblocks.includes(block.id) ? '.found' : ''
	let block_el = dom('.block' + found, { onclick: () => add_block_to_spread(block), })

	if (block.class == "Text") block_el.appendChild(dom('div', block.content))
	if (block.class == "Image") block_el.appendChild(dom('img', { src: block.image.original.url }))
	if (block.class == "Link") block_el.appendChild(dom(['div', ['img', { src: block.image.display.url }], ['p', block.title]]))
	if (block.class == "Media") block_el.appendChild(dom(['div', ['img', { src: block.image.display.url }], ['p', block.title]]))
	if (block.class == "Attachment") block_el.appendChild(dom(['div', ['img', { src: block.image.display.url }], ['p', block.title]]))

	block_el.appendChild(dom(['p', block.class]))
	arena_ui_container.appendChild(block_el)
}
let update_arena_ui = () => {
	arena_ui_container.innerHTML = ''

	let foundblocks = findblockids()
	console.log(foundblocks)
	if (Array.isArray(contents)) contents.forEach(c => renderarenaui(c, foundblocks))
}

let cleandata = (item) => [
	item[0],
	...Object.entries(
		item.slice(1)
			.reduce((group, prop) => {
				group[prop[0]] = prop[1]
				return group
			}, {}))
]

let parseintodata = (str) => {
	let tempdata = JSON.parse(str)
	let logg = tempdata.map(r => r.reduce((acc, item) => {
		acc.push(cleandata(item))
		return acc
	}, []))

	console.log(logg, tempdata)
	data = logg
}
let d = localStorage.getItem('data')
if (d) parseintodata(d)
else data = [[], [], []]

// ----------------- +x+ --
// ++ RENDER BOOK
// ----------------- +x+ --
let render = () => {
	let spreads = data.map(frames).map(f => new Spread(grid, s, f))
	spread = book.current_spread
	let drawgrid = book.grid
	setTimeout(() => {
		book = new Book(spreads, { draw_grid: drawgrid })
		book.current_spread = spread
		// canvas.draw_saddle(book)
		if (display) canvas.draw_book(book)
		else canvas.draw_saddle(book)
		updatebar()
	}, 10)

}
let init = (channel) => {
	contents = channel.contents
	updateui()
	updatebar()
	render()
	update_arena_ui()
}

let viewmode = false
let presentationmode = false
let presentationindex = 0

let startviewmode = () => {
	viewmode = true
	document.querySelector('.main.container').setAttribute('view-mode', 'true')
}
let endviewmode = () => {
	viewmode = false
	document.querySelector('.main.container').setAttribute('view-mode', 'false')
}

let startpresentationmode = () => {
	startviewmode()
	presentationmode = true
	findpropertyandset('hidden', 'true')
	render()
	document.querySelector('.ui').setAttribute('presentation-mode', 'true')
	updateui()
}

let endpresentationmode = () => {
	presentationindex = 0
	endviewmode()
	presentationmode = false
	findpropertyandset('hidden', 'false')
	render()
	updateui()
	document.querySelector('.ui').setAttribute('presentation-mode', 'false')
	// go through all current page props and make them visible
}

let decrementpresentationindex = () => {
	if (presentationindex != 0) presentationindex--
	for (let i = 0; i < presentationindex; i++) {
		data[book.current_spread][i].forEach(p => {
			if (Array.isArray(p) && p[0] == 'hidden') {
				p[1] = 'false'
			}
		})
	}

	for (let i = presentationindex; i < data[book.current_spread].length; i++) {
		data[book.current_spread][i].forEach(p => {
			if (Array.isArray(p) && p[0] == 'hidden') {
				p[1] = 'true'
			}
		})
	}

	render()
}

let mountvideo = (src) => {
	let vid = dom('.video', {
		style: `
position: fixed;
width: 70vw;
top:5em;
left:10vw;
z-index: 220;
`},
		['video', {
			style: 'width: 100%',
			src, autoplay: true, muted: true
		}],)

	document.body.appendChild(vid)
}

let unmountallvideo = () => {
	document.querySelectorAll('.video').forEach(e => e.remove())

}

let incrementpresentationindex = () => {
	if (presentationindex != data[book.current_spread].length) presentationindex++

	for (let i = 0; i < presentationindex; i++) {
		data[book.current_spread][i].forEach(p => {
			console.log(p[0], i, presentationindex)
			if (i == presentationindex - 1) {
				// check if vidsrc prop is there, if yes then make video
				if (Array.isArray(p) && p[0] == 'vidsrc') {
					console.log('found video, mounting', p[1])
					mountvideo(p[1])
				}
			}

			if (Array.isArray(p) && p[0] == 'hidden') {
				p[1] = 'false'
			}
		})
	}

	render()
}

document.onkeydown = (e) => {
	if (e.key == 'ArrowRight') nextpage()
	if (e.key == 'ArrowLeft') prevpage()
	if (e.key == 'ArrowUp') decrementpresentationindex()
	if (e.key == 'ArrowDown') incrementpresentationindex()
	if (e.key == 'w') togglegrid()
	if (e.key == 'W') {
		if (viewmode) endviewmode()
		else startviewmode()
	}

	if (e.key == 'X') {unmountallvideo()}
	if (e.key == 'P') {
		if (presentationmode) endpresentationmode()
		else startpresentationmode()
	}
}

let defaulttextprops = [
	// ["hyphenate", "boolean"],
	// ["font_family", 'sans-serif'],
	['font_weight', 100],
	['leading', ['em', 1]],
	['font_size', ['point', 8]],
	['length', ['em', 12]],
	['height', ['em', 12]],
	['color', 'black'],
	// stroke?: string,
	// rect?: boolean,
]
