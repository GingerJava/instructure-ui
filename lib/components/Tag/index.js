import React, { Component } from 'react'
import PropTypes from 'prop-types'
import themeable from '../../themeable'
import classNames from 'classnames'
import { omitProps } from '../../util/passthroughProps'
import CustomPropTypes from '../../util/CustomPropTypes'
import Container from '../Container'
import IconXSolid from 'instructure-icons/lib/Solid/IconXSolid'

import styles from './styles.css'
import theme from './theme.js'

/**
### Use `<Tag />` to represent a category or group in a form

Tag can be static (informational only) or clickable (when the `onClick` prop is
supplied). When the `isDismissable` prop is added to a clickable Tag, the button
renders an X/close icon (the Tag should be dismissed via the `onClick` prop).

  ```jsx_example
    <div>
      <Tag text="Static" margin="0 xxSmall 0 0" />
      <Tag
        text="Clickable"
        margin="0 xxSmall 0 0"
        onClick={function () {
          alert("This Tag was clicked")
        }}
      />
      <Tag
        text="Dismissable"
        isDismissable
        margin="0 xxSmall 0 0"
        onClick={function () {
          alert("This Tag was dismissed")
        }}
      />
      <Tag
        disabled
        text="Disabled clickable"
        onClick={function () {
          alert("This Tag was clicked")
        }}
      />
    </div>
  ```
  ### Sizes
  `medium` is the default Tag size.
  ```jsx_example
  <div>
    <Tag text="Small" size="small" margin="0 xxSmall 0 0" />
    <Tag text="Medium" margin="0 xxSmall 0 0" />
    <Tag text="Large" size="large" margin="0 xxSmall 0 0" />
  </div>
  ```
  ### Max-width
  ```jsx_example
    <Tag
      text="Long string of text designed to trigger overflow"
    />
  ```
**/

@themeable(theme, styles)
class Tag extends Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    isDismissable: PropTypes.bool,
    /**
    * Valid values are `0`, `none`, `auto`, `xxxSmall`, `xxSmall`, `xSmall`,
    * `small`, `medium`, `large`, `xLarge`, `xxLarge`. Apply these values via
    * familiar CSS-like shorthand. For example: `margin="small auto large"`.
    */
    margin: CustomPropTypes.spacing,
    /**
    * If you add an onClick prop, Tag renders as a clickable button
    */
    onClick: PropTypes.func,
    size: PropTypes.oneOf(['small', 'medium', 'large'])
  }

  static defaultProps = {
    size: 'medium',
    isDismissable: false
  }

  handleClick = (e) => {
    const {
      disabled,
      onClick
    } = this.props

    if (disabled) {
      e.preventDefault()
      e.stopPropagation()
    } else if (typeof onClick === 'function') {
      onClick(e)
    }
  }

  render () {
    const {
      isDismissable,
      disabled,
      size,
      text,
      onClick,
      margin
    } = this.props

    const props = omitProps(this.props, Tag.propTypes)

    const classes = {
      [styles.root]: true,
      [styles[size]]: size,
      [styles.dismissable]: isDismissable,
      [styles.button]: onClick
    }

    return (
      <Container
        {...props}
        className={classNames(classes)}
        as={(onClick) ? 'button' : 'span'}
        margin={margin}
        type={(onClick) ? 'button' : null}
        onClick={(onClick) ? this.handleClick : null}
        aria-disabled={(onClick && disabled) ? 'true' : null}
        display={null}
        title={text}
      >
        <span className={styles.text}>
          {text}
        </span>
        {(onClick && isDismissable)
          ? <IconXSolid className={styles.icon} /> : null
        }
      </Container>
    )
  }
}

export default Tag