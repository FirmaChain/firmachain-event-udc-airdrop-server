import { Router } from 'express';

import IndexController from '../controllers/index.controller';

import { Routes } from '../interfaces/routes.interface';

class IndexRoute implements Routes {
  constructor(public path = '/', public router = Router(), public indexController = new IndexController()) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.indexController.index);
  }
}

export default IndexRoute;
