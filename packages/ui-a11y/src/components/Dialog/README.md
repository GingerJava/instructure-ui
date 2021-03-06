---
describes: Dialog
---

The `Dialog` component is a utility that is used by
[Popover](#Popover), [Modal](#Modal) and [Tray](#Tray) for keyboard accessibility.

```js
---
example: true
render: false
---
class Example extends React.Component {
  constructor (props) {
    super(props)
    this.state = { open: false }
  }

  render () {
    return (
      <View
        as="div"
        padding="large"
      >
        <Button
          onClick={() => this.setState({ open: true })}
        >
          Open the Dialog
        </Button>
        <Portal open={this.state.open}>
          <Mask>
            <Dialog
              open={this.state.open}
              shouldContainFocus
              defaultFocusElement={() => this._firstName}
              shouldReturnFocus
              onDismiss={() => this.setState({ open: false })}
            >
              <View
                as="div"
                maxWidth="40rem"
                maxHeight="30rem"
                background="default"
                shadow="above"
                style={{position: 'relative'}}
                padding="medium"
              >
                <CloseButton placement="end" onClick={() => this.setState({ open: false })}>
                  Close
                </CloseButton>
                <FormFieldGroup
                  description={<Heading level="h4" as="span">Full name</Heading>}
                  layout="columns"
                >
                  <TextInput width="12rem" label="First" inputRef={(c) => this._firstName = c} />
                  <TextInput width="12rem" label="Last" />
                </FormFieldGroup>
              </View>
            </Dialog>
          </Mask>
        </Portal>
      </View>
    )
  }
}

render(<Example />)
```

### Guidelines

```js
---
guidelines: true
---
<Guidelines>
  <Figure recommendation="a11y" title="Accessibility">
    <FigureItem>Keyboard focus must be set to a dialog when it appears; usually on the first interactive element within the dialog</FigureItem>
    <FigureItem>A modal dialog must contain keyboard focus until it closes, so that keyboard or screen reader users won't mistakenly interact with background content that is meant to be hidden or inaccessible</FigureItem>
    <FigureItem>A non-modal dialog must close when it loses focus</FigureItem>
    <FigureItem>When the user closes a dialog, focus must return to a logical place within the page. This is usually to the element that triggered the dialog</FigureItem>
    <FigureItem>When dialogs are triggered by buttons or links (buttons are recommended), accessibility can be further enhanced by applying aria-haspopup="dialog" to the trigger. This will notify screen reader users that the trigger opens a dialog</FigureItem>
    <FigureItem>We recommend that dialogs begin with a heading (typically an H2)</FigureItem>
    <FigureItem>Dialogs should be able to be closed by clicking away, esc key and/or a close button</FigureItem>
  </Figure>
</Guidelines>
```
