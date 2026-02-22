import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-step1-problem',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step1-problem.component.html',
  styleUrls: ['./step1-problem.component.css'],
})
export class Step1ProblemComponent {
  @Input({ required: true }) group!: FormGroup;
  @Input() categories: string[] = [];
  @Input() locations: string[] = [];
  @Input() showErrors = false;

  isInvalid(name: string): boolean {
    const c = this.group.get(name);
    return !!c && c.invalid && (this.showErrors);
  }
}
