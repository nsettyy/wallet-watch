// import { Link } from "react-router-dom";
import Card from "../../components/Card/Card";
import { Popup } from "reactjs-popup";
import BudgetForm from "../../components/BudgetForm/BudgetForm";
import "chartkick/chart.js";
import "./home.css";
import Auth from "../../utils/auth";
import "reactjs-popup/dist/index.css";
import { useQuery } from "@apollo/client";
import { useState } from "react";
import { QUERY_ME } from "../../utils/queries";
import CurrentBudget from "../../components/CurrentBudget/CurrentBudget";
import AllBudgetSpending from "../../components/AllBudgetSpending"

const Home = () => {
  const { loading, data } = useQuery(QUERY_ME);
  const user = data?.me || [];

  const [showCurrent, setShowCurrent] = useState(true);

  const handleSwitch = () => {
    setShowCurrent(!showCurrent);
  };

  if (loading) {
    return <div>Loading... </div>;
  }

  if (Auth.loggedIn()) {
    if (showCurrent) {
      return (
        <>
          <main>
            <div>
              <Popup
                trigger={<button> Add Budget </button>}
                position="right center"
                modal
              >
                {(close) => (
                  <div className="modal-container">
                    <div className="modal-content">
                      <BudgetForm userId={user._id} />
                      <button onClick={() => close()}>Close Modal</button>
                    </div>
                  </div>
                )}
              </Popup>
              <button onClick={handleSwitch}>Show Budget Spending</button>
            </div>
            <CurrentBudget user={user} />
          </main>
        </>
      );
    }
    return(
      <>
      <div>
        All Budget Spending
      </div>
      <button onClick={handleSwitch}>Show Current Budget</button>
      <AllBudgetSpending />
      </>
    )
  }
  return (
    <>
      <div id="card-container">
        <Card></Card>
      </div>
    </>
  );
};

export default Home;
