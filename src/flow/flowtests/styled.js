// @flow
/* eslint-disable no-unused-vars */
import * as zacs from '../../index'

const styles = { root: '.root' }
const noop = (..._args: any[]): void => {}

type Props = $Exact<{
  x: string,
  y: number,
  z?: ?number,
}>
const Foo: zacs.Component<Props> = () => null

function ChecksProps(): void {
  noop([
    // GOOD:
    zacs.styled(Foo),
    zacs.styled(Foo, null),
    zacs.styled(Foo, styles.root),
    zacs.styled(Foo, [styles.root, styles.root]),
    zacs.styled(Foo, null, {}),
    zacs.styled(Foo, null, { x: styles.root }),
    zacs.styled(Foo, styles.root, { x: styles.root, y: styles.root }),
    zacs.styled(Foo, null, null, { k: 'marginTop' }),
    zacs.styled(Foo, null, null, { k: 'marginTop', j: 'borderColor' }),
    zacs.styled(Foo, null, { x: styles.root }, { k: 'marginTop', j: 'borderColor' }),
    zacs.styled(Foo, styles.root, { x: styles.root }, { k: 'marginTop', j: 'borderColor' }),
    // BAD:
    // $FlowExpectedError[incompatible-call]
    zacs.styled(Foo, null, { x: null }),
    // $FlowExpectedError[incompatible-call]
    zacs.styled(Foo, null, null, { k: 'thisDoesNotExist' }),
    // $FlowExpectedError[incompatible-call]
    zacs.styled(Foo, null, { x: styles.root }, { k: 'thisDoesNotExist' }),
  ])
}

function BasicStyling(): void {
  const StyledFoo = zacs.styled(Foo, styles.root)
  noop(
    (StyledFoo: React$ComponentType<
      $Exact<{
        x: string,
        y: number,
        z?: ?number,
      }>,
    >),
  )

  noop([
    // GOOD:
    <StyledFoo x="x" y={1} />,
    <StyledFoo x="x" y={1} z={5} />,
    <StyledFoo x="x" y={1} z={5} zacs:style={{}} zacs:inherit={{}} />,
    // BAD:
    // $FlowExpectedError[prop-missing]
    <StyledFoo />,
    // $FlowExpectedError[prop-missing]
    <StyledFoo x="x" y={1} extra="nono" extra2={true} />,
    // $FlowExpectedError[prop-missing]
    <StyledFoo x="x" y={1} extra2={true} />,
  ])
}

function BasicStyling2(): void {
  const StyledFoo = zacs.styled(Foo)
  noop(
    (StyledFoo: React$ComponentType<
      $Exact<{
        x: string,
        y: number,
        z?: ?number,
      }>,
    >),
  )

  noop([
    // GOOD:
    <StyledFoo x="x" y={1} />,
    // BAD:
    // $FlowExpectedError[prop-missing]
    <StyledFoo />,
  ])
}

function StylingWithConditionalStyles(): void {
  const StyledFoo = zacs.styled(Foo, styles.root, {
    a: styles.root,
    b: styles.root,
  })
  noop(
    (StyledFoo: React$ComponentType<
      $Exact<{
        x: string,
        y: number,
        z?: ?number,
        a?: ?boolean,
        b?: ?boolean,
      }>,
    >),
  )

  noop([
    // GOOD:
    <StyledFoo x="x" y={1} />,
    <StyledFoo x="x" y={1} a={true} />,
    <StyledFoo x="x" y={1} a={true} b={false} />,
    <StyledFoo x="x" y={1} z={2} a={true} b={false} />,
    <StyledFoo x="x" y={1} z={2} a={true} b={false} zacs:style={{}} zacs:inherit={{}} />,
    // BAD:
    // $FlowExpectedError[prop-missing]
    <StyledFoo />,
    // $FlowExpectedError[incompatible-type]
    <StyledFoo x="x" y={1} a="asd" />,
    // $FlowExpectedError[prop-missing]
    <StyledFoo x="x" y={1} a={true} b={false} extra="nono" extra2={true} />,
    // $FlowExpectedError[prop-missing]
    <StyledFoo x="x" y={1} a={true} b={false} extra2={true} />,
  ])
}

function StylingWithLiteralStyles(): void {
  const StyledFoo = zacs.styled(Foo, styles.root, null, {
    j: 'marginBottom',
    k: 'paddingTop',
  })
  noop(
    (StyledFoo: React$ComponentType<
      $Exact<{
        x: string,
        y: number,
        z?: ?number,
        j?: string | number,
        k?: string | number,
      }>,
    >),
  )

  noop([
    // GOOD:
    <StyledFoo x="x" y={1} />,
    <StyledFoo x="x" y={1} j={24} />,
    <StyledFoo x="x" y={1} k={84} />,
    <StyledFoo x="x" y={1} j={24} k={84} />,
    <StyledFoo x="x" y={1} j={24} k={84} zacs:style={{}} />,
    // BAD:
    // $FlowExpectedError[prop-missing]
    <StyledFoo />,
    // $FlowExpectedError[incompatible-type]
    <StyledFoo x="x" y={1} j={{}} />,
    // $FlowExpectedError[prop-missing]
    <StyledFoo x="x" y={1} k={4} extra="nono" extra2={true} />,
    // $FlowExpectedError[prop-missing]
    <StyledFoo x="x" y={1} k={4} extra2={true} />,
  ])
}

function StylingWithConditionalAndLiteralStyles(): void {
  const StyledFoo = zacs.styled(
    Foo,
    [styles.root, styles.root],
    {
      a: 123, // fake style reference
      b: 1233,
    },
    {
      j: 'marginBottom',
      k: 'paddingTop',
    },
  )
  noop(
    (StyledFoo: React$ComponentType<
      $Exact<{
        x: string,
        y: number,
        z?: ?number,
        a?: ?boolean,
        b?: ?boolean,
        j?: string | number,
        k?: string | number,
      }>,
    >),
  )

  noop([
    // GOOD:
    <StyledFoo x="x" y={1} />,
    <StyledFoo x="x" y={1} a={true} />,
    <StyledFoo x="x" y={1} a={true} b={false} />,
    <StyledFoo x="x" y={1} z={2} a={true} b={false} />,
    <StyledFoo x="x" y={1} a={true} b={false} j={24} />,
    <StyledFoo x="x" y={1} a={true} b={false} j={24} k={84} />,
    <StyledFoo x="x" y={1} k={84} />,
    <StyledFoo x="x" y={1} z={2} a={true} b={false} j={24} k={84} zacs:style={{}} />,
    // BAD:
    // $FlowExpectedError[prop-missing]
    <StyledFoo />,
    // $FlowExpectedError[incompatible-type]
    <StyledFoo x="x" y={1} k={{}} />,
    // $FlowExpectedError[prop-missing]
    <StyledFoo x="x" y={1} a={true} b={false} extra="nono" extra2={true} />,
    // $FlowExpectedError[prop-missing]
    <StyledFoo x="x" y={1} a={true} b={false} extra2={true} />,
  ])
}

// NOTE: Simplified tests for zacs.createStyled, which is basically the same (type-wise) but with extra prop

function CreateStyled(): void {
  const StyledFoo = zacs.createStyled(Foo, styles.root, null, null, ['a', 'b'])

  noop([
    // GOOD:
    <StyledFoo x="x" y={1} />,
    // BAD:
    // $FlowExpectedError[prop-missing]
    <StyledFoo />,
    // $FlowExpectedError[prop-missing]
    <StyledFoo x="x" y={1} extra2={true} />,
  ])
}

function CreateStyledWithConditionalStyles(): void {
  const StyledFoo = zacs.createStyled(
    Foo,
    styles.root,
    {
      a: styles.root,
      b: styles.root,
    },
    null,
    ['a', 'b'],
  )

  noop([
    // GOOD:
    <StyledFoo x="x" y={1} />,
    <StyledFoo x="x" y={1} b={true} />,
    // BAD:
    // $FlowExpectedError[prop-missing]
    <StyledFoo />,
    // $FlowExpectedError[prop-missing]
    <StyledFoo x="x" y={1} extra2={true} />,
  ])
}

function CreateStyledWithLiteralStyles(): void {
  const StyledFoo = zacs.createStyled(
    Foo,
    styles.root,
    null,
    {
      j: 'marginBottom',
      k: 'paddingTop',
    },
    ['a', 'b'],
  )

  noop([
    // GOOD:
    <StyledFoo x="x" y={1} />,
    <StyledFoo x="x" y={1} j={10} />,
    // BAD:
    // $FlowExpectedError[prop-missing]
    <StyledFoo />,
    // $FlowExpectedError[prop-missing]
    <StyledFoo x="x" y={1} extra2={true} />,
  ])
}

function CreateStyledWithConditionalAndLiteralStyles(): void {
  const StyledFoo = zacs.createStyled(
    Foo,
    styles.root,
    {
      a: styles.root,
      b: styles.root,
    },
    {
      j: 'marginBottom',
      k: 'paddingTop',
    },
    ['a', 'b'],
  )

  noop([
    // GOOD:
    <StyledFoo x="x" y={1} />,
    <StyledFoo x="x" y={1} b={false} j={10} />,
    // BAD:
    // $FlowExpectedError[prop-missing]
    <StyledFoo />,
    // $FlowExpectedError[prop-missing]
    <StyledFoo x="x" y={1} extra2={true} />,
  ])
}

// Untyped zacs.styled variants
function StyledWithoutProperTyping(): void {
  noop([
    zacs.styled('a'),
    zacs.styled({ web: 'a', native: Foo }),
    zacs.styled(
      { web: 'a', native: zacs.view },
      styles.root,
      { a: styles.root },
      { j: 'marginTop' },
    ),
    zacs.styled({ web: zacs.text, native: 'RCTText' }, styles.root, { a: styles.root }),
    zacs.styled({ web: Foo, native: Foo }, styles.root, { a: styles.root }),
  ])
  noop((zacs.createStyled('a'): React$ComponentType<any>))
}
