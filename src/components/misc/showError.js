import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';


/* MainContainer is all of the screen to the right of the sidebar */
const Container = styled.div`
  height: 95vh;
  width: 95vw;
`;
const CenterHorizontal = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-left: 10vw;
  padding-right: 10vw;
`;
const ShowError = ({message}) => {
  return (
    <Container>
      <CenterHorizontal>
        {message}
      </CenterHorizontal>
    </Container>
  );
};

ShowError.propTypes = {
  message: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ])
};

ShowError.defaultProps = {
  message: (
    <>
      <h1>{"An unknown error has occured"}</h1>
      <p>
        {`Please consider submitting an issue `}
        <a href="https://github.com/seattleflu/genomic-incidence-tracker/issues">here</a>
        {` including the steps that caused this error and any messages in the browser's console (if possible).`}
      </p>
      <p>{`Thanks!`}</p>
    </>
  )
};

export default ShowError;
