---
describes: Avatar
---

When an image src is not supplied the user's initials will display. The avatar can be `circle` _(default)_ or `rectangle`. Use the `margin` prop to add space between Avatar and other content.

```js
---
example: true
---
<div>
  <Avatar name="Sarah Robinson" src={avatarSquare} margin="0 small 0 0" />
  <Avatar name="Sarah Robinson" margin="0 small 0 0" />
  <Avatar name="Kyle Montgomery" src={avatarSquare} variant="rectangle" margin="0 small 0 0" />
  <Avatar name="Kyle Montgomery" variant="rectangle" />
</div>
```

The `size` prop allows you to select from `x-small`, `small`, `medium`, `large`, and `x-large`. If the `auto` prop is set, the avatar size will adjust according to the font-size
of its container.

```js
---
example: true
---
<div>
  <Avatar name="James Arias" size="x-small" margin="0 small 0 0" />
  <Avatar name="Charles Kimball" size="small" margin="0 small 0 0" />
  <Avatar name="Melissa Reed" size="medium" margin="0 small 0 0" />
  <Avatar name="Heather Wheeler" size="large" margin="0 small 0 0" />
  <Avatar name="David Herbert" size="x-large" />
</div>
```
### Guidelines

```js
---
guidelines: true
---
<Guidelines>
  <Figure recommendation="yes" title="Do">
    <FigureItem>Ensure the appropriate size is being used for its placement (in a table, stand-alone, etc…)</FigureItem>
    <FigureItem>Use circle variant in Canvas</FigureItem>
  </Figure>
  <Figure recommendation="no" title="Don't">
    <FigureItem>Use inline in sentence</FigureItem>
  </Figure>
</Guidelines>
```

