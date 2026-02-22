import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-step4-review',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step4-review.component.html',
  styleUrls: ['./step4-review.component.css'],
})
export class Step4ReviewComponent {
  @Input({ required: true }) group!: FormGroup;
  @Input() reviewers: string[] = [];
  @Input() showErrors = false;
  @Input() formLevelErrors: ValidationErrors | null = null;

  isInvalid(name: string): boolean {
    const c = this.group.get(name);
    return !!c && c.invalid && (this.showErrors);
  }

  get isRejected(): boolean {
    return (this.group.get('approvalStatus')?.value ?? '') === 'Reject';
  }
}
