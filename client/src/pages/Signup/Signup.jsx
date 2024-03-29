//React Imports
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import Auth from "../../utils/auth";
import { ADD_USER } from "../../utils/mutations";

//CSS Imports
import "./Signup.css";

//Signup Function
function Signup() {
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [addUser] = useMutation(ADD_USER);

  // submite function that takes user input
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const mutationResponse = await addUser({
      variables: {
        email: formState.email,
        password: formState.password,
        firstName: formState.firstName,
        lastName: formState.lastName,
      },
    });
    const token = mutationResponse.data.addUser.token;
    Auth.login(token);
  };

  // tracks the state of the login inputs
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  return (
    <div className="signup">
      <div id="link">
        <Link to="/login">← Go to Login</Link>
      </div>

      <h2>Signup</h2>
      <form onSubmit={handleFormSubmit}>
        <div className="row">
          <div className="column">
            <label className="label" htmlFor="firstName">
              First Name:
            </label>
            <input
              placeholder="First Name"
              name="firstName"
              type="firstName"
              id="firstName"
              onChange={handleChange}
            />
          </div>
          <div className="column">
            <label className="label" htmlFor="email">
              Email Address:
            </label>
            <input
              placeholder="example@domain.com"
              name="email"
              type="email"
              id="email"
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="row">
          <div className="column">
            <label className="label" htmlFor="lastName">
              Last Name:
            </label>
            <input
              placeholder="Last Name"
              name="lastName"
              type="lastName"
              id="lastName"
              onChange={handleChange}
            />
          </div>
          <div className="column">
            <label className="label" htmlFor="pwd">
              Password:
            </label>
            <input
              placeholder="**********"
              name="password"
              type="password"
              id="pwd"
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="row" id="submit">
          <button id="submit-button" type="submit">
            Signup
          </button>
        </div>
      </form>
    </div>
  );
}

export default Signup;
