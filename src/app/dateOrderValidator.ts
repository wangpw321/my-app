import { AbstractControl, ValidatorFn } from '@angular/forms';

export function dateOrderValidator(
  startDateControl: AbstractControl
): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const startDate = startDateControl.value;
    const endDate = control.value;
    return startDate && endDate && startDate > endDate
      ? { dateOrder: true }
      : null;
  };
}
