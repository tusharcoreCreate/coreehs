import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-step3-corrective',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step3-corrective.component.html',
  styleUrls: ['./step3-corrective.component.css'],
})
export class Step3CorrectiveComponent {
  @Input({ required: true }) group!: FormGroup;
  @Input() responsiblePeople: string[] = [];
  @Input() showErrors = false;
  @Input() formLevelErrors: ValidationErrors | null = null;

  isInvalid(name: string): boolean {
    const c = this.group.get(name);
    return !!c && c.invalid && (this.showErrors);
  }
}
