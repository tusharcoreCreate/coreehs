import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from "@angular/forms";

export function normalizeDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !value) return null;
  const d = new Date(value + 'T00:00:00');
  return Number.isNaN(d.getTime()) ? null : d;
}

export function notFutureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const d = normalizeDate(control.value);
    if (!d) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d.getTime() > today.getTime()) return { notFutureDate: true };
    return null;
  };
}

export function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const d = normalizeDate(control.value);
    if (!d) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d.getTime() <= today.getTime()) return { mustBeFutureDate: true };
    return null;
  };
}

export function inListValidator(list: string[]): ValidatorFn {
  const set = new Set(list.map(x => x.toLowerCase()));
  return (control: AbstractControl): ValidationErrors | null => {
    const v = (control.value ?? '').toString().trim().toLowerCase();
    if (!v) return null;
    return set.has(v) ? null : { notInList: true };
  };
}

export function positiveNumberOptionalValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value;
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    if (Number.isNaN(n)) return { notNumber: true };
    return n > 0 ? null : { mustBePositive: true };
  };
}

export function uniqueWhyFieldsValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const g = group as FormGroup;
    const v1 = (g.get('why1')?.value ?? '').toString().trim().toLowerCase();
    const v2 = (g.get('why2')?.value ?? '').toString().trim().toLowerCase();
    const v3 = (g.get('why3')?.value ?? '').toString().trim().toLowerCase();

    const filled = [v1, v2, v3].filter(v => v.length > 0);
    const unique = new Set(filled);
    return unique.size !== filled.length ? { duplicateWhy: true } : null;
  };
}

export function investigationDateAfterReportedValidator(reportedPath: string, investigationPath: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const reported = normalizeDate(group.get(reportedPath)?.value);
    const inv = normalizeDate(group.get(investigationPath)?.value);
    if (!reported || !inv) return null;
    return inv.getTime() >= reported.getTime() ? null : { investigationBeforeReported: true };
  };
}

export function targetDateAfterInvestigationValidator(investigationPath: string, targetPath: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const inv = normalizeDate(group.get(investigationPath)?.value);
    const target = normalizeDate(group.get(targetPath)?.value);
    if (!inv || !target) return null;
    return target.getTime() > inv.getTime() ? null : { targetNotAfterInvestigation: true };
  };
}

export function reviewDateAfterTargetValidator(targetPath: string, reviewPath: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const target = normalizeDate(group.get(targetPath)?.value);
    const review = normalizeDate(group.get(reviewPath)?.value);
    if (!target || !review) return null;
    return review.getTime() >= target.getTime() ? null : { reviewBeforeTarget: true };
  };
}

