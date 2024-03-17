import { useMutation } from "@apollo/client";
import { REMOVE_BUDGET } from "../../utils/mutations";

// passes budget from the viewBudget.jsx
const DeleteBudget = (budget) => {

  const [removeIncome,
    //  { error }
  ] = useMutation(REMOVE_BUDGET);

  const budgetId = budget.budget._id

  const handleDelete = async (event) => {
    console.log("test");
    event.preventDefault();

    try {
      console.log("test");
      console.log(budget);
      const data = await removeIncome({
        variables: { budgetId },
      });
      console.log(data);
      window.location.href = "/user"
    } catch (err) {
      console.error(err);
    }
  };

return (
    <>
    <button onClick={handleDelete}>Delete Budget</button>
    </>
)
};

export default DeleteBudget;