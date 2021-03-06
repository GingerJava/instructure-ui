/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2018 - present Instructure, Inc.
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

import canUseDOM from '@instructure/ui-utils/lib/dom/canUseDOM'
import getComputedStyle from '@instructure/ui-utils/lib/dom/getComputedStyle'

let observer

/**
 * ---
 * category: utilities/i18n
 * ---
 *
 * Return the direction ('ltr' or 'rtl') of an element
 * @param {Element} element will use the <html> element by default
 * @returns {String} 'ltr' or 'rtl' (or `undefined` if no DOM is present)
 */
export default canUseDOM ? (() => {
  /**
   * use a cached value for the default of <html> element's "dir" so we don't
   * have to call the expensive getComputedStyle to look it it up every time
   */
  const htmlEl = document.documentElement
  let htmlElDir = htmlEl.getAttribute('dir') || getComputedStyle(htmlEl).direction

  if (!observer) {
    observer = new MutationObserver(() => {
      htmlElDir = htmlEl.getAttribute('dir')
    })
    observer.observe(htmlEl, { attributes: true })
  }

  return element => {
    if (typeof element === 'undefined' || (element === htmlEl)) return htmlElDir
    return getComputedStyle(element).direction
  }
})() : function(){}
