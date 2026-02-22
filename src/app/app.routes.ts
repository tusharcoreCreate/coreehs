import { Routes } from '@angular/router';
import { FormWizardComponent } from './features/form-wizard/form-wizard.component';
import { D3TreeComponent } from './features/d3-tree/d3-tree.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'form' },

  { path: 'form', component: FormWizardComponent },
  { path: 'd3', component: D3TreeComponent },

  { path: '**', redirectTo: 'form' },
];