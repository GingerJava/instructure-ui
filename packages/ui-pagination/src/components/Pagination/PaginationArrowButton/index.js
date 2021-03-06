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

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Button from '@instructure/ui-buttons/lib/components/Button'
import PresentationContent from '@instructure/ui-a11y/lib/components/PresentationContent'
import ScreenReaderContent from '@instructure/ui-a11y/lib/components/ScreenReaderContent'
import Tooltip from '@instructure/ui-overlays/lib/components/Tooltip'

import IconStart from '@instructure/ui-icons/lib/Solid/IconArrowOpenStart'
import IconEnd from '@instructure/ui-icons/lib/Solid/IconArrowOpenEnd'

import testable from '@instructure/ui-testable'
/**
---
parent: Pagination
---
**/
@testable()
export default class PaginationArrowButton extends Component {
  static propTypes = {
    direction: PropTypes.oneOf(['next', 'prev']),
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired
  }

  render() {
    const { label, direction, ...props } = this.props
    const Icon = direction === 'prev' ? IconStart : IconEnd
    return (
      <Tooltip
        on={['hover', 'focus']}
        tip={<PresentationContent>{label}</PresentationContent>}
      >
        <Button
          {...props}
          variant="icon"
          size="small"
          icon={Icon}
          rel={(props.href || props.to) ? direction : null}
        >
          <ScreenReaderContent>{label}</ScreenReaderContent>
        </Button>
      </Tooltip>
    )
  }
}
