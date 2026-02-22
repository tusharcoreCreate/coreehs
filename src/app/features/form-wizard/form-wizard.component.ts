import { Component, computed, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Step1ProblemComponent } from '../steps/step1-problem/step1-problem.component';
import { Step2RootCauseComponent } from '../steps/step2-root-cause/step2-root-cause.component';
import { Step3CorrectiveComponent } from '../steps/step3-corrective/step3-corrective.component';
import { Step4ReviewComponent } from '../steps/step4-review/step4-review.component';
import { futureDateValidator, inListValidator, investigationDateAfterReportedValidator, notFutureDateValidator, positiveNumberOptionalValidator, reviewDateAfterTargetValidator, targetDateAfterInvestigationValidator, uniqueWhyFieldsValidator } from 'src/app/core/validations';

type ApprovalStatus = 'Approve' | 'Reject' | '';

const DRAFT_KEY = 'practical_form_draft_v1';

@Component({
  selector: 'app-form-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Step1ProblemComponent,
    Step2RootCauseComponent,
    Step3CorrectiveComponent,
    Step4ReviewComponent,
  ],
  templateUrl: './form-wizard.component.html',
  styleUrls: ['./form-wizard.component.css'],
})
export class FormWizardComponent {
  // Predefined lists for autocomplete
  readonly locations = ['Mumbai', 'Navi Mumbai', 'Pune', 'Surat', 'Nagpur'];
  readonly investigators = ['Amit', 'Neha', 'Rahul', 'Priya', 'Tushar'];
  readonly responsiblePeople = ['Manager A', 'Manager B', 'Lead C', 'Owner D'];
  readonly reviewers = ['QA Lead', 'Plant Head', 'Operations Manager'];

  readonly categories = ['Safety', 'Quality', 'Production', 'Maintenance', 'Other'];

  readonly stepIndex = signal<number>(0);
  readonly submitAttempted = signal<boolean>(false);
  readonly draftMessage = signal<string>('');
  readonly submitMessage = signal<string>('');

  readonly form: FormGroup;

  readonly currentStepName = computed(() => {
    const names = ['Problem Definition', 'Root Cause Analysis', 'Corrective Action', 'Review & Approval'];
    return names[this.stepIndex()] ?? 'Step';
  });

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group(
      {
        problem: this.fb.group({
          problemTitle: ['', []],
          problemDescription: ['', []],
          category: ['', []],
          reportedDate: ['', []], // YYYY-MM-DD
          location: ['', []],
        }),
        rootCause: this.fb.group(
          {
            why1: ['', []],
            why2: ['', []],
            why3: ['', []],
            investigationDate: ['', []],
            investigator: ['', []],
          },
          { validators: [uniqueWhyFieldsValidator()] }
        ),
        corrective: this.fb.group({
          actionPlan: ['', []],
          responsiblePerson: ['', []],
          targetCompletionDate: ['', []],
          budgetEstimate: [null as number | null, []],
        }),
        review: this.fb.group({
          reviewer: ['', []],
          reviewDate: ['', []],
          approvalStatus: ['' as ApprovalStatus, []],
          comments: ['', []],
        }),
      },
      {
        validators: [
          investigationDateAfterReportedValidator('problem.reportedDate', 'rootCause.investigationDate'),
          targetDateAfterInvestigationValidator('rootCause.investigationDate', 'corrective.targetCompletionDate'),
          reviewDateAfterTargetValidator('corrective.targetCompletionDate', 'review.reviewDate'),
        ],
      }
    );

    this.applyFinalValidators();
    // this.loadDraft();
    this.setupConditionalValidation();
  }

  next(): void {
    this.submitAttempted.set(false);
    this.draftMessage.set('');
    this.submitMessage.set('');
    this.stepIndex.set(Math.min(this.stepIndex() + 1, 3));
    
  }

  prev(): void {
    this.submitAttempted.set(false);
    this.draftMessage.set('');
    this.submitMessage.set('');
    this.stepIndex.set(Math.max(this.stepIndex() - 1, 0));
  }

  goTo(step: number): void {
    this.submitAttempted.set(false);
    this.draftMessage.set('');
    this.submitMessage.set('');
    this.stepIndex.set(Math.min(Math.max(step, 0), 3));
  }

  saveDraft(): void {
    const raw = this.form.getRawValue();
    localStorage.setItem(DRAFT_KEY, JSON.stringify(raw));
    this.draftMessage.set('Draft saved locally.');
  }

  loadDraft(): void {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      this.form.patchValue(parsed);
      this.draftMessage.set('Loaded saved draft.');
    } catch {
      // ignore invalid draft
    }
  }

  // clearDraft(): void {
  //   localStorage.removeItem(DRAFT_KEY);
  //   this.draftMessage.set('Draft cleared.');
  // }

  submitFinal(): void {
    this.submitAttempted.set(true);
    this.draftMessage.set('');
    this.submitMessage.set('');

    this.form.markAllAsTouched();
    if (this.problemGroup.invalid) {
    this.stepIndex.set(0);
    return;
  }

  if (this.rootCauseGroup.invalid) {
    this.stepIndex.set(1);
    return;
  }

  if (this.correctiveGroup.invalid) {
    this.stepIndex.set(2);
    return;
  }

  if (this.reviewGroup.invalid) {
    this.stepIndex.set(3);
    return;
  } 
    this.form.updateValueAndValidity({ emitEvent: true });
    

    if (this.form.invalid) {
      this.submitMessage.set('Please fix validation errors before submitting.');
      return;
    }

    const payload = this.form.getRawValue();
    this.submitMessage.set('Submitted successfully! Check console for payload.');
    console.log('FINAL SUBMIT PAYLOAD:', payload);

    localStorage.removeItem(DRAFT_KEY);

  }

  private applyFinalValidators(): void {
    const problem = this.form.get('problem') as FormGroup;
    const rootCause = this.form.get('rootCause') as FormGroup;
    const corrective = this.form.get('corrective') as FormGroup;
    const review = this.form.get('review') as FormGroup;

    problem.get('problemTitle')?.setValidators([Validators.required, Validators.minLength(5), Validators.maxLength(100)]);
    problem.get('problemDescription')?.setValidators([Validators.required, Validators.minLength(20)]);
    problem.get('category')?.setValidators([Validators.required]);
    problem.get('reportedDate')?.setValidators([Validators.required, notFutureDateValidator()]);
    problem.get('location')?.setValidators([Validators.required, inListValidator(this.locations)]);

    rootCause.get('why1')?.setValidators([Validators.required]);
    rootCause.get('why2')?.setValidators([Validators.required]);
    rootCause.get('why3')?.setValidators([Validators.required]);
    rootCause.get('investigationDate')?.setValidators([Validators.required]);
    rootCause.get('investigator')?.setValidators([Validators.required, inListValidator(this.investigators)]);

    corrective.get('actionPlan')?.setValidators([Validators.required, Validators.minLength(15)]);
    corrective.get('responsiblePerson')?.setValidators([Validators.required, inListValidator(this.responsiblePeople)]);
    corrective.get('targetCompletionDate')?.setValidators([Validators.required, futureDateValidator()]);
    corrective.get('budgetEstimate')?.setValidators([positiveNumberOptionalValidator()]);

    review.get('reviewer')?.setValidators([Validators.required, inListValidator(this.reviewers)]);
    review.get('reviewDate')?.setValidators([Validators.required]);
    review.get('approvalStatus')?.setValidators([Validators.required]);

    this.form.updateValueAndValidity({ emitEvent: false });
  }

  private setupConditionalValidation(): void {
    const approvalCtrl = this.form.get('review.approvalStatus');
    const commentsCtrl = this.form.get('review.comments');

    approvalCtrl?.valueChanges.subscribe(() => {
      const status = (approvalCtrl.value ?? '') as ApprovalStatus;
      if (status === 'Reject') {
        commentsCtrl?.setValidators([Validators.required, Validators.minLength(5)]);
      } else {
        commentsCtrl?.setValidators([]);
      }
      commentsCtrl?.updateValueAndValidity();
    });
  }

  get problemGroup(): FormGroup {
    return this.form.get('problem') as FormGroup;
  }
  get rootCauseGroup(): FormGroup {
    return this.form.get('rootCause') as FormGroup;
  }
  get correctiveGroup(): FormGroup {
    return this.form.get('corrective') as FormGroup;
  }
  get reviewGroup(): FormGroup {
    return this.form.get('review') as FormGroup;
  }
}


