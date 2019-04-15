import React, { useState, useCallback } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: absolute;
  background-color: ${(props) => props.theme.neutral[800]};
  color: ${(props) => props.theme.neutral[100]};
  pointer-events: none;
  border-radius: 10px;
  padding: 10px;
  left: ${(props) => props.left}px;
  top: ${(props) => props.top}px;
`;

/**
 * A custom React Hook to store information for a hover info box
 * This allows simple communication between D3 & a React-rendered info box.
 *
 * The handlers are wrapped in `useCallback` to prevent them updating unneccessarily
 * (`setHoverState` doesn't need to be a dep as React guarantees it doesn't change)
 *
 * hoverState -> state value to be passed to HoverInfoBox
 * handleHoverOver -> mouseover / mousenter handler
 * handleHoverOut -> mouseleave / mouseout handler
 */
export const useHover = () => {
  const [hoverState, setHoverState] = useState(false);

  const handleHoverOver = useCallback((msg, x, y) => {
    setHoverState({mouseX: x, mouseY: y, msg});
  }, []);
  const handleHoverOut = useCallback(() => {
    setHoverState(false);
  }, []);

  return [hoverState, handleHoverOver, handleHoverOut];

};

/**
 * to do -- there are much better solutions. See react-ruler?
 * This is essentially lifted from Auspice, and may be enough
 * for the April prototype, but is not a good solution.
 * and must change left -> right as neede
 */
const calcPosition = (el, mouseX, mouseY) => {
  const boundingBox = el.getBoundingClientRect();
  const left = mouseX - boundingBox.left;
  const top = mouseY - boundingBox.top;
  return {left, top};
};

/**
 * Render a hover info box.
 * To do - make abstract enough that it can be used in multiple charts.
 */
const HoverInfoBox = ({hoverState, boundingBoxRef}) => {
  if (!hoverState) {
    return null;
  }
  const pos = calcPosition(boundingBoxRef.current, hoverState.mouseX, hoverState.mouseY);
  return (
    <Container {...pos}>
      {hoverState.msg}
    </Container>
  );
};


export default HoverInfoBox;
