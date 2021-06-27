const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({
      erro: "User does not exists"
    });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({
      error: "User already exists"
    });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const id = request.params.id;
  let exists = false;

  user.todos.forEach(todo => {
    if (todo.id === id) {
      todo.title = title;
      todo.deadline = deadline;
      exists = true;
    }
  });

  if (!exists) {
    return response.status(404).json({
      error: "Todo does not exists"
    });
  }

  return response.json({
    title,
    deadline,
    done: false
  });
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const id = request.params.id;

  const todoExist = user.todos.find(todo => todo.id === id);

  if (!todoExist) {
    return response.status(404).json({
      error: "Todo does not exists"
    });
  }

  user.todos.forEach(todo => {
    if (todo.id === id) {
      todo.done = true;
    }
  });

  return response.json({
    ...todoExist,
    done: true
  });
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const id = request.params.id;
  let exists = false;

  user.todos.forEach((todo, index) => {
    if (todo.id === id) {
      user.todos.splice(index, 1);
      exists = true;
      return exists;
    }
  });

  if (!exists) {
    return response.status(404).json({
      error: "Todo does not exists"
    });
  }

  return response.status(204).send();
});

module.exports = app;