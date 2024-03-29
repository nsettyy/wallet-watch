const { User, Budget, Category } = require("../models");
const { signToken, AuthenticationError } = require("../utils/auth");

// use this for debugging / wrap function in a variable / log and return the variable
//   const data = await User.find({})
//   console.log(JSON.stringify(data, null, 2));
//   return data;

const resolvers = {
  Query: {
    // finds all users and gets all their budgets => expenses + incomes => the categories
    users: async () => {
      return await User.find({})
        .populate("budgets")
        .populate({
          path: "budgets",
          populate: ["expenses", "incomes"],
        });
    },
    // adding the category populate will break the code if there is no budget/category on the user and me queries
    // finds a single user by their id and gets all their budgets, expenses, and incomes
    user: async (parent, { userId }) => {
      return await User.findOne({ _id: userId })
        .populate("budgets")
        .populate({
          path: "budgets",
          populate: ["expenses", "incomes"],
        });
      // .populate({
      //   path: "expenses",
      //   populate: "category",
      // });
    },
    // finds the logged in user data via tokens and context 'variable'
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id })
          .populate("budgets")
          .populate({
            path: "budgets",
            populate: ["expenses", "incomes"],
          });
        // .populate({
        //   path: "expenses",
        //   populate: "category",
        // });
      }
      // if no user is found, throw error
      throw AuthenticationError;
    },
    // find all budgets
    budgets: async () => {
      return await Budget.find({}).populate(["expenses", "incomes"]).populate({
        path: "expenses",
        populate: "category",
      });
    },
    // finds a single budget by the budget id and gets all the expensea and incomes
    budget: async (parent, { budgetId }) => {
      return await Budget.findOne({ _id: budgetId })
        .populate(["expenses", "incomes"])
        .populate({
          path: "expenses",
          populate: "category",
        });
    },
    // find all categories and their _id
    categories: async () => {
      return await Category.find({});
    },
    // finds the budget for the current logged in user based on the current month and year
    currentMonthBudget: async (parent, { userId, budgetMonth, budgetYear }) => {
      return await Budget.findOne({
        userId: userId,
        budgetMonth: budgetMonth,
        budgetYear: budgetYear,
      })
        .populate(["expenses", "incomes"])
        .populate({
          path: "expenses",
          populate: "category",
        });
    },
  },
  Mutation: {
    // sign up, creates the user
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      console.log({ token, user });
      return { token, user };
    },
    // finds the user by their email, and logins
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw AuthenticationError;
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw AuthenticationError;
      }

      const token = signToken(user);

      console.log({ token, user });
      return { token, user };
    },
    // creates a budget, then finds a user and assigns the budget to them
    addBudget: async (parent, { userId, budgetMonth, budgetYear }) => {
      const budgetData = await Budget.create({
        budgetMonth,
        budgetYear,
        userId,
      });
      console.log(budgetData);
      await User.findOneAndUpdate(
        {
          _id: userId,
        },
        {
          $addToSet: {
            budgets: {
              _id: budgetData._id,
              userId: userId,
            },
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );
    },
    // find a budget and adds an expense to the expenses array
    addExpense: async (parent, { budgetId, name, cost, categoryId }) => {
      return await Budget.findOneAndUpdate(
        { _id: budgetId },
        {
          $addToSet: {
            expenses: {
              name,
              cost,
              category: {
                _id: categoryId,
              },
            },
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );
    },
    // finds a budget and adds an income to the incomes array
    addIncome: async (parent, { budgetId, name, amount }) => {
      return await Budget.findOneAndUpdate(
        { _id: budgetId },
        {
          $addToSet: {
            incomes: {
              name,
              amount,
            },
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );
    },
    // finds a budget by the id and deletes it
    removeBudget: async (parent, { budgetId }) => {
      return await Budget.findOneAndDelete({ _id: budgetId });
    },
    // finds a budget by the id and pulls the expense from the expenses array
    removeExpense: async (parent, { budgetId, expenseId }) => {
      return await Budget.findOneAndUpdate(
        { _id: budgetId },
        { $pull: { expenses: { _id: expenseId } } },
        { new: true }
      );
    },
    // finds a budget by the id and pulls the income from the incomes array
    removeIncome: async (parent, { budgetId, incomeId }) => {
      return await Budget.findOneAndUpdate(
        { _id: budgetId },
        { $pull: { incomes: { _id: incomeId } } },
        { new: true }
      );
    },

    // finds a budget by the id and updates the name
    updateBudget: async (parent, { budgetId, budgetMonth, budgetYear }) => {
      return await Budget.findOneAndUpdate(
        { _id: budgetId },
        { $set: { budgetMonth: budgetMonth, budgetYear: budgetYear } },
        { new: true, runValidators: true }
      );
    },

    // finds a budget and an expense by its _id then updates it
    // https://www.mongodb.com/docs/manual/reference/operator/update/positional/#update-documents-in-an-array
    // uses positional operator "$"
    updateExpense: async (
      parent,
      { budgetId, expenseId, name, cost, categoryId }
    ) => {
      return await Budget.findOneAndUpdate(
        { _id: budgetId, "expenses._id": expenseId },
        {
          // the $ matches the expense with the expenseId provided and allows access to all the embedded documents
          // kind of like an index [], but it knows which index based on the filter
          $set: {
            "expenses.$.name": name,
            "expenses.$.cost": cost,
            "expenses.$.category": categoryId,
          },
        },
        { new: true, runValidators: true }
      );
    },

    // finds a budget and an income by its _id, then updates its
    // update is returning null
    updateIncome: async (parent, { budgetId, incomeId, name, amount }) => {
      return await Budget.findOneAndUpdate(
        { _id: budgetId, "incomes._id": incomeId },
        {
          $set: {
            "incomes.$.name": name,
            "incomes.$.amount": amount,
          },
        },
        { new: true, runValidators: true }
      );
    },
  },
};

module.exports = resolvers;
