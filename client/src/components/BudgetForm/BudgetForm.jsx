import { useMutation } from "@apollo/client";
import { ADD_BUDGET } from "../../utils/mutations";
import MonthOptions from "../Dropdowns/MonthOptions";
import YearOptions from "../Dropdowns/YearOptions";

// userId is being passed from the SingleProfile.jsx
const BudgetForm = ({ userId }) => {

  // addBudget is given the ADD_BUDGET mutation functionality
  const [addBudget, { error }] = useMutation(ADD_BUDGET)

  const handleFormSubmit = async (event) => {
    // add event as an arg for handleFormSubmit as well
    // will stop the page from refreshing (working as intended, so page will refresh with the addition of new budget)
    event.preventDefault()

    // running the mutation with the provided variables as args
    try{
      let budgetMonth = document.getElementById('month-dropdown').value
      let budgetYear = parseFloat(document.getElementById('year-dropdown').value)
      const { data } = await addBudget({
        variables: {userId, budgetMonth, budgetYear}
      })
      console.log(data)
      // if user is adding a budget from the homepage, it will redirect them to their profile page and show that new budget
      window.location.replace('/user/')
    }catch (err) {
    console.error(err)
    }
  }; 
  return (
    <>
      <form onSubmit={handleFormSubmit}>
        <label>Month</label>
        <select id="month-dropdown">
          <MonthOptions />
        </select>
        <label>Year</label>
        <select id="year-dropdown">
          <YearOptions />
        </select>
        <button type="submit">Submit</button>
        {error && (
          <div>Something went wrong... </div>
        )}
      </form>
    </> 
  );
};

export default BudgetForm;