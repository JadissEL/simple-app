import express from 'express';
import bodyParser from 'body-parser';
import { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Food Items Routes
app.get('/food_items', (req: Request, res: Response) => {
  res.json({ message: 'Get all food items' });
});

app.get('/food_items/:id', (req: Request, res: Response) => {
  res.json({ message: `Get food item ${req.params.id}` });
});

app.post('/food_items', (req: Request, res: Response) => {
  res.json({ message: 'Create new food item', data: req.body });
});

app.put('/food_items/:id', (req: Request, res: Response) => {
  res.json({ message: `Update food item ${req.params.id}`, data: req.body });
});

app.delete('/food_items/:id', (req: Request, res: Response) => {
  res.json({ message: `Delete food item ${req.params.id}` });
});

// Categories Routes
app.get('/categories', (req: Request, res: Response) => {
  res.json({ message: 'Get all categories' });
});

app.get('/categories/:id', (req: Request, res: Response) => {
  res.json({ message: `Get category ${req.params.id}` });
});

app.post('/categories', (req: Request, res: Response) => {
  res.json({ message: 'Create new category', data: req.body });
});

app.put('/categories/:id', (req: Request, res: Response) => {
  res.json({ message: `Update category ${req.params.id}`, data: req.body });
});

app.delete('/categories/:id', (req: Request, res: Response) => {
  res.json({ message: `Delete category ${req.params.id}` });
});

// Storage Locations Routes
app.get('/storage_locations', (req: Request, res: Response) => {
  res.json({ message: 'Get all storage locations' });
});

app.get('/storage_locations/:id', (req: Request, res: Response) => {
  res.json({ message: `Get storage location ${req.params.id}` });
});

app.post('/storage_locations', (req: Request, res: Response) => {
  res.json({ message: 'Create new storage location', data: req.body });
});

app.put('/storage_locations/:id', (req: Request, res: Response) => {
  res.json({ message: `Update storage location ${req.params.id}`, data: req.body });
});

app.delete('/storage_locations/:id', (req: Request, res: Response) => {
  res.json({ message: `Delete storage location ${req.params.id}` });
});

// Stores Routes
app.get('/stores', (req: Request, res: Response) => {
  res.json({ message: 'Get all stores' });
});

app.get('/stores/:id', (req: Request, res: Response) => {
  res.json({ message: `Get store ${req.params.id}` });
});

app.post('/stores', (req: Request, res: Response) => {
  res.json({ message: 'Create new store', data: req.body });
});

app.put('/stores/:id', (req: Request, res: Response) => {
  res.json({ message: `Update store ${req.params.id}`, data: req.body });
});

app.delete('/stores/:id', (req: Request, res: Response) => {
  res.json({ message: `Delete store ${req.params.id}` });
});

// Store Prices Routes
app.get('/store_prices', (req: Request, res: Response) => {
  res.json({ message: 'Get all store prices' });
});

app.get('/store_prices/:id', (req: Request, res: Response) => {
  res.json({ message: `Get store price ${req.params.id}` });
});

app.post('/store_prices', (req: Request, res: Response) => {
  res.json({ message: 'Create new store price', data: req.body });
});

app.put('/store_prices/:id', (req: Request, res: Response) => {
  res.json({ message: `Update store price ${req.params.id}`, data: req.body });
});

app.delete('/store_prices/:id', (req: Request, res: Response) => {
  res.json({ message: `Delete store price ${req.params.id}` });
});

// Purchase History Routes
app.get('/purchase_history', (req: Request, res: Response) => {
  res.json({ message: 'Get all purchase history entries' });
});

app.get('/purchase_history/:id', (req: Request, res: Response) => {
  res.json({ message: `Get purchase history entry ${req.params.id}` });
});

app.post('/purchase_history', (req: Request, res: Response) => {
  res.json({ message: 'Create new purchase history entry', data: req.body });
});

app.put('/purchase_history/:id', (req: Request, res: Response) => {
  res.json({ message: `Update purchase history entry ${req.params.id}`, data: req.body });
});

app.delete('/purchase_history/:id', (req: Request, res: Response) => {
  res.json({ message: `Delete purchase history entry ${req.params.id}` });
});

// Shopping List Routes
app.get('/shopping_list', (req: Request, res: Response) => {
  res.json({ message: 'Get all shopping list items' });
});

app.get('/shopping_list/:id', (req: Request, res: Response) => {
  res.json({ message: `Get shopping list item ${req.params.id}` });
});

app.post('/shopping_list', (req: Request, res: Response) => {
  res.json({ message: 'Create new shopping list item', data: req.body });
});

app.put('/shopping_list/:id', (req: Request, res: Response) => {
  res.json({ message: `Update shopping list item ${req.params.id}`, data: req.body });
});

app.delete('/shopping_list/:id', (req: Request, res: Response) => {
  res.json({ message: `Delete shopping list item ${req.params.id}` });
});

// Recipes Routes
app.get('/recipes', (req: Request, res: Response) => {
  res.json({ message: 'Get all recipes' });
});

app.get('/recipes/:id', (req: Request, res: Response) => {
  res.json({ message: `Get recipe ${req.params.id}` });
});

app.post('/recipes', (req: Request, res: Response) => {
  res.json({ message: 'Create new recipe', data: req.body });
});

app.put('/recipes/:id', (req: Request, res: Response) => {
  res.json({ message: `Update recipe ${req.params.id}`, data: req.body });
});

app.delete('/recipes/:id', (req: Request, res: Response) => {
  res.json({ message: `Delete recipe ${req.params.id}` });
});

// Recipe Ingredients Routes
app.get('/recipe_ingredients', (req: Request, res: Response) => {
  res.json({ message: 'Get all recipe ingredients' });
});

app.get('/recipe_ingredients/:id', (req: Request, res: Response) => {
  res.json({ message: `Get recipe ingredient ${req.params.id}` });
});

app.post('/recipe_ingredients', (req: Request, res: Response) => {
  res.json({ message: 'Create new recipe ingredient', data: req.body });
});

app.put('/recipe_ingredients/:id', (req: Request, res: Response) => {
  res.json({ message: `Update recipe ingredient ${req.params.id}`, data: req.body });
});

app.delete('/recipe_ingredients/:id', (req: Request, res: Response) => {
  res.json({ message: `Delete recipe ingredient ${req.params.id}` });
});

// Recipe Shopping Checklist Routes
app.get('/recipe_shopping_checklist', (req: Request, res: Response) => {
  res.json({ message: 'Get all recipe shopping checklist items' });
});

app.get('/recipe_shopping_checklist/:id', (req: Request, res: Response) => {
  res.json({ message: `Get recipe shopping checklist item ${req.params.id}` });
});

app.post('/recipe_shopping_checklist', (req: Request, res: Response) => {
  res.json({ message: 'Create new recipe shopping checklist item', data: req.body });
});

app.put('/recipe_shopping_checklist/:id', (req: Request, res: Response) => {
  res.json({ message: `Update recipe shopping checklist item ${req.params.id}`, data: req.body });
});

app.delete('/recipe_shopping_checklist/:id', (req: Request, res: Response) => {
  res.json({ message: `Delete recipe shopping checklist item ${req.params.id}` });
});

// Expenses Routes
app.get('/expenses', (req: Request, res: Response) => {
  res.json({ message: 'Get all expenses' });
});

app.get('/expenses/:id', (req: Request, res: Response) => {
  res.json({ message: `Get expense ${req.params.id}` });
});

app.post('/expenses', (req: Request, res: Response) => {
  res.json({ message: 'Create new expense', data: req.body });
});

app.put('/expenses/:id', (req: Request, res: Response) => {
  res.json({ message: `Update expense ${req.params.id}`, data: req.body });
});

app.delete('/expenses/:id', (req: Request, res: Response) => {
  res.json({ message: `Delete expense ${req.params.id}` });
});

// Home Cooked Meals Routes
app.get('/home_cooked_meals', (req: Request, res: Response) => {
  res.json({ message: 'Get all home cooked meals' });
});

app.get('/home_cooked_meals/:id', (req: Request, res: Response) => {
  res.json({ message: `Get home cooked meal ${req.params.id}` });
});

app.post('/home_cooked_meals', (req: Request, res: Response) => {
  res.json({ message: 'Create new home cooked meal', data: req.body });
});

app.put('/home_cooked_meals/:id', (req: Request, res: Response) => {
  res.json({ message: `Update home cooked meal ${req.params.id}`, data: req.body });
});

app.delete('/home_cooked_meals/:id', (req: Request, res: Response) => {
  res.json({ message: `Delete home cooked meal ${req.params.id}` });
});

// Eating Out Expenses Routes
app.get('/eating_out_expenses', (req: Request, res: Response) => {
  res.json({ message: 'Get all eating out expenses' });
});

app.get('/eating_out_expenses/:id', (req: Request, res: Response) => {
  res.json({ message: `Get eating out expense ${req.params.id}` });
});

app.post('/eating_out_expenses', (req: Request, res: Response) => {
  res.json({ message: 'Create new eating out expense', data: req.body });
});

app.put('/eating_out_expenses/:id', (req: Request, res: Response) => {
  res.json({ message: `Update eating out expense ${req.params.id}`, data: req.body });
});

app.delete('/eating_out_expenses/:id', (req: Request, res: Response) => {
  res.json({ message: `Delete eating out expense ${req.params.id}` });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
