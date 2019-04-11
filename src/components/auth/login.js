import React, {useState} from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import styled from 'styled-components';
import { login as loginAction } from "../../actions/auth";
import * as types from "../../actions/types";
import { getLoginMessage } from "../../reducers/misc";

const Container = styled.div`
  height: 95vh;
  width: 95vw;
`;
const FormContainer = styled.div`
  align-self: center;
  padding: 20px;
`;
const CenterHorizontal = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 100%;
`;
const Label = styled.label`
  display: block;
  padding: 10px;
`;
const Input = styled.input`
  border-radius: 3px;
  border: 2px solid #609;
  color: #609;
  font-size: 16px;
  margin-left: 10px;
  height: 18px;
`;
const ErrMsg = styled.div`
  color: #609;
  font-size: 16px;
  text-transform: uppercase;
`;
const SpaceItems = styled.div`
  display: flex;
  justify-content:space-between;
`;

const Login = ({login, loginMessage, rejectLogin}) => {
  const [username, setUsername] = useState("");
  const [password, setpassword] = useState("");

  const handleSubmit = (event) => {
    if (username.length && password.length) {
      login({username, password});
    } else {
      rejectLogin("You must enter a username & password!");
    }
    event.preventDefault();
  };

  const devOnlyRemoveToken = (event) => {
    localStorage.clear();
    event.preventDefault();
    console.log("local storage cleared"); // eslint-disable-line
  };

  return (
    <Container>
      <CenterHorizontal>
        <FormContainer>
          <ErrMsg>{loginMessage}</ErrMsg>
          <form onSubmit={handleSubmit}>
            <Label>
              Username:
              <Input type="text" value={username} onChange={(event) => setUsername(event.target.value)} />
            </Label>
            <Label>
              Password:
              <Input type="password" value={password} onChange={(event) => setpassword(event.target.value)} />
            </Label>
            <SpaceItems>
              <input type="submit" value="LOGIN"/>
              <button onClick={devOnlyRemoveToken}>
                DEV ONLY - DELETE TOKEN
              </button>
            </SpaceItems>
          </form>

        </FormContainer>
      </CenterHorizontal>
    </Container>
  );
};


Login.propTypes = {
  loginMessage: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.string
  ]).isRequired,
  login: PropTypes.func.isRequired,
  rejectLogin: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
  return {
    loginMessage: getLoginMessage(state)
  };
};
const mapDispatchToProps = {
  rejectLogin: (message) => ({type: types.AUTH_FAILED, message: message}),
  login: loginAction
};
export default connect(mapStateToProps, mapDispatchToProps)(Login);
