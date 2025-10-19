export const DPI = 100

/**
@typedef {("inch" | "pica" | "point" | "em" | "pixel")} UnitType
@typedef {{
	unit?: UnitType,
	value?: number,
	px: number
}} Unit
 */

export class Scale {
	constructor(scale = DPI) {
		this.dpi = window.devicePixelRatio * 96
		this.scale = scale / this.dpi
		console.log("dpr", window.devicePixelRatio)
	}

	/**
	@param {Type.Unit} unit1 
	@param {Type.Unit} unit2 
	*/
	add(unit1, unit2) {
		return this.px_raw(unit1.px + unit2.px)
	}

	/**
	@param {Type.Unit} unit1 
	@param {Type.Unit} unit2 
	*/
	sub(unit1, unit2) {
		return this.px_raw(unit1.px - unit2.px)
	}

	/**
	@param {Type.Unit} unit1 
	@param {number} unit2 
	*/
	mul(unit1, unit2) {
		return this.px_raw(unit1.px * unit2)
	}

	/**
	@param {Type.Unit} unit1 
	@param {Type.Unit} unit2 
	*/
	div(unit1, unit2) {
		let two = unit2.px ? unit2.px : unit2
		return this.px_raw(unit1.px / two)
	}

	/**
	@param {number} value 
	@returns {Type.Unit} 
	*/
	em(value) {
		return {
			unit: "em",
			value,
			px: this.inch(value / 6).px
		}
	}

	/**
	@param {number} value 
	@returns {Type.Unit} 
	*/
	px(value) {
		return {
			unit: "pixel",
			value,
			px: value * this.scale
		}
	}

	/**
	@param {number} value 
	@returns {Type.Unit} 
	*/
	px_raw(value) {
		return {
			unit: "pixel",
			value,
			px: value
		}
	}

	pixel(value) { return this.px(value) }

	/**
	@param {number} value 
	@returns {Type.Unit} 
	*/
	inch(value) {
		return {
			unit: "inch",
			value,
			px: value * this.dpi * this.scale
		}
	}

	/**
	@param {number} value 
	@returns {Type.Unit} 
	*/
	pica(value) { return this.em(value) }
	picas(value) { return this.pica(value) }


	/**
	@param {number} value 
	@returns {Type.Unit} 
	*/
	point(value) {
		return {
			unit: "point",
			value,
			px: this.pica(value).px / 12
		}
	}
}

export let s = new Scale()
