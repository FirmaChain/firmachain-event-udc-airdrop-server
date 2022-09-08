import { Router } from 'express';
import { Routes } from '../interfaces/routes.interface';

import StoreService from '../services/store.service';
import AirdropController from '../controllers/airdrop.controller';

class ProjectRoute implements Routes {
  constructor(
    public storeService: StoreService,
    public path = '/airdrop',
    public router = Router(),
    private airdropController = new AirdropController(storeService)
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.airdropController.getAirdropQR);
    this.router.get(`${this.path}/latest`, this.airdropController.getLatestTransaction);
    this.router.post(`${this.path}/callback`, this.airdropController.callback);
  }
}

export default ProjectRoute;
