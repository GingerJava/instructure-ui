/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 - present Instructure, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { changedPackageWarning, warnDeprecatedComponent } from '../react/deprecated'

import getBoundingClientRect from './getBoundingClientRect'
import getScrollParents from './getScrollParents'
import getOffsetParents from './getOffsetParents'
import canUseDOM from './canUseDOM'
import findDOMNode from './findDOMNode'
import ownerDocument from './ownerDocument'
import ownerWindow from './ownerWindow'

export default function calculateElementPosition (element, target, options) {
  warnDeprecatedComponent('5.0.0', 'calculateElementPosition', changedPackageWarning(
    'ui-utils',
    'ui-layout'
  ))

  if (!element || options.placement === 'offscreen') {
    // hide offscreen content at the bottom of the DOM from screenreaders
    // unless content is contained somewhere else
    const hide = !options.container && element
    return {
      placement: options.placement,
      style: {
        left: '-9999em',
        overflow: 'hidden',
        position: 'absolute',
        display: hide ? 'none' : null
      }
    }
  }

  const pos = new PositionData(element, target, options)

  return {
    placement: pos.placement,
    style: pos.style
  }
}

class PositionedElement {
  constructor (element, placement, offset = { top: 0, left: 0 }) {
    this.node = findDOMNode(element)

    if (typeof placement === 'string') {
      this.placement = parsePlacement(placement)
    } else if (Array.isArray(placement)) {
      this.placement = placement
    } else {
      this.placement = ['bottom', 'center']
    }

    this.rect = getBoundingClientRect(this.node)

    this._offset = offsetToPx(offset, this.size)
  }

  get width () {
    return this.rect.width
  }

  get height () {
    return this.rect.height
  }

  get size () {
    return {
      width: this.width,
      height: this.height
    }
  }

  get position () {
    return {
      top: this.rect.top,
      left: this.rect.left
    }
  }

  get hasVerticalPlacement () {
    return ['top', 'bottom'].indexOf(this.placement[0]) >= 0
  }

  get hasHorizontalPlacement () {
    return ['start', 'end'].indexOf(this.placement[0]) >= 0
  }

  get shouldStretchVertically () {
    return this.placement[1] === 'stretch' && this.hasVerticalPlacement
  }

  get shouldStretchHorizontally () {
    return this.placement[1] === 'stretch' && this.hasHorizontalPlacement
  }

  get mirroredPlacement () {
    return mirrorPlacement(this.placement)
  }

  calculateOffset (placement) {
    const offsetMap = {
      top: 0,
      start: 0,
      center: '50%',
      bottom: '100%',
      end: '100%',
      stretch: 0
    }

    let [first, second] = placement

    if (['start', 'end'].indexOf(first) >= 0) {
      [first, second] = [second, first]
    }

    let top = 0
    let left = 0

    if (typeof offsetMap[first] !== 'undefined') {
      top = offsetMap[first]
    }

    if (typeof offsetMap[second] !== 'undefined') {
      left = offsetMap[second]
    }

    return addOffsets([offsetToPx({ top, left }, this.size), parseOffset(this._offset, this.placement)])
  }

  get scrollParentsOffset () {
    const parents = getScrollParents(this.node)

    let offsetY = 0
    let offsetX = 0

    for (let i = 1; i < parents.length; i++) {
      const parent = parents[i]
      const child = parents[i - 1]

      offsetY = offsetY + (parent.scrollTop - child.scrollTop)
      offsetX = offsetX + (parent.scrollLeft - child.scrollLeft)
    }

    return { top: offsetY, left: offsetX }
  }

  get positionedParentsOffset () {
    // If the element container is within a positioned
    // element, it will position absolutely with respect to that
    // ancestor. We calculate the offset between the child and
    // positioned parent so we can negate that distance
    const parents = getOffsetParents(this.node)

    let offsetY = 0
    let offsetX = 0
    let scrollY = 0

    for (let i = 1; i < parents.length; i++) {
      const parent = getBoundingClientRect(parents[i])
      const child = getBoundingClientRect(parents[i - 1])

      offsetY = offsetY + (child.top - parent.top)
      offsetX = offsetX + (child.left - parent.left)
      scrollY = scrollY + parents[i].scrollTop
    }
    // Account for any scrolling on positioned parents
    // Without this, unnecessary scroll offset could be applied
    // to our target element
    offsetY = offsetY + scrollY

    return { top: offsetY, left: offsetX }
  }
}

class PositionData {
  constructor (element, target, options) {
    this.options = options || {}

    const { container, constrain, placement, over } = this.options

    if (!element || placement === 'offscreen') return

    this.container = container || ownerDocument(element).body

    this.element = new PositionedElement(element, placement, { top: this.options.offsetY, left: this.options.offsetX })

    this.target = new PositionedElement(
      target || this.container,
      over ? this.element.placement : this.element.mirroredPlacement
    )

    if (constrain === 'window') {
      this.constrainTo(ownerWindow(element))
    } else if (constrain === 'scroll-parent') {
      this.constrainTo(getScrollParents(this.target.node)[0])
    } else if (constrain === 'parent') {
      this.constrainTo(this.container)
    }
  }

  get offset () {
    const { top, left } = this.target.calculateOffset(this.element.placement)

    const offset = addOffsets([
      this.element.calculateOffset(this.target.placement),
      this.element.scrollParentsOffset,
      this.element.positionedParentsOffset
    ])

    return {
      top: top - offset.top,
      left: left - offset.left
    }
  }

  get placement () {
    return formatPlacement(this.element.placement)
  }

  get minWidth () {
    return this.element.shouldStretchVertically ? this.target.width : null
  }

  get minHeight () {
    return this.element.shouldStretchHorizontally ? this.target.height : null
  }

  get position () {
    const win = ownerWindow(this.target.node)

    let { left, top } = addOffsets([this.target.position, this.offset])

    if (canUseDOM && win.matchMedia) {
      const retina =
        win.matchMedia('only screen and (min-resolution: 1.3dppx)').matches ||
        win.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3)').matches
      if (!retina) {
        left = Math.round(left)
        top = Math.round(top)
      }
    }

    return { left, top }
  }

  get style () {
    return {
      top: 0,
      left: 0,
      minWidth: this.minWidth,
      minHeight: this.minHeight,
      position: 'absolute',
      transform: `translateX(${this.position.left}px) translateY(${this.position.top}px) translateZ(0)`
    }
  }

  overflow (element) {
    const bounds = getBoundingClientRect(element)
    const offsets = addOffsets([this.target.position, this.offset])
    const parentOffsetTop = this.element.positionedParentsOffset.top + this.element.scrollParentsOffset.top

    const left = offsets.left
    const right = left + this.element.positionedParentsOffset.left + this.element.width

    let top = offsets.top + parentOffsetTop
    let bottom = offsets.top + this.element.height + parentOffsetTop

    // adjust for vertical placements
    if (this.element.placement[0] === "bottom") {
      top -= this.element.height + this.target.height
    } else if (this.element.placement[0] === "top") {
      bottom += this.element.height + this.target.height
    }
    // adjust for horizontal placements
    if (this.element.placement[1] === "top") {
      top -= this.element.height - this.target.height
    } else if (this.element.placement[1] === "bottom") {
      bottom += this.element.height - this.target.height
    }

    return {
      top: (top < bounds.top) ? bounds.top - top : 0,
      bottom: (bottom > bounds.bottom) ? bottom - bounds.bottom : 0,
      left: (left < bounds.left) ? bounds.left - left : 0,
      right: (right > bounds.right) ? right - bounds.right : 0
    }
  }

  constrainTo (element) {
    if (!element) return

    const overflow = this.overflow(element)
    const oob = {
      top: overflow.top > 0,
      bottom: overflow.bottom > 0,
      left: overflow.left > 0,
      right: overflow.right > 0,
    }

    if (this.element.hasVerticalPlacement) {
      if (oob.left && oob.right) {
        this.element.placement[1] = 'center'
        this.target.placement[1] = 'center'
      } else if (oob.left) {
        this.element.placement[1] = 'start'
        this.target.placement[1] = 'start'
      } else if (oob.right) {
        this.element.placement[1] = 'end'
        this.target.placement[1] = 'end'
      }

      if (oob.top && oob.bottom) {
        // if top and bottom bounds broken
        if (overflow.bottom < overflow.top) {
          // more room on bottom, position below
          this.element.placement[0] = 'bottom'
          this.target.placement[0] = 'top'
        } else {
          // more room on top, position above
          this.element.placement[0] = 'top'
          this.target.placement[0] = 'bottom'
        }
      } else if (oob.top) {
        // if top bound broken, position below
        this.element.placement[0] = 'bottom'
        this.target.placement[0] = 'top'
      } else if (oob.bottom) {
        // if bottom bound broken, position above
        this.element.placement[0] = 'top'
        this.target.placement[0] = 'bottom'
      }
    } else if (this.element.hasHorizontalPlacement) {
      if (oob.top && oob.bottom) {
        this.element.placement[1] = 'center'
        this.target.placement[1] = 'center'
      } else if (oob.top) {
        this.element.placement[1] = 'top'
        this.target.placement[1] = 'top'
      } else if (oob.bottom) {
        this.element.placement[1] = 'bottom'
        this.target.placement[1] = 'bottom'
      }

      if (oob.left) {
        this.element.placement[0] = 'end'
        this.target.placement[0] = 'start'
      } else if (oob.right) {
        this.element.placement[0] = 'start'
        this.target.placement[0] = 'end'
      }
    }
  }
}

function addOffsets (offsets) {
  return offsets.reduce(
    (sum, offset) => {
      return {
        top: sum.top + offset.top,
        left: sum.left + offset.left
      }
    },
    { top: 0, left: 0 }
  )
}

function parseOffset (offset, placement) {
  let { top, left } = offset

  if (placement[0] === 'bottom') {
    top = 0 - parseFloat(top, 10)
  }

  if (placement[0] === 'end') {
    left = 0 - parseFloat(left, 10)
  }

  return {
    top,
    left
  }
}

function offsetToPx (offset, size) {
  let { left, top } = offset

  if (typeof left === 'string' && left.indexOf('%') !== -1) {
    left = parseFloat(left, 10) / 100 * size.width // eslint-disable-line no-mixed-operators
  } else {
    left = parseFloat(left, 10)
  }

  if (typeof top === 'string' && top.indexOf('%') !== -1) {
    top = parseFloat(top, 10) / 100 * size.height // eslint-disable-line no-mixed-operators
  } else {
    top = parseFloat(top, 10)
  }

  return { top, left }
}

function sortPlacement (placement) {
  let [first, second] = placement

  if (first === 'center' || first === 'stretch') {
    [first, second] = [second, first]
  }
  return [first, second]
}

export function parsePlacement (placement) {
  let parsed = placement.split(' ')

  if (parsed.length === 1) {
    parsed = [placement, 'center']
  }

  return sortPlacement(parsed)
}

function formatPlacement (placement) {
  return placement.join(' ')
}

export function mirrorPlacement (placement) {
  const [first, second] = placement

  const mirror = {
    center: 'center',
    start: 'end',
    end: 'start',
    top: 'bottom',
    bottom: 'top',
    stretch: 'stretch'
  }
  return [mirror[first], second]
}
