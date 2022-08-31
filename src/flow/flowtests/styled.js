// @flow
import type { ZacsStyledFunction, Component } from '../styled'

// TODO: update to zacs.styled after this moves to index
const styled: ZacsStyledFunction = (null: any)

const styles = { root: '.root' }
const noop = (..._args: any[]): void => {}

type Props = $Exact<{
  x: string,
  y: number,
  z?: ?number,
}>
const Foo: Component<Props> = () => null

function BasicStyling(): void {
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
noop(BasicStyling)

function StylingWithConditionalStyles(): void {
  const StyledFoo = styled(Foo, {
    a: 123, // fake style reference
    b: 1233,
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
noop(StylingWithConditionalStyles)

function StylingWithLiteralStyles(): void {
  const StyledFoo = styled(Foo, null, {
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
noop(StylingWithLiteralStyles)

function StylingWithConditionalAndLiteralStyles(): void {
  const StyledFoo = styled(
    Foo,
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
noop(StylingWithConditionalAndLiteralStyles)
