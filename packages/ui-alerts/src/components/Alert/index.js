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
import ReactDOM from 'react-dom'

import PropTypes from 'prop-types'
import classNames from 'classnames'
import keycode from 'keycode'

import CloseButton from '@instructure/ui-buttons/lib/components/CloseButton'
import View from '@instructure/ui-layout/lib/components/View'
import ScreenReaderContent from '@instructure/ui-a11y/lib/components/ScreenReaderContent'

import IconCheckMark from '@instructure/ui-icons/lib/Solid/IconCheckMark'
import IconInfoBorderless from '@instructure/ui-icons/lib/Solid/IconInfoBorderless'
import IconWarningBorderless from '@instructure/ui-icons/lib/Solid/IconWarningBorderless'
import IconNo from '@instructure/ui-icons/lib/Solid/IconNo'

import Transition from '@instructure/ui-motion/lib/components/Transition'

import themeable from '@instructure/ui-themeable'
import ThemeablePropTypes from '@instructure/ui-themeable/lib/utils/ThemeablePropTypes'
import deprecated from '@instructure/ui-utils/lib/react/deprecated'
import error from '@instructure/ui-utils/lib/error'
import uid from '@instructure/uid'

import styles from './styles.css'
import theme from './theme'

/**
---
category: components
---
**/

@deprecated('3.0.0', {
  dismissable: true,
  onClose: 'onDismiss',
  transitionType: 'transition',
  isOpen: 'open'
})
@themeable(theme, styles)
export default class Alert extends Component {
  static propTypes = {
    /**
    * content to be rendered within Alert
    */
    children: PropTypes.node,
    /**
    * Determines color and icon
    */
    variant: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
    /**
    * Valid values are `0`, `none`, `auto`, `xxx-small`, `xx-small`, `x-small`,
    * `small`, `medium`, `large`, `x-large`, `xx-large`. Apply these values via
    * familiar CSS-like shorthand. For example: `margin="small auto large"`.
    */
    margin: ThemeablePropTypes.spacing,
    /**
    * Function that returns the DIV where screenreader alerts will be placed.
    */
    liveRegion: PropTypes.func,
    /**
    * Choose the politeness level of screenreader alerts.
    */
    liveRegionPoliteness: PropTypes.oneOf(['polite', 'assertive']),
    /**
     * If the alert should only be visible to screen readers
     */
    screenReaderOnly: PropTypes.bool,
    /**
    * Milliseconds until the Alert is dismissed automatically
    */
    timeout: PropTypes.number,
    /**
    * Close button label
    */
    closeButtonLabel: PropTypes.string,
    /**
    * Callback after the alert is closed
    */
    onDismiss: PropTypes.func,
    /**
    * Transition used to make the alert appear and disappear
    */
    transition: PropTypes.oneOf(['none', 'fade']),
    /**
    * if open transitions from truthy to falsey, it's a signal to close and unmount the alert.
    * This is necessary to close the alert from the outside and still run the transition.
    */
    open: PropTypes.bool
  }

  static defaultProps = {
    variant: 'info',
    margin: 'x-small 0',
    timeout: 0,
    transition: 'fade',
    open: true,
    screenReaderOnly: false,
    liveRegionPoliteness: 'assertive'
  }

  constructor (props) {
    super(props)

    this.state = {
      open: true
    }
  }

  _timeouts = []

  variantUI () {
    return {
      error: {
        Icon: IconNo,
        classNames: classNames(styles.alert, styles.error)
      },
      info: {
        Icon: IconInfoBorderless,
        classNames: classNames(styles.alert, styles.info)
      },
      success: {
        Icon: IconCheckMark,
        classNames: classNames(styles.alert, styles.success)
      },
      warning: {
        Icon: IconWarningBorderless,
        classNames: classNames(styles.alert, styles.warning)
      }
    }[this.props.variant]
  }

  handleTimeout = () => {
    if (this.props.timeout > 0) {
      this._timeouts.push(
        setTimeout(() => {
          this.close()
        }, this.props.timeout)
      )
    }
  }

  clearTimeouts () {
    this._timeouts.forEach(timeout => clearTimeout(timeout))
    this._timeouts = []
  }

  onExitTransition = () => {
    if (this.props.onDismiss) {
      this.props.onDismiss()
    }
  }

  close = () => {
    this.clearTimeouts()
    this.removeScreenreaderAlert()
    this.setState({ open: false }, () => {
      if (this.props.onDismiss && this.props.transition === 'none') {
        this.props.onDismiss()
      }
    })
  }

  // duck type for a dom node
  isDOMNode (n) {
    return n && typeof n === 'object' && n.nodeType === 1
  }

  getLiveRegion () {
    let lr = null
    if (typeof this.props.liveRegion === 'function') {
      lr = this.props.liveRegion()
    }

    return this.isDOMNode(lr) ? lr : null
  }

  initLiveRegion (liveRegion) {
    error(
      liveRegion.getAttribute('role') === 'alert',
      'Alert',
      `live region must have role='alert' set on page load in order to announce content`
    )

    if (liveRegion) {
      liveRegion.setAttribute('aria-live', this.props.liveRegionPoliteness)
      liveRegion.setAttribute('aria-relevant', 'additions text')
      liveRegion.setAttribute('aria-atomic', 'false')
    }
  }

  createScreenreaderContentNode () {
    return (
      <ScreenReaderContent>
        {this.props.children}
      </ScreenReaderContent>
    )
  }

  createScreenreaderAlert () {
    const liveRegion = this.getLiveRegion()
    if (liveRegion) {
      this.srid = uid('Alert')

      const div = document.createElement('div')
      div.setAttribute('id', this.srid)

      const content = this.createScreenreaderContentNode()
      ReactDOM.render(content, div)
      liveRegion.appendChild(div)
    }
  }

  updateScreenreaderAlert () {
    if (this.getLiveRegion()) {
      const div = document.getElementById(this.srid)
      if (div) {
        ReactDOM.unmountComponentAtNode(div)
        const content = this.createScreenreaderContentNode()
        ReactDOM.render(content, div)
      }
    }
  }

  removeScreenreaderAlert () {
    const liveRegion = this.getLiveRegion()
    if (liveRegion) {
      const div = document.getElementById(this.srid)
      if (div) {
        // Accessibility attributes must be removed for the deletion of the node
        // and then reapplied because JAWS/IE will not respect the
        // "aria-relevant" attribute and read when the node is deleted if
        // the attributes are in place
        liveRegion.removeAttribute('aria-live')
        liveRegion.removeAttribute('aria-relevant')
        liveRegion.removeAttribute('aria-atomic')

        ReactDOM.unmountComponentAtNode(div)
        div.parentNode.removeChild(div)

        this.initLiveRegion(liveRegion)
      }
    }
  }

  handleKeyUp = event => {
    if (this.props.closeButtonLabel && event.keyCode === keycode.codes.esc) {
      this.close()
    }
  }

  componentWillMount () {
    const liveRegion = this.getLiveRegion()
    if (liveRegion) {
      this.initLiveRegion(liveRegion)
    }
  }

  componentDidMount () {
    this.handleTimeout()
    this.createScreenreaderAlert()
  }

  componentDidUpdate (prevProps) {
    if (!!this.props.open === false && !!this.props.open !== !!prevProps.open) {
      // this outside world is asking us to close the alert, which needs to
      // take place internally so the transition runs
      this.close()
    } else {
      this.updateScreenreaderAlert()
    }
  }

  componentWillUnmount () {
    this.removeScreenreaderAlert()
    this.clearTimeouts()
  }

  renderIcon () {
    const { Icon } = this.variantUI()
    return (
      <div className={styles.icon}>
        <Icon className={styles.alertIcon} />
      </div>
    )
  }

  renderCloseButton () {
    return this.props.closeButtonLabel
      ? <div className={styles.closeButton} key="closeButton">
        <CloseButton onClick={this.close} size="small" variant="icon">
          {this.props.closeButtonLabel}
        </CloseButton>
      </div>
      : null
  }

  renderAlert () {
    const { classNames } = this.variantUI()
    return (
      <View as="div" margin={this.props.margin} className={classNames} onKeyUp={this.handleKeyUp}>
        {this.renderIcon()}
        <div className={styles.content}>
          {this.props.children}
        </div>
        {this.renderCloseButton()}
      </View>
    )
  }

  render () {
    // Don't render anything if screen reader only
    if (this.props.screenReaderOnly) {
      error(
        this.getLiveRegion(),
        'Alert',
        `The 'screenReaderOnly' prop must be used in conjunction with 'liveRegion'.`
      )

      return null
    }

    if (this.props.transition === 'none') {
      return this.state.open ? this.renderAlert() : null
    }
    return (
      <Transition
        type={this.props.transition}
        transitionOnMount
        in={this.state.open}
        unmountOnExit
        onExited={this.onExitTransition}
      >
        {this.renderAlert()}
      </Transition>
    )
  }
}
