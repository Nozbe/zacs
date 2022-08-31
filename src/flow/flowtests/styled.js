// @flow
/* eslint-disable no-unused-vars */
import type { ZacsStyledFunction, Component } from '../styled'

// TODO: update to zacs.styled after this moves to index
const styled: ZacsStyledFunction = (null: any)
const createStyled = styled

const styles = { root: '.root' }
const noop = (..._args: any[]): void => {}

type Props = $Exact<{
  x: string,
  y: number,
  z?: ?number,
}>
const Foo: Component<Props> = () => null

function ChecksProps(): void {
  noop([
    // GOOD:
    styled(Foo),
    styled(Foo, null),
    styled(Foo, styles.root),
    styled(Foo, [styles.root, styles.root]),
    styled(Foo, null, {}),
    styled(Foo, null, { x: styles.root }),
    styled(Foo, styles.root, { x: styles.root, y: styles.root }),
    styled(Foo, null, null, { k: 'marginTop' }),
    styled(Foo, null, null, { k: 'marginTop', j: 'borderColor' }),
    styled(Foo, null, { x: styles.root }, { k: 'marginTop', j: 'borderColor' }),
    styled(Foo, styles.root, { x: styles.root }, { k: 'marginTop', j: 'borderColor' }),
    // BAD:
    // $FlowExpectedError[incompatible-call]
    styled(Foo, null, { x: null }),
    // $FlowExpectedError[incompatible-call]
    styled(Foo, null, null, { k: 'thisDoesNotExist' }),
    // $FlowExpectedError[incompatible-call]
    styled(Foo, null, { x: styles.root }, { k: 'thisDoesNotExist' }),
  ])
}

function BasicStyling(): void {
  const StyledFoo = styled(Foo, styles.root)
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
  const StyledFoo = styled(Foo)
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
  const StyledFoo = styled(Foo, styles.root, {
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
  const StyledFoo = styled(Foo, styles.root, null, {
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
  const StyledFoo = styled(
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
  const StyledFoo = createStyled(Foo, styles.root, null, null, ['a', 'b'])

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
  const StyledFoo = createStyled(
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
  const StyledFoo = createStyled(
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
  const StyledFoo = createStyled(
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
