import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-step2-root-cause',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step2-root-cause.component.html',
  styleUrls: ['./step2-root-cause.component.css'],
})
export class Step2RootCauseComponent {
  @Input({ required: true }) group!: FormGroup;
  @Input() investigators: string[] = [];
  @Input() showErrors = false;
  @Input() formLevelErrors: ValidationErrors | null = null;

  isInvalid(name: string): boolean {
    const c = this.group.get(name);
    return !!c && c.invalid && (this.showErrors);
  }

  get hasDuplicateWhy(): boolean {
    return !!this.group.errors?.['duplicateWhy'] && this.showErrors;
  }
}
