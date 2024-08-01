// project-root/frontend/src/App.tsx
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';

const App: React.FC = () => {
  return (
    <div>
      <Switch>
        <Route path="/" exact component={HomePage} />
      </Switch>
    </div>
  );
};

export default App;
